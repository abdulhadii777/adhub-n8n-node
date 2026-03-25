# Adhub App n8n Node

An n8n community node for managing Adhub leads, lead sources, and lead statuses.

## Features

- Lead Sources: list, create, get, update, delete
- Lead Statuses: list, create, get, update, delete
- Leads: list, create, get, update, delete
- Lead extras: query fields, timeline, entries

## Installation

1. Install dependencies

```bash
npm install
```

2. Start development server

```bash
npm run dev
```

## Credentials

Create credentials named `Adhub App API` in n8n and provide your API token.

## Operations

Resource: Lead Source
- List
- Create
- Get
- Update
- Delete

Resource: Lead Status
- List
- Create
- Get
- Update
- Delete

Resource: Lead
- List
- Create
- Get
- Update
- Delete
- List Query Fields
- Timeline
- Entries

## Notes

- For lead creation and update you can send either form fields or a JSON body.
- When using form fields, Additional Fields supports a JSON object with custom keys.

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## Release

```bash
npm run release
```

## License

MIT
