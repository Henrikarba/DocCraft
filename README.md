# DocCraft

A flexible documentation generator that leverages AI to create comprehensive documentation for your codebase. Built with SvelteKit, DocCraft automatically analyzes your source code and generates detailed documentation using your preferred AI provider.

## Features

- **Flexible AI Integration**: Support for multiple AI providers (OpenAI, Anthropic, etc.)
- **Multiple File Types**: Currently supports TypeScript (.ts, .tsx) and Svelte (.svelte) files
- **Batch Processing**: Process individual files or entire folders
- **Progress Tracking**: Real-time progress indication during documentation generation
- **Configurable Settings**: Easy-to-use interface for managing AI provider settings
- **Markdown Output**: Generated documentation is saved in markdown format
- **Custom Parsing**: Dedicated parsers for TypeScript and Svelte components

## Technical Features

- **TypeScript Support**: Analyzes exports, types, and JSDoc comments
- **Svelte Analysis**: Extracts component props, scripts, and structure
- **AI Provider Management**: Configure multiple AI providers with custom endpoints
- **Storage System**: Automatic file storage management for settings and documentation
- **Real-time Progress**: Visual progress tracking during documentation generation

## Setup & Configuration

1. Launch the application
2. Navigate to the Settings tab
3. Configure your AI provider:
   - Provider name
   - API endpoint
   - Authentication headers
   - Request body template
4. Save your settings

## Usage

1. Select the input type (Single File or Folder)
2. Choose your file(s) or folder
3. Click "Generate Documentation"
4. Documentation will be saved in the `storage/docs` directory

## File Support

Currently supports:

- TypeScript (.ts, .tsx)
- Svelte (.svelte)

## Project Structure

```
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   └── settings.svelte         # Settings management UI
│   │   ├── parsers/
│   │   │   ├── typescript.ts           # TypeScript file parser
│   │   │   └── svelte.ts               # Svelte component parser
│   │   └── types/
│   │       └── settings.ts             # Type definitions
│   └── routes/
│       ├── api/                        # API endpoints
│       └── +page.svelte                # Main page
└── storage/
    ├── settings.json                   # AI provider configurations
    └── docs/                           # Generated documentation
```

## Development

Built with:

- SvelteKit
- TypeScript
- TailwindCSS

## Future Enhancements

- Support for additional file types and frameworks
- Enhanced parsing capabilities
- Documentation templates
- Documentation search functionality
- Interactive documentation viewer

## Licensing

This project is available under dual licensing:

1. Non-Commercial Use: MIT License - See [LICENSE](LICENSE)
2. Commercial Use: Requires a commercial license with revenue sharing agreement. See [COMMERCIAL_LICENSE](COMMERCIAL_LICENSE.md)

Any commercial use, including offering this software as a service for payment, requires a commercial license.

## Author

Henri Karba
Contact: henrikarba@gmail.com for commercial licensing
