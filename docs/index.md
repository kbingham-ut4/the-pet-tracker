---
layout: home

hero:
  name: 'Pet Tracker'
  text: 'Complete Pet Care Management'
  tagline: "Track your pet's health, nutrition, activities, and veterinary records all in one place"
  image:
    src: /hero-pet.png
    alt: Pet Tracker Hero Image
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started/
    - theme: alt
      text: View on GitHub
      link: https://github.com/yourusername/pet-tracker

features:
  - icon: 🐕
    title: Pet Management
    details: Manage multiple pets with detailed profiles, photos, and basic information.

  - icon: 🏥
    title: Health Tracking
    details: Track veterinary visits, vaccinations, medications, and health records.

  - icon: 🍖
    title: Nutrition & Weight
    details: Monitor food intake, calorie tracking, and weight management with smart recommendations.

  - icon: 🎾
    title: Activity Logging
    details: Record walks, playtime, training sessions, and other pet activities.

  - icon: 📱
    title: Cross-Platform
    details: Built with React Native and Expo for iOS, Android, and web platforms.

  - icon: 🔒
    title: Privacy First
    details: Your pet's data stays on your device with optional cloud sync.
---

## Quick Start

Get up and running with Pet Tracker in minutes:

```bash
# Clone the repository
git clone https://github.com/yourusername/pet-tracker.git

# Install dependencies
cd pet-tracker
npm install

# Set up environment
cp .env.example .env

# Start development server
npm run start:dev
```

## Why Pet Tracker?

Pet Tracker is designed for pet owners who want to keep comprehensive records of their pet's health, nutrition, and activities. Whether you have one pet or many, our app helps you:

- **Stay Organized**: Keep all pet information in one place
- **Track Health**: Monitor weight, medications, and vet visits
- **Optimize Nutrition**: Calculate calorie needs and track food intake
- **Remember Everything**: Never forget important dates or medications
- **Share with Vets**: Export data for veterinary consultations

## Architecture

Built with modern React Native technologies:

- **Frontend**: React Native + Expo
- **State Management**: Context API with useReducer
- **Navigation**: React Navigation 6
- **Storage**: Local-first with optional cloud sync
- **Deployment**: EAS Build for App Store and Play Store

## Community

- **Discussions**: [GitHub Discussions](https://github.com/yourusername/pet-tracker/discussions)
- **Issues**: [GitHub Issues](https://github.com/yourusername/pet-tracker/issues)
- **Contributing**: [Contributing Guide](/contributing/guide)
- **Code of Conduct**: [Code of Conduct](/contributing/code-of-conduct)
