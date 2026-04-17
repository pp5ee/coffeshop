# Customer Entity & State Machine — Design Analysis

**Task:** task3 (analyze)
**Target AC:** AC-3 — Customer system functionality
**Date:** 2026-04-17

---

## 1. Overview

The customer entity (`Customer` class in `js/customer.js`) is the central actor in the
pixel coffee-shop game. Each customer is an independent object that moves through a
well-defined lifecycle, managed cooperatively by the `Customer` class itself (per-customer
logic) and the `CustomerManager` class (pool-level coordination).

---

## 2. State Definitions

```
CUSTOMER_STATE (frozen enum)
├── ENTERING         — customer has just been constructed; brief entry phase
├── QUEUING          — customer is standing in the visible queue
├── AT_COUNTER       — customer has reached the front; patience timer is live
├── SERVED           — player delivered the correct (or any) drink; happy exit
├── LEAVING_UNHAPPY  — patience ran out or wrong drink served; unhappy exit
└── DONE             — terminal state; customer is ready for garbage collection
```

All constants are declared with `Object.freeze` to prevent accidental mutation at runtime.

---

## 3. State Transition Diagram

```
                      [spawn]
                         │
                         ▼
                     ENTERING ──────────────────────────────────┐
                         │                                       │
                         │  (state set to QUEUING               │
                         │   immediately after createElement)   │
                         ▼                                       │
     ┌──────────────► QUEUING                                    │
     │                   │                                       │
     │   (CustomerManager._promoteToCounter)                     │
     │                   │                                       │
     │                   ▼                                       │
     │             AT_COUNTER ◄──── patience timer running       │
     │             /         \                                   │
     │  (player          (patienceLeft                          │
     │   serves)          reaches 0)                            │
     │      │                  │                                 │
     │      ▼                  ▼                                 │
     │   SERVED        LEAVING_UNHAPPY                          │
     │      │                  │                                 │
     │      └────────┬─────────┘                                │
     │               │                                           │
     │               │  (CustomerManager marks DONE             │
     │               │   and fires onCustomerLeft callback)     │
     │               ▼                                           │
     │            DONE ──────────────────────────────────────────┘
     │               (removed from _customers array)
     │
     └── [queue compacted; next QUEUING customer promoted]
```

### Transition Rules (tabular)

| From State      | To State        | Trigger / Guard                                                        | Actor                  |
|-----------------|-----------------|------------------------------------------------------------------------|------------------------|
| *(constructor)* | `ENTERING`      | `new Customer(opts)`                                                   | `CustomerManager._spawnCustomer` |
| `ENTERING`      | `QUEUING`       | Immediately after element created; `customer.state = QUEUING`          | `CustomerManager._spawnCustomer` |
| `QUEUING`       | `AT_COUNTER`    | `!this._counterOccupied` AND customer is first in queue                | `CustomerManager.update` → `_promoteToCounter` |
| `AT_COUNTER`    | `SERVED`        | Player calls `serveCounterCustomer(drinkId)` (any drink triggers exit) | `CustomerManager.serveCounterCustomer` → `customer.serve()` |
| `AT_COUNTER`    | `LEAVING_UNHAPPY` | `patienceLeft === 0` (timeout)                                       | `Customer.update` → `customer.leaveUnhappy()` |
| `SERVED`        | `DONE`          | Manager detects `state === SERVED` in update loop                      | `CustomerManager.update` |
| `LEAVING_UNHAPPY` | `DONE`        | Manager detects `state === LEAVING_UNHAPPY` in update loop             | `CustomerManager.update` |

**Guard against re-entry:** `leaveUnhappy()` short-circuits if `state === DONE`, preventing
double-transitions when the patience timer fires concurrently with manager cleanup.

---

## 4. Implementation Alignment

### 4.1 Queue Movement

- **Slot system:** `_repositionQueue()` recalculates every `QUEUING` customer's CSS
  position after any departure. Customers are spaced 52 px apart, aligned with the
  `QueueSystem` visual markers drawn in `queue.js`.
- **Promotion rule:** Each `update()` tick, `CustomerManager` checks
  `!this._counterOccupied`. If true, it finds the first `QUEUING` customer
  (`Array.find` — index 0 is the front of the queue) and promotes them via
  `_promoteToCounter()`.
- **Capacity cap:** Spawn is suppressed when 5 customers are already `QUEUING`,
  matching the 5-slot marker grid rendered by `QueueSystem`.

### 4.2 Counter Service

- **Mutex flag:** `_counterOccupied` acts as a binary semaphore — set to `true` when
  a customer is promoted, cleared to `false` when they exit (`SERVED` or
  `LEAVING_UNHAPPY`). This guarantees at most one customer at the counter at any time.
- **Correct-drink path:** `serveCounterCustomer(drinkId)` compares the served `drinkId`
  against `customer.drinkId`. On match, `customer.serve()` is called; `_wasServedHappy`
  is set to `true`; money (`DrinkSystem.getDrink(drinkId).price`) is returned to `Game`.
- **Wrong-drink path:** On mismatch the customer still calls `customer.serve()` —
  they leave immediately — but `earn` is returned as `0`. The `_wasServedHappy` flag
  is **not** set (defaults `false`), so `_handleCustomerLeft(false)` increments the
  lost counter and shows the red feedback banner.

### 4.3 Wrong-Drink Handling

The current design treats a wrong-drink serve identically to an unhappy departure at
the scoring level: `earn = 0`, lost counter incremented. The customer visually exits
with the same `leaving` CSS animation as a timed-out customer. This is a deliberate
simplification (per the Claude-Codex deliberation resolution: "single-click drinks for
v1") that keeps the service interaction snappy.

One subtle correctness issue is addressed in `Game._handleServe`: the expected drink
name is captured **before** `serveCounterCustomer()` is called, because the customer
reference becomes unreliable once the state transitions to `SERVED` and the DOM element
begins its removal animation.

### 4.4 Timeout Handling

- **Patience countdown:** Runs exclusively when `state === AT_COUNTER`. The delta-time
  (`dt`) is subtracted from `patienceLeft` each tick, clamped at 0.
- **Visual feedback:** `_updatePatienceBar()` recalculates bar width as
  `(patienceLeft / patience) * 100%` and applies CSS classes:
  - `> 50 %` — default (green)
  - `25–50 %` — `.low` (amber)
  - `< 25 %` — `.urgent` (red pulse)
- **Timeout trigger:** When `patienceLeft === 0`, `Customer.update()` calls
  `this.leaveUnhappy()`, which transitions to `LEAVING_UNHAPPY` and fires the CSS
  leave animation. The manager's next tick will detect `LEAVING_UNHAPPY`, set `DONE`,
  fire `onCustomerLeft(false, 0)`, and remove the customer from the pool.
- **Delta-time cap:** `Game._loop` caps `dt` at 100 ms (`Math.min(ts - lastTs, 100)`)
  to prevent large jumps from draining patience instantly after a tab regains focus.

---

## 5. Design Decisions & Patterns

### 5.1 Entity-owns-its-DOM

Each `Customer` instance creates and owns its `<div>` element. Position, CSS class
changes, and patience-bar updates are applied directly on the element through the
class methods. This avoids a separate render pass and keeps the state-mutation code
co-located with the transitions that trigger it.

### 5.2 Manager-as-Coordinator

`CustomerManager` does not reach inside `Customer` to mutate state directly (except
for the `_wasServedHappy` read and the `DONE` write after departure). All state changes
flow through named transition methods (`arriveAtCounter`, `serve`, `leaveUnhappy`),
which is a lightweight application of the *State* pattern without a formal state-object
hierarchy.

### 5.3 DONE as a Two-Phase Exit

Customers do not self-assign `DONE`. Instead, `serve()` and `leaveUnhappy()` set an
intermediate exit state (`SERVED` / `LEAVING_UNHAPPY`) and start the CSS animation;
the manager detects those states on the next tick, transitions to `DONE`, fires the
callback, and removes the customer. This two-phase approach decouples the animation
lifecycle from the game-logic cleanup.

### 5.4 `isDone()` Convenience Predicate

`isDone()` returns `true` for all three terminal/exit states (`DONE`, `SERVED`,
`LEAVING_UNHAPPY`). This allows callers to test "is this customer effectively finished?"
without needing to enumerate state constants.

### 5.5 ENTERING State is Vestigial

In the current implementation `ENTERING` is assigned in the constructor but immediately
overwritten to `QUEUING` by `_spawnCustomer`. The CSS class `entering` is removed in
`arriveAtCounter()`. This means `ENTERING` is reserved for a future walk-in animation;
it is not currently observable from outside the constructor.

---

## 6. Acceptance-Criteria Coverage (AC-3)

| AC-3 Criterion | Where implemented | Status |
|---|---|---|
| Customers spawn at door at regular intervals | `CustomerManager._spawnTimer` in `update(dt)` | ✅ |
| Customers move through queue positions correctly | `_repositionQueue()` called after every departure and spawn | ✅ |
| Each customer has unique drink order and patience value | `drinkId: DrinkSystem.randomDrinkId()`, `patience: patienceMs` (per-spawn config) | ✅ |
| Customers spawn in invalid positions (must FAIL) | Queue capped at 5; spawn position anchored to `sceneW - 70` | ✅ guard present |
| Queue movement logic breaks with multiple customers (must FAIL) | Compact reposition runs after every departure | ✅ guard present |
| Customer states become inconsistent (must FAIL) | `leaveUnhappy` early-return guard; `_counterOccupied` mutex | ✅ guard present |

---

## 7. Potential Enhancements (Out of Scope for v1)

- **Walk-in animation:** Fully realise the `ENTERING` state with a CSS walk transition
  from the right-side door to the first queue slot before state becomes `QUEUING`.
- **Per-customer patience variance:** Introduce per-customer patience multipliers
  (e.g., ±20 %) for variety without complexity.
- **Multi-step drink preparation:** Extend `AT_COUNTER` with sub-states
  (`WAITING_FOR_BREW`, `WAITING_FOR_POUR`) for more complex service interaction.
- **Cosmetic/behavioral customer types:** Different avatars with distinct patience
  durations or tip bonuses (noted in Claude-Codex deliberation).
