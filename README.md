# HaxOS ⚽

A feature-rich HaxBall headless room server for Real Soccer 7v7 gameplay. Built with TypeScript and the `haxball.js`
library.

The project was done by the students from IM-22 group:

* [Danyil Tymofeiev](https://github.com/SharpDevOps10)
* [Anton Dovzhenko](https://github.com/KobbAsa)
* [Nazarii Radichenko](https://github.com/radichenko)

## Installation

## Features

### ⚽ Realistic Soccer Rules

- **Throw-ins** — Ball placed at sideline when it goes out
- **Corner kicks** — Awarded when defending team kicks ball over their goal line
- **Goal kicks** — Awarded when attacking team kicks ball over goal line
- **Ball locking** — Ball stays in place until the correct team takes the restart

### 🏃 Advanced Physics

- **Sprint** — Hold kick button longer to activate a speed boost (💨 avatar)
- **Slide tackle** — Short kick hold triggers a sliding tackle (👟 avatar)
- **Fatigue system** — Players slow down after using sprint/slide abilities

### 🎮 Chat Commands

| Command             | Description                 |
|---------------------|-----------------------------|
| `!help`             | List all available commands |
| `!afk`              | Toggle AFK status           |
| `!admin <password>` | Login as admin              |
| `!start`            | Start the game (admin only) |
| `!stop`             | Stop the game (admin only)  |
| `!stats`            | View stats (coming soon)    |

### 🛡️ AFK System

- Automatic AFK detection for inactive players
- Warning before being moved to spectators
- Cooldown before returning from AFK

### 🔐 Security

- Argon2 password hashing for admin authentication
- Environment-based configuration

## Getting Started

### Prerequisites

- Node.js 18+
- A HaxBall headless token ([get one here](https://www.haxball.com/headlesstoken))

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd HaxOS

# Install dependencies
npm install

# Configure environment
cp .env.example .env
```

### Configuration

Edit `.env` with your settings:

```env
HAXBALL_TOKEN=your_headless_token_here
HAXBALL_ADMIN_PASSWORD=your_argon2_hashed_password
```

### Running

```bash
# Development (with hot reload)
npm run start:dev

# Production build
npm run build
```

### Docker

```bash
docker-compose up -d
```

### Deployment

HaxOS was deployed to DigitalOcean droplet using Docker. You can see the [Dockerfile](Dockerfile)
and [docker-compose.yml](docker-compose.yaml) files for more details. The link to the deployed room
is: https://www.haxball.com/play?c=UNXQbRdgI5U

## Project Structure

```
src/
├── afk/          # AFK detection system
├── commands/     # Chat command handlers
├── physics/      # Sprint, slide, fatigue mechanics
├── rules/        # Soccer rules (out, corners, etc.)
├── utils/        # Messaging, colors, fonts
└── index.ts      # Main entry point
maps/
└── uamap.hbs     # Custom stadium file
```

## Room Settings

- **Room name:** Real Soccer 7v7 [HaxOS v0.1]
- **Max players:** 14 (7v7)
- **Region:** Ukraine 🇺🇦
