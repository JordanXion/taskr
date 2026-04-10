# Taskr

A task management app with list organization, due date countdowns, and user authentication.

**Live demo:** [taskr.jxrdxn.xyz](https://taskr.jxrdxn.xyz)

## Tech Stack

- **[Next.js 14](https://nextjs.org/)** — App Router, Server Actions, API routes
- **[TypeScript](https://www.typescriptlang.org/)** — end to end
- **[Prisma](https://www.prisma.io/)** — ORM with schema migrations
- **[PostgreSQL](https://www.postgresql.org/)** (via [Neon.tech](https://neon.tech)) — serverless database
- **[Tailwind CSS](https://tailwindcss.com/)** — styling
- **[jose](https://github.com/panva/jose)** — JWT auth with httpOnly cookies
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** — password hashing
- **[Vercel](https://vercel.com/)** — deployment

## Features

- Register / login with secure JWT sessions
- Create and organize tasks across multiple lists
- Optional due dates with live countdowns

## Running Locally

```bash
npm install
cp .env.example .env  # fill in DATABASE_URL, DIRECT_URL, JWT_SECRET
npx prisma db push
npm run dev
```
