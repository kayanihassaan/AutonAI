Auton AI 🎭

Auton AI is a terminal-first, open-source test automation engineer designed to live in your command line. It automatically converts natural language test criteria, user stories, or manual QA steps into production-ready, highly reliable Playwright or Cypress scripts. Powered by Gemini, Auton AI eliminates the boilerplate of writing E2E (end-to-end) tests while enforcing strict, modern locator and waiting best practices.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()


 📖 Project Description

Auton AI bridges the gap between natural language requirements and robust automated test suites. Instead of manually inspecting DOM structures and writing brittle selectors, developers and QA engineers can describe a user journey in plain English. Auton AI analyzes the target framework patterns, generates syntactically flawless test code, and structures it into proper test suites (`test.describe` / `it` blocks).

Built to match production standards, Auton AI defaults to modern locator strategies (like `page.getByRole` or `page.getByPlaceholder` in Playwright) to avoid flaky tests. It completely outlaws arbitrary hardcoded pauses, ensuring every script adheres to optimal async waiting mechanics.

---

💡 Key Use Cases

*   **Manual-to-Automated QA Translation:** Feed standard, bulleted QA manual test sheets directly into the terminal and receive fully formed `.spec.ts` or `.cy.js` files ready to run.
*   **Rapid Regression Suite Scaffolding:** Spin up entire suites of smoke or regression tests for a new feature path in seconds by describing the intended user behavior.
*   **TDD / BDD Framework Setup:** Write your test criteria in natural language *before* implementing a feature, allowing Auton AI to generate the failing test scripts for your development cycle.
*   **Cross-Framework Script Migration:** Easily translate existing Cypress Javascript routines into modern Playwright TypeScript suites with a single prompt.



⚙️ Core Functionality & Features

*   **Dual Framework Native Output:** Full, native support for generating both **Playwright (TypeScript/JavaScript)** and **Cypress (JavaScript)** syntax structures.
*   **Strict Smart-Locator Engine:** Enforces modern, accessible-first locator practices. It intentionally avoids fragile XPath paths or deep, easily broken CSS hierarchies unless absolutely necessary.
*   **Zero-Flakiness Guarantee:** Rejects unsafe automation practices. It handles element visibility checks and asynchronous transitions using built-in auto-waiting mechanisms instead of hardcoded sleeps (like `page.waitForTimeout(5000)`).
*   **Clean Markdown & File Exports:** Outputs isolated code blocks complete with a detailed "Architect’s Notes" section outlining any assumed URLs, structural assumptions, or environmental conditions.

📦 Installation on Linux

 Method 1: Quick Install Script (Recommended)
Download the binary optimized for your Linux architecture and append it straight to your local path:
```bash
curl -fsSL [https://auton.ai/install](https://auton.ai/install) | bash
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/ba98075f-25d6-4dab-b8b8-e2779d825425

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
