# GuestWorker – Mobile app (Android) setup

This app is ready to be wrapped as a native Android app using **Capacitor**. The same codebase runs on **web** and **mobile** without changes.

## Prerequisites

- **Node.js** 18+ and **yarn** (or npm)
- **Android Studio** (for building and running the Android app)
- **JDK 17** (usually bundled with Android Studio)

## One-time setup

### 1. Install dependencies

From the `app/frontend` directory:

```bash
yarn install
```

This installs the existing app dependencies plus `@capacitor/core`, `@capacitor/cli`, and `@capacitor/android`.

### 2. Build the web app

Capacitor uses the **production build** output:

```bash
yarn build
```

This creates the `build/` folder (configured as `webDir` in `capacitor.config.json`).

### 3. Add the Android platform

Run once:

```bash
npx cap add android
```

This creates the `android/` folder with the native Android project.

### 4. Sync web build into the native project

Whenever you change the web app and rebuild:

```bash
yarn build
npx cap sync
```

Or use the shortcut:

```bash
yarn build:mobile
```

`cap sync` copies the latest `build/` output into `android/app/src/main/assets/public` and updates native config (e.g. `capacitor.config.json`) in the Android project.

## Running the Android app

### Open in Android Studio

```bash
npx cap open android
```

Or:

```bash
yarn cap:open:android
```

Then in Android Studio:

1. Wait for Gradle sync to finish.
2. Choose a device or emulator.
3. Click **Run** (green play button).

### From the command line (optional)

If you have Android SDK and a device/emulator set up:

```bash
cd android && ./gradlew installDebug
```

## API URL (backend) when running on device

The app uses `REACT_APP_API_URL` for the backend. For the **web** build you already use:

- **Production:** `https://api.guestworker.app` (or your API URL)
- **Development:** `http://localhost:8000` (or host machine IP)

For the **Android app**, the WebView loads the files from `build/`. All API requests go from the **device**, so:

- **Emulator:** Use your machine’s IP (e.g. `http://10.0.2.2:8000` for Android emulator, or your LAN IP like `http://192.168.1.x:8000`).
- **Production:** Set `REACT_APP_API_URL=https://api.guestworker.app` (or your API URL) **before** running `yarn build`, so the built JS is baked with the correct API URL.

Example for production build:

```bash
REACT_APP_API_URL=https://api.guestworker.app yarn build
npx cap sync
```

Then open Android Studio and run the app. The device will call your live API.

## What’s already configured

- **capacitor.config.json** – App ID `com.guestworker.app`, app name **GuestWorker**, `webDir`: `build`, `androidScheme`: `https`, mixed content allowed for dev.
- **index.html** – Viewport with `viewport-fit=cover`, theme color `#3B2ED0`, mobile-web-app meta tags, link to `manifest.json`.
- **manifest.json** – Name, theme/background color, standalone display, icons (using `logo.png`).
- **index.css** – Safe area insets for notched devices, `100dvh` for mobile viewport height, tap highlight, touch-friendly `touch-action` on buttons/links.

## Build a release APK/AAB

1. In Android Studio: **Build → Generate Signed Bundle / APK**.
2. Create or choose a keystore, then build **Android App Bundle** (.aab) for Play Store or **APK** for direct install.

## Summary of scripts

| Script              | Command                    | Purpose                                  |
|---------------------|----------------------------|------------------------------------------|
| `yarn build`        | `craco build`              | Production web build → `build/`         |
| `yarn cap:sync`     | `cap sync`                 | Copy `build/` into Android project      |
| `yarn cap:open:android` | `cap open android`     | Open Android project in Android Studio  |
| `yarn build:mobile` | `yarn build && cap sync`   | Build web app and sync to Android       |

After the one-time `npx cap add android`, use **build → sync → open Android Studio → Run** for your normal mobile workflow. The app remains fully web-compatible; no code changes are required to switch between web and mobile.
