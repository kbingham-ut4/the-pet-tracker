# Pet Tracker

A modern mobile application built with React Native, Expo, and TypeScript to help you track your beloved pets' activities, health, and important information.

## 🐾 Features

- **Pet Management**: Add, edit, and organize information about your pets
- **Activity Tracking**: Log walks, play sessions, training, and other activities
- **Health Records**: Keep track of vet visits, vaccinations, and medical history
- **Nutrition & Weight Management**: Track feeding schedules and weight for dogs
- **Offline Storage**: Robust offline-first data storage with cloud synchronization
- **Logging System**: Comprehensive logging with pluggable providers (Console, BetterStack, File)
- **Environment Configuration**: Multi-environment setup (dev, test, staging, production)
- **Dashboard**: Overview of your pets' health and activities
- **Modern UI**: Beautiful, intuitive interface with custom themes

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PNPM (recommended) or npm
- Expo CLI
- React Native development environment

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd the-pet-tracker
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start the development server:

   ```bash
   pnpm start
   ```

4. Run on your preferred platform:
   - **iOS**: `pnpm ios`
   - **Android**: `pnpm android`
   - **Web**: `pnpm web`

## 📱 Development

### Project Structure

```
src/
├── components/          # Reusable UI components
├── config/             # Environment and app configuration
├── contexts/           # React contexts for state management
├── constants/          # App constants and themes
├── hooks/             # Custom React hooks
├── navigation/        # Navigation configuration
├── screens/           # Screen components
├── services/          # API services and data management
├── storage/           # Offline-first storage system
│   ├── providers/     # Storage providers (AsyncStorage, GraphQL)
│   └── services/      # High-level storage services
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
    └── logging/       # Pluggable logging system
```

### Storage System

The app features a robust offline-first storage system:

- **Local Storage**: Always stores data locally first using AsyncStorage
- **Cloud Sync**: Optional synchronization with GraphQL endpoints
- **Network Resilience**: Automatic fallback to local storage when offline
- **Configurable**: Enable/disable storage features per environment
- **Event System**: Real-time notifications for storage operations

See [storage documentation](./docs/development/storage.md) for detailed usage.

### Environment Configuration

The app supports multiple environments with specific configurations:

- **Development**: Local development with console + file logging
- **Testing**: Minimal logging for automated tests
- **Staging**: Full logging with BetterStack for pre-production testing
- **Production**: Remote logging only with BetterStack

Copy `.env.example` to `.env.development` and configure your environment variables.

### Logging System

The app includes a comprehensive logging system with multiple providers:

- **ConsoleProvider**: Development debugging
- **BetterStackProvider**: Remote logging and monitoring
- **FileProvider**: Local file logging

See [logging documentation](./docs/development/logging.md) for detailed usage.

### Scripts

- `pnpm start` - Start Expo development server
- `pnpm android` - Run on Android
- `pnpm ios` - Run on iOS
- `pnpm web` - Run on web
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues
- `pnpm format` - Format code with Prettier
- `pnpm type-check` - Run TypeScript type checking

## 🛠 Tech Stack

- **Framework**: Expo SDK 53
- **Language**: TypeScript
- **UI**: React Native
- **Navigation**: React Navigation 7
- **State Management**: React Context API
- **Icons**: Expo Vector Icons
- **Package Manager**: PNPM
- **Code Quality**: ESLint + Prettier

## 🎨 Design System

The app uses a custom design system with:

- Consistent color palette
- Typography scale
- Spacing system
- Border radius standards
- Component variants

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Issues

If you encounter any issues, please create an issue in the repository.
