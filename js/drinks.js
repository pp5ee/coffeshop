/**
 * drinks.js — Drink catalogue and preparation mechanics.
 *
 * Defines the available drinks, their prices, and exposes a
 * DrinkSystem that renders the clickable drink buttons and
 * handles the "serve drink" action.
 */

/* ── Drink catalogue ────────────────────────────────────────── */
const DRINKS = [
  { id: 'espresso',   name: 'Espresso',    icon: '☕', price: 3 },
  { id: 'latte',      name: 'Latte',       icon: '🥛', price: 4 },
  { id: 'cappuccino', name: 'Cappuccino',  icon: '☕', price: 4 },
  { id: 'tea',        name: 'Green Tea',   icon: '🍵', price: 3 },
  { id: 'frappe',     name: 'Frappe',      icon: '🧋', price: 5 },
];

/* ── DrinkSystem ────────────────────────────────────────────── */
class DrinkSystem {
  /**
   * @param {object} opts
   * @param {Function} opts.onServe  Called with (drinkId) when player clicks a drink.
   */
  constructor({ onServe }) {
    this._onServe = onServe;
    this._container = document.getElementById('drink-buttons');
    this._enabled = false;
  }

  /** Render drink buttons into the DOM (called once on init). */
  renderButtons() {
    this._container.innerHTML = '';
    DRINKS.forEach(drink => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-drink';
      btn.dataset.drinkId = drink.id;
      btn.disabled = true;
      btn.innerHTML = `
        <span class="drink-icon" aria-hidden="true">${drink.icon}</span>
        <span class="drink-name">${drink.name}</span>
        <span class="drink-price" aria-label="price $${drink.price}">$${drink.price}</span>
      `;
      btn.addEventListener('click', () => {
        if (this._enabled) this._onServe(drink.id);
      });
      this._container.appendChild(btn);
    });
  }

  /** Enable / disable all drink buttons. */
  setEnabled(enabled) {
    this._enabled = enabled;
    const buttons = this._container.querySelectorAll('.btn-drink');
    buttons.forEach(btn => { btn.disabled = !enabled; });
  }

  /** Return drink object by id, or null. */
  static getDrink(id) {
    return DRINKS.find(d => d.id === id) || null;
  }

  /** Return a random drink id (used when building customer orders). */
  static randomDrinkId() {
    return DRINKS[Math.floor(Math.random() * DRINKS.length)].id;
  }

  /** Return a copy of the full catalogue. */
  static getCatalogue() {
    return DRINKS.slice();
  }
}
