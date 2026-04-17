# Goal Tracker

<!--
This file tracks the ultimate goal, acceptance criteria, and plan evolution.
It prevents goal drift by maintaining a persistent anchor across all rounds.

RULES:
- IMMUTABLE SECTION: Do not modify after initialization
- MUTABLE SECTION: Update each round, but document all changes
- Every task must be in one of: Active, Completed, or Deferred
- Deferred items require explicit justification
-->

## IMMUTABLE SECTION
<!-- Do not modify after initialization -->

### Ultimate Goal
Create a complete browser-based coffee shop simulation game prototype using HTML, CSS, and JavaScript. The game features pixel-art aesthetics, customer service mechanics, and a modular code structure that runs locally without heavy dependencies.

## Acceptance Criteria

### Acceptance Criteria
<!-- Each criterion must be independently verifiable -->
<!-- Claude must extract or define these in Round 0 -->


Following TDD philosophy, each criterion includes positive and negative tests for deterministic verification.

- AC-1: Game loads and initializes correctly
  - Positive Tests (expected to PASS):
    - Game starts from index.html without errors
    - Start screen displays with clear instructions
    - All required assets load successfully
  - Negative Tests (expected to FAIL):
    - Game fails to start if critical files are missing
    - Start screen missing essential UI elements

- AC-2: Core game flow and state management
  - Positive Tests (expected to PASS):
    - Start screen transitions to active game state
    - Active game state displays shop interior and UI
    - Game transitions to end-of-day summary correctly
  - Negative Tests (expected to FAIL):
    - Game gets stuck in transition states
    - State transitions trigger incorrect displays

- AC-3: Customer system functionality
  - Positive Tests (expected to PASS):
    - Customers spawn at door at regular intervals
    - Customers move through queue positions correctly
    - Each customer has unique drink order and patience value
  - Negative Tests (expected to FAIL):
    - Customers spawn in invalid positions
    - Queue movement logic breaks with multiple customers
    - Customer states become inconsistent

- AC-4: Drink preparation and service system
  - Positive Tests (expected to PASS):
    - Player can prepare drinks through clickable buttons
    - Correct drink service increases money and customer satisfaction
    - Incorrect or slow service triggers negative outcomes
  - Negative Tests (expected to FAIL):
    - Drink preparation fails with invalid inputs
    - Service system allows incorrect customer targeting
    - Money system fails to update correctly

- AC-5: UI and feedback systems
  - Positive Tests (expected to PASS):
    - Score/money/order counters display correctly
    - Clear feedback messages for player actions
    - UI panels are readable and well-organized
  - Negative Tests (expected to FAIL):
    - Counters display incorrect values
    - Feedback messages are missing or unclear
    - UI elements overlap or become unreadable

- AC-6: Animation and visual presentation
  - Positive Tests (expected to PASS):
    - Pixel-art visual style is consistent throughout
    - Simple animations or tile-based movement work smoothly
    - Scene feels alive with appropriate visual feedback
  - Negative Tests (expected to FAIL):
    - Visual style is inconsistent across elements
    - Animation system causes performance issues
    - Movement appears jerky or unnatural

- AC-7: Code organization and structure
  - Positive Tests (expected to PASS):
    - Code is modular with clear separation of concerns
    - Systems are organized as specified (state, customers, queue, drinks, UI, update loop)
    - Code follows consistent patterns and conventions
  - Negative Tests (expected to FAIL):
    - Systems are tightly coupled and difficult to modify
    - Code organization violates specified structure
    - Update loop causes timing or performance issues

---

## MUTABLE SECTION
<!-- Update each round with justification for changes -->

### Plan Version: 1 (Updated: Round 0)

#### Plan Evolution Log
<!-- Document any changes to the plan with justification -->
| Round | Change | Reason | Impact on AC |
|-------|--------|--------|--------------|
| 0 | Initial plan | - | - |
| 2 | No implementation progress; prior review findings remain outstanding | Round 2 focused on coordination only and did not advance planned work | AC-1 through AC-7 remain unverified and partially unmet |
| 3 | No implementation progress; Round 2 defects and missing tasks remain unresolved | Round 3 again reported coordination only, and repository code/commit history still show no implementation or verification changes | AC-1 through AC-7 remain only partially addressed; AC-3, AC-4, AC-5, and AC-7 are still blocked by known defects and missing evidence |

#### Active Tasks
<!-- Map each task to its target Acceptance Criterion and routing tag -->
| Task | Target AC | Status | Tag | Owner | Notes |
|------|-----------|--------|-----|-------|-------|
| task1: Create project structure and HTML foundation | AC-1 | in_progress | coding | claude | Repo contains initial implementation, but no verified completion evidence |
| task2: Implement game state management system | AC-2 | in_progress | coding | claude | Initial state flow exists, but final verification is missing |
| task3: Design customer entity and state machine | AC-3 | pending | analyze | codex | - |
| task4: Implement queue system and position logic | AC-3 | in_progress | coding | claude | Queue visuals exist, but compaction and bounds bugs remain |
| task5: Create drink system and preparation mechanics | AC-4 | in_progress | coding | claude | Drink buttons exist, but invalid-input handling is incomplete |
| task6: Implement service system and customer interaction | AC-4 | in_progress | coding | claude | Correct/incorrect service flow exists, but timeout and lifecycle bugs remain |
| task7: Build UI framework and screen transitions | AC-5 | in_progress | coding | claude | All screens exist, but no final integration verification is recorded |
| task8: Implement scoring and feedback systems | AC-5 | in_progress | coding | claude | HUD and feedback exist, but wrong-drink messaging is incorrect |
| task9: Apply pixel-art styling and visual polish | AC-6 | in_progress | coding | claude | Styling exists, but completion is not yet verified |
| task10: Add animations and visual feedback | AC-6 | in_progress | coding | claude | Basic animations exist, but completion is not yet verified |
| task11: Create README documentation | AC-7 | in_progress | coding | claude | README exists, but overall project completion is not verified |
| task12: Final testing and integration | AC-1-7 | pending | coding | claude | - |

### Completed and Verified
<!-- Only move tasks here after Codex verification -->
| AC | Task | Completed Round | Verified Round | Evidence |
|----|------|-----------------|----------------|----------|

### Explicitly Deferred
<!-- Items here require strong justification -->
| Task | Original AC | Deferred Since | Justification | When to Reconsider |
|------|-------------|----------------|---------------|-------------------|

### Open Issues
<!-- Issues discovered during implementation -->
| Issue | Discovered Round | Blocking AC | Resolution Path |
|-------|-----------------|-------------|-----------------|
| Customer timeout departures do not reliably invoke manager callback and lose terminal state detail | 1 | AC-3, AC-4 | Refactor `js/customer.js` lifecycle bookkeeping so outcome is preserved and callbacks fire exactly once |
| Wrong-drink feedback can lose the expected order and display `?` | 1 | AC-5 | Capture expected drink before service and use deterministic feedback in `js/game.js` |
| Queue compaction and overflow handling are incomplete | 1 | AC-3 | Reposition queue after departures/promotions and enforce queue capacity bounds |
| Required `task3` analyze artifact and `task12` verification evidence are missing | 1 | AC-3, AC-7 | Execute Codex analysis integration and perform documented final validation |
| Round 3 claimed progress blocker due to team management conflict, but repository state shows no code or verification changes and original tasks remain incomplete | 3 | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7 | Resume implementation directly against the remaining tasks; do not defer original-plan work for coordination reasons |
