# Anvia Fullstack: HR Assistant

A ChatGPT-style HR assistant for **PT Maju Jaya Sakti** (a fictional Indonesian company), built with [Anvia](https://github.com/anvia-hq/anvia).

Employees ask about leave (cuti), overtime (lembur), THR, BPJS, PPh 21, contracts and termination. The agent answers from built-in summaries of company policy and Indonesian employment rules, and searches the web for figures that change often, such as the minimum wage.

> The company and its policies are mock data, and the Indonesian rule summaries are simplified. This is a demo, not legal advice.

## Features

- Streaming chat UI with markdown answers (dark mode)
- Multiple chat sessions: `/` starts a new chat, `/s/:id` continues one, and the sidebar lists past chats
- Conversation memory stored in PostgreSQL (`@anvia/memory-prisma` on Prisma 8)
- Web search and webpage reading tools (Tavily)
- Tracing and eval scores in Anvia Lens (optional)
- 20 eval cases scored for correctness, relevancy and expected numbers

## Tech stack

| Part | Tech |
|---|---|
| Monorepo | pnpm workspaces |
| API | Hono, `@anvia/server`, `@anvia/client` |
| Web | React 19, Vite, Tailwind CSS 4, TanStack Router (file-based), `@anvia/react`, `@anvia/react-ui` |
| Agent | `@anvia/core`, `@anvia/openai` (OpenAI-compatible gateway), Tavily |
| Database | PostgreSQL 16 (Docker), Prisma 8 (release candidate) |
| Observability | `@anvia/lens` |

## Project structure

```
apps/
  api/            Hono API: chat streaming, sessions, memory store
  web/            React app: new-chat page, chat page, sidebar
packages/
  agents/         The HR agent: model, instructions, context, tools, evals, Lens
  db/             Prisma 8 contract and database client
infra/lens/       Self-hosted Anvia Lens (Docker Compose), optional
docker-compose.dev.yaml   PostgreSQL 16 for development
```

Key files:

- [packages/agents/src/agent.ts](packages/agents/src/agent.ts): `createAgent()` and `runAgent()`
- [packages/agents/src/instructions.ts](packages/agents/src/instructions.ts): the system prompt
- [packages/agents/src/context/](packages/agents/src/context/): company policies and Indonesian rule documents
- [packages/agents/src/evals/](packages/agents/src/evals/): eval suites
- [packages/db/src/prisma/contract.prisma](packages/db/src/prisma/contract.prisma): database models
- [apps/api/src/index.ts](apps/api/src/index.ts): API routes
- [apps/web/src/routes/](apps/web/src/routes/): web pages

## Prerequisites

- Node.js 24 or later
- pnpm 11
- Docker (for PostgreSQL)
- An API key for an OpenAI-compatible model gateway, and a [Tavily](https://tavily.com) API key

## Setup

1. **Install dependencies**

   ```sh
   pnpm install
   ```

2. **Create the env file** in the project root and fill in your keys:

   ```sh
   cp .env.example .env
   ```

   | Variable | Required | Purpose |
   |---|---|---|
   | `OPENROUTER_API_KEY` | yes | Key for the model gateway. The gateway URL and default model are set in [model.ts](packages/agents/src/model.ts). |
   | `TAVILY_API_KEY` | yes, for web search | Used by the `search_web` and `read_webpage` tools |
   | `DATABASE_URL` | yes | The default matches `docker-compose.dev.yaml` |
   | `ANVIA_LENS_BASE_URL`, `ANVIA_LENS_PUBLIC_KEY`, `ANVIA_LENS_SECRET_KEY` | no | Turns on Lens tracing. Leave empty to turn it off. |

   All apps and scripts read this one root `.env` with Node's built-in `--env-file` flag.

3. **Start PostgreSQL** (it listens on port **5433** on your machine):

   ```sh
   pnpm run db:up
   ```

4. **Create the database tables:**

   ```sh
   pnpm run db:init
   ```

## Run

```sh
pnpm dev
```

- Web: http://localhost:5173
- API: http://localhost:3000. The web dev server forwards `/api` to it.

To run only one app, use `pnpm run dev:api` or `pnpm run dev:web`.

Stop the database with `pnpm run db:down`. Data is kept in a Docker volume.

## Scripts

Run these from the project root.

| Command | What it does |
|---|---|
| `pnpm dev` | Start the API and the web app |
| `pnpm run dev:api` / `dev:web` | Start one app |
| `pnpm run build` | Type-check the API and build the web app |
| `pnpm run db:up` / `db:down` | Start or stop PostgreSQL |
| `pnpm run db:emit` | Regenerate the contract files after editing `contract.prisma` |
| `pnpm run db:init` | Create missing tables (additive only, never drops anything) |
| `pnpm run evals` | Run all eval suites |
| `pnpm run evals:1` … `evals:4` | Run one suite: leave, overtime and THR, BPJS and tax, contracts and termination |
| `pnpm run lens:test` | Run one agent request and send its trace to Lens |

## How it works

1. On `/`, the user types a question. The app creates a session id and opens `/s/:id`, which sends the question.
2. The web app streams the request to `POST /api/chat` with an `x-session-id` header (`useChat` with `createHttpClientTransport`).
3. The API calls `runAgent()` with a Prisma memory store, scoped to the session and the user (`default-user`; there is no login yet). The agent loads earlier messages from memory, answers, and saves each new message.
4. The answer streams back to the browser through `agentToClientStream` and `createClientStreamResponse`.
5. The sidebar lists sessions from `GET /api/sessions`. Opening a chat loads its history from `GET /api/chat/:sessionId`.

API routes:

| Route | Purpose |
|---|---|
| `POST /api/chat` | Stream an agent answer. Needs the `x-session-id` header. |
| `GET /api/chat/:sessionId` | Saved messages of one session |
| `GET /api/sessions` | Sessions of `default-user`, newest first, titled by their first message |

## Database (Prisma 8)

This project uses the **Prisma 8 release candidate**, which works differently from Prisma 7:

- Models live in a "data contract", [contract.prisma](packages/db/src/prisma/contract.prisma), not `schema.prisma`.
- `pnpm run db:emit` writes `contract.json` and `contract.d.ts`. There is no generated client folder. Commit both files.
- The client comes from `@prisma/orm-postgres`. Import it with `import { db } from "@anvia/db"`.
- The `AgentMemory*` models were generated by the `@anvia/memory-prisma` CLI. Keep them between the `BEGIN/END ANVIA MEMORY` markers.

To change the database: edit `contract.prisma`, then run `pnpm run db:emit` and `pnpm run db:init`.

## Evals

There are 20 test questions with reference answers in [packages/agents/src/evals/](packages/agents/src/evals/), split into 4 suites. Each answer is scored on three metrics:

- `correctness`: an LLM judge compares the answer with the reference, using a 0–10 rubric. It passes at 0.7.
- `answerRelevancy`: whether the answer stays on the question. It passes at 0.7.
- `containsNumber`: a regex check for the key number, for example `/275[.,]?000/`.

Runs make real model calls. When Lens is configured, the scores are also published to Lens and linked to each run's trace. By default the agent judges its own answers; set `EVAL_JUDGE_MODEL_ID` to use another model as the judge.

## Lens (optional)

[infra/lens/](infra/lens/) contains a Docker Compose setup for a self-hosted Anvia Lens. Configure it with `infra/lens/.env`, based on its `.env.example`, then start it from that folder with `docker compose up -d`. Create keys in Lens and put them in the root `.env` as `ANVIA_LENS_*`.

Lens captures full prompts and answers (`captureMode: "full"` in [lens.ts](packages/agents/src/lens.ts)). Change it to `"safe"` if employee messages should not be stored there.

## Known limitations

- No authentication: every session belongs to `default-user`.
- Company data and the Indonesian rule summaries are mock data.
- Prisma 8 is a release candidate and may change before the stable release.
