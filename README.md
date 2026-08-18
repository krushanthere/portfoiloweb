<div align="center">

# ✦ Krushanta Podha // Interactive 3D Portfolio

**An obsidian-aesthetic, high-performance portfolio featuring WebGL shaders, 3D particle systems, ASCII morphing, and an interactive vinyl disc player.**

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3.1-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.8-blue?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-0.185-black?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[**Explore Live**](https://krushanta.dev) • [**Disc Player**](https://krushanta.dev/player) • [**GitHub**](https://github.com/krushanthere) • [**LinkedIn**](https://www.linkedin.com/in/krushantapodha-8b97042b4/)

---

</div>

## 🌌 Overview

This repository houses the personal developer portfolio and experimental creative computing playground of **Krushanta Podha**. Built from the ground up with **Next.js 16**, **React 19**, **Three.js / React Three Fiber**, and **Tailwind CSS v4**, the site combines cutting-edge WebGL graphics, procedural particle simulations, dynamic typography, and generative Web Audio synthesis into a cohesive obsidian minimalist experience.

---

## ✨ Key Features

### 🚀 1. Hyperspace Wormhole Preloader (`WormholePreloader`)
- Custom 3D canvas rendering an interactive particle tunnel with depth-accelerated warp speeds.
- Integrated procedural audio synthesizer utilizing the **Web Audio API** (filtered noise sweeps, sub-bass rumbles, and resonance bursts).
- Cybernetic telemetry HUD overlay displaying real-time warp coordinates, velocity metrics, and warp progress.

### 🖐️ 2. The Creation of Adam 3D ASCII & Particle Hands (`HandSphereSection`)
- 3D point-cloud and glyph reconstruction of Michelangelo's *The Creation of Adam* (Human Hand meeting Robotic Hand).
- Dynamic shader pipelines with customizable particle density, glow thresholds, and interactive cursor physics.
- Real-time morphing between glyph matrices and high-density point clouds.

### ✨ 3. Interactive Glitter Warp Background (`GlitterWarp`)
- Full-viewport ambient starfield reacting to cursor velocity, scroll offset, and viewport perspective.
- Particle glow diffusion with zero CPU overhead using custom canvas batching.

### 🪐 4. 3D Quote Sphere & Node Graph (`QuoteSphere` / `QuoteNodeGraph`)
- Interactive revolving 3D sphere mapping thoughts, philosophy, and engineering maxims into 3D space.
- Raycasted mouse interactions with spring-physics tooltips and node-link physics.

### 🎵 5. Minimalist Vinyl Disc Player (`DiscPlayer` / `/player`)
- Fully-interactive spinning vinyl record player with realistic groove reflections and tonearm physics.
- Multi-source audio integration (ambient generative synth pads, streaming feeds, and audio tracks).
- Global persistent audio engine (`GlobalMusicEngine`) retaining seamless playback state across page transitions.

### ⚡ 6. Obsidian Dark Aesthetic & Micro-Interactions
- Deep pure black palette (`#000000`) with high-contrast monochrome accents and glassmorphism.
- Fluid physics-based hover transitions and page reveals powered by **Motion (Framer Motion)** and **GSAP**.

---

## 🛠️ Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Webpack/Turbopack, Server/Client Components) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Core UI** | [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [PostCSS](https://postcss.org/) |
| **3D & Shaders** | [Three.js](https://threejs.org/), [@react-three/fiber](https://r3f.docs.pmnd.rs/), [@react-three/drei](https://github.com/pmndrs/drei), [@react-three/postprocessing](https://github.com/pmndrs/react-postprocessing) |
| **Animations** | [Motion](https://motion.dev/) (Framer Motion v13), [GSAP (GreenSock)](https://greensock.com/) |
| **Audio Engine** | Web Audio API (Procedural Synthesizers, Spatial Audio, Gain Nodes) |
| **Icons & Design** | [Lucide React](https://lucide.dev/), Custom Glyph Atlases, Geist Sans / Mono |

---

## 📁 Repository Structure

```
├── app/
│   ├── layout.tsx              # Root HTML shell, fonts, meta tags, and global audio context
│   ├── page.tsx                # Primary single-page portfolio layout
│   ├── globals.css             # Tailwind CSS v4 variables and custom shader classes
│   └── player/
│       └── page.tsx            # Dedicated Vinyl Disc Audio Player page route
├── components/
│   ├── Navbar.tsx              # Minimalist fixed glass navigation bar
│   ├── Hero.tsx                # Hero introduction and call-to-actions
│   ├── HeroScene.tsx           # 3D canvas hero background
│   ├── HandSphereSection.tsx   # Creation of Adam 3D ASCII & particle morphing section
│   ├── About.tsx               # Bio, background, and engineering philosophy
│   ├── Projects.tsx            # Featured project cards and live repository links
│   ├── Skills.tsx              # Interactive categorized tech skill matrix
│   ├── Experience.tsx          # Timeline and core journey milestones
│   ├── Contact.tsx             # Terminal-styled interactive contact section
│   ├── Footer.tsx              # Clean minimalist footer
│   ├── DiscPlayer.tsx          # Realistic spinning vinyl disc player
│   ├── GlobalMusicEngine.tsx   # Persistent background audio provider
│   ├── GlitterWarp.tsx         # Fullscreen interactive WebGL starfield
│   ├── QuoteSphere.tsx         # 3D revolving quote particle sphere
│   ├── QuoteNodeGraph.tsx      # Interactive connected node graph
│   └── WormholePreloader/      # 3D canvas hyperspace tunnel preloader & audio HUD
├── lib/
│   ├── animations.ts           # Shared motion & transition variants
│   ├── content.ts              # Projects, skills, journey, and contact data
│   ├── glyph-atlas.ts          # ASCII / glyph bitmap generation algorithms
│   ├── quotes.ts               # Curated quotes dataset
│   ├── music-context.tsx       # Global music player context
│   └── utils.ts                # Tailwind class mergers and helper utilities
├── public/
│   ├── data/                   # Precalculated 3D point cloud JSONs (hands, sphere)
│   ├── hands/                  # High-resolution source reference maps
│   └── images/                 # Project previews, album covers, and assets
└── scripts/
    ├── generate-all-data.mjs   # Automated point-cloud generator script
    ├── prep_image.py           # Image preprocessing utilities
    └── process-adam-hands.py   # 3D hand mesh coordinate extraction
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**, **pnpm**, or **yarn**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/krushanthere/rpor.git
   cd rpor
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```

4. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Launches the Next.js development server with hot-reloading |
| `npm run build` | Builds an optimized production bundle with type checking |
| `npm run start` | Runs the built production server locally |
| `npm run lint` | Executes ESLint to check for code quality and syntax issues |

---

## 💼 Featured Projects Showcased

- **[cargomind](https://github.com/krushanthere/cargomind)**: AI-driven logistics decision platform designed to optimize multi-node shipping operations and routing.
- **[Cargomind3.0](https://github.com/krushanthere/Cargomind3.0)**: Next-generation intelligent logistics platform with real-time predictive analytics.
- **[Howmuchtostudy](https://github.com/krushanthere/Howmuchtostudy)**: Natural Language Processing tool estimating personalized study schedules from plain-text goals.
- **[learnC](https://github.com/krushanthere/learnC)**: Comprehensive systems programming repository documenting C algorithms, data structures, and memory internals.

---

## 🚢 Deployment

### Deploy with Vercel (Recommended)

The easiest way to deploy this portfolio is using [Vercel](https://vercel.com/):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkrushanthere%2Frpor)

1. Push your repository to GitHub.
2. Import the project into Vercel.
3. Vercel will automatically detect Next.js and apply the optimal build configuration.

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).

---

## 📬 Connect

- **Portfolio**: [krushanta.dev](https://krushanta.dev)
- **GitHub**: [@krushanthere](https://github.com/krushanthere)
- **LinkedIn**: [Krushanta Podha](https://www.linkedin.com/in/krushantapodha-8b97042b4/)
- **Email**: [contact@krushanta.dev](mailto:contact@krushanta.dev)

<div align="center">
  <sub>Crafted with passion for creative code and obsidian minimalism.</sub>
</div>
