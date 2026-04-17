CORE_RISKS:
- “Complete browser game prototype” is underspecified; without a scope cap, this can sprawl into art pipeline, balancing, UI polish, animation, and simulation complexity.
- “Built from scratch” plus “modular code structure” is feasible, but modularity can be overengineered in a tiny JS project if no explicit architecture is chosen early.
- “Pixel-art inspired” is a style direction, not a requirement set; without constraints on resolution, palette, sprite source, and animation fidelity, implementation can drift or stall on visuals.
- Customer flow is the highest systemic risk: door spawning, pathing, queue slot assignment, counter service state, patience decay, and exit behavior all need deterministic rules or bugs will compound quickly.
- Clickable drink preparation sounds simple, but order correctness, prep time, input locking, customer targeting, and handoff rules are not defined; this is a common source of unclear gameplay.
- “Simple animations or tile-based movement” hides a design fork: continuous movement and path interpolation are more work, while tile snapping may feel stiff unless the whole game is designed around it.
- End-of-day summary implies a time model, lose/win conditions, and session length, none of which are currently defined.
- The deliverable asks for git commits, but in many automated build contexts that may be out of scope or undesirable unless explicitly required during execution.
- “Runs locally without heavy dependencies” is feasible, but if the prototype uses ES modules, local launching via `file://` can behave differently across browsers unless a tiny local server is assumed.
- Browser performance is likely fine for a small queue sim, but timing bugs from `setInterval`, frame-rate dependence, and state mutation can make the prototype feel unreliable if no main loop approach is specified.

MISSING_REQUIREMENTS:
- Explicit gameplay loop: what the player actually does per order besides clicking a drink button.
- Drink system detail: how many drink types, whether there are ingredients, whether prep takes time, and whether multi-step recipes exist.
- Service interaction: how the player selects which waiting customer receives the prepared drink.
- Queue rules: max queue length, what happens when full, whether new customers stop spawning, and whether blocked paths are allowed.
- Patience model: starting ranges, decay speed, whether it changes while moving vs waiting, and whether UI exposes it numerically or visually.
- Day system: fixed timer, target revenue, number of customers, difficulty ramp, and explicit end conditions.
- Failure states: can the player lose, or is it only a summary screen.
- Economy rules: drink prices, penalties for wrong drinks, refunds, or unhappy-customer penalties.
- Customer variety: purely cosmetic or behaviorally distinct.
- Feedback rules: what exact text, sounds, highlights, or animations communicate success, failure, and urgency.
- Accessibility basics: keyboard support, color contrast, reduced-motion handling, readable font sizing.
- Audio: absent by omission; if excluded, that should be explicit.
- Save/progression expectations: single-session only, or persistent high score/local storage.
- Asset sourcing: handcrafted CSS/canvas art, embedded SVG, or external image assets.
- Browser support targets: modern Chromium only, or broader support.
- Deployment/run method: static files only, or requires a dev server.
- Testing expectations: none are defined, but even a small prototype benefits from smoke-test criteria.

TECHNICAL_GAPS:
- No rendering approach is chosen. Plain DOM, Canvas 2D, or hybrid DOM+Canvas each changes complexity:
  - DOM is easiest for UI and simple sprites but can get awkward for layered movement.
  - Canvas is better for animation coherence but needs more custom UI/state plumbing.
  - Hybrid is often strongest here but requires clear boundaries.
- “Organize code by systems” is good, but there is no data model defined for customer entities, queue slots, orders, timers, and game state transitions.
- No update model is specified. A proper `requestAnimationFrame` loop with delta time is preferable to scattered timers.
- No state machine is defined for customers. At minimum they need states like `entering`, `joiningQueue`, `waiting`, `atCounter`, `served`, `leaving`, `expired`.
- Queue movement logic needs ownership rules: who occupies each slot, when slots collapse forward, and how transition conflicts resolve.
- UI architecture is unclear: if the player clicks drink buttons, where do current orders display, and how is the active service target determined.
- Balancing is unaddressed. Even a prototype needs spawn cadence, patience ranges, and payout values tuned together.
- “Clean UI panels” conflicts with “pixel-art inspired” unless a style system is defined; otherwise the interface can look detached from the scene.
- README requirements include “installation steps,” “usage examples with code snippets,” and “configuration options,” but a small static browser game may not naturally have meaningful installation/configuration unless these are deliberately introduced.
- The requirement for “complete runnable files” is feasible, but without a build step the project should avoid module patterns that complicate loading, or provide a minimal server instruction.

ALTERNATIVE_DIRECTIONS:
- Minimal static prototype:
  - Use HTML/CSS for layout and animated characters as positioned DOM elements.
  - Tradeoff: fastest to build, easiest to inspect and debug, but movement/scene layering can be less elegant.
- Canvas-first simulation:
  - Render room, queue, and customers on a single canvas; keep UI in DOM.
  - Tradeoff: best control over pixel-art feel and animation, but higher implementation effort.
- Grid/tile movement instead of free movement:
  - Customers move between predefined positions: door, queue slots, counter, exit.
  - Tradeoff: dramatically lowers pathing complexity and fits pixel style, but movement feels less organic.
- Single-step drinks only:
  - Each customer orders one of 3–5 direct drinks from buttons.
  - Tradeoff: very feasible for prototype, less depth but clearer pacing.
- Two-step prep system:
  - Example: choose base + serve, or choose drink then short brew timer.
  - Tradeoff: adds engagement, but substantially increases UI and state complexity.
- Session-based “day” with fixed 90–180 second timer:
  - Tradeoff: clean prototype scope and summary screen, but less sandbox feel.
- Score-attack focus instead of sim depth:
  - Emphasize speed, streaks, and clean feedback over realism.
  - Tradeoff: stronger arcade loop, weaker management fantasy.

QUESTIONS_FOR_USER:
- Do you want DOM, Canvas, or hybrid rendering?
- Should the prototype be pure static files, or is a tiny local server acceptable?
- How many drink types should exist in v1?
- Are drinks single-click selections, or multi-step preparation?
- How does the player choose which customer gets the prepared drink?
- What should happen on wrong drink delivery?
- How long is one in-game day?
- Is there a fail state, or only end-of-day scoring?
- Should customer patience be visible as bars, icons, color changes, or hidden?
- Do you want sound effects/music in scope?
- Should the art be code-drawn/placeholders, or do you expect handcrafted sprite assets?
- Is persistent high score via `localStorage` desired?
- Which browsers must be supported?
- Do you actually want git commits produced as part of delivery, or just commit message suggestions?

CANDIDATE_CRITERIA:
- Game loads from `index.html` and starts reliably in a supported browser.
- Start screen allows beginning a new day; end-of-day summary appears after a clearly defined condition.
- Scene includes visible shop interior, door, counter, queue area, and UI panels.
- Customers spawn from the door, occupy queue slots in order, advance when space opens, receive service at the counter, and exit visibly.
- Each customer has exactly one order and one patience metric that changes over time.
- Player can prepare and serve drinks through defined controls with unambiguous feedback.
- Correct service increases money and registers a happy departure.
- Timeout or incorrect service triggers a negative outcome with visible feedback.
- HUD shows at least money, customers served or orders completed, and current day/session status.
- Code is split into clear modules such as `state`, `customers`, `queue`, `drinks`, `ui`, and `game loop`.
- Movement and timers are frame-rate independent enough to behave consistently.
- README at `README.md:1` explains run instructions, scope, controls, architecture, and any assumptions.
- Acceptance scope should explicitly cap v1 to:
  - one room,
  - one queue lane,
  - 3–5 drink types,
  - one-day session,
  - no save system beyond optional high score,
  - no complex pathfinding,
  - no external backend.

A stronger plan direction would be:
- Define the core loop and state machine first.
- Choose hybrid rendering with DOM UI and either DOM sprites or Canvas scene.
- Use fixed queue slot positions instead of dynamic pathfinding.
- Limit drinks to a small set with one-click prep.
- Implement deterministic customer states before visual polish.
- Add juice last: feedback text, tweened movement, screen transitions, and summary details.

If you want, I can turn this into a sharper implementation-ready spec with milestone phases and a recommended file/module layout.
