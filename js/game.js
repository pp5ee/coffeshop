/**
 * game.js — Core game initialisation, state management, and main loop.
 *
 * This is the entry point that wires together all subsystems:
 *   DrinkSystem  → drink catalogue + button rendering
 *   CustomerManager → spawn, update, and retire customers
 *   QueueSystem  → visual queue position markers
 *   UIManager    → screen switching, HUD, feedback
 *
 * Game flow:
 *   start screen  →  (player clicks "Open the Shop")
 *   game screen   →  (day timer counts down)
 *   summary screen → (player clicks "Play Again" or "Main Menu")
 */

/* ── Game configuration ─────────────────────────────────────── */
const CONFIG = {
  dayDurationMs:     60_000,   // length of one day (ms)
  spawnIntervalMs:    5_000,   // how often a new customer appears (ms)
  patienceMs:        12_000,   // default customer patience (ms)
  highScoreKey:      'pixelCoffeeShop_highscore',
};

/* ── Game ───────────────────────────────────────────────────── */
class Game {
  constructor() {
    /* Subsystems — created once, reused across play-throughs */
    this._ui = new UIManager();

    this._drinks = new DrinkSystem({
      onServe: (drinkId) => this._handleServe(drinkId),
    });

    this._customers = new CustomerManager({
      spawnIntervalMs: CONFIG.spawnIntervalMs,
      patienceMs:      CONFIG.patienceMs,
      onCounterReady:  (customer) => this._handleCounterReady(customer),
      onCustomerLeft:  (wasServed, earn) => this._handleCustomerLeft(wasServed, earn),
    });

    this._queue = new QueueSystem({ maxSlots: 5 });

    /* Per-round state */
    this._money      = 0;
    this._served     = 0;
    this._lost       = 0;
    this._timeLeft   = CONFIG.dayDurationMs;  // ms
    this._running    = false;
    this._lastTs     = null;
    this._rafId      = null;

    /* Bootstrap UI */
    this._drinks.renderButtons();
    this._ui.showScreen('start');
    this._bindButtons();
  }

  /* ── Button wiring ──────────────────────────────────────── */
  _bindButtons() {
    document.getElementById('btn-start')
      .addEventListener('click', () => this._startGame());

    document.getElementById('btn-play-again')
      .addEventListener('click', () => this._startGame());

    document.getElementById('btn-back-start')
      .addEventListener('click', () => this._ui.showScreen('start'));
  }

  /* ── Game lifecycle ─────────────────────────────────────── */
  _startGame() {
    /* Reset round state */
    this._money    = 0;
    this._served   = 0;
    this._lost     = 0;
    this._timeLeft = CONFIG.dayDurationMs;
    this._running  = true;
    this._lastTs   = null;

    /* Prepare subsystems */
    this._customers.start();
    this._queue.renderMarkers();
    this._drinks.setEnabled(false);   // enabled only when a customer is at counter

    /* Sync HUD */
    this._ui.setMoney(0);
    this._ui.setServed(0);
    this._ui.setTimer(Math.ceil(this._timeLeft / 1000));
    this._ui.clearOrder();
    this._ui.showScreen('game');

    /* Kick off the loop */
    if (this._rafId) cancelAnimationFrame(this._rafId);
    this._rafId = requestAnimationFrame((ts) => this._loop(ts));
  }

  _endGame() {
    this._running = false;
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    this._customers.stop();
    this._drinks.setEnabled(false);
    this._queue.clear();

    /* Final score: money + bonus for served customers */
    const score    = this._money + this._served * 2;
    const high     = this._loadHighScore();
    const newHigh  = score > high ? score : high;
    if (score > high) this._saveHighScore(score);

    this._ui.showSummary({
      money:     this._money,
      served:    this._served,
      lost:      this._lost,
      score,
      highscore: newHigh,
    });
  }

  /* ── Main loop ──────────────────────────────────────────── */
  _loop(ts) {
    if (!this._running) return;

    /* Delta time */
    if (this._lastTs === null) this._lastTs = ts;
    const dt      = Math.min(ts - this._lastTs, 100); // cap at 100ms to avoid spirals
    this._lastTs  = ts;

    /* Count down the day */
    this._timeLeft -= dt;
    if (this._timeLeft <= 0) {
      this._timeLeft = 0;
      this._endGame();
      return;
    }

    /* Update subsystems */
    this._customers.update(dt);

    /* Sync HUD timer (only update when second changes to avoid thrash) */
    const secondsLeft = Math.ceil(this._timeLeft / 1000);
    this._ui.setTimer(secondsLeft);

    this._rafId = requestAnimationFrame((t) => this._loop(t));
  }

  /* ── Event handlers ─────────────────────────────────────── */
  _handleCounterReady(customer) {
    const drink = DrinkSystem.getDrink(customer.drinkId);
    this._ui.showOrder(customer);
    this._ui.showFeedback(
      `${customer.avatar} wants a ${drink?.name ?? customer.drinkId}!`,
      'info',
      99_999  // keep visible until served / leaves
    );
    this._drinks.setEnabled(true);
  }

  _handleServe(drinkId) {
    if (!this._customers.isCounterOccupied()) return;

    const { correct, earn } = this._customers.serveCounterCustomer(drinkId);
    const drinkName = DrinkSystem.getDrink(drinkId)?.name ?? drinkId;

    if (correct) {
      this._money  += earn;
      this._served += 1;
      this._ui.setMoney(this._money);
      this._ui.setServed(this._served);
      this._ui.showFeedback(`✅ ${drinkName} — +$${earn}! Customer happy!`, 'success');
    } else {
      const correctDrink = DrinkSystem.getDrink(
        this._customers.getCounterCustomer()?.drinkId ?? ''
      );
      // Customer already leaving from wrong serve; just log feedback
      this._ui.showFeedback(`❌ Wrong drink! They wanted a ${correctDrink?.name ?? '?'}.`, 'error');
    }

    this._ui.clearOrder();
    this._drinks.setEnabled(false);
  }

  /** Called by CustomerManager when a customer leaves due to timeout. */
  _handleCustomerLeft(wasServed, _earn) {
    if (!wasServed) {
      this._lost += 1;
      this._ui.showFeedback('😤 Customer left unhappy — too slow!', 'error');
      this._ui.clearOrder();
      this._drinks.setEnabled(false);
    }
  }

  /* ── High-score persistence ─────────────────────────────── */
  _loadHighScore() {
    try {
      return parseInt(localStorage.getItem(CONFIG.highScoreKey) || '0', 10) || 0;
    } catch {
      return 0;
    }
  }

  _saveHighScore(score) {
    try {
      localStorage.setItem(CONFIG.highScoreKey, String(score));
    } catch { /* storage may be unavailable — silently ignore */ }
  }
}

/* ── Bootstrap ──────────────────────────────────────────────── */
/**
 * Wait for the DOM to be fully parsed before constructing the game.
 * Using DOMContentLoaded ensures all HTML elements referenced by
 * subsystems exist before any constructor runs.
 */
document.addEventListener('DOMContentLoaded', () => {
  window._game = new Game();
});
