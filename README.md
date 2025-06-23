# TijariWise
*Transform Your Financial Management Into Smart Decisions*

![last commit](https://img.shields.io/github/last-commit/AbdelMouhaimenDakhlia/PFM-Frontend)
![React Native](https://img.shields.io/badge/React%20Native-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)

**Built with the tools and technologies:**

![React Native](https://img.shields.io/badge/React%20Native-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-000020?style=flat&logo=expo&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat&logo=axios&logoColor=white)
![React Navigation](https://img.shields.io/badge/React%20Navigation-6B46C1?style=flat&logo=react&logoColor=white)
![AsyncStorage](https://img.shields.io/badge/AsyncStorage-FF6B6B?style=flat&logo=react&logoColor=white)

## Table of Contents
- [Overview](#overview)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Configuration](#configuration)
- [Features](#features)
- [Project Structure](#project-structure)
- [Technologies](#technologies)
- [Scripts](#scripts)

## Overview

TijariWise is a comprehensive mobile personal financial management application that empowers users to take control of their financial life. Built with React Native and TypeScript, it provides intuitive visualization of bank accounts, transactions, financial analytics, predictions, and personalized recommendations through a modern, user-friendly interface.

### Why TijariWise?

This application transforms complex financial data into actionable insights, making personal finance management accessible and intelligent. The core features include:

- 🔐 **Secure Authentication**: Safe login/logout with encrypted user sessions
- 📊 **Smart Dashboard**: Comprehensive overview with total balance, expense charts, and recent transactions
- 🏦 **Account Management**: Complete bank account listing, search functionality, and detailed account views
- 💳 **Transaction Intelligence**: Advanced transaction history with search, category filtering, and detailed transaction insights
- 📈 **Financial Analytics**: Revenue/expense charts, smart alerts, and balance evolution tracking
- 🔮 **Predictive Insights**: AI-powered expense forecasting by category for upcoming months
- 🎯 **Personalized Recommendations**: Custom financial advice based on transaction analysis patterns
- 👤 **User Profile Management**: Easy profile customization with name and photo updates

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- Expo Go app (for mobile testing)
- Android Studio or Xcode (for emulator testing)

### Installation

1. **Clone the repository**
   ```sh
   git clone <repository-url>
   cd TijariWise
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Start the application**
   ```sh
   npm start
   ```
   
   Then scan the QR code with Expo Go or launch on an emulator.

### Usage

After installation, the app provides:
- Secure authentication flow
- Real-time financial dashboard
- Comprehensive transaction management
- Advanced analytics and predictions
- Personalized financial recommendations

### Configuration

- API URL configuration is located in [`src/services/api.ts`](src/services/api.ts)
- Navigation routes and types are defined in [`src/navigation/routes.ts`](src/navigation/routes.ts)

## Features

### Core Functionality
- **Secure Authentication System**: Complete login/logout workflow with session management
- **Dynamic Dashboard**: Real-time financial overview with interactive charts and recent activity
- **Multi-Account Support**: Manage multiple bank accounts with search and filtering capabilities
- **Advanced Transaction Management**: Comprehensive transaction history with category-based filtering
- **Financial Analytics Engine**: Revenue/expense analysis with trend visualization and smart alerts
- **Predictive Analytics**: Machine learning-powered expense forecasting
- **Intelligent Recommendations**: Personalized financial advice based on spending patterns
- **User Profile Customization**: Easy profile management with photo and name updates

## Project Structure

```
TijariWise/
├── App.tsx                     # Main application entry point
├── src/
│   ├── components/            # Reusable UI components (TopHeader, etc.)
│   ├── screens/              # Main application screens (Home, Accounts, Transactions, Profile)
│   ├── navigation/           # Navigation configuration (Stack and Bottom Tabs)
│   ├── context/             # Authentication context and state management
│   └── services/            # API services and HTTP client configuration
└── assets/                  # Images, icons, and static resources
```

## Technologies

**Frontend Framework:**
- React Native with Expo for cross-platform mobile development
- TypeScript for type-safe development
- React Navigation for seamless app navigation

**Data & State Management:**
- Axios for HTTP requests and API communication
- AsyncStorage for local data persistence
- React Context for global state management

**UI & Visualization:**
- react-native-paper for Material Design components
- react-native-chart-kit for financial charts and graphs
- react-native-svg-charts for advanced data visualization

## Scripts

- `npm start` : Start the Expo development server
- `npm run android` : Launch on Android device/emulator
- `npm run ios` : Launch on iOS simulator
- `npm run web` : Launch web version (if supported)

## Customization

**Styling & Branding:**
- Modify colors, logos, and text in [`src/components/`](src/components/) and [`src/screens/`](src/screens/)
- Update app icon and splash screen images in [`assets/`](assets/)

**API Integration:**
- Configure backend endpoints in [`src/services/api.ts`](src/services/api.ts)
- Customize data models and types as needed

## Author

**AbdelMouhaimenDakhlia** - Project Developer & Maintainer

---

> **Note**: This application requires a compatible REST API backend to function properly. Ensure your backend services are configured and running before using the app.
