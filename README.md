# Dark and Darker Marketplace Auto-Buy Tool

A desktop application built with TypeScript, Svelte, and Electron that automatically purchases items from the "Dark and Darker" Game marketplace.

This tool helps you buy items automatically from the game's marketplace, ensuring you never miss out on any rare or highly coveted items

### Features

-   Automatically buy items from the "Dark and Darker" marketplace.
-   Real-time monitoring of marketplace listings.

## Prebuilt Binaries

A prebuilt binary for Windows is available in the [Releases](https://github.com/dad-js/daddy-snag/releases) section of this repository. Simply download the latest release, extract the contents, and run the .exe file to start using the tool without the need to manually build the project.

## Installation

### Prerequisites

Ensure you have the following installed:

    Node.js (v14 or later)
    pnpm (recommended package manager)
    Electron
    Steam
    Dark and Darker

### Setup

Clone the repository and install the dependencies:

```
git clone https://github.com/dad-js/daddy-snag.git
cd daddy-snag
pnpm run setup
```

### Usage

To run the app in development mode, use the following command:

```
pnpm run dev
```

This will launch both the Svelte renderer and the Electron app simultaneously.

## Available Commands

#### Setup the project:

Installs dependencies for both the main app and the Svelte renderer.

```
pnpm run setup
```

#### Start the development environment:

Runs both the Electron app and the Svelte renderer in watch mode.

```
pnpm run dev
```

#### Package the application:

Builds both the renderer and Electron, then packages the app for distribution.

```
pnpm run package
```

#### Direct Windows Package:

Skips building the renderer and directly packages for Windows.

```
pnpm run package:direct
```

#### Build Electron:

Builds the Electron main process.

```
pnpm run build:electron
```

#### Build Renderer:

Builds the Svelte renderer.

```
pnpm run build:renderer
```

#### Format the code:

Formats the entire codebase using Prettier.

```
pnpm run format
```

## Development

For local development, run the following:

```
pnpm run dev
```

This command will concurrently run both the Svelte renderer and the Electron app, watching for changes and rebuilding as necessary.
Project Structure

```
├── src                # Main source code for the Electron app
│   └── main.ts        # Entry point for Electron
├── renderer           # Svelte-based renderer
│   └── App.svelte     # Main UI component
├── tsconfig.json      # TypeScript configuration
├── package.json       # Project metadata and dependencies
└── README.md          # Project documentation (this file)
```

## Build & Package

To create a production build of the application:

```
pnpm run package
```

This command will build both the Svelte front-end and the Electron main process, then package the app using electron-builder. You can customize the packaging configuration via the electron-builder settings in package.json.

# License

This project is licensed under the MIT License. See the LICENSE file for details.

Feel free to reach out if you encounter any issues or have any suggestions for improvement!

# Contributions

Contributions are welcome! Feel free to submit a pull request or open an issue if you find a bug or have an idea for a new feature.

Enjoy using the Dark and Darker Marketplace Auto-Buy Tool! 🎮

# Join Discord
Feel free to join my Discord @ https://discord.gg/2CpRqD9F6Y
