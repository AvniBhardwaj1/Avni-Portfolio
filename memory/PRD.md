# PRD — Avni Bhardwaj Interactive Portfolio

## Original Problem Statement
Single-page developer portfolio (React, TypeScript, Tailwind, React Three Fiber, GSAP ScrollTrigger, MediaPipe Tasks Vision) with: webcam gesture scrolling (index-finger Y mapped to scroll), scroll-reactive 3D wireframe background, floating AI chatbot, hero (Avni Bhardwaj — Data, Cloud & AI Engineer), experience/projects cards (Airbus FP-BOT + AirSimuPy, Autonomous AI Research Agent, Deep Learning ensemble), grouped skills, contact footer. Iteration 2 added: GLB 3D avatar with mouse-tracking head in hero, "Apple-style" scroll-scrubbed aircraft assembly for the Airbus section, live LLM chatbot (Vercel AI SDK useChat + FastAPI + GPT-5.4-mini via Emergent key) as Avni's witty digital clone, pearl light mode with animated mesh gradients + light/dark toggle, custom magnetic cursor, glassmorphism sticky tabs (Industry Experience / AI & Data Projects), LeetCode link, console easter egg.

## Architecture
- Frontend: React 19 + TypeScript (craco/CRA), Tailwind, R3F + drei (3 canvases: background network, hero robot avatar, aircraft assembly), GSAP ScrollTrigger (pin + scrub), Lenis smooth scroll, framer-motion reveals, @mediapipe/tasks-vision (local wasm in /public/mediapipe/wasm, model from Google CDN), @ai-sdk/react useChat (streamProtocol: text).
- Backend: FastAPI /api/chat — StreamingResponse text/plain via emergentintegrations LlmChat (openai/gpt-5.4-mini), witty Avni-clone system prompt, per-session memory (sessionId from client).
- 3D assets: /public/models/robot.glb (RobotExpressive, three.js examples, placeholder).

## User Personas
- Recruiter/hiring manager scanning experience + asking the clone questions.
- Fellow developers (console easter egg, gesture scrolling, cursor-tracking robot).

## Implemented
- 2026-08-14 (v1): Hero masked name reveal, gesture scroll (MediaPipe) with live preview panel, theme-adaptive 3D wireframe network/torus-knot/icosahedron background scrubbed by ScrollTrigger, marquee, experience cards, skills clusters, contact footer, chat widget (mocked), light(default)/dark toggle.
- 2026-08-14 (v2): Robot avatar (useGLTF) with head/eye mouse tracking; scroll-scrubbed exploded→assembled→fly-off aircraft (pinned 300% section, GSAP timeline); live digital-clone chat (real LLM streaming, witty persona); pearl light theme + animated mesh gradient blobs; custom inverted-color magnetic cursor (GSAP quickTo); glass sticky tabs splitting Industry vs AI & Data Projects (added Personalized AI Financial Advisor card); GSAP parallax on project cards; GitHub/LinkedIn/LeetCode/email socials in hero + footer; console.log easter egg.

## Verified
- /api/chat streams real GPT-5.4-mini answers about Avni (curl + UI).
- Aircraft assembly scrub states (exploded/assembled/card overlay), tabs switch, theme toggle adapts 3D materials, chat live in UI, hero robot framed correctly.
- Gesture scroll auto-activates with camera (headless test used fake camera). Model loads from Google CDN — needs network.

## Backlog
- P0: Replace placeholder robot.glb with custom avatar GLB; real LinkedIn URL (currently placeholder /in/avnibhardwaj) and LeetCode URL (/u/avnibhardwaj1 placeholder).
- P1: Persist chat history in MongoDB per session; rate-limit /api/chat; robot idle animation (Idle clip via drei's useAnimations).
- P2: Mobile gesture fallback message polish; accessibility pass (reduced-motion mode); aircraft model upgrade to real GLTF.

## Next Tasks
1. Swap in final avatar model + social URLs from user.
2. Add chat history persistence + basic rate limiting.
3. Reduced-motion accessibility mode.
