# Premasshop

Modern E-commerce Platform built with React 18, TypeScript, and Supabase.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Radix UI + Tailwind CSS
- **Backend**: Supabase (auth + database + functions)
- **State**: TanStack Query
- **Routing**: React Router v6

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase credentials.

4. Start the development server:
   ```bash
   npm run dev
   ```

### Build

```bash
npm run build
```

### Deploy

The project is configured for Hostinger deployment. See `DEPLOY.md` for detailed instructions.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/         # Custom React hooks
├── lib/           # Utility functions and configurations
├── pages/         # Page components
└── styles/        # Global styles
```

## License

MIT
