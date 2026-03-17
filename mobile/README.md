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
   - `elidzstp://oauth-callback` (Google/Apple sign-in)
3. For Expo Go development, also add the URL shown when running `npx expo start` (e.g. `exp://192.168.x.x:8081/--/email-confirmed`)

### Email confirmation with Mailtrap / custom SMTP

If you use **Mailtrap sandbox** or custom SMTP and confirmation links open a blank or non-existent page:

1. **Use a web URL for the redirect** (recommended): Deploy the app for web (`npx expo export --platform web`), host it (e.g. Vercel/Netlify), then set `appWebUrl` in `app.json` → `extra` to your deployed URL (e.g. `https://elidz-stp.vercel.app`). Add that URL + `/email-confirmed` to Supabase **Redirect URLs**. This makes links work in desktop browsers and avoids deep-link issues.

2. **Disable Mailtrap link tracking**: Mailtrap rewrites links by default, which can break auth flows. In Mailtrap → your domain → **Link tracking** → disable it, or exclude the Supabase domain from tracking.

3. **Supabase Site URL**: Ensure **Site URL** in Supabase Auth URL config points to a valid, reachable URL (e.g. your web app URL). Avoid placeholder URLs like `http://localhost`.

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
