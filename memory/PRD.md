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
- 2026-08-14 (v3): Replaced robot with procedural Animoji-style character (head + pupils track cursor, blink cycle, bob); gesture scroll is now strictly opt-in (no auto camera request; "Enable Camera for Gesture Scroll" button); aircraft upgraded from primitives to a detailed 524-mesh Airbus A380 glTF (Flightradar24 model, converted glTF 1.0→2.0 via gltf-pipeline, stored at /public/models/a380.glb) — meshes auto-grouped into fuselage/wingL/wingR/4 engine clusters/tailV/tailH/gear by node-name regex + centroid clustering, exploded with centroid-direction offsets, scrubbed assembly, dual glassmorphism cards (FP-BOT left, AirSimuPy + Fortran validation right), nose-first banked fly-off; content updates (GitHub Actions digest, Agentic RAG + Llama-3 8B Unsloth, Kafka/ClickHouse skills); real LinkedIn (/in/avni-bhardwaj10/) and LeetCode (/u/AvniBhardwaj10/) URLs everywhere incl. chat prompt.

## Verified
- /api/chat streams real GPT-5.4-mini answers about Avni (curl + UI).
- A380: exploded float, assembled state with both glass cards, banked nose-first fly-off. Tabs switch, theme toggle adapts 3D lighting, Animoji eye/head tracking + blink verified in both themes.
- Camera confirmed OFF on load (opt-in only). Real webcam tracking NOT verified (headless fake camera) — needs manual test.
- Photo attachment never arrived — avatar is a stylized default, not photo-derived.

## Backlog
- P0: Re-attach Avni's photo to personalize the Animoji (hair/skin/style) or commission a rigged GLB avatar; A380 has no interior meshes (seats/windows don't exist in this model) — swap for a model with interior if needed.
- P1: Rate-limit /api/chat; avatar idle animations; fill 5 certificate placeholder cards with real credentials; point project cards at exact repo URLs (currently profile/guessed links).
- P2: Mobile gesture fallback polish.

## v4 (2026-08-14)
- Photo-matched Animoji: warm skin tone, shoulder-length dark wavy hair with side locks, gold stud earrings, navy blazer + pale scarf (from user photo).
- Headline → "Computer Engineering | Data, Cloud & AI".
- Background 3D: wireframes replaced with a soft particle field + node cloud (no generic wireframe shapes), scroll-reactive.
- Clone Memory: chat persists per visitor — sessionId in localStorage, messages stored in MongoDB (db.chat_messages), GET /api/chat/history hydrates useChat on load.
- Assembly Sound Design: Web Audio servo clicks as each A380 group locks + whoosh on fly-off (initialized on first user gesture).
- Reduced Motion Mode: person-standing toggle in navbar (also respects prefers-reduced-motion); disables Lenis, scrub timelines (A380 renders statically assembled with cards visible), custom cursor, marquee/blob animations, framer reveals.
- Projects & Certificates: clickable magnetic cards (Research Agent, Financial Advisor, MapMyNotes, Pediatric Bone Age, IoT Actuator) + 5 dashed certificate placeholder slots linking to LinkedIn certifications.
- Leadership & Achievements: vertical timeline (7 nodes) with scroll-scrubbed glowing line, node reveal animations, dot glow on viewport entry, "View all achievements" expander.

## v5 (2026-08-14)
- Hero avatar scrapped; replaced with real 2D photo (/public/portrait.webp, rotated/cropped from user upload) in a glassmorphism frame with soft shadow, 3D tilt-on-hover (framer-motion springs), and floating "Indore · Open to opportunities" chip. HeroAvatar.tsx + robot.glb deleted.
- Contact section rebuilt: "CONTACT ME // LET'S CONNECT" kicker, LET'S CONNECT. masked headline, collaboration intro copy, details grid (Location: Indore MP, Email, Education: NMIMS Indore, Mobile: +91 96913 85721, Languages: English/Hindi/Korean (I)) with lucide icons; social pills retained.
- Humor quotes marquee (reverse, 70s) above footer: "Today no knowledge, tomorrow master." / "It works on my machine." / "Turning caffeine into scalable architecture." Clone prompt now uses these when asked about her learning process (verified live).

## v6 (2026-08-14)
- BUGFIX: aircraft vanished after switching to Projects tab and back — root cause: A380 component mutated the useGLTF-cached scene (meshes attached into discarded groups). Fixed by cloning the scene per mount (scene.clone(true)) + ScrollTrigger.refresh() after timeline creation. Verified via real wheel-scroll: exploded → assembly → fly-off all scrub correctly after tab roundtrip.
- Background particles calmed (900→340 particles, smaller, lower opacity) per user feedback.
- Light theme color variety: added --accent-2 (violet) and --accent-3 (amber); violet/rose mesh blobs; gradient CONNECT. headline; skill group titles and project card indices cycle through cyan/violet/amber.
- Résumé download: generated Avni_Bhardwaj_Resume.pdf (reportlab, scripts/make_resume.py) in /public; Résumé buttons in navbar and contact section.

## v7 (2026-08-14)
- Projects grid expanded to 9 real repo-linked cards with user-provided READMEs: Briefing-Bot-Automation (research agent), personal-finance-assistant (local Llama-3 GGUF + Ollama + ReAct tools), MapMyNotes, Job_search_automation (jobhunt), weather-mcp-server, MLPROJECT (fake news NLP), Pediatric Bone Age, IoT Actuator, speed-typing-game.
- Certificates moved to dedicated section: scroll-snap carousel of round "vinyl disc" cards (spin on hover, arrows, photos drop into /public/certificates/cert-0X.jpg when user provides folder). Chapter renumbered: Contact is now 05.
- Clone prompt updated with all new repos.

## Next Tasks
1. Swap in final avatar model + social URLs from user.
2. Add chat history persistence + basic rate limiting.
3. Reduced-motion accessibility mode.
