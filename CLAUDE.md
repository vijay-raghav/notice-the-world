# The Noticing Engine 👁️

**Hackathon Theme:** Creative Flourishing  
**Objective:** A 1.5-hour build showcasing an interactive methodology inspired by *The Art of Noticing* to combat digital autopilot.

## Coding Standards
*   **Framework:** Next.js (App Router).
*   **Styling:** Tailwind CSS.
*   **UX/UI Constraints:** Strict Mobile-First approach. The application uses a constrained device-width wrapper, large touch targets, and a mindful UI color palette (soft slates and indigos) on desktop to simulate a premium iOS app feel.

## Agentic Memory
*   **API Architecture:** The backend was engineered to sequentially orchestrate Anthropic's state-of-the-art models:
    *   **Vision Step (`claude-sonnet-4-6`):** Captures base64 visual data to formulate a highly targeted, subjective question about a tiny, mundane detail. 
    *   **Evaluation Step (`claude-haiku-4-5-20251001`):** Computes a subjective text analysis on the user's response to generate a creative multiplier (`[1x]`, `[3x]`, or `[5x]`) using a strict grading rubric context.
