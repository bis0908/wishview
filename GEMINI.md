# GEMINI.md: Project WishView

This document provides a comprehensive overview of the WishView project, a Chrome extension designed to enhance the user experience on the Wishket platform. It is intended to be a living document for developers and contributors.

## 1. Project Overview

**WishView** is a Chrome Extension (Manifest V3) that allows users to view the hidden details of "private matching" projects on [Wishket](https://www.wishket.com/), a Korean freelance marketplace.

When a user navigates to a private project page, the extension automatically detects it, parses a hidden JSON-LD data script on the page, and displays the extracted project details (like budget, scope, and required skills) in an intuitive modal overlay.

### Core Technologies

- **Language**: JavaScript (ES2020+)
- **Platform**: Chrome Extension (Manifest V3)
- **Styling**: Vanilla CSS3 (Flexbox, Grid, Custom Properties)
- **Architecture**: Modular, class-based vanilla JavaScript. No external frameworks or build tools are currently used.

### Key Architectural Components

- **`manifest.json`**: The entry point of the extension. It defines permissions (`activeTab`, `storage`, `scripting`), the background service worker, content scripts, and the popup page.
- **`background.js`**: The service worker manages the extension's lifecycle, handles installation/update events, and processes background tasks. It acts as a central coordinator.
- **`content/`**: The content scripts and styles injected directly into Wishket project pages.
  - `WishViewController.js`: The main controller that orchestrates data extraction, UI rendering, and dynamic content detection on the page.
  - `ProjectDataProcessor.js`: Handles the logic for finding and parsing the JSON-LD data.
  - `styles/`: Contains the CSS for the modal UI, ensuring it blends with the Wishket site design.
- **`popup/`**: The HTML, CSS, and JavaScript for the popup that appears when the user clicks the extension icon. It provides manual controls, settings toggles, and status information.
- **`utils/`**: Contains helper modules for common tasks like DOM manipulation (`dom.js`), data parsing (`parser.js`), and interacting with `chrome.storage` (`storage.js`).

## 2. Building and Running

This project does not have a build step. It is run directly in the browser from the source files.

### Running the Extension for Development

1. Open the Google Chrome browser.
2. Navigate to the extensions page by entering `chrome://extensions/` in the address bar.
3. Enable **"Developer mode"** using the toggle switch in the top-right corner.
4. Click the **"Load unpacked"** button.
5. Select the root directory of this project (`D:\study\wishview`).

The extension will now be installed and active. To test its functionality, navigate to a project page on `https://www.wishket.com/project/`. If it's a private project, the extension's modal should appear automatically (if the "auto-show" setting is enabled).

### Debugging

- **Content Scripts**: Open the browser's developer tools (F12) on a Wishket project page and view the `Console` tab.
- **Background Script**: On the `chrome://extensions/` page, find the WishView extension and click the "service worker" link to open its dedicated dev tools.
- **Popup**: Right-click the extension icon, and select "Inspect" to open the dev tools for the popup.

## 3. Development Conventions

- **Coding Style**:
  - **Indentation**: 2 spaces.
  - **Quotes**: Single quotes (`''`).
  - **Semicolons**: Always used.
  - **Naming**: `camelCase` for functions/variables, `PascalCase` for classes, `UPPER_SNAKE_CASE` for constants.
- **Modularity**: The codebase is organized into distinct classes, each with a specific responsibility (e.g., `WishViewController`, `ProjectManager`, `SettingsManager`). This promotes separation of concerns.
- **Communication**: Components communicate via the standard Chrome Extension messaging APIs (`chrome.runtime.sendMessage`, `chrome.tabs.sendMessage`).
- **No Dependencies**: The project is self-contained and uses vanilla JavaScript and Web APIs, avoiding external libraries or frameworks to keep it lightweight and performant.

<MUST_FOLLOW_RULE>

## **CRITICAL**

**This is NOT optional**

- Comments, logs, and documents shall be written in Korean as a basic principle.
- Test codes shall be written using the Given-When-Then pattern.
- When writing functions, the logic for verifying parameters that must be entered shall be written first (edge case handling).
- If mcp cannot be called, the planned task shall be suspended and the user shall be notified.

---

## Development Guide

- KISS (Keep It Short and Simple)
  - We aim to reduce complexity and keep things simple.
  - We write concise and easy-to-understand code to facilitate maintenance.
  - We strive to solve problems with as little code as possible.

- DRY (Don't Repeat Yourself)
  - Remove duplicate code and create reusable components.
  - Code duplication increases maintenance costs and the likelihood of errors.
  - When changes are necessary, all duplicate code must be modified, making change management difficult.

- YAGNI (You Ain't Gonna Need It)
  - Avoid writing code or implementing features that you expect will be needed in the future.
  - Developing unnecessary features in advance is unnecessary work and increases complexity.
  - It is more efficient to implement only the features that are really needed when they are needed.

- Single Responsibility Principle (SRP)
  - An object should have only one responsibility (function).

---

- If you need to run the project yourself, check whether the process is already running. If it is running, do not run it again, but ask the user to check the currently running program.
- If the number of code lines exceeds 400, consider designing separate modules. (Less than 400 lines is acceptable; respond flexibly depending on the situation.)
