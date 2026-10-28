# INNOVAID – Subscription Manager Frontend

## Prerequisites

- [pnpm](https://pnpm.io/)
- [docker](https://docs.docker.com/desktop/setup/install/windows-install/)

## Setup

Open Docker Desktop to run the Docker Engine.
Then run the following:

```sh
pnpm install
pnpm run db:start
pnpm run db:push
```

And then to run the project perform:

```sh
pnpm run dev
```

The frontend should now be available at [localhost:5173](http://localhost:5173).

## Creating a user

Run the following command, and change the parameters to be in a valid format:

```sh
npx tsx scripts/create-user.ts "{email}" "{username}" "{role}" "{group}" "{password}"
```

Example:

```sh
npx tsx scripts/create-user.ts "example@mail.dk" "John Doe" "owner" "global" "123456"
```

## Libraries

- [shadcn-svelte](https://www.shadcn-svelte.com/docs/components)
- [lucide](https://lucide.dev/icons/)
- better-auth
- sveltekit
- tailwind
- drizzle
- tsx
