# 👁️ Notice the World | Built for Creative Flourishing

Built By Vijay Raghavan at CMUAI x Claude Builders Hackathon

### 💡 The Philosophy
In *Machines of Loving Grace*, Dario Amodei outlines a future where AI handles routine drudgery, freeing humans to engage in deeper, more meaningful cognitive work. But as machines automate the ordinary, our human attention spans are under siege by endless doomscrolling and digital numbness. **Notice the World** flips this paradigm: it uses cutting-edge AI not to do the work *for* you, but to actively retrain your human attention span. By forcing you to pause and deeply observe the mundane, this app uses the power of subjective AI evaluation to stretch your "noticing muscle".

### ⚙️ How It Works
1. **The Snap:** Open the elegant mobile-first web app and use the native WebRTC integration to snap a quick photo of an ordinary, completely mundane object next to you.
2. **The Hook:** The photo is securely analyzed by **Claude Sonnet 4.6 (Vision)**. Acting as an empathetic creative coach, it finds a tiny, easily overlooked detail in the frame and challenges you to describe it in an entirely new way.
3. **The Flourish:** You submit your observation. **Claude Haiku 4.5** evaluates your wording for metaphor, poetic depth, and sensory scale. It then awards a celebratory multiplier (`[1x]`, `[3x]`, or `[5x]`) alongside tailored, encouraging feedback. 

### 🧠 How Claude Powers It 
Most AI apps ask the human for a prompt and generate an output. **I flipped the dynamic.** The AI prompts the human, and the human must do the creative work. 

This app is impossible without Claude's advanced reasoning and nuanced understanding of human emotion. I built a **Dual-Model Pipeline**:

1. **The Visionary Coach (Claude 4.6 Sonnet):** I pass a base64 image of a boring object to Claude via the Anthropic Vision API. Using a highly constrained system prompt, Claude ignores the obvious (e.g., "It's a cup") and isolates a microscopic detail to ask a profound, thought-provoking question (e.g., *"Notice the way the shadow warps around the handle. What does that shape remind you of?"*).
2. **The Subjective Grader (Claude 4.5 Haiku):** Once the user types their observation, I pipe the text to Haiku. Traditional code cannot grade human poetry. Haiku acts as an empathetic art critic, evaluating the user's text against a custom rubric for sensory depth and metaphor use, awarding a multiplier score (1x, 3x, or 5x) and a personalized, encouraging critique.

### 🏗️ The Architecture
*   **Frontend:** Next.js (App Router) combined with Tailwind CSS. Constrained strictly to mobile dimensions to prioritize touch UX, large interaction zones, and immersive focus.
*   **Camera Integration:** Native browser `navigator.mediaDevices.getUserMedia` implemented to natively bypass desktop OS file pickers for a seamless "in-app" camera feel.
*   **The AI Integration:** Handled via custom Next.js API Routes. LLMs strictly act as subjective *art graders* here. The application requires advanced vision capabilities to identify details, and nuance-aware language models to subjectively grade literary effort—a task entirely impossible for deterministic code.



### 🏗️ The Future

This is an app that encourages mindfulness and being observant, I envisage this as a fully gamified and social experience. 

### 🚀 Get Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure the Environment**
   Create a `.env.local` file at the root to securely house your API access:
   ```env
   ANTHROPIC_API_KEY="your-api-key-here"
   ```

3. **Boot the Dev Server**
   ```bash
   npm run dev
   ```
   *Navigate to `http://localhost:3000` to break out of autopilot.*
