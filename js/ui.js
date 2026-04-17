/**
 * ui.js — User interface manager and screen transitions.
 *
 * UIManager is responsible for:
 *   - Switching between start / game / summary screens
 *   - Updating HUD counters (money, served, timer)
 *   - Displaying the current order and player feedback
 *   - Populating the end-of-day summary
 */

class UIManager {
  constructor() {
    /* Screens */
    this._screens = {
      start:   document.getElementById('screen-start'),
      game:    document.getElementById('screen-game'),
      summary: document.getElementById('screen-summary'),
    };
    this._root = document.getElementById('game-root');

    /* HUD elements */
    this._hudMoney  = document.getElementById('hud-money');
    this._hudServed = document.getElementById('hud-served');
    this._hudTime   = document.getElementById('hud-time');
    this._hudEl     = document.getElementById('hud');

    /* Service panel elements */
    this._orderDisplay    = document.getElementById('order-display');
    this._feedbackDisplay = document.getElementById('feedback-display');

    /* Summary elements */
    this._summaryMoney     = document.getElementById('summary-money');
    this._summaryServed    = document.getElementById('summary-served');
    this._summaryLost      = document.getElementById('summary-lost');
    this._summaryScore     = document.getElementById('summary-score');
    this._summaryHighscore = document.getElementById('summary-highscore');
    this._summaryMessage   = document.getElementById('summary-message');

    /* Feedback auto-clear timer */
    this._feedbackTimer = null;
  }

  /* ── Screen transitions ─────────────────────────────────── */
  showScreen(name) {
    Object.entries(this._screens).forEach(([key, el]) => {
      if (key === name) {
        el.removeAttribute('hidden');
      } else {
        el.setAttribute('hidden', '');
      }
    });
    this._root.dataset.screen = name;
  }

  /* ── HUD updates ────────────────────────────────────────── */
  setMoney(amount) {
    this._hudMoney.textContent = amount;
  }

  setServed(count) {
    this._hudServed.textContent = count;
  }

  /**
   * @param {number} secondsLeft  Seconds remaining in the day.
   */
  setTimer(secondsLeft) {
    this._hudTime.textContent = secondsLeft;
    if (secondsLeft <= 10) {
      this._hudEl.classList.add('urgent');
      this._hudTime.closest('.hud-item')?.classList.add('urgent');
    } else {
      this._hudEl.classList.remove('urgent');
      this._hudTime.closest('.hud-item')?.classList.remove('urgent');
    }
  }

  /* ── Order display ──────────────────────────────────────── */
  /**
   * Show the current customer's order.
   * @param {Customer|null} customer
   */
  showOrder(customer) {
    if (!customer) {
      this._orderDisplay.innerHTML =
        '<span class="order-placeholder">No customer at counter</span>';
      return;
    }
    const drink = DrinkSystem.getDrink(customer.drinkId);
    if (!drink) return;
    this._orderDisplay.innerHTML = `
      <span style="font-size:26px;display:block;margin-bottom:4px">${drink.icon}</span>
      ${drink.name}
    `;
  }

  clearOrder() {
    this._orderDisplay.innerHTML =
      '<span class="order-placeholder">No customer at counter</span>';
  }

  /* ── Feedback messages ──────────────────────────────────── */
  /**
   * @param {string} message
   * @param {'success'|'error'|'info'} type
   * @param {number} [durationMs=2000]
   */
  showFeedback(message, type = 'info', durationMs = 2000) {
    clearTimeout(this._feedbackTimer);
    this._feedbackDisplay.className = `feedback-display ${type}`;
    this._feedbackDisplay.textContent = message;

    this._feedbackTimer = setTimeout(() => {
      this._feedbackDisplay.className = 'feedback-display';
      this._feedbackDisplay.innerHTML =
        '<span class="feedback-placeholder">Waiting for customers…</span>';
    }, durationMs);
  }

  /* ── Summary screen ─────────────────────────────────────── */
  /**
   * @param {object} stats
   * @param {number} stats.money
   * @param {number} stats.served
   * @param {number} stats.lost
   * @param {number} stats.score
   * @param {number} stats.highscore
   */
  showSummary({ money, served, lost, score, highscore }) {
    this._summaryMoney.textContent     = `$${money}`;
    this._summaryServed.textContent    = served;
    this._summaryLost.textContent      = lost;
    this._summaryScore.textContent     = score;
    this._summaryHighscore.textContent = highscore;

    // Motivational message
    const ratio = served / Math.max(1, served + lost);
    if (ratio >= 0.9)       this._summaryMessage.textContent = '⭐ Outstanding service! The shop is buzzing!';
    else if (ratio >= 0.7)  this._summaryMessage.textContent = '☕ Great work! The regulars loved it.';
    else if (ratio >= 0.5)  this._summaryMessage.textContent = '😅 Decent shift. Room for improvement!';
    else                    this._summaryMessage.textContent = '😬 Tough day… practice makes perfect!';

    this.showScreen('summary');
  }
}
