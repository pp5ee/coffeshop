# Pixel Coffee Shop

A pixel-art coffee shop simulation game built with vanilla JavaScript. Manage your coffee shop by serving customers their favorite drinks before their patience runs out!

## Features

- **Pixel-art aesthetic** with crisp, chunky UI elements and smooth animations
- **Customer management** with queueing system, visual avatars, and patience tracking
- **Drink preparation** with 5 different beverage types (☕ Coffee, 🍵 Tea, 🥤 Smoothie, 🥛 Latte, 🍫 Hot Chocolate)
- **Time-based gameplay** with 60-second rounds and scoring system
- **High score tracking** with localStorage persistence
- **Accessible design** with ARIA labels, keyboard navigation, and screen reader support
- **Responsive layout** that works on desktop and mobile devices

## Gameplay

1. **Start Screen** - Click "Start Serving" to begin your shift
2. **Game Screen** - Serve customers by matching their drink orders
3. **Summary Screen** - View your performance metrics and earnings

## How to Play

1. **Start the game** by clicking the "Start Serving" button
2. **Customers will appear** and queue up automatically every 5 seconds
3. **Monitor the queue** - customers move from right to left toward the counter
4. **Read orders** - when a customer reaches the counter, their drink order appears in the service panel
5. **Serve drinks** - click the corresponding drink button to serve them
6. **Manage patience** - each customer has a patience meter (green → yellow → red)
7. **Earn money** - receive payment for each correct order served
8. **Game ends** after 60 seconds - view your final score and performance

## Controls

- **Mouse/Touch**: Click drink buttons to serve customers
- **Keyboard**: Tab through buttons and press Enter/Space to select

## Scoring System

- **Correct Order**: +$3-$5 (varies by drink type)
- **Incorrect Order**: $0 earned
- **Customer Leaves**: $0 earned (patience runs out)

## Drink Types & Prices

- ☕ **Coffee**: $3 - Classic black coffee
- 🍵 **Tea**: $3 - Herbal tea selection
- 🥤 **Smoothie**: $4 - Fruit smoothie blend
- 🥛 **Latte**: $4 - Creamy milk coffee
- 🍫 **Hot Chocolate**: $5 - Rich chocolate drink

## Technical Details

Built with vanilla JavaScript using modern web technologies:
- **ES6 classes** for modular game systems (Game, Customer, DrinkSystem, etc.)
- **CSS Grid/Flexbox** for responsive, pixel-perfect layouts
- **CSS custom properties** for consistent theming and easy customization
- **LocalStorage API** for high score persistence between sessions
- **CSS animations** for smooth customer movements and visual feedback
- **Accessibility features** including ARIA labels and keyboard navigation

## File Structure

```
├── index.html          # Main HTML file with all game screens
├── css/
│   └── game.css        # Complete pixel-art styling system with animations
├── js/
│   ├── game.js         # Main game engine, state management, and core loop
│   ├── drinks.js       # Drink system with 5 beverage types and pricing
│   ├── customer.js     # Customer entity class and CustomerManager system
│   ├── queue.js        # Queue position management and visual markers
│   └── ui.js           # UI management, screen transitions, and feedback
└── README.md           # Complete game documentation
```

## Getting Started

1. **Download or clone** the repository
2. **Open `index.html`** in your web browser
3. **Start playing** - no build process or dependencies required!

## Browser Compatibility

Works in all modern browsers that support:
- ES6 modules and classes
- CSS Grid and Flexbox
- CSS custom properties (variables)
- LocalStorage API

## Development

The game is built with clean, modular JavaScript that's easy to extend:
- Add new drink types in `js/drinks.js`
- Modify customer behavior in `js/customer.js`
- Customize visuals in `css/game.css`
- Extend gameplay mechanics in `js/game.js`

## License

Open source - feel free to modify and extend for your own projects!