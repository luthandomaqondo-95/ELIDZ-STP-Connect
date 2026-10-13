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

### Production deep linking (recommended)

Use verified `https` links when you want taps on `https://elidzconnect.vercel.app/auth/...` to open the **mobile app** (not only the browser). Custom scheme `elidzstp://` works independently and does **not** use this verification.

- **Domain**: `https://elidzconnect.vercel.app`
- **Android App Links**:
  - `mobile/app.json` includes `android.intentFilters` with `autoVerify: true` for `https://elidzconnect.vercel.app` and `pathPrefix` `/auth`
  - `admin/public/.well-known/assetlinks.json` must list package `com.elidzstp.app` and the correct **SHA-256** certificate(s)
  - `admin/next.config.ts` sets `Content-Type: application/json` for `/.well-known/assetlinks.json` and `apple-app-site-association`
- **iOS Universal Links**:
  - `mobile/app.json` includes `ios.associatedDomains` = `applinks:elidzconnect.vercel.app`
  - `admin/public/.well-known/apple-app-site-association` must use your real **Apple Team ID** + bundle `com.elidzstp.app`
- **Supabase Redirect URLs** (typical set):
  - `elidzstp://change-password`, `elidzstp://email-confirmed`, `elidzstp://oauth-callback` (and `elidzstp://**` if you use a wildcard)
  - For **admin** web reset only: `https://elidzconnect.vercel.app/auth/reset-password` and `https://elidzconnect.vercel.app/auth/email-confirmed`

### Fix Google Play Console → “Failed domain checks” (Android App Links)

Play checks that your **website** (`elidzconnect.vercel.app`) declares the **same signing certificate** that users’ Play Store builds use. If they differ, you see **Failed domain checks** even though `assetlinks.json` exists.

**Most common cause:** `assetlinks.json` contains the **upload key** or an **EAS build** fingerprint, but Play **re-signs** the app with **Play App Signing**. The SHA-256 in the file must include the **App signing key certificate** from Play Console.

Do this in order:

1. **Get the correct SHA-256 from Play Console**
   - Open [Google Play Console](https://play.google.com/console) → your app.
   - Go to **Release** → **Setup** → **App integrity** (older UI: **Setup** → **App signing**).
   - Under **App signing key certificate**, copy **SHA-256 certificate fingerprint** (format like `AB:CD:...`).

2. **Update `admin/public/.well-known/assetlinks.json`**
   - Open the file in this repo.
   - In `sha256_cert_fingerprints`, set the value(s) so they **include** that Play **App signing** SHA-256. You can list **multiple** fingerprints as separate strings in the JSON array (e.g. Play app signing + upload key) if you need more than one verified.

3. **Deploy the admin site**
   - Merge and deploy to Vercel so `https://elidzconnect.vercel.app/.well-known/assetlinks.json` serves the updated JSON.

4. **Verify the file is live**
   - In a browser: open `https://elidzconnect.vercel.app/.well-known/assetlinks.json` → must be **200**, valid JSON, **no HTML** wrapper.
   - Optional: [Google Digital Asset Links API](https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://elidzconnect.vercel.app&relation=delegate_permission/common.handle_all_urls) should list your app + fingerprint.

5. **Wait for Play to re-scan**
   - Play Console deep-link / domain checks can take **hours to a day** after the site is fixed. Re-open **Grow** → **Deep links** (or **Policy** → **App content** → **App links**, depending on UI) and use any **Re-check** / **Test** action if available.

6. **Optional on-device check** (debug build or Play build installed):
   - `adb shell pm get-app-links com.elidzstp.app` and look for `elidzconnect.vercel.app` → **verified** vs **none**.

**If you do not need HTTPS links to open the app** (you only use `elidzstp://` for mobile auth): you can remove the `android.intentFilters` block from `mobile/app.json` and ship a **new AAB** so Play stops expecting domain verification for that host—but then `https://elidzconnect.vercel.app/auth/...` will not auto-open the app.

### Password reset / email confirmation (mobile)

**Mobile app** uses `elidzstp://` redirects from Supabase. Ensure:

- Supabase **Redirect URLs** include `elidzstp://change-password`, `elidzstp://email-confirmed`, and `elidzstp://oauth-callback` as needed (wildcard `elidzstp://**` is simplest if allowed).
- `AuthProvider` handles `PASSWORD_RECOVERY` and routes to change-password (see app source).

**Admin users** reset via the admin site only: `https://elidzconnect.vercel.app/auth/forgot-password` → email → `/auth/reset-password` (separate from mobile).

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
