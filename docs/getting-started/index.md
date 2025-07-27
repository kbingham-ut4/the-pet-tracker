# Getting Started

Welcome to Pet Tracker! This guide will help you set up the development environment and get the app running on your machine.

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

- **Node.js** (v18 or later) - [Download](https://nodejs.org/)
- **npm** or **pnpm** (pnpm recommended) - [Install pnpm](https://pnpm.io/installation)
- **Git** - [Download](https://git-scm.com/)

### Mobile Development (Optional)

For testing on physical devices or simulators:

- **Android Studio** (for Android development) - [Download](https://developer.android.com/studio)
- **Xcode** (for iOS development, macOS only) - [Download](https://developer.apple.com/xcode/)

### Expo CLI

Install the Expo CLI globally:

```bash
npm install -g @expo/cli
```

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/pet-tracker.git
   cd pet-tracker
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**:

   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file with your configuration (see [Environment Setup](./environment-setup)).

4. **Start the development server**:
   ```bash
   pnpm start:dev
   # or
   npm run start:dev
   ```

## Verification

After installation, verify everything works:

1. **Development server starts** without errors
2. **QR code appears** in the terminal
3. **Expo Dev Client** can connect to your app
4. **App loads** on your device/simulator

## Next Steps

- [Environment Setup](./environment-setup) - Configure different environments
- [Project Structure](./project-structure) - Understand the codebase
- [Running the App](./running-the-app) - Learn development workflows

## Troubleshooting

### Common Issues

**Node.js version mismatch**:

```bash
node --version  # Should be v18 or later
```

**Expo CLI not found**:

```bash
npm list -g @expo/cli  # Check if installed globally
```

**Port already in use**:

```bash
npx expo start --port 19001  # Use different port
```

**Metro bundler issues**:

```bash
npx expo start --clear  # Clear Metro cache
```

Need help? Check our [GitHub Issues](https://github.com/yourusername/pet-tracker/issues) or [Discussions](https://github.com/yourusername/pet-tracker/discussions).
