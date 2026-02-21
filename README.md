# 🍵 Tea Diary

A comprehensive, personal tea brewing diary. Track your tea stash, record brewing sessions with a specialized Gongfu timer, and monitor your taste evolution over time.  
Built with Next.js 16, Prisma, NextAuth, and Groq AI for automatic tea photo recognition.

---

## 🌟 Features

### 🔐 Authentication

- **Registration**: Email and password registration with bcrypt hashing.
- **Login**: Secure sessions using NextAuth credentials provider and JWT.
- **Protected Routes**: Middleware protects private routes from unauthorized access.

### 🍃 Tea Stash Management

- **Inventory**: Visual cards representing your teas, showing type, year, region, and remaining weight.
- **Search**: Real-time filtering by tea name.
- **Add with AI**: Take or upload a photo of your tea wrapper/cake, and the Groq Vision AI will automatically extract the name, type, year, and region!
- **Manual Add**: Add teas manually with 12 distinct tea types (Puer, Oolong, Red, Green, etc.) or a custom type.
- **Badge Colors**: Customize the color of the tea type badge with 7 presets or a custom color picker.

### ⏱️ Gongfu Brewing Timer

- **Stopwatch Mode**: A simple count-up timer. Useful if you intuitive brew. Tracks total session time and steep counts.
- **Countdown Mode (Timer)**: Set a specific time (e.g., 10s, 30s) and watch the animated SVG ring.
- **Smart Brewing Parameters**: Adjust water temperature (°C), leaf weight (g), and vessel volume (ml) inline during the session.
- **Audio & Haptic Feedback**: Uses the WebAudio API for a gentle 3-note chime and the Vibration API (on supported devices) when the timer finishes.
- **Session Summary**: After finishing a session, rate your tea from 1 to 5 stars and save the session data to your journal.

### 📖 Journal & Statistics

- **Session History**: Chronological timeline of all your brewing sessions.
- **Monthly Stats**: See your total sessions, steeps, tea hours, and unique teas brewed this month.
- **Activity Graph**: A GitHub-style contribution graph visualizing your tea sessions over the past year.

### ⚙️ User Profile & Customization

- **Avatars**: Generate playful avatars (using DiceBear API) or upload your own cropped profile picture.
- **i18n (Multi-language)**: Seamlessly switch between **English** and **Ukrainian** directly from the profile menu. The entire UI and date formats adjust instantly.
- **Themes**: Choose from 6 beautiful presets (Dark, Light, Green Tea, Purple, Red, Blue) or craft your own entirely custom theme by changing individual background, text, and accent colors.
- **Haptic Settings**: Toggle vibration feedback on or off.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions)
- **Database**: PostgreSQL (via [Neon](https://neon.tech)) + [Prisma ORM](https://www.prisma.io/)
- **Auth**: NextAuth v5 (Auth.js)
- **Styling**: Tailwind CSS + Custom CSS Variables for dynamic themes
- **AI**: [Groq API](https://groq.com/) (Llama 3 Vision model)
- **PWA**: `@ducanh2912/next-pwa` for offline capabilities and mobile installation
- **Code Quality**: ESLint, Prettier, Husky, lint-staged, GitHub Actions

---

## 🚀 Detailed Installation Guide

Follow these steps to get the project up and running on your local machine.

### 1. Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version **22 or higher**)
- [pnpm](https://pnpm.io/) (version **9 or higher**) - Install via `npm install -g pnpm`
- Git

You will also need:

- A PostgreSQL database. You can quickly get a free one at [Neon](https://neon.tech).
- A free [Groq API Key](https://console.groq.com/) for the AI vision feature.

### 2. Clone the Repository

Open your terminal and clone the project:

```bash
git clone https://github.com/artemqwer/tea-diary.git
cd tea-diary
```

### 3. Install Dependencies

Since this project uses `pnpm`, install the dependencies by running:

```bash
pnpm install
```

### 4. Setup Environment Variables

Copy the example environment file to create your local environment file:

```bash
cp .env.example .env.local
```

_(On Windows Command Prompt, use `copy .env.example .env.local`)_

Open `.env.local` in your editor and fill in the required values:

- `DATABASE_URL`: Your PostgreSQL connection string (from Neon or local DB).
- `AUTH_SECRET`: A random 32-character string for NextAuth. Generate one by running `openssl rand -base64 32` in your terminal or use an [online generator](https://generate-secret.vercel.app/32).
- `NEXTAUTH_URL`: Should be `http://localhost:3000` for local development.
- `GROQ_API_KEY`: Your API key from Groq for the AI picture analysis.

### 5. Setup the Database

Push the Prisma schema to your database to create the necessary tables:

```bash
pnpm exec prisma db push
```

Then, generate the Prisma Client for TypeScript:

```bash
pnpm exec prisma generate
```

### 6. Run the Development Server

Start the application in development mode:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You can now register a new account and start adding your teas!

---

## 💻 Available Scripts

| Command             | Description                                                        |
| :------------------ | :----------------------------------------------------------------- |
| `pnpm dev`          | Starts the Next.js development server on port 3000.                |
| `pnpm build`        | Compiles and optimizes the application for production.             |
| `pnpm start`        | Runs the built Next.js application in production mode.             |
| `pnpm lint`         | Runs ESLint to find issues in the code.                            |
| `pnpm lint:fix`     | Runs ESLint and automatically fixes fixable issues.                |
| `pnpm format`       | Formats all supported files using Prettier.                        |
| `pnpm format:check` | Checks if files are properly formatted (used in CI).               |
| `pnpm type-check`   | Runs the TypeScript compiler to catch type errors.                 |
| `pnpm prepare`      | Sets up Husky git hooks (runs automatically after `pnpm install`). |

---

## 🔒 Code Quality

This project enforces strict code quality standards:

- **Prettier** formats the code consistently.
- **ESLint** catches logical errors and enforces best practices.
- **Husky & lint-staged** ensure that every `git commit` automatically formats and lints the specific files you changed before allowing the commit.
- **GitHub Actions** runs continuous integration (CI) on every push and pull request to `main`, executing `type-check`, `lint`, and `format:check`. Dependencies are monitored by Dependabot.

---

## ☁️ Deployment

The easiest way to deploy this application is using [Vercel](https://vercel.com).

1. Push your code to GitHub.
2. Import the repository in Vercel.
3. Add your Environment Variables (`DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `GROQ_API_KEY`) in the Vercel project settings.
4. Deploy!

The automated script `vercel-build` is already configured in `package.json` to safely run `prisma generate` and `prisma db push` before building the app on Vercel.
