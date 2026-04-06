# Expense Tracker App

A modern, high-performance mobile application built with React Native and Expo for managing personal finances, tracking expenses, and monitoring lending activities.

## 🚀 Features

- **📊 Comprehensive Dashboard**: Get a quick overview of your current balance, total income, and total expenses.
- **💸 Transaction Management**: Effortlessly add, edit, and delete income and expense transactions.
- **📂 Category Organization**: Manage custom categories to keep your finances organized.
- **🤝 Lend Tracker**: Specialized module to track money lent to or borrowed from friends and family.
- **📈 Visual Analytics**: Interactive charts and monthly breakdowns to visualize your spending patterns.
- **🌙 Dark Mode**: Sleek dark and light theme options for a comfortable viewing experience.
- **🔐 Secure Authentication**: Firebase-powered user accounts with login and sign-up functionality.
- **☁️ Cloud Sync**: Real-time data synchronization across devices using Firestore.

## 🛠️ Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Backend**: [Firebase](https://firebase.google.com/) (Authentication & Firestore)
- **UI Components**: [Gluestack UI](https://gluestack.io/), [React Native UI Lib](https://wix.github.io/react-native-ui-lib/)
- **Charts**: [React Native Chart Kit](https://github.com/indie6/react-native-chart-kit)
- **Styling**: Vanilla CSS & Tailwind CSS integration

## 📥 Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/ExpenseTrackerApp.git
    cd ExpenseTrackerApp
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Setup Firebase**:
    - Create a new project in the [Firebase Console](https://console.firebase.google.com/).
    - Enable Authentication (Email/Password) and Firestore Database.
    - Update the `firebase.js` file with your project's configuration.

4.  **Run the application**:
    ```bash
    npx expo start
    ```

## 📁 Project Structure

- `screens/`: Contains all the main application screens (Home, Transactions, AddTransaction, etc.).
- `screens/store/`: Redux slices and store configuration.
- `services/`: Backend services including Firebase integration.
- `assets/`: Static assets such as images and icons.
- `firebase.js`: Firebase configuration and initialization.

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please feel free to open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License.
