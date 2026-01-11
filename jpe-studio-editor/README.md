# JPE Studio Editor

A JPE-specific code editor for Sims 4 mod development. This editor provides a tailored environment for creating and managing JPE (Just Plain English) files that are converted to Sims 4 compatible XML tuning files.

## Features

- Syntax highlighting for JPE language constructs
- Real-time preview of JPE to XML transformation
- File explorer for managing JPE projects
- Mod element browser for interactions, buffs, and traits
- Integration with the JPE toolchain

## Project Structure

```
jpe-studio-editor/
├── src/
│   ├── main.ts           # Electron main process
│   ├── renderer.tsx      # Electron renderer process
│   ├── preload.ts        # Secure IPC preload script
│   ├── App.tsx           # Main application component
│   ├── App.css           # Global styles
│   └── components/       # React components
│       ├── Editor.tsx
│       ├── Sidebar.tsx
│       └── PreviewPanel.tsx
├── dist/                 # Distribution files
├── assets/               # Static assets
├── package.json
├── tsconfig.json
└── webpack.config.js
```

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Run the development server:
```bash
npm run dev
```

4. Start the Electron application:
```bash
npm start
```

## Architecture

The application follows a typical Electron + React architecture:

- **Main Process**: Handles application lifecycle, windows, and system integration
- **Renderer Process**: Runs the React UI using Monaco Editor for code editing
- **Preload Script**: Provides secure IPC communication between renderer and main
- **Components**: Modular React components for different UI sections

## Integration with JPE Toolchain

The editor is designed to integrate with the existing Rust-based JPE toolchain. Communication happens through:

- IPC calls for file operations
- HTTP API calls to the Rust engine (to be implemented)
- Direct binary execution of JPE tools (to be implemented)

## Next Steps

1. Implement proper JPE language support in Monaco Editor
2. Add integration with the Rust-based JPE engine
3. Implement file saving/loading functionality
4. Add project management features
5. Create JPE-specific templates and snippets
6. Implement the visual mod designer
7. Add testing and debugging support for Sims 4 mods