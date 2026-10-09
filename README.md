# lowcode

A low-code platform for building admin systems: design pages visually, save them as schemas, and render them at runtime.

## What it can do

- **Manage apps and pages.** Group pages into apps, each with its own name, logo, home page and menu. Pages are either designed visually or embed an existing site in an iframe.
- **Design pages visually.** Build list and detail pages from a search bar, a table, forms and action buttons, with about 25 input widgets (select, date range, upload, cascader, table input, spreadsheet import, ...) and about 25 display widgets (tags, statistics, timeline, QR code, image gallery, ...). Page layouts are designed the same way.
- **Connect to your own backend.** Register your HTTP APIs once (method, URL, parameters, content type) and bind them to tables, forms and buttons. Each API can have a saved mock response for building pages before the backend is ready.
- **Reuse shared settings.** Dictionaries (option lists or JSON), reusable code snippets (formatters, request and response hooks) and published config variables are shared across pages.
- **Publish safely.** Pages go through draft, online and offline states. Every publish is versioned and logged, an older version can be restored, and concurrent publishes are detected as conflicts.
- **Move work between environments.** Export and import records, or compare pages, APIs and dictionaries with another environment (dev, test, pre, prod) and pull them across.
- **Extend it.** Load extra component bundles into an app with the bundled webpack plugin.

## What it cannot do

- **It is not a backend or database for your data.** Pages read and write through APIs you already have. It does not create tables, store business records or generate server code.
- **No end-user accounts or permissions.** Published pages are open to anyone who can reach them. Sign-in, roles and data access control for end users must be enforced by your own APIs.
- **One shared admin login.** The studio has a single `ADMIN_PASSWORD`, with no per-user accounts or roles.
- **Not a free-form page builder.** Pages follow the search, table, form and action pattern of admin systems. It is not meant for marketing sites, dashboards with arbitrary layouts or native mobile apps.
- **No server-side logic.** Code written in the designer runs in the browser with full page access. It is not sandboxed and cannot run scheduled jobs or server workflows.
- **MySQL only, one API instance per `appdata` volume.** The publish lock is per process, so the API does not scale horizontally on shared storage.

## Screenshots

Adding a search field in the page designer:

![Page designer: adding a search field](demos/1.png)

Managing table columns:

![Page designer: table column management](demos/2.png)

## Getting started

Requires Node 22. The server runs on <http://localhost:8080>.

```bash
npm install
npm start        # API + webpack dev server
npm run mock     # like start, but always use the local mock config
npm run build    # typecheck, then build API and web into dist/
npm test         # server, API and network-client tests (no database needed)
npm run lint     # also: typecheck (includes a strict check of the server code), lint:fix
npm run db:migrate  # apply pending database migrations (uses DB_URL, DB_USER, DB_PASSWORD)
```

Configuration comes from environment variables; [`.env.example`](.env.example) lists and explains all of them.

In development, if `NACOS_URL` is not set, the API loads its config from `src/api/lowcode-api/config/mock.ts` instead of Nacos, so `npm start` works offline.

### Admin sign-in

The studio (`/admin`, `/design`) and its API require signing in with `ADMIN_PASSWORD`. Sessions are signed, httpOnly cookies that last 12 hours. They are signed with `SESSION_SECRET` when it is set; otherwise the key is derived from the password, so changing the password signs everyone out. Set `TRUST_PROXY` (for example `1`) behind a load balancer, so failed logins are throttled per client rather than per balancer.

Production refuses to start without `ADMIN_PASSWORD`. In development, leaving it unset runs the studio without sign-in.

Published pages (`/<app>/<page>`), `/public/*`, `/health/*` and `/resource/upload` stay open, because end users of generated apps are not studio admins.

### Publishing and files

Published configs and uploads are stored in `appdata/` (or `APPDATA_DIR`) and served from `/resources`. Pre-release (`RUN_ENV=pre`) publishes to `lowcode-pre/`, apart from production's `lowcode/`.

The server builds every published file from the database and writes it under a per-file lock, so concurrent publishes never overwrite each other. Publishing a page is one request that checks the version, backs up the page, logs the release, marks page and app online and writes the files. If someone published a newer version meanwhile, it answers `CONFLICT` with that version. The lock is per process, so run one API instance per `appdata` volume.

Anonymous uploads from published pages go to `appdata/uploads/` under a server-chosen name. Only common image, document and media types are accepted (no HTML, SVG or scripts), at most 100 per client per 10 minutes.

Config variables (the Config variables page in the studio) are published as a public file that the runtime reads with `getEnvVar`. Use them for values such as `API_<SYSTEM>_HOST`, which sets the backend host for that system's APIs. Never store secrets in them; server secrets belong in the environment variables listed in `.env.example`.

Designer code (formatters, request/response hooks) runs in the browser with full page access. Only signed-in admins can author it; treat it like application code.

### Database migrations

Schema changes live in `src/api/lowcode-api/migrations` and run once per database, in order. Run `npm run db:migrate` when deploying (in the container: `node src/api/lowcode-api/migrate.js`). Local development and mock mode also apply them at startup.

## Deploy

`npm run build`, then build the `dockerfile`. The container runs the API with `node` on `PORT` (default 8080). Supply the environment variables at runtime, and mount a volume at `appdata/`.

- `/health/check` is liveness: the process is up (the container health check).
- `/health/ready` is readiness: it answers 503 while the database is unreachable (use it for load-balancer target groups).

## Layout

| Path                                          | Contents                                                                                      |
| --------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `src/api/lowcode-api`                         | Backend: entry, controllers, `config`, `framework`, `models`                                  |
| `src/web/lowcode`                             | Admin pages and layouts                                                                       |
| `src/web/lowcode-core`                        | Page designer and schema runtime                                                              |
| `src/web/lowcode-ui`, `lowcode-registry`      | Designer widgets and their registry                                                           |
| `src/web/lowcode-services`, `lowcode-configs` | API clients, constants (the rematch store lives in `lowcode-core/provider`)                   |
| `packages/lowcode-kit`                        | Tailwind + Radix component kit used by the studio, designer and generated apps                |
| `packages/lowcode-blocks`                     | Config-driven table/form/action building blocks                                               |
| `packages/lowcode-common`                     | HTTP client, OSS/URL helpers                                                                  |
| `packages/lowcode-server`                     | Decorator-based HTTP server on Express (`@Controller`, `@Post`, `@Body`, `createServer`)      |
| `packages/lowcode-dev-proxy`                  | Dev-server middleware: forwards to `PROXY_TARGET` or serves `mock/*.json`                     |
| `packages/lowcode-webpack-plugin`             | Webpack plugin for sub-app component bundles (also re-exported as `lowcode-registry/webpack`) |

All dependencies install from public npm.

## License

[MIT](LICENSE) © 2026 ttang1024
