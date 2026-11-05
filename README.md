# Rakshak · रक्षक

Rakshak protects senior citizens from phone and online scams, alerts their family, and asks family to approve large payments.

- **Senior** ("Keep me safe"): the person being protected.
- **Family** ("I look after family"): a trusted contact who gets alerts and approves payments.

> **Status: Phase 1 of 7 is done.** Language, login, roles and family linking work.
> Checking messages, alerts, call warnings, payments and the assistant come in later
> phases (see [docs/BUILD_PLAN.md](docs/BUILD_PLAN.md)).

---

## Contents

1. [What's in this folder](#whats-in-this-folder)
2. [One-time setup](#one-time-setup)
   1. [Tools on your computer](#1-tools-on-your-computer)
   2. [Create the Firebase project](#2-create-the-firebase-project)
   3. [Deploy the server code and security rules](#3-deploy-the-server-code-and-security-rules)
   4. [Create the demo accounts (seed data)](#4-create-the-demo-accounts-seed-data)
   5. [Android phone](#5-android-phone)
   6. [iPhone (free Xcode on a Mac)](#6-iphone-free-xcode-on-a-mac)
3. [Every day: running the app](#every-day-running-the-app)
4. [Demo accounts](#demo-accounts)
5. [Editing the Hindi and English text](#editing-the-hindi-and-english-text)
6. [Automated tests](#automated-tests)
7. [What needs telecom or bank partners](#what-needs-telecom-or-bank-partners)
8. [Troubleshooting](#troubleshooting)

---

## What's in this folder

```
src/
  app/                 Screens. Each file is one screen (Expo Router).
    (onboarding)/      Language → Role → Login → Code
    senior/            Senior tabs (Home, Check, Pay, Settings) + My family
    family/            Family tabs (Home, Settings) + Link another parent
  components/          Buttons, cards, code boxes, icons… shared by screens
  i18n/strings.ts      ALL Hindi and English text, in one file
  services/            Talking to Firebase (login, profiles, links)
  session/             Who is logged in, and which screens they may see
  theme/               Colours and text sizes from the approved designs
functions/             Server code (Firebase Cloud Functions)
  src/links.ts         Invite codes and linking (max 5 family, 24-hour codes)
  scripts/seed.ts      Creates the demo accounts
firestore.rules        Who may read/write what in the database
tests/                 Automated tests for the rules and server code
design/                Approved mockups (open design/mockups/*.png)
docs/BUILD_PLAN.md     The phase-by-phase plan
```

**Why a "development build" instead of Expo Go?** Phone OTP login, push notifications, voice input and the Share menu need native code that Expo Go doesn't include. A development build is your own version of Expo Go with that code inside. You install it once, then it works the same way: start the server, open the app, and changes appear live.

---

## One-time setup

### 1. Tools on your computer

Install these first:

| Tool | How to get it |
|---|---|
| Node.js 22 | <https://nodejs.org> (choose "LTS") |
| Git | <https://git-scm.com> |
| Expo account (free) | Sign up at <https://expo.dev> |
| EAS command line | `npm install -g eas-cli`, then `eas login` |
| Firebase command line | `npm install -g firebase-tools`, then `firebase login` |
| Java 17+ (only to run the automated tests) | <https://adoptium.net> |

Then download this project and install its packages:

```bash
git clone <this repository's URL> rakshak
```

```bash
cd rakshak && npm install
```

```bash
cd functions && npm install && cd ..
```

### 2. Create the Firebase project

1. Go to <https://console.firebase.google.com> → **Add project**. Name it e.g. `rakshak-demo`. Google Analytics is not needed.
2. **Upgrade to the Blaze plan** (bottom-left → *Upgrade*). Cloud Functions need it. A demo stays inside the free monthly allowance.
   - Then set a budget alert: Google Cloud console → **Billing → Budgets & alerts → Create budget** → ₹100.
3. **Turn on phone login:** *Build → Authentication → Get started → Sign-in method → Phone → Enable → Save.*
4. **Create the database:** *Build → Firestore Database → Create database →* location **asia-south1 (Mumbai)** → *Start in production mode*. The real rules are deployed in step 3.
5. **Add the Android app:** *Project settings (gear) → Your apps → Android icon.*
   - Package name: `in.rakshak.app`
   - Download **google-services.json** and put it in the project's root folder (next to `package.json`).
6. **Add the iOS app:** *Project settings → Your apps → Add app → iOS.*
   - Bundle ID: `in.rakshak.app`. If you need a different one, see [step 6](#6-iphone-free-xcode-on-a-mac).
   - Download **GoogleService-Info.plist** and put it in the project's root folder.

Both files are listed in `.gitignore`, so they are never committed.

### 3. Deploy the server code and security rules

```bash
cp .firebaserc.example .firebaserc
```

Open `.firebaserc` and replace `your-firebase-project-id` with your project ID. It's shown under *Project settings → General*. Then:

```bash
firebase deploy --only firestore:rules,functions
```

The first deploy takes a few minutes while Google turns on the services it needs. If it says an API "has not been used", wait a minute and run it again.

> **Claude API key:** not needed until Phase 2. When we get there, you'll run
> `firebase functions:secrets:set ANTHROPIC_API_KEY` and paste the key when it asks.
> The key is stored encrypted in Google Secret Manager. It is never in the app or in this repository.

### 4. Create the demo accounts (seed data)

1. Firebase console → *Project settings → Service accounts → Generate new private key*.
2. Save the file as `functions/service-account.json`. It is git-ignored. **Never share or commit it.**
3. Run:

```bash
cd functions && GOOGLE_APPLICATION_CREDENTIALS=./service-account.json npm run seed
```

On Windows PowerShell, run this instead:

```powershell
cd functions; $env:GOOGLE_APPLICATION_CREDENTIALS="./service-account.json"; npm run seed
```

This does three things:
- Registers the [demo phone numbers](#demo-accounts) as Firebase **test phone numbers** with code `123456`, so no SMS is sent.
- Creates Kamla (Senior), Rahul (Family, linked to Kamla) and Priya (Family, not linked).
- Gives Kamla default settings.

You can run it again at any time to reset the demo accounts.

If it prints *"Could not register test phone numbers automatically"*, add them by hand: *Authentication → Sign-in method → Phone → Phone numbers for testing* → add each number with code `123456`.

### 5. Android phone

1. Link the project to your Expo account:
   ```bash
   eas init
   ```
   It prints a **project ID**. Paste it into `app.config.ts` at `const EAS_PROJECT_ID = '...'`.

2. Give EAS your Firebase file. The cloud build can't see git-ignored files, so we upload it once:
   ```bash
   eas env:set --environment development --name GOOGLE_SERVICES_JSON --type file --value ./google-services.json --visibility secret
   ```

3. Build the development app in the cloud. This takes about 10–20 minutes, and EAS creates the signing key for you when asked:
   ```bash
   eas build -p android --profile development
   ```

4. When it finishes, open the link it prints **on your Android phone**, or scan its QR code. Download and install the APK. Allow "Install unknown apps" if asked.

5. *(Only needed for real phone numbers, not the demo ones.)* Firebase must recognise your app's signature. Run `eas credentials -p android`, choose the development build, and copy the **SHA-1** and **SHA-256** fingerprints. Add both under *Firebase → Project settings → Your apps → Android app → Add fingerprint*.

You only rebuild when native packages change. Each phase will tell you if a rebuild is needed.

### 6. iPhone (free Xcode on a Mac)

Limits of the free path:
- The app stops opening after **7 days**. Plug in the phone and run `npm run ios` again.
- **No push notifications on iPhone.** Alerts still appear live while the app is open. From Phase 3, test the Family role on Android.
- Only phones plugged into the Mac.

One-time steps on the Mac:

1. Install **Xcode** from the Mac App Store, open it once, and accept the licence. Then run:
   ```bash
   xcode-select --install
   ```
2. Install CocoaPods:
   ```bash
   brew install cocoapods
   ```
   (or `sudo gem install cocoapods`)
3. Xcode → **Settings → Accounts → +** → sign in with your Apple ID. This creates a "Personal Team".
4. On the iPhone, turn on **Settings → Privacy & Security → Developer Mode** and restart the phone.
5. Plug the iPhone into the Mac with a cable, unlock it, and tap **Trust**.
6. Build and install. Pick your iPhone from the list:
   ```bash
   npm run ios
   ```
   If it fails with a **signing** error:
   1. Open `ios/Rakshak.xcworkspace` in Xcode.
   2. Click the **Rakshak** project → **Signing & Capabilities** → set **Team** to your Personal Team.
   3. Run `npm run ios` again.
7. The first time, the iPhone blocks the app. Allow it in **Settings → General → VPN & Device Management → your Apple ID → Trust**.

**If Xcode says the bundle ID `in.rakshak.app` is not available.** Free accounts need an ID nobody else has used.
1. In Firebase, add another iOS app with your own ID, e.g. `com.yourname.rakshak`, and download its `GoogleService-Info.plist` into the root folder.
2. Build with:
   ```bash
   RAKSHAK_IOS_BUNDLE_ID=com.yourname.rakshak npx expo run:ios --device
   ```

---

## Every day: running the app

1. Start the development server on your computer:
   ```bash
   npm start
   ```
2. Open **Rakshak** on the phone. The phone and computer must be on the same Wi-Fi.
   - **Android:** the app shows the server, or you can scan the QR code from the terminal.
   - **iPhone:** the app finds the Mac automatically, or you can scan the QR code with the Camera app.
3. Save a file and the app reloads. Shake the phone for the developer menu.

If your Wi-Fi blocks phone-to-computer connections (office or public Wi-Fi), use:

```bash
npx expo start --dev-client --tunnel
```

---

## Demo accounts

| Who | Role | Phone | Code |
|---|---|---|---|
| Kamla Sharma | Senior | `90000 00001` | `123456` |
| Rahul Sharma | Family (linked to Kamla) | `90000 00002` | `123456` |
| Priya Sharma | Family (not linked) | `90000 00003` | `123456` |

Type just the 10 digits. The app adds +91. Any name works on the login screen, because demo accounts already have one.

---

## Editing the Hindi and English text

All text is in **[`src/i18n/strings.ts`](src/i18n/strings.ts)**: English first, then Hindi, with the same keys in the same order.

- Change only the text on the right side of each line.
- Keep `{name}`, `{count}` and other words in curly braces exactly as they are. The app fills them in.
- If you add a new line to English, add it to Hindi too. `npm run typecheck` will tell you if one is missing.

---

## Automated tests

These run on your computer against Firebase's local emulator. They need Java and don't touch your real project.

```bash
cd tests && npm install && npm test
```

- `firestore.rules.test.ts` covers 22 checks. Examples: a Family member can read only linked Seniors, the Senior can't change their own payment limit, and the app can't create links itself.
- `functions.smoke.cjs` covers 17 checks: invite codes, the 5-family limit, expired codes, and the limit on guessing codes.

Code checks for the app:

```bash
npm run typecheck && npm run lint
```

---

## What needs telecom or bank partners

Android and iOS don't let apps listen to phone calls or block payments made in other apps. So in this prototype:

| Feature | In this prototype | To work for real, it would need |
|---|---|---|
| Call warning (1) | A simulated call with scripted captions | A **telecom operator** partnership (network-side call analysis or live transcription with consent), or Android's call-screening role plus on-device speech-to-text. iOS doesn't allow this at all. |
| Fake voice check (2) | Compares the simulated caller's number with saved numbers | **Caller ID data from operators**, e.g. TRAI's CNAP (caller name display), to check who is really calling. |
| Family joins the call (6) | A normal call to the Senior, with a note | **Operator conference calling** (3-way calling started by the network). Apps can't start a conference call. |
| Payment approval (8) | A practice UPI screen inside Rakshak | **Bank or UPI app partnership** (NPCI / PSP bank) to hold payments above a limit until family approves, e.g. via UPI "delegated payments". |
| Scam number lists | Phrases and links only | Access to **DoT's Chakshu / Sanchar Saathi** fraud number reports and bank fraud feeds. |

These features work for real now or in later phases with no partners needed: checking messages, links and screenshots (3, 4), family alerts (5), privacy levels (7), Emergency and recovery help (9), and the assistant (10).

---

## Troubleshooting

| Problem | What to do |
|---|---|
| "This code is not right" with a demo number | Run the seed script again, or check the test numbers in Firebase → Authentication → Phone. |
| Real number never gets an SMS (Android) | Add the SHA-1 and SHA-256 fingerprints (Android step 5). |
| Real number opens a web page on iPhone | Normal on the free Apple path: Firebase checks you're not a robot. Complete it and you'll come back to the app. |
| "Something went wrong" on My family | The functions aren't deployed, or are in another region. Run `firebase deploy --only functions` and check they're in `asia-south1`. |
| App can't find the computer | Same Wi-Fi? Try `npx expo start --dev-client --tunnel`. |
| iPhone app won't open after a week | Free Apple builds expire after 7 days. Run `npm run ios` again. |
