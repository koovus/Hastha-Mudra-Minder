# Hastha

A mindfulness and spiritual wellness web application inspired by Japanese Aikido philosophy. Hastha combines mudra practice, breathwork, divination tools, and reflective journaling into a serene, mobile-first experience.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![React](https://img.shields.io/badge/React-19-61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-required-336791)

## Features

### Daily Mudra Practice
Browse a curated library of traditional hand gestures (mudras) with Sanskrit names, step-by-step instructions, and listed benefits. A random mudra is featured on the home screen each session as "Today's Practice."

### Kokyu (Breath Work)
Six guided breathing techniques with an animated visual pacer:
- **Shikaku (Box)** - 4-4-4-4 pattern
- **Yasuragi (Rest)** - 4-7-8 pattern
- **Chowa (Harmony)** - 6-6 pattern
- **Kokyu (Deep)** - 4-16-8 pattern
- **Nagare (Flow)** - 4-2-8 pattern
- **Mushin (Empty Mind)** - 8-4-8-4 pattern

### Angel Number Cards
Draw from a deck of 22 angel number cards (111, 222, 333, etc.) for weekly guidance. Includes a shuffle animation and 7-day persistence so you keep the same card for a week before drawing again.

### D30 Sacred Dice
A 30-sided dice roller with animated 3D hexagonal SVG, number spread fan-out with distance-based opacity fading, and roll history.

### Audio Journal with Burn Ritual
- Record voice reflections directly in the browser using the MediaRecorder API
- Play back entries with full controls (play/pause, restart, seek via progress bar)
- Export entries as WAV files for offline use
- **Burn Ritual**: Release journal entries through an animated fire ceremony with four phases (igniting, burning, ashes, wind) using SVG particle effects
- Set timed burn timers (1 hour, 1 day, 1 week) for scheduled release

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| TypeScript | Type safety |
| Tailwind CSS 4 | Styling |
| Framer Motion | Animations (breath pacer, burn ritual, dice) |
| TanStack React Query | Server state management |
| Wouter | Client-side routing |
| Radix UI | Accessible component primitives |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|---|---|
| Express 5 | HTTP server |
| TypeScript (tsx) | Runtime |
| Drizzle ORM | Database queries and schema |
| Zod | Request validation |
| PostgreSQL | Data persistence |

### Build
| Technology | Purpose |
|---|---|
| Vite | Frontend bundling and dev server with HMR |
| esbuild | Server bundling for production |

## Project Structure

```
hastha/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AudioJournal.tsx      # Recording, playback, burn ritual, WAV export
│   │   │   ├── BreathPacer.tsx       # Animated breathing guide with 6 techniques
│   │   │   ├── BurnRitual.tsx        # Fire animation with SVG particles
│   │   │   ├── HandIllustrator.tsx   # Mudra hand position visualization
│   │   │   ├── Layout.tsx            # App shell with header and bottom navigation
│   │   │   ├── MudraCard.tsx         # Mudra display card
│   │   │   └── ui/                   # shadcn/ui components
│   │   ├── pages/
│   │   │   ├── Home.tsx              # Dashboard with daily practice and quick links
│   │   │   ├── AngelCards.tsx        # Card drawing interface
│   │   │   ├── Breathe.tsx           # Breathing exercise selector
│   │   │   ├── Dice.tsx              # D30 sacred dice roller
│   │   │   ├── Journal.tsx           # Audio journal page
│   │   │   └── MudraDetail.tsx       # Individual mudra view
│   │   ├── lib/
│   │   │   ├── mudras.ts             # Mudra data and types
│   │   │   ├── queryClient.ts        # React Query configuration
│   │   │   └── utils.ts              # Utility functions
│   │   └── App.tsx                   # Router and providers
│   └── index.html
├── server/
│   ├── index.ts                      # Server entry point
│   ├── routes.ts                     # API route definitions
│   └── storage.ts                    # Database storage interface
├── shared/
│   └── schema.ts                     # Drizzle schema and Zod validation
└── package.json
```

## Database Schema

### mudras
| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| name | text | Display name |
| sanskritName | text | Sanskrit name |
| description | text | Description of the mudra |
| benefits | text[] | Array of benefits |
| instructions | text[] | Step-by-step instructions |
| image | text | Optional image data |
| category | text | Category grouping |
| isBuiltIn | boolean | Whether it's a built-in mudra |
| createdAt | timestamp | Creation timestamp |

### journal_entries
| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| title | text | Entry title |
| audioUrl | text | Base64-encoded audio data |
| duration | text | Formatted duration string |
| mood | text | Optional mood tag |
| burnAt | timestamp | Scheduled burn time |
| burnedAt | timestamp | Actual burn time |
| createdAt | timestamp | Creation timestamp |

### angel_cards
| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| name | text | Card number (e.g., "111") |
| message | text | Card message |
| meaning | text | Deeper meaning |

### angel_card_draws
| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| angelCardId | UUID | Reference to angel card |
| drawnAt | timestamp | When the card was drawn |

## API Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/mudras` | List all mudras |
| GET | `/api/mudras/random` | Get a random mudra for daily practice |
| GET | `/api/mudras/:id` | Get a specific mudra |
| POST | `/api/mudras` | Create a new mudra |
| GET | `/api/journal` | List active journal entries |
| POST | `/api/journal` | Create a journal entry |
| POST | `/api/journal/:id/burn` | Burn an entry immediately |
| POST | `/api/journal/:id/burn-timer` | Set a delayed burn timer |
| DELETE | `/api/journal/:id` | Delete an entry permanently |
| GET | `/api/angel-cards/current` | Get the current week's drawn card |
| POST | `/api/angel-cards/draw` | Draw a new angel card |
| POST | `/api/seed` | Seed database with built-in data |

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database

### Installation

```bash
git clone https://github.com/your-username/hastha.git
cd hastha
npm install
```

### Environment Variables

Create a `.env` file or set the following environment variable:

```
DATABASE_URL=postgresql://user:password@localhost:5432/hastha
```

### Database Setup

Push the schema to your database:

```bash
npm run db:push
```

Seed the database with built-in mudras and angel cards:

```bash
curl -X POST http://localhost:5000/api/seed
```

### Development

```bash
npm run dev
```

The app runs at `http://localhost:5000` with hot module replacement enabled.

### Production Build

```bash
npm run build
npm run start
```

## Design Philosophy

Hastha draws from Japanese Aikido aesthetics with a zen minimalist approach:
- Deep indigo and vermillion color palette
- Rice paper-inspired backgrounds
- Noto Serif JP for headings, Inter/Plus Jakarta Sans for body text
- Mobile-first layout (max-width 448px, centered on larger screens)
- Mindful micro-animations and transitions

> "True victory is victory over oneself." - Morihei Ueshiba, Founder of Aikido

## License

MIT
