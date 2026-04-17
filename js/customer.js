/**
 * customer.js — Customer entity and state machine.
 *
 * CustomerManager spawns, updates, and retires customers.
 * Each Customer has a state machine (QUEUEING → WAITING → LEAVING).
 * Customers move through the queue, wait at the counter for service,
 * and leave if not served in time.
 */

/* ── Customer class ───────────────────────────────────────────── */
class Customer {
  /**
   * @param {object} opts
   * @param {string} opts.avatar  Emoji avatar (👨, 👩, etc.)
   * @param {string} opts.name    Display name
   * @param {string} opts.drinkId Which drink they want
   * @param {number} opts.patienceMs How long they'll wait at counter (ms)
   */
  constructor({ avatar, name, drinkId, patienceMs }) {
    this.avatar     = avatar;
    this.name       = name;
    this.drinkId    = drinkId;
    this.patienceMs = patienceMs;
    this.patienceLeft = patienceMs;

    /* State machine */
    this.state = 'QUEUEING'; // QUEUEING → WAITING → LEAVING

    /* DOM element */
    this._el = null;
    this._patienceBarEl = null;

    /* Position tracking */
    this._targetPos = null;
    this._currentPos = null;
    this._moveSpeed = 80; // px/sec
  }

  /**
   * Create the customer's DOM element and insert into the customer layer.
   * @param {HTMLElement} container  #customer-layer element
   */
  createElement(container) {
    if (this._el) return;

    this._el = document.createElement('div');
    this._el.className = 'customer';
    this._el.setAttribute('role', 'img');
    this._el.setAttribute('aria-label', `${this.name} waiting for ${this.drinkId}`);

    this._el.innerHTML = `
      <span class="customer-avatar" aria-hidden="true">${this.avatar}</span>
      <span class="customer-name">${this.name}</span>
      <div class="patience-bar-wrap">
        <div class="patience-bar"></div>
      </div>
    `;

    this._patienceBarEl = this._el.querySelector('.patience-bar');
    container.appendChild(this._el);

    // Initial position (off-screen right)
    this._currentPos = { x: 600, y: 0.22 };
    this._el.style.left = `${this._currentPos.x}px`;
    this._el.style.bottom = `${this._currentPos.y * 400}px`;

    // Enter animation
    this._el.classList.add('entering');
    setTimeout(() => this._el.classList.remove('entering'), 300);
  }

  /**
   * Update customer position and state.
   * @param {number} dt  Delta time (ms)
   */
  update(dt) {
    if (!this._el) return;

    // Update position if moving
    if (this._targetPos && this._currentPos) {
      const dx = this._targetPos.x - this._currentPos.x;
      const dy = this._targetPos.y - this._currentPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0.5) {
        // Move toward target
        const moveDist = (this._moveSpeed * dt) / 1000;
        const ratio = Math.min(moveDist / dist, 1);
        this._currentPos.x += dx * ratio;
        this._currentPos.y += dy * ratio;

        this._el.style.left = `${this._currentPos.x}px`;
        this._el.style.bottom = `${this._currentPos.y * 400}px`;
      } else {
        // Reached target
        this._currentPos = { ...this._targetPos };
        this._targetPos = null;
      }
    }

    // Update patience bar if waiting
    if (this.state === 'WAITING') {
      this.patienceLeft = Math.max(0, this.patienceLeft - dt);
      const ratio = this.patienceLeft / this.patienceMs;
      this._patienceBarEl.style.width = `${ratio * 100}%`;

      // Update bar color based on patience level
      this._patienceBarEl.className = 'patience-bar';
      if (ratio < 0.3) this._patienceBarEl.classList.add('urgent');
      else if (ratio < 0.6) this._patienceBarEl.classList.add('low');
    }
  }

  /**
   * Move customer to a new position.
   * @param {object} pos  { x, y } in pixels (y as fraction of scene height)
   */
  moveTo(pos) {
    this._targetPos = pos;
  }

  /**
   * Start waiting at the counter.
   */
  startWaiting() {
    this.state = 'WAITING';
    this.patienceLeft = this.patienceMs;
  }

  /**
   * Customer is leaving (either served or timeout).
   */
  leave() {
    this.state = 'LEAVING';
    this._el.classList.add('leaving');
    setTimeout(() => {
      if (this._el && this._el.parentNode) {
        this._el.parentNode.removeChild(this._el);
      }
      this._el = null;
    }, 400);
  }

  /**
   * Check if customer has left (for cleanup).
   */
  hasLeft() {
    return this.state === 'LEAVING' && !this._el;
  }
}

/* ── CustomerManager ──────────────────────────────────────────── */
class CustomerManager {
  /**
   * @param {object} opts
   * @param {number} opts.spawnIntervalMs  How often to spawn new customers
   * @param {number} opts.patienceMs       Default customer patience
   * @param {Function} opts.onCounterReady Called when customer reaches counter
   * @param {Function} opts.onCustomerLeft Called when customer leaves
   */
  constructor({ spawnIntervalMs, patienceMs, onCounterReady, onCustomerLeft }) {
    this._spawnIntervalMs = spawnIntervalMs;
    this._patienceMs      = patienceMs;
    this._onCounterReady  = onCounterReady;
    this._onCustomerLeft  = onCustomerLeft;

    this._customers = [];
    this._spawnTimer = null;
    this._running = false;

    /* Queue positions */
    this._queuePositions = [
      { x: 440, y: 0.22 },  // position 4
      { x: 388, y: 0.22 },  // position 3
      { x: 336, y: 0.22 },  // position 2
      { x: 284, y: 0.22 },  // position 1
      { x: 232, y: 0.22 },  // position 0 (next to counter)
    ];
    this._counterPos = { x: 60, y: 0.22 };  // counter position

    this._container = document.getElementById('customer-layer');
  }

  /* ── Spawning ──────────────────────────────────────────────── */
  start() {
    this._running = true;
    this._spawnTimer = setTimeout(() => this._spawnCustomer(), 1000);
  }

  stop() {
    this._running = false;
    if (this._spawnTimer) {
      clearTimeout(this._spawnTimer);
      this._spawnTimer = null;
    }
    // Make all customers leave
    this._customers.forEach(c => c.leave());
    this._customers = [];
  }

  _spawnCustomer() {
    if (!this._running) return;

    // Don't spawn if queue is full
    if (this._customers.length >= 6) { // 5 queue + 1 counter
      this._spawnTimer = setTimeout(() => this._spawnCustomer(), this._spawnIntervalMs);
      return;
    }

    const customer = this._createRandomCustomer();
    this._customers.push(customer);
    customer.createElement(this._container);

    // Move customer to their initial queue position
    this._updateCustomerPositions();

    this._spawnTimer = setTimeout(() => this._spawnCustomer(), this._spawnIntervalMs);
  }

  _createRandomCustomer() {
    const avatars = ['👨', '👩', '🧔', '👧', '👦', '🧑', '👴', '👵'];
    const names = ['Alex', 'Sam', 'Jamie', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jordan'];

    return new Customer({
      avatar: avatars[Math.floor(Math.random() * avatars.length)],
      name: names[Math.floor(Math.random() * names.length)],
      drinkId: DrinkSystem.randomDrinkId(),
      patienceMs: this._patienceMs,
    });
  }

  /* ── Queue management ──────────────────────────────────────── */
  _updateCustomerPositions() {
    // Customers in queue (not at counter)
    const queueCustomers = this._customers.filter(c => c.state === 'QUEUEING');

    // Move each queue customer to their position
    queueCustomers.forEach((customer, index) => {
      const posIndex = Math.min(index, this._queuePositions.length - 1);
      customer.moveTo(this._queuePositions[posIndex]);
    });

    // Check if we can move the first queue customer to counter
    if (queueCustomers.length > 0 && !this.isCounterOccupied()) {
      const nextCustomer = queueCustomers[0];
      nextCustomer.moveTo(this._counterPos);
      nextCustomer.startWaiting();
      this._onCounterReady(nextCustomer);
    }
  }

  /* ── Main update ───────────────────────────────────────────── */
  update(dt) {
    // Update all customers
    this._customers.forEach(customer => customer.update(dt));

    // Check for customers leaving due to timeout
    this._customers.forEach(customer => {
      if (customer.state === 'WAITING' && customer.patienceLeft <= 0) {
        customer.leave();
        this._onCustomerLeft(false, 0); // not served, no earnings
      }
    });

    // Remove customers who have left
    this._customers = this._customers.filter(customer => {
      if (customer.hasLeft()) {
        return false;
      }
      return true;
    });

    // Update queue positions
    this._updateCustomerPositions();
  }

  /* ── Service interaction ───────────────────────────────────── */
  isCounterOccupied() {
    return this._customers.some(c => c.state === 'WAITING');
  }

  getCounterCustomer() {
    return this._customers.find(c => c.state === 'WAITING') || null;
  }

  serveCounterCustomer(drinkId) {
    const customer = this.getCounterCustomer();
    if (!customer) return { correct: false, earn: 0 };

    const correct = customer.drinkId === drinkId;
    const earn = correct ? DrinkSystem.getDrink(drinkId)?.price || 3 : 0;

    customer.leave();
    this._onCustomerLeft(correct, earn);

    return { correct, earn };
  }
}
