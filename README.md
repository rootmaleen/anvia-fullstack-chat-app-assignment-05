# Assignment 05

- Nama : Alin M
- Program : AI Product Engineering with Typescript
- Batch : 2
- Assignment Number : 5

# Anvia Fullstack: Customer Support Agent

A ChatGPT-style customer support assistant for **Toko Maju Elektronik**, a fictional Indonesian online store for home electronics, built with [Anvia](https://github.com/anvia-hq/anvia).

Customers ask about orders, shipping, payment, returns and refunds, warranty and vouchers. The agent answers from the store's policy documents, and uses tools to look up orders, track shipments and submit return requests.

> The store, its policies and its orders are mock data. This is a demo.

## Features

- Streaming chat UI with markdown answers, in a light theme
- Multiple chat sessions: `/` starts a new chat, `/s/:id` continues one, and the sidebar lists past chats
- New-chat page with four suggestion cards that send a starter question
- Mobile layout: the sidebar becomes a slide-in drawer
- Conversation memory stored in PostgreSQL (`@anvia/memory-prisma` on Prisma 8)
- Order tools on mock data: look up an order, track a shipment, submit a return request (only after the customer confirms)
- Web search and webpage reading tools (Tavily), for general product questions
- Tracing and eval scores in Anvia Lens (optional)
- 20 eval cases scored for correctness, relevancy and expected numbers

## Tech stack

| Part          | Tech                                                                                            |
| ------------- | ----------------------------------------------------------------------------------------------- |
| Monorepo      | pnpm workspaces                                                                                 |
| API           | Hono, `@anvia/server`, `@anvia/client`                                                          |
| Web           | React 19, Vite, Tailwind CSS 4, TanStack Router (file-based), `@anvia/react`, `@anvia/react-ui` |
| Agent         | `@anvia/core`, `@anvia/openai` (OpenAI-compatible gateway), Tavily                              |
| Database      | PostgreSQL 16 (Docker), Prisma 8 (release candidate)                                            |
| Observability | `@anvia/lens`                                                                                   |

## Project structure

```
apps/
  api/            Hono API: chat streaming, sessions, memory store
  web/            React app: new-chat page, chat page, header, sidebar, logo
packages/
  agents/         The support agent: model, instructions, context, tools, evals, Lens
  db/             Prisma 8 contract and database client
infra/lens/       Self-hosted Anvia Lens (Docker Compose), optional
docker-compose.dev.yaml   PostgreSQL 16 for development
```

Key files:

- [packages/agents/src/agent.ts](packages/agents/src/agent.ts): `createAgent()` and `runAgent()`
- [packages/agents/src/instructions.ts](packages/agents/src/instructions.ts): the system prompt
- [packages/agents/src/context/store.ts](packages/agents/src/context/store.ts): store profile and policy documents
- [packages/agents/src/tools/orders/](packages/agents/src/tools/orders/): order tools and mock orders
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

   | Variable                                                                | Required            | Purpose                                                                                                           |
   | ----------------------------------------------------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------- |
   | `OPENROUTER_API_KEY`                                                    | yes                 | Key for the model gateway. The gateway URL and default model are set in [model.ts](packages/agents/src/model.ts). |
   | `TAVILY_API_KEY`                                                        | yes, for web search | Used by the `search_web` and `read_webpage` tools                                                                 |
   | `DATABASE_URL`                                                          | yes                 | The default matches `docker-compose.dev.yaml`                                                                     |
   | `ANVIA_LENS_BASE_URL`, `ANVIA_LENS_PUBLIC_KEY`, `ANVIA_LENS_SECRET_KEY` | no                  | Turns on Lens tracing. Leave empty to turn it off.                                                                |

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

| Command                        | What it does                                                                                                   |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                     | Start the API and the web app                                                                                  |
| `pnpm run dev:api` / `dev:web` | Start one app                                                                                                  |
| `pnpm run build`               | Type-check the API and build the web app                                                                       |
| `pnpm run db:up` / `db:down`   | Start or stop PostgreSQL                                                                                       |
| `pnpm run db:emit`             | Regenerate the contract files after editing `contract.prisma`                                                  |
| `pnpm run db:init`             | Create missing tables (additive only, never drops anything)                                                    |
| `pnpm run evals`               | Run all eval suites                                                                                            |
| `pnpm run evals:1` … `evals:4` | Run one suite: returns and refunds, shipping and payment, warranty and vouchers, orders (uses the order tools) |
| `pnpm run lens:test`           | Run one agent request and send its trace to Lens                                                               |

## How it works

1. On `/`, the customer types a question or clicks a suggestion card. The app creates a session id and opens `/s/:id`, which sends the question.
2. The web app streams the request to `POST /api/chat` with an `x-session-id` header (`useChat` with `createHttpClientTransport`).
3. The API calls `runAgent()` with a Prisma memory store, scoped to the session and the user (`default-user`; there is no login yet). The agent loads earlier messages from memory, answers, and saves each new message.
4. The answer streams back to the browser through `agentToClientStream` and `createClientStreamResponse`.
5. The sidebar lists sessions from `GET /api/sessions`. Opening a chat loads its history from `GET /api/chat/:sessionId`.

API routes:

| Route                      | Purpose                                                                 |
| -------------------------- | ----------------------------------------------------------------------- |
| `POST /api/chat`           | Stream an agent answer. Needs the `x-session-id` header.                |
| `GET /api/chat/:sessionId` | Saved messages of one session                                           |
| `GET /api/sessions`        | Sessions of `default-user`, newest first, titled by their first message |

## Database (Prisma 8)

This project uses the **Prisma 8 release candidate**, which works differently from Prisma 7:

- Models live in a "data contract", [contract.prisma](packages/db/src/prisma/contract.prisma), not `schema.prisma`.
- `pnpm run db:emit` writes `contract.json` and `contract.d.ts`. There is no generated client folder. Commit both files.
- The client comes from `@prisma/orm-postgres`. Import it with `import { db } from "@anvia/db"`.
- The `AgentMemory*` models were generated by the `@anvia/memory-prisma` CLI. Keep them between the `BEGIN/END ANVIA MEMORY` markers.

To change the database: edit `contract.prisma`, then run `pnpm run db:emit` and `pnpm run db:init`.

## Mock orders

The order tools read five mock orders from [data.ts](packages/agents/src/tools/orders/data.ts). Use them to try the chat, for example "Cek pesanan MJE-1002, email andi@example.com".

| Order    | Email            | Status                | Good for trying                      |
| -------- | ---------------- | --------------------- | ------------------------------------ |
| MJE-1001 | sari@example.com | Delivered 3 days ago  | A return within the 7-day period     |
| MJE-1002 | andi@example.com | Shipped               | Tracking a shipment                  |
| MJE-1003 | dewi@example.com | Delivered 10 days ago | A return after the period has passed |
| MJE-1004 | rudi@example.com | Awaiting payment      | Payment deadline                     |
| MJE-1005 | maya@example.com | Being packed          | Cancelling an order                  |

Dates are relative to the current time, so the return periods behave the same whenever you run it. A wrong email gets the same "no order found" answer as a wrong order number.

## Evals

There are 20 test questions with reference answers in [packages/agents/src/evals/](packages/agents/src/evals/), split into 4 suites. Each answer is scored on three metrics:

- `correctness`: an LLM judge compares the answer with the reference, using a 0–10 rubric. It passes at 0.7.
- `answerRelevancy`: whether the answer stays on the question. It passes at 0.7.
- `containsNumber`: a regex check for the key number, for example `/17[.,]?495/` for the shipping insurance fee.

Runs make real model calls. When Lens is configured, the scores are also published to Lens and linked to each run's trace. By default the agent judges its own answers; set `EVAL_JUDGE_MODEL_ID` to use another model as the judge.

## Lens (optional)

[infra/lens/](infra/lens/) contains a Docker Compose setup for a self-hosted Anvia Lens. Configure it with `infra/lens/.env`, based on its `.env.example`, then start it from that folder with `docker compose up -d`. Create keys in Lens and put them in the root `.env` as `ANVIA_LENS_*`.

Lens captures full prompts and answers (`captureMode: "full"` in [lens.ts](packages/agents/src/lens.ts)). Change it to `"safe"` if customer messages should not be stored there.

## Known limitations

- No authentication: every session belongs to `default-user`.
- The store policies and orders are mock data. The order tools don't change anything: a return request only returns an ID.
- Prisma 8 is a release candidate and may change before the stable release.
