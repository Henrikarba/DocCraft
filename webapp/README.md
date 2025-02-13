# DocCraft Webapp

> ⚠️ **Development Status**: This project is currently in early development stage.

## Prerequisites

- Node.js (v16 or higher)
- npm or pnpm (pnpm recommended)

## Project Setup

1. Clone the repository

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

## Development

Run the development server:
```bash
pnpm dev
# or
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

```bash
pnpm build
# or
npm run build
```

## Configuration

### AI Provider Setup

1. Go to the Settings tab in the webapp
2. Configure your AI provider:
   - Name (e.g., "openai", "anthropic")
   - API endpoint
   - Headers (including your API key)
   - Request body template

### Supported File Types

Currently supports parsing:
- TypeScript (.ts, .tsx)
- Svelte (.svelte)

## Usage

1. Start the application
2. Choose between Single File or Folder mode
3. Select your files
4. Click "Generate Documentation"
5. Find generated documentation in `storage/docs/`

## Security Notes

- Store API keys securely
- Do not commit `settings.json` with real API keys
- Consider using environment variables for sensitive data

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request
