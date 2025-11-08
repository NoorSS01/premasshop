# Prema's Shop - Frontend

React + Vite + Tailwind CSS frontend application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

3. Replace logo:
- Replace `public/logo.png` with your actual logo file
- Ensure it's named exactly `logo.png`

## Development

```bash
npm run dev
```

Runs on http://localhost:3000

## Build

```bash
npm run build
```

Outputs to `dist/` directory.

## Test

```bash
npm test
```

## Deployment

1. Build the project: `npm run build`
2. Upload contents of `dist/` folder to Hostinger `public_html/`
3. Ensure `index.html` is in the root directory

