/**
 * customer.js — Customer entity and state machine.
 *
 * A Customer travels through these states:
 *   ENTERING → QUEUING → AT_COUNTER → SERVED | LEAVING_UNHAPPY → (removed)
 *
 * The DOM element for each customer is created here; CustomerManager
 * appends it to #customer-layer and calls update() every tick.
 */

/* ── Customer state constants ───────────────────────────────── */
const CUSTOMER_STATE = Object.freeze({
  ENTERING:        'ENTERING',
  QUEUING:         'QUEUING',
  AT_COUNTER:      'AT_COUNTER',
  SERVED:          'SERVED',
  LEAVING_UNHAPPY: 'LEAVING_UNHAPPY',
  DONE:            'DONE',   // ready to be garbage-collected
});

/* ── Avatar pool (emoji "sprites") ─────────────────────────── */
const AVATARS = ['🧑', '👩', '👨', '🧔', '👱', '🧕', '👴', '👵'];

let _nextCustomerId = 1;

/* ── Customer class ─────────────────────────────────────────── */
class Customer {
  /**
   * @param {object} opts
   * @param {string}  opts.drinkId      Drink the customer wants.
   * @param {number}  opts.patience     Full patience in milliseconds.
   * @param {number}  opts.startX       Initial CSS left value (px).
   * @param {number}  opts.startBottom  Initial CSS bottom value (px).
   */
  constructor({ drinkId, patience, startX, startBottom }) {
    this.id       = _nextCustomerId++;
    this.drinkId  = drinkId;
    this.patience = patience;       // total ms of patience
    this.patienceLeft = patience;   // ms remaining
    this.state    = CUSTOMER_STATE.ENTERING;
    this.x        = startX;
    this.bottom   = startBottom;
    this.avatar   = AVATARS[Math.floor(Math.random() * AVATARS.length)];
    this.name     = `Cust. ${this.id}`;
    this._wasServedHappy = false;   // track service outcome

    this._el = this._createElement();
  }

  /* ── DOM element ─────────────────────────────────────────── */
  _createElement() {
    const el = document.createElement('div');
    el.className = 'customer entering';
    el.id = `customer-${this.id}`;
    el.setAttribute('aria-label', `${this.name} wants a ${this.drinkId}`);
    el.innerHTML = `
      <span class="customer-avatar" aria-hidden="true">${this.avatar}</span>
      <span class="customer-name">${this.name}</span>
      <div class="patience-bar-wrap" aria-hidden="true">
        <div class="patience-bar" style="width:100%"></div>
      </div>
    `;
    el.style.left   = `${this.x}px`;
    el.style.bottom = `${this.bottom}px`;
    return el;
  }

  get element() { return this._el; }

  /* ── Per-tick update ────────────────────────────────────── */
  /**
   * @param {number} dt  Delta time in ms since last frame.
   */
  update(dt) {
    if (this.state === CUSTOMER_STATE.AT_COUNTER) {
      this.patienceLeft = Math.max(0, this.patienceLeft - dt);
      this._updatePatienceBar();
      if (this.patienceLeft === 0) {
        this.leaveUnhappy();
      }
    }
  }

  /* ── Position helpers ───────────────────────────────────── */
  moveTo(x, bottom) {
    this.x      = x;
    this.bottom = bottom;
    this._el.style.left   = `${x}px`;
    this._el.style.bottom = `${bottom}px`;
  }

  /* ── State transitions ──────────────────────────────────── */
  arriveAtCounter() {
    this.state = CUSTOMER_STATE.AT_COUNTER;
    this._el.classList.remove('entering');
  }

  serve() {
    this.state = CUSTOMER_STATE.SERVED;
    this._wasServedHappy = true;
    this._el.classList.add('leaving');
    // Remove element after animation ends
    this._el.addEventListener('animationend', () => this._el.remove(), { once: true });
    // Fallback removal
    setTimeout(() => { if (this._el.parentNode) this._el.remove(); }, 800);
    // Don't set to DONE here - let manager handle cleanup
  }

  leaveUnhappy() {
    if (this.state === CUSTOMER_STATE.DONE) return;
    this.state = CUSTOMER_STATE.LEAVING_UNHAPPY;
    this._wasServedHappy = false;
    this._el.classList.add('leaving');
    this._el.addEventListener('animationend', () => this._el.remove(), { once: true });
    setTimeout(() => { if (this._el.parentNode) this._el.remove(); }, 800);
    // Don't set to DONE here - let manager handle cleanup
  }

  isDone() {
    return this.state === CUSTOMER_STATE.DONE ||
           this.state === CUSTOMER_STATE.SERVED ||
           this.state === CUSTOMER_STATE.LEAVING_UNHAPPY;
  }

  /* ── Private: update patience bar appearance ────────────── */
  _updatePatienceBar() {
    const ratio = this.patienceLeft / this.patience;
    const bar   = this._el.querySelector('.patience-bar');
    if (!bar) return;
    bar.style.width = `${(ratio * 100).toFixed(1)}%`;
    bar.classList.remove('low', 'urgent');
    if (ratio < 0.25) bar.classList.add('urgent');
    else if (ratio < 0.5) bar.classList.add('low');
  }
}

/* ── CustomerManager ────────────────────────────────────────── */
/**
 * Manages the pool of active customers: spawning, updating, and
 * handing off the front-of-queue customer to the counter.
 */
class CustomerManager {
  /**
   * @param {object} opts
   * @param {number}   opts.spawnIntervalMs   How often a new customer arrives (ms).
   * @param {number}   opts.patienceMs        Default patience duration (ms).
   * @param {Function} opts.onCounterReady    Called when a customer reaches the counter.
   * @param {Function} opts.onCustomerLeft    Called (wasServed) when a customer departs.
   */
  constructor({ spawnIntervalMs, patienceMs, onCounterReady, onCustomerLeft }) {
    this._spawnInterval = spawnIntervalMs;
    this._patienceMs    = patienceMs;
    this._onCounterReady = onCounterReady;
    this._onCustomerLeft = onCustomerLeft;

    this._layer     = document.getElementById('customer-layer');
    this._customers = [];          // all active customers
    this._spawnTimer = 0;
    this._active    = false;
    this._counterOccupied = false;
  }

  /* ── Lifecycle ─────────────────────────────────────────── */
  start() {
    this._active = true;
    this._spawnTimer = 0;
    this._customers = [];
    this._counterOccupied = false;
  }

  stop() {
    this._active = false;
    // Clean up any remaining customer elements
    this._customers.forEach(c => { if (c.element.parentNode) c.element.remove(); });
    this._customers = [];
    this._counterOccupied = false;
  }

  /* ── Per-tick update ────────────────────────────────────── */
  /**
   * @param {number} dt  Delta time in ms.
   */
  update(dt) {
    if (!this._active) return;

    // Spawn timer
    this._spawnTimer += dt;
    if (this._spawnTimer >= this._spawnInterval) {
      this._spawnTimer = 0;
      this._spawnCustomer();
    }

    // Update all customers
    this._customers.forEach(c => c.update(dt));

    // Remove done customers and fire callbacks
    const leaving = this._customers.filter(c => c.state === CUSTOMER_STATE.SERVED || c.state === CUSTOMER_STATE.LEAVING_UNHAPPY);
    leaving.forEach(c => {
      // Set final state and call callback once
      c.state = CUSTOMER_STATE.DONE;
      this._onCustomerLeft(c._wasServedHappy, c._wasServedHappy ? (DrinkSystem.getDrink(c.drinkId)?.price ?? 0) : 0);
    });
    this._customers = this._customers.filter(c => c.state !== CUSTOMER_STATE.DONE);

    // Compact queue positions after departures
    if (leaving.length > 0) {
      this._repositionQueue();
    }

    // Promote first queuing customer to counter if counter is free
    if (!this._counterOccupied) {
      const next = this._customers.find(c => c.state === CUSTOMER_STATE.QUEUING);
      if (next) {
        this._promoteToCounter(next);
      }
    }
  }

  /* ── Serve the counter customer ─────────────────────────── */
  /**
   * Called by Game when the player clicks a drink button.
   * @param {string} drinkId
   * @returns {{ correct: boolean, earn: number }}
   */
  serveCounterCustomer(drinkId) {
    // Validate drinkId before proceeding
    if (!drinkId || !DrinkSystem.getDrink(drinkId)) {
      return { correct: false, earn: 0 };
    }

    const customer = this._getCounterCustomer();
    if (!customer) return { correct: false, earn: 0 };

    const correct = customer.drinkId === drinkId;
    const earn    = correct ? (DrinkSystem.getDrink(drinkId)?.price ?? 0) : 0;

    if (correct) {
      customer.serve();
    } else {
      // Wrong drink — still serve but no money
      customer.serve();
    }

    this._counterOccupied = false;
    return { correct, earn };
  }

  /** Return the customer currently at the counter, or null. */
  getCounterCustomer() {
    return this._getCounterCustomer();
  }

  /** True if at least one customer is at the counter. */
  isCounterOccupied() {
    return this._counterOccupied;
  }

  /* ── Private helpers ────────────────────────────────────── */
  _spawnCustomer() {
    // Enforce queue capacity (max 5 customers in queue)
    const queueingCount = this._customers.filter(c => c.state === CUSTOMER_STATE.QUEUING).length;
    if (queueingCount >= 5) {
      return; // Queue is full, don't spawn
    }

    const sceneEl = document.getElementById('shop-scene');
    const sceneW  = sceneEl ? sceneEl.offsetWidth  : 600;
    const sceneH  = sceneEl ? sceneEl.offsetHeight : 400;

    const startX      = sceneW - 70;   // near the door (right side)
    const startBottom = Math.round(sceneH * 0.22);

    const customer = new Customer({
      drinkId:      DrinkSystem.randomDrinkId(),
      patience:     this._patienceMs,
      startX,
      startBottom,
    });

    // Begin as QUEUING state after the enter animation
    customer.state = CUSTOMER_STATE.QUEUING;

    this._layer.appendChild(customer.element);
    this._customers.push(customer);
    this._repositionQueue();
  }

  _promoteToCounter(customer) {
    this._counterOccupied = true;
    customer.arriveAtCounter();
    // Move customer to counter position
    const sceneEl = document.getElementById('shop-scene');
    const sceneH  = sceneEl ? sceneEl.offsetHeight : 400;
    customer.moveTo(60, Math.round(sceneH * 0.22));
    this._onCounterReady(customer);
  }

  _getCounterCustomer() {
    return this._customers.find(c => c.state === CUSTOMER_STATE.AT_COUNTER) || null;
  }

  /** Space queuing customers evenly across the scene width. */
  _repositionQueue() {
    const sceneEl = document.getElementById('shop-scene');
    const sceneW  = sceneEl ? sceneEl.offsetWidth  : 600;
    const sceneH  = sceneEl ? sceneEl.offsetHeight : 400;
    const baseBottom = Math.round(sceneH * 0.22);

    const queueing = this._customers.filter(c => c.state === CUSTOMER_STATE.QUEUING);
    const spacing  = 52;
    const startX   = sceneW - 80;

    queueing.forEach((c, i) => {
      c.moveTo(startX - i * spacing, baseBottom);
    });
  }
}
