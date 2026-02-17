# ClawdBlox Frontend

The admin dashboard for **MemoryWeave** — an AI-powered NPC engine that gives game characters persistent memory, unique personalities, and real-time conversational abilities.

Built with React, TypeScript, and a dark-themed macOS/iOS-inspired design system. Fully responsive with dedicated desktop and mobile interfaces.

**Live:** [clawdblox.xyz](https://clawdblox.xyz)

---

## Features

### NPC Management
- **AI Generation** — Describe a character in plain text and let the AI generate a complete profile (personality, backstory, speaking style). Optionally provide a name or roll a random fantasy name with the dice button.
- **Manual Creation** — Full control over every attribute: OCEAN personality traits, speaking style (vocabulary, formality, humor, verbosity), quirks, catchphrases, and backstory.
- **Lifecycle** — Create, edit, activate/deactivate, and delete NPCs from a unified interface.

### Real-Time Chat
- **WebSocket Streaming** — Talk to any NPC with token-by-token streaming responses, just like a modern AI chat interface.
- **Reconnection Logic** — Exponential backoff with heartbeat keep-alive ensures resilient connections.
- **Conversation History** — Browse past conversations by NPC, with full message threads and status tracking (active, ended, archived).

### Memory System
- **Four Memory Types** — Episodic, semantic, emotional, and procedural memories, each with importance levels and vividness scores.
- **Vector Search** — Find relevant memories using semantic similarity powered by pgvector embeddings.
- **Memory Decay** — Memories naturally fade over time based on importance, simulating realistic recall.

### Personality & Relationships
- **OCEAN Model** — Five-factor personality visualization with interactive radar charts (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism).
- **Relationship Tracking** — Monitor affinity, trust, and familiarity between NPCs and players with animated circular gauges.
- **Life Simulation** — Manage routines (daily schedules), goals (personal/professional/social), and inter-character relationships.

### Analytics & Administration
- **Dashboard** — At-a-glance stats for NPCs, conversations, memories, and relationships with bar charts for top NPCs.
- **API Key Management** — View, copy, and rotate API keys and player signing secrets with one click.
- **Channel Bindings** — Connect NPCs to Discord and Telegram channels for cross-platform interactions.
- **Team Management** — Invite collaborators with role-based access (owner, editor, viewer).
- **Project Settings** — Configure AI models (Groq), bring your own API key (BYOK), and tune system parameters.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 6 |
| State | Zustand 5 |
| Styling | Tailwind CSS 4 |
| Components | Radix UI (46 primitives) |
| Animations | Motion (Framer Motion) |
| Charts | Recharts |
| Icons | Lucide React |
| Notifications | Sonner |
| Testing | Vitest + Testing Library |

---

## Architecture

```
src/
├── app/
│   ├── App.tsx                 # Viewport detector (desktop vs mobile at 1024px)
│   ├── MobileApp.tsx           # Tab-based mobile shell
│   ├── components/             # Mobile screens + shared iOS-style UI
│   │   ├── ios-ui.tsx          # iOS design system (sections, rows, sliders, segmented controls)
│   │   ├── HomeScreen.tsx      # Dashboard overview
│   │   ├── NPCListScreen.tsx   # NPC list with swipe-to-delete
│   │   ├── NPCDetailScreen.tsx # Tabbed NPC detail (6 tabs)
│   │   ├── CreateNPCScreen.tsx # AI + manual NPC creation
│   │   ├── ChatLiveScreen.tsx  # Streaming chat interface
│   │   └── ...                 # Memories, settings, team, channels, etc.
│   └── desktop/
│       ├── DesktopApp.tsx      # Sidebar + content layout
│       ├── layout/             # Collapsible sidebar navigation
│       ├── screens/            # Desktop-specific screens
│       └── components/         # MacUI design system (cards, tables, inset sections)
├── stores/                     # Zustand stores
│   ├── auth.store.ts           # JWT auth + session management
│   ├── npc.store.ts            # NPC CRUD + AI generation
│   ├── memory.store.ts         # Memory management + vector search
│   ├── conversation.store.ts   # Conversation history + messaging
│   ├── life.store.ts           # Routines, goals, relationships
│   ├── project.store.ts        # Project settings + key rotation
│   ├── channel.store.ts        # Discord/Telegram bindings
│   ├── team.store.ts           # Team member management
│   ├── stats.store.ts          # Aggregated analytics
│   └── tutorial.store.ts       # Onboarding flow
├── lib/
│   ├── api.ts                  # HTTP client (JWT + API key auth)
│   ├── ws.ts                   # WebSocket service (streaming, heartbeat, reconnection)
│   ├── config.ts               # Environment configuration
│   ├── random-names.ts         # Fantasy name generator
│   └── utils.ts                # Helpers (OCEAN data, avatars, relative time)
└── styles/                     # Global CSS + Tailwind config
```

### Responsive Design

The app detects the viewport width at **1024px** and renders a completely different interface:

- **Desktop** — macOS-inspired sidebar layout with data tables, multi-panel views, and keyboard-friendly navigation.
- **Mobile** — iOS-style tab bar with stack-based navigation. Each tab (Home, NPCs, Chat, More) maintains its own screen stack with push/pop transitions.

### API Communication

Two authentication strategies depending on the route:

- **`adminFetch`** — JWT tokens stored in httpOnly cookies with automatic refresh on 401 responses. Used for authentication, project settings, and team management.
- **`apiFetch`** — API key sent via `x-api-key` header. Used for all v1 data endpoints (NPCs, memories, conversations, etc.).
- **WebSocket** — Native WebSocket with token-based auth, 25s heartbeat, and exponential backoff reconnection (up to 10 attempts).

---

## Screens

### Desktop

| Screen | Description |
|--------|-------------|
| **Overview** | Dashboard with stat cards, top NPCs bar chart, and recent NPCs list |
| **NPCs** | Searchable NPC table with inline create/edit/delete |
| **NPC Detail** | 6-tab view: Identity, Memories, Relationships, Life, Conversations, Chat |
| **Memories** | Filter by NPC, vector search, CRUD with type/importance badges |
| **Conversations** | Filter by NPC, message thread viewer with role indicators |
| **Analytics** | Aggregated metrics: NPCs, conversations, avg vividness, trust, familiarity |
| **Settings** | Project name, Groq model selector, BYOK API key input |
| **API Keys** | Show/hide/copy/rotate API key and player signing secret |
| **Channels** | Manage Discord and Telegram channel bindings per NPC |
| **Team** | Add/remove members with role-based access control |

### Mobile

| Screen | Description |
|--------|-------------|
| **Home** | Stat cards + active NPCs with OCEAN radar charts |
| **NPC List** | Searchable list with swipe-to-delete gestures |
| **NPC Detail** | Tabbed detail with personality sliders and relationship gauges |
| **Create NPC** | AI generation mode with dice name roller + full manual form |
| **Chat Select** | Pick an NPC to start a conversation |
| **Chat Live** | Real-time streaming chat with typing indicators |
| **More** | Access to memories, conversations, analytics, settings, API keys, channels, team |

---

## Design System

### Desktop — MacUI
Inspired by macOS system preferences:
- `MacCard` — Rounded cards with optional title and action buttons
- `MacTable` — Data tables with hover states and inline actions
- `MacInsetSection` — Grouped form sections with dividers

### Mobile — iOS-UI
Inspired by iOS Settings:
- `IOSSection` — Grouped sections with title and footer
- `IOSInputRow` — Label + input rows with chevron navigation
- `IOSSliderRow` — Labeled sliders with min/max descriptions
- `IOSSegmentedControl` — Tab-style segmented pickers

### Color Palette

| Role | Color | Usage |
|------|-------|-------|
| Primary | `#05b6f8` | Actions, links, focus states |
| Success | `#34C759` | Active badges, confirmations |
| Warning | `#FF9500` | Quirk tags, caution states |
| Danger | `#FF453A` | Delete buttons, errors |
| Accent | `#AF52DE` | Highlights, special elements |
| Surface | `#1C1C1E` | Card backgrounds |
| Background | `#000000` | App background (mobile) |
| Border | `#38383A` | Subtle separators |
| Muted | `#8E8E93` | Secondary text, placeholders |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A running [MemoryWeave](https://github.com/clawdblox/clawdBlox) backend instance

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

The app starts on `http://localhost:5173` by default.

### Configuration

Set the API URL via environment variable:

```env
VITE_API_URL=http://localhost:3000
```

### Build

```bash
npm run build
```

### Testing

```bash
npm test            # Run tests once
npm run test:watch  # Watch mode
```

---

## Related

- [MemoryWeave Backend](https://github.com/clawdblox/clawdBlox) — The API server powering this dashboard (Express + PostgreSQL + pgvector + Redis + WebSocket).

---

## License

Proprietary. All rights reserved.
