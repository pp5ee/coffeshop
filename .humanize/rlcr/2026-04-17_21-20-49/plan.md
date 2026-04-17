# Pixel Coffee Shop Browser Game Implementation Plan

## Goal Description
Create a complete browser-based coffee shop simulation game prototype using HTML, CSS, and JavaScript. The game features pixel-art aesthetics, customer service mechanics, and a modular code structure that runs locally without heavy dependencies.

## Acceptance Criteria

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

## Path Boundaries

Path boundaries define the acceptable range of implementation quality and choices.

### Upper Bound (Maximum Acceptable Scope)
The implementation includes a complete pixel-art coffee shop simulation with hybrid DOM/Canvas rendering, 5 distinct drink types, customer state machine with smooth animations, comprehensive UI feedback system, and modular code architecture with clear separation of concerns. The game features a complete day cycle with detailed end-of-day summary and persistent high score tracking.

### Lower Bound (Minimum Acceptable Scope)
The implementation includes a functional coffee shop simulation with DOM-based rendering, 3 basic drink types, core customer queue mechanics, essential UI elements, and a working game loop. The game demonstrates the complete customer flow from door to counter with basic drink service mechanics and score tracking.

### Allowed Choices
- Can use: Hybrid DOM/Canvas rendering, vanilla JavaScript modules, CSS animations, requestAnimationFrame game loop, localStorage for high scores
- Cannot use: External libraries or frameworks (React, Vue, etc.), backend dependencies, complex asset pipelines, WebGL rendering

> **Note on Deterministic Designs**: The draft specifies HTML, CSS, and JavaScript as required technologies, constraining the implementation approach to web technologies without external dependencies.

## Feasibility Hints and Suggestions

> **Note**: This section is for reference and understanding only. These are conceptual suggestions, not prescriptive requirements.

### Conceptual Approach
```javascript
// Core game architecture
class Game {
  constructor() {
    this.state = new GameState();
    this.customers = new CustomerManager();
    this.queue = new QueueSystem();
    this.drinks = new DrinkSystem();
    this.ui = new UIManager();
    this.updateLoop();
  }
  
  updateLoop() {
    // Update all systems
    this.customers.update();
    this.queue.update();
    this.ui.update();
    
    requestAnimationFrame(() => this.updateLoop());
  }
}

// Customer state machine
class Customer {
  states = ['ENTERING', 'QUEUE_WAITING', 'AT_COUNTER', 'SERVED', 'LEAVING'];
  
  update() {
    // Handle state transitions and movement
  }
}
```

### Relevant References
- `index.html` - Main entry point and game container
- `css/game.css` - Pixel-art styling and animations
- `js/game.js` - Core game initialization and loop
- `js/customer.js` - Customer behavior and state management
- `js/queue.js` - Queue system and position management
- `js/drinks.js` - Drink preparation and service logic
- `js/ui.js` - User interface and feedback systems

## Dependencies and Sequence

### Milestones
1. **Milestone 1: Core Game Foundation**
   - Phase A: Project structure and basic HTML/CSS setup
   - Phase B: Game state management and main loop implementation
   - Phase C: Basic UI framework and screen transitions

2. **Milestone 2: Customer System Implementation**
   - Step 1: Customer entity and state machine
   - Step 2: Queue system and position management
   - Step 3: Customer spawning and movement logic

3. **Milestone 3: Gameplay Mechanics**
   - Step 1: Drink system and preparation mechanics
   - Step 2: Service system and customer interaction
   - Step 3: Scoring and feedback systems

4. **Milestone 4: Polish and Completion**
   - Step 1: Visual polish and pixel-art styling
   - Step 2: Animation and visual feedback improvements
   - Step 3: Documentation and final testing

The customer system depends on the core game foundation. Gameplay mechanics depend on both the customer system and core foundation. Polish and completion depend on all previous milestones.

## Task Breakdown

Each task must include exactly one routing tag:
- `coding`: implemented by Claude
- `analyze`: executed via Codex (`/humanize:ask-codex`)

| Task ID | Description | Target AC | Tag (`coding`/`analyze`) | Depends On |
|---------|-------------|-----------|----------------------------|------------|
| task1 | Create project structure and HTML foundation | AC-1 | coding | - |
| task2 | Implement game state management system | AC-2 | coding | task1 |
| task3 | Design customer entity and state machine | AC-3 | analyze | task2 |
| task4 | Implement queue system and position logic | AC-3 | coding | task3 |
| task5 | Create drink system and preparation mechanics | AC-4 | coding | task2 |
| task6 | Implement service system and customer interaction | AC-4 | coding | task4, task5 |
| task7 | Build UI framework and screen transitions | AC-5 | coding | task2 |
| task8 | Implement scoring and feedback systems | AC-5 | coding | task6 |
| task9 | Apply pixel-art styling and visual polish | AC-6 | coding | task7 |
| task10 | Add animations and visual feedback | AC-6 | coding | task9 |
| task11 | Create README documentation | AC-7 | coding | task10 |
| task12 | Final testing and integration | AC-1-7 | coding | task11 |

## Claude-Codex Deliberation

### Agreements
- Both agree on the core customer flow: door → queue → counter → exit
- Both agree on modular code organization with clear system separation
- Both agree on the need for a proper game loop using requestAnimationFrame
- Both agree on the importance of clear visual feedback for player actions

### Resolved Disagreements
- **Rendering approach**: Codex suggested DOM/Canvas hybrid, Claude chose DOM-first for simplicity in a prototype. Resolution: Start with DOM for faster implementation, consider Canvas if animation complexity increases.
- **Drink complexity**: Codex suggested considering multi-step drinks, Claude opted for single-click simplicity. Resolution: Implement single-click drinks for v1, document multi-step as potential enhancement.
- **Customer variety**: Codex suggested cosmetic/behavioral variety, Claude focused on uniform behavior. Resolution: Implement uniform behavior first, document variety as enhancement.

### Convergence Status
- Final Status: `converged`

## Pending User Decisions

- DEC-1: Drink system complexity
  - Claude Position: Single-click drink selection for prototype simplicity
  - Codex Position: Consider multi-step preparation for engagement depth
  - Tradeoff Summary: Single-click is faster to implement but less engaging; multi-step adds depth but increases complexity
  - Decision Status: `PENDING`

- DEC-2: Customer patience visibility
  - Claude Position: Simple numeric or color-based indicators
  - Codex Position: Visual patience bars or icons for better feedback
  - Tradeoff Summary: Numeric is simpler to implement; visual bars provide better player experience
  - Decision Status: `PENDING`

- DEC-3: Sound implementation
  - Claude Position: Silent prototype unless audio is explicitly requested
  - Codex Position: Consider basic sound effects for feedback
  - Tradeoff Summary: Audio enhances immersion but adds complexity and browser compatibility concerns
  - Decision Status: `PENDING`

## Implementation Notes

### Code Style Requirements
- Implementation code and comments must NOT contain plan-specific terminology such as "AC-", "Milestone", "Step", "Phase", or similar workflow markers
- These terms are for plan documentation only, not for the resulting codebase
- Use descriptive, domain-appropriate naming in code instead

## Output File Convention

This template is used to produce the main output file (e.g., `plan.md`).

### Translated Language Variant

When `alternative_plan_language` resolves to a supported language name through merged config loading, a translated variant of the output file is also written after the main file. Humanize loads config from merged layers in this order: default config, optional user config, then optional project config; `alternative_plan_language` may be set at any of those layers. The variant filename is constructed by inserting `_<code>` (the ISO 639-1 code from the built-in mapping table) immediately before the file extension:

- `plan.md` becomes `plan_<code>.md` (e.g. `plan_zh.md` for Chinese, `plan_ko.md` for Korean)
- `docs/my-plan.md` becomes `docs/my-plan_<code>.md`
- `output` (no extension) becomes `output_<code>`

The translated variant file contains a full translation of the main plan file's current content in the configured language. All identifiers (`AC-*`, task IDs, file paths, API names, command flags) remain unchanged, as they are language-neutral.

When `alternative_plan_language` is empty, absent, set to `"English"`, or set to an unsupported language, no translated variant is written. Humanize does not auto-create `.humanize/config.json` when no project config file is present.

--- Original Design Draft Start ---

# Requirement

Create a complete browser game prototype called "Pixel Coffee Shop" using HTML, CSS, and JavaScript. Requirements: - Pixel-art inspired visual style - Runs locally without heavy dependencies - Modular code structure - Charming coffee shop interior scene - Customers visibly enter from the door, walk into a queue, move toward the counter, wait for service, then leave - Each customer has a drink order and a patience value - The player can prepare drinks through clickable buttons - If the player serves the correct drink, money increases and the customer leaves happy - If the player is too slow, the customer leaves unhappy - Include score/money/order counters - Include a start screen, active game state, and end-of-day summary - Include clean UI panels and readable feedback messages - Use simple animations or tile-based movement to make the scene feel alive - Organize code by systems such as state, customers, queue, drinks, UI, and update loop - Output complete runnable files and explain how to run them

---

## Standard Deliverables (mandatory for every project)

- **README.md** — must be included at the project root with: project title & description, prerequisites, installation steps, usage examples with code snippets, configuration options, and project structure overview.
- **Git commits** — use conventional commit prefix `feat:` for all commits.

--- Original Design Draft End ---
