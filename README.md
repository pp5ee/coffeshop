# Pixel Coffee Shop

A cozy browser-based coffee shop simulation game with a pixel-art aesthetic. Serve customers before their patience runs out, earn money, and survive a full day's shift!

## Prerequisites

- Any modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- No build tools, no package manager, no server required

## Installation

```bash
# Clone the repository
git clone <repo-url>
cd pixel-coffee-shop
```

That's it — no `npm install` or compilation step needed.

## Usage

Open `index.html` directly in your browser:

```bash
# macOS
open index.html

# Linux
xdg-open index.html

# Windows (PowerShell)
start index.html
```

Or drag `index.html` onto any browser window.

### How to play

1. Click **Open the Shop** on the start screen.
2. Watch customers enter from the door on the right and join the queue.
3. When a customer reaches the counter, their drink order appears in the **Current Order** panel.
4. Click the correct **drink button** in the service panel before the customer's patience bar empties.
5. Earn money for each correct order; wrong drinks still clear the customer but earn nothing.
6. Survive the 60-second day and review your end-of-day summary!

## Configuration

Game constants live at the top of `js/game.js` in the `CONFIG` object:

```js
const CONFIG = {
  dayDurationMs:    60_000,  // length of one in-game day (ms)
  spawnIntervalMs:   5_000,  // how often a new customer spawns (ms)
  patienceMs:       12_000,  // default customer patience duration (ms)
  highScoreKey: 'pixelCoffeeShop_highscore',  // localStorage key
};
```

Adjust these values to make the game easier or harder.

## Project Structure

```
pixel-coffee-shop/
├── index.html          # Entry point — all three screens (start / game / summary)
├── css/
│   └── game.css        # Pixel-art styling, animations, layout
├── js/
│   ├── drinks.js       # Drink catalogue (DRINKS array) + DrinkSystem class
│   ├── customer.js     # Customer entity, state machine + CustomerManager
│   ├── queue.js        # Visual queue-position markers (QueueSystem)
│   ├── ui.js           # Screen transitions, HUD, feedback (UIManager)
│   └── game.js         # Game orchestration, main loop, high-score storage
├── docs/
│   └── plan.md         # Implementation plan
└── requirements/
    └── draft.md        # Original design brief
```

### Architecture overview

```
Game (game.js)
 ├── UIManager      — switches screens, updates HUD, shows feedback
 ├── DrinkSystem    — renders drink buttons, handles "serve" clicks
 ├── CustomerManager— spawns & updates customers, fires callbacks
 └── QueueSystem    — draws decorative queue markers on the scene
```

Script load order (bottom of `index.html`) ensures each class is
defined before the one that depends on it:

```
drinks.js → customer.js → queue.js → ui.js → game.js
```
