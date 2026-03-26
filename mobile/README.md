# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Authentication (Supabase)

Email confirmation and password reset require redirect URLs to be whitelisted in Supabase:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication** → **URL Configuration**
2. Add these to **Redirect URLs**:
   - `elidzstp://email-confirmed` (email confirmation)
   - `elidzstp://change-password` (password reset)
   - `elidzstp://oauth-callback` (Apple sign-in)
3. **Google Sign-In (native)**: Uses `signInWithIdToken` – no browser, no redirect URLs. Configure:
   - In **app.json** → `extra.googleAuth.webClientId`: Add your **Web application** OAuth Client ID from [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (create a "Web application" client if needed).
   - In **Supabase** → Authentication → Providers → Google: Add the Web Client ID (first), Android Client ID, and iOS Client ID. Enable **Skip nonce check** for iOS.
4. For Expo Go development, also add the URL shown when running `npx expo start` (e.g. `exp://192.168.x.x:8081/--/email-confirmed`)

### Password reset / email confirmation links open a blank page

**On mobile (app installed):** The deep link `elidzstp://change-password` should open the app directly. Ensure:
- `elidzstp://change-password` and `elidzstp://email-confirmed` are in Supabase Redirect URLs
- AuthProvider handles `PASSWORD_RECOVERY` and navigates to change-password

**If you get about:blank:** Gmail opens links in a browser, which can't handle `elidzstp://`. The app now uses the admin URL for redirects. Ensure:
1. `appWebUrl` in `app.json` → `extra` is your deployed admin URL (e.g. `https://elidz-stp-admin.vercel.app`)
2. Add to Supabase **Redirect URLs**: `https://your-admin-url.com/auth/reset-password` and `https://your-admin-url.com/auth/email-confirmed`

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
