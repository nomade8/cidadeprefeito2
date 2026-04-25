
# EcoCity Builder: A Pedagogical Game of Urban Development Challenges

## 1. Project Idea & Concept

EcoCity Builder is an interactive city-building simulation game with a strong pedagogical focus on understanding the **challenges and consequences of rapid, unmeasured urban growth**. The core idea is to provide players (acting as city mayors) with a sandbox environment where their construction and policy decisions have tangible impacts on the city's finances, citizen happiness, and its ecological health, particularly under the pressures of expansion.

The game aims to teach players about:
-   The impact of urban planning (or lack thereof) on resource consumption (electricity, housing) and service provision.
-   The interconnectedness of social (happiness, services), economic (funds, income), and environmental (air/water quality, biodiversity) factors in a city, especially when facing rapid development.
-   The potential for infrastructure strain when development outpaces planning.
-   How unchecked growth can impact citizen happiness and environmental quality, even with well-intentioned development.
-   The complexities of balancing growth with maintaining a functional and livable city.

**Core Gameplay Loop:**
1.  **Build:** Players select from a variety of buildings (residential, commercial, industrial, public services, energy, parks) and place them on a 2D grid representing the city.
2.  **Manage:** Players manage the city's budget, considering construction costs, building maintenance, and income generation.
3.  **Simulate:** Time advances in months. Each month, the game simulates:
    *   Income and expenses.
    *   Housing capacity and population (population is based on available housing). New residences may develop automatically if conditions (happiness, services, space) are favorable, reflecting organic growth rather than chasing a "desired population" target.
    *   Changes in citizen happiness based on services, amenities, housing quality/availability (relative to having a home, not an abstract target), and environmental conditions.
    *   Changes in environmental metrics (air quality, water quality, biodiversity) based on the types and number of buildings.
    *   Electricity production and consumption.
4.  **Observe & Adapt:** Players observe the consequences of their actions through various UI panels and dashboards, adapting their strategy to manage the growth of their city.
5.  **Mandates:** The game features a mandate system (e.g., 60 months per mandate), offering a cycle for review and continuation, and unlocking new features like advanced buildings in subsequent mandates.

## 2. Technical Architecture & Code Structure

The game is built as a web application using **React**, **TypeScript**, and **Three.js** (via **@react-three/fiber** and **@react-three/drei**) for 3D rendering.

### Core Technologies:
-   **React 19:** For building the user interface components.
-   **TypeScript:** For static typing, improving code quality and maintainability.
-   **Three.js:** The underlying 3D graphics library.
-   **@react-three/fiber:** A React renderer for Three.js, allowing declarative 3D scene construction.
-   **@react-three/drei:** A collection of useful helpers and abstractions for @react-three/fiber.
-   **Tailwind CSS:** For styling the HTML-based UI elements (via CDN).
-   **uuid:** For generating unique IDs for buildings.

### Project Structure (`src/`):

The project is organized into logical directories:

-   **`components/`**: Contains React components.
    -   **`ui/`**: HTML-based UI components (e.g., `GameUI.tsx`, `Dashboard.tsx`, `EnvironmentalDashboard.tsx`, `Button.tsx`, `Notification.tsx`, `BarChart.tsx`).
    -   **`world/`**: React Three Fiber components for 3D objects (e.g., `Scene.tsx`, `Terrain.tsx`, `Road.tsx`, `House.tsx`, `Mountain.tsx`, specific building models).
-   **`context/`**: React Context API for global state management.
    -   `GameContext.tsx`: Manages the core game state (money, month, buildings, happiness, environmental metrics, etc.).
    -   `LanguageContext.tsx`: Manages internationalization (i18n) and provides translation functions.
-   **`data/`**: Static configuration data.
    -   `buildingData.ts`: Contains properties (cost, income, maintenance, environmental effects, electricity data) for all buildable structures.
-   **`game/`**: Core game logic and settings.
    -   `gameReducer.ts`: The reducer function that handles all game state transitions based on dispatched actions.
    -   `settings.ts`: Defines game constants, initial values for metrics, and unbuildable terrain features (river, mountains).
-   **`hooks/`**: Custom React hooks for encapsulating and reusing logic.
    -   `useGameLogic.tsx`: Provides a convenient API for UI components to interact with the game state, dispatch actions, and access calculated metrics.
    *   It also integrates with `LanguageContext` to provide translated UI messages.
-   **`locales/`**: Translation files for i18n.
    -   `en.ts`: English translation strings.
    -   `ptBR.ts`: Brazilian Portuguese translation strings.
-   **`types.ts`**: Global TypeScript type definitions and enums (e.g., `GameState`, `BuildingType`, `GameAction`, `TranslationKeys`).
-   **`utils/`**: Utility functions.
    -   `gridUtils.ts`: Functions for converting between 3D world coordinates and 2D grid coordinates.
-   **`App.tsx`**: The main application component, responsible for setting up the R3F Canvas, context providers, and overall layout.
-   **`index.tsx`**: The entry point of the React application.
-   **`index.html`**: The main HTML file.

### State Management:

-   **`GameContext` & `gameReducer`**:
    *   The primary state management solution, following the reducer pattern (`useReducer` hook).
    *   `initialState` is defined in `gameReducer.ts`.
    *   All game actions (e.g., building, advancing month) dispatch an action object, which the `gameReducer` processes to produce a new state.
    *   This centralizes game logic and ensures predictable state updates.
-   **`LanguageContext`**:
    *   Manages the current language (English or Brazilian Portuguese).
    *   Provides a translation function `t(key, options?)` that components use to display localized text.

### Game Logic:

-   **`gameReducer.ts`**:
    *   **Building Placement:** Validates if a building can be placed (affordability, tile occupancy, terrain restrictions like mountains/rivers, mandate requirements).
    *   **Monthly Advancement (`ADVANCE_MONTH`):**
        *   Calculates income and maintenance.
        *   Updates player's money.
        *   Calculates housing capacity and current population (based on available housing).
        *   Recalculates `happiness` based on parks, public services, electricity coverage, and other factors (no longer directly penalized by unmet "desired population").
        *   Recalculates environmental metrics (`airQuality`, `waterQuality`, `biodiversity`) based on the cumulative effects of all buildings.
        *   Calculates `electricityProduction` and `electricityConsumption`.
        *   Handles automatic development of new residences if conditions (high happiness, available space, services) are met.
        *   Checks for game over conditions (bankruptcy) or mandate completion.
-   **`BUILDING_DATA` (`data/buildingData.ts`):** A crucial configuration object mapping each `BuildingType` to its specific attributes:
    *   `cost`, `income`, `maintenance`
    *   `housingProvided`, `happinessEffectMonthly`
    *   `electricityConsumption`, `electricityProduction`
    *   `airQualityEffectMonthly`, `waterQualityEffectMonthly`, `biodiversityEffectMonthly`
    *   `requiresRiver` (for buildings like Hydro Power Plants).
-   **`settings.ts`**: Defines all initial values, constants for gameplay mechanics (e.g., `MANDATE_DURATION_MONTHS`, `HAPPINESS_PENALTY_LOW_ELECTRICITY_MONTHLY`), and static terrain features.

### Rendering:

-   **`App.tsx`**: Sets up the main R3F `<Canvas>` and the overall flex layout for the `EnvironmentalDashboard` (side panel) and the main game area.
-   **`Scene.tsx`**: The R3F component responsible for rendering all 3D elements within the canvas, including:
    *   Lights (ambient, directional, hemisphere).
    *   Camera controls (`OrbitControls`).
    *   The `Terrain` component (which includes the ground, grid, and river).
    *   The `Mountain` component.
    *   Dynamically rendering all `buildings` from the game state using their respective 3D components (e.g., `<House />`, `<Road />`, `<SolarPowerPlant />`).
    *   Fog for atmospheric effect.
-   **Individual 3D Components (`components/world/`):** Each buildable entity (and terrain features) has its own React component that defines its 3D geometry and materials (e.g., `House.tsx` uses `boxGeometry` and `coneGeometry`).
-   **Building Placeholder:** `Terrain.tsx` includes logic (`BuildingPlaceholderWithColorLogic`) to render a semi-transparent preview of the selected building at the hovered grid location, color-coded for placement validity.

### UI Components:

-   **`GameUI.tsx`**: The main HTML overlay component. It displays:
    *   Top bar: Game title, key stats (Funds, Month, Happiness), Dashboard button, Language switcher.
    *   Bottom bar: Construction menu (buttons for each building type with tooltips showing cost, effects, etc.) or Mandate End/Game Over messages.
    *   Manages the display of the `Notification` and the main `Dashboard` modal.
-   **`Dashboard.tsx`**: A modal dialog displaying comprehensive city statistics (finances, population, happiness, structure counts) and bar charts for financial overview and building distribution.
-   **`EnvironmentalDashboard.tsx`**: A collapsible side panel (on the left) displaying real-time environmental metrics (Air Quality, Water Quality, Biodiversity) and electricity statistics (Production, Consumption, Coverage).
-   **Reusable Elements:**
    *   `Button.tsx`: A styled, reusable button component.
    *   `Notification.tsx`: Displays transient messages to the player (e.g., "Building built!", "Not enough money!").
    *   `BarChart.tsx`: A simple component to render bar charts for the dashboards.

### Internationalization (i18n):

-   Uses `LanguageContext` and a `useLanguage` hook.
-   Locale files (`locales/en.ts`, `locales/ptBR.ts`) store key-value pairs for all UI strings.
-   The `t(key, options?)` function is used throughout UI components for translation.
-   Game messages from the `gameReducer` use `messageKey` and `messagePayload` to support dynamic, translatable messages.

### Key Features Implemented:

-   **Grid-based Building System:** Roads, houses, markets, parks, apartments, schools, health posts, police stations.
-   **Advanced Energy Options:** Thermal, Solar, and Hydroelectric power plants with different costs, outputs, and environmental impacts. Hydro plants require river placement.
-   **Resource Management:** Money (income, expenses, maintenance).
-   **Time Progression:** Automatic month advancement with a settable interval.
-   **Mandate System:** Game progresses in mandates (e.g., 60 months), after which results are shown and the player can continue. New buildings (Apartments) unlock in later mandates.
-   **Population & Housing:** Population is determined by available housing capacity. New residences (houses, apartments) can develop automatically under favorable conditions (happiness, services, space), representing organic growth. Apartment generation rules have been modified to illustrate growth impacts.
-   **Happiness Metric:** Influenced by parks, public services, housing availability, and electricity coverage.
-   **Environmental Metrics:**
    *   Air Quality, Water Quality, Biodiversity.
    *   These are affected monthly by the types and number of buildings.
-   **Electricity Management:** Buildings consume electricity; power plants produce it. Coverage percentage affects happiness.
-   **Terrain Features:**
    *   Enlarged terrain (`30x30` grid).
    *   A procedurally placed river that allows "bridge" (road) construction.
    *   A mountain area. Both river (for non-roads) and mountain tiles are unbuildable.
-   **Interactive UI:**
    *   Main game UI with stats and construction menu.
    *   Modal Dashboard with detailed statistics and charts.
    *   Collapsible Environmental Dashboard for real-time ecological data.
    *   Notifications for game events.
-   **Language Switcher:** Toggle between English (EN) and Brazilian Portuguese (PT-BR).
-   **3D Scene:** Includes basic models for all buildings, terrain, river, mountain, lighting, and camera controls.

## 3. How to Run

1.  **Project Setup:**
    *   Ensure you have Node.js and npm (or yarn) installed.
    *   Set up a new React + TypeScript project. A common way is using Vite:
        ```bash
        npm create vite@latest ecocity-builder -- --template react-ts
        cd ecocity-builder
        ```
2.  **Replace Files:**
    *   Replace the contents of the `src/` directory in your new project with the `src/` files provided.
    *   Replace the `index.html` file in your project's root with the `index.html` provided.
    *   Add the `metadata.json` file to the project root (or as specified by your environment).
3.  **Install Dependencies:**
    *   The `index.html` uses an `importmap` for CDN-based dependencies, which simplifies setup for basic React, Three.js, R3F, Drei, and UUID. For a local development environment, you would typically install these via npm/yarn:
        ```bash
        npm install react react-dom three @react-three/fiber @react-three/drei uuid
        npm install --save-dev typescript @types/react @types/react-dom @types/three @types/uuid
        ```
        (If using the provided `index.html` with import maps, these explicit npm installs for the core libraries might be skippable for a quick start, but are good practice for robust development).
4.  **Tailwind CSS:**
    *   The `index.html` includes Tailwind CSS via a CDN script. No further Tailwind setup is needed for the provided MVP to work as is. For more complex projects, a local Tailwind CSS installation and configuration would be typical.
5.  **API Key (If Applicable):**
    *   The current version of the game does **not** use the Gemini API, so no API key setup is required. If this were to be added, `process.env.API_KEY` would need to be configured in your environment.
6.  **Start Development Server:**
    *   If using Vite:
        ```bash
        npm run dev
        ```
    *   If using Create React App (after ejecting or with Craco): `npm start`

The application should then be accessible in your web browser, typically at `http://localhost:5173` (for Vite) or `http://localhost:3000`.

## 4. Potential Future Enhancements

-   **More Building Types & Interactions:** Industrial zones, waste management, water treatment, advanced public transport to further explore growth impacts.
-   **Policy System:** Allow players to enact policies (e.g., development controls, infrastructure investment levels) that directly address or exacerbate growth challenges.
-   **Events & Scenarios:** Traffic jams, service shortages, citizen protests related to overcrowding or lack of amenities.
-   **Advanced Graphics & Models:** More detailed 3D models and visual effects to better represent a dense, growing city.
-   **Sound Design:** Background music and sound effects reflecting city density and activity.
-   **Education Pop-ups:** More explicit pedagogical information triggered by rapid growth milestones or negative consequences.
-   **Deeper Economic Simulation:** Land value changes, speculation, or economic impacts of infrastructure strain.
-   **Citizen Feedback System:** More detailed feedback on specific issues related to growth (e.g., "The city is too crowded!", "Services can't keep up!").

---

This documentation provides a good overview of EcoCity Builder's design and implementation, now tailored to explore the dynamics of urban growth.