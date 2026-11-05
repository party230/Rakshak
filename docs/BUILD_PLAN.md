# Rakshak build plan

Status: waiting for approval. Mockups are approved (`design/mockups/sheet1–7.png`).

---

## 1. Changes from the requested tech stack

| Area | Requested | What we'll use | Why |
|---|---|---|---|
| Running on phones | Expo Go | **Expo development build** (approved) | Phone OTP login, Android push, speech-to-text and the Share menu all need native code that Expo Go doesn't include. |
| Firebase SDK | not specified | **React Native Firebase** (`@react-native-firebase/*`) | Native phone login works with no reCAPTCHA web view and supports test phone numbers. Firestore stays live in real time. |
| Push sending | Expo Notifications + FCM | **Expo Notifications on the phone, Expo Push Service from Cloud Functions** | One API reaches both platforms; it still goes through FCM (Android) and APNs (iPhone). The `users.fcmToken` field will store the Expo push token, renamed `pushToken`. |
| Claude API key | Cloud Function environment variable | **Firebase Secret Manager** (`defineSecret("ANTHROPIC_API_KEY")`) | Plain `.env` values in Functions are deployed as readable config. Secret Manager stores the key encrypted and gives it only to the functions that need it. The key still never touches the app. |
| `alerts.fullContent` | a field on the alert | **A separate document: `alerts/{id}/private/content`** | Firestore rules can't hide a single field, only whole documents. Splitting it out lets the rules return the full text only when the privacy level is Full. |
| Linking, payment decisions | not specified | **Callable Cloud Functions** (`linkWithCode`, `decidePayment`) | Checks like "the code is valid and not expired", "no more than 5 family members", "this person is linked" and "the payment is still pending" can't be trusted to the phone. |
| "Join call" | 3-way call | A normal phone call plus a note (already in the mockups) | Neither Android nor iOS lets an app start a conference call. |

**Firebase plan:** Cloud Functions and Secret Manager need the **Blaze (pay-as-you-go)** plan. A demo stays inside the free monthly allowance, and we'll set a budget alert at ₹100.

**Claude models:**
- **Claude Haiku 5.5** for live call checks, where speed matters most.
- **Claude Sonnet 5.5** for messages, links, screenshots and the assistant.

The function caps each user at 10 checks per minute and 200 per day, counted in Firestore.

---

## 2. Project layout

```
rakshak/
  app/                    Expo Router screens
    (onboarding)/         language, role, login, code, invite
    (senior)/             tabs: home, check, pay, settings (+ stacks)
    (family)/             tabs: home, settings (+ alert, approval)
    call/                 simulated call + warnings
  src/
    i18n/strings.ts       EVERY Hindi + English string, in one file
    theme/                colours, font sizes, spacing (from mockups)
    components/           BigButton, StatusCard, Verdict, ...
    services/             firebase, push, speech, claude (calls Functions)
    detection/            keyword lists (hi/en), link heuristics
    simulation/           scripted scam calls and scenarios
  functions/              Cloud Functions (TypeScript)
    src/claude.ts         the only place the Claude API is called
    src/rateLimit.ts
    src/alerts.ts         push to family on new alert
    src/payments.ts       approve/reject/expire
    src/links.ts          linkWithCode, removeFamily
    scripts/seed.ts       seed Senior + Family accounts
  firestore.rules
  firestore.indexes.json
  README.md
```

---

## 3. Test accounts (fixed OTP, no real SMS)

| Account | Name | Phone | OTP |
|---|---|---|---|
| Senior | Kamla Sharma | +91 90000 00001 | 123456 |
| Family | Rahul Sharma (son) | +91 90000 00002 | 123456 |
| Spare Family (for testing linking) | Priya Sharma | +91 90000 00003 | 123456 |

To add these in Firebase:
1. Open Firebase console → **Authentication → Sign-in method → Phone → Enable**.
2. Under **Phone numbers for testing**, add the three numbers with code `123456`.

`npm run seed` (in `functions/`) then creates the matching users, links Kamla and Rahul, sets Kamla's limit to ₹5,000 and privacy to Standard, and saves Rahul and Priya as trusted numbers. Test numbers never send an SMS and don't count against SMS quota.

---

## 4. One-time setup: phones

### Android (both team members)
1. Create a free Expo account at expo.dev, then run `npm i -g eas-cli` and `eas login`.
2. In the Firebase console, add an Android app with package `in.rakshak.app`. Download `google-services.json` into the project root.
3. Add the SHA-1 and SHA-256 fingerprints from `eas credentials -p android` to the Firebase Android app. Phone login needs them.
4. Create a Firebase service account key for FCM v1 and upload it with `eas credentials -p android` → *Google Service Account → FCM V1*.
5. Run `eas build -p android --profile development`. When it finishes, open the link or QR on the Android phone and install the APK. Allow "install unknown apps" if asked.
6. On the computer, run `npx expo start --dev-client`. Open the Rakshak app on the phone and scan the QR. Code changes then reload live, like Expo Go.

### iPhone, Path A: free Xcode on your Mac (start here)
Limits:
- The app stops opening after **7 days**; reconnect the phone and run step 6 again.
- **No push notifications on iPhone** (Apple only allows them on paid accounts). The app still shows alerts and approvals live while it's open, but the iPhone won't buzz when Rakshak is closed. The Family role is best tested on Android on this path.
- Only works on phones plugged into the Mac.

Steps:
1. Install **Xcode** from the Mac App Store, open it once, and accept the licence. Then run `xcode-select --install`.
2. Install CocoaPods: `sudo gem install cocoapods` (or `brew install cocoapods`).
3. In Xcode, open **Settings → Accounts → +** and sign in with your Apple ID. This creates a "Personal Team".
4. In the Firebase console, add an iOS app with bundle ID `in.rakshak.app`. Download `GoogleService-Info.plist` into the project root.
5. On the iPhone, turn on **Settings → Privacy & Security → Developer Mode** and restart.
6. Plug in the iPhone and run `npx expo run:ios --device`. Pick your phone. If signing fails, open `ios/Rakshak.xcworkspace`, then **Signing & Capabilities → Team = Personal Team**, and remove the Push Notifications capability.
7. On the iPhone, go to **Settings → General → VPN & Device Management → your Apple ID → Trust**.
8. Next time, just run `npx expo start --dev-client` and open the app.

### iPhone, Path B: Apple Developer account + EAS + TestFlight (later)
1. Enrol at developer.apple.com/programs ($99 a year). Approval takes 1–2 days.
2. Run `eas device:create`, open the link on each tester's iPhone, and install the profile. This registers the phone.
3. Run `eas build -p ios --profile development`. Let EAS create the certificates and the **push notification (APNs) key** when it asks.
4. Open the build link on the iPhone and install. Turn on Developer Mode as in Path A step 5. Then use `npx expo start --dev-client` as usual.
5. Optional: upload the same APNs key to Firebase (**Project settings → Cloud Messaging → APNs auth key**). Real phone numbers then log in without a reCAPTCHA page.
6. For **TestFlight**, so testers get the app with no computer and no device registration:
   1. Create the app in App Store Connect with bundle ID `in.rakshak.app`.
   2. Run `eas build -p ios --profile preview` (store build), then `eas submit -p ios`.
   3. In App Store Connect, open **TestFlight**, add testers by email, and they install from the TestFlight app. Each build lasts 90 days.
   4. TestFlight builds are fixed releases, not live-reloading. Use them for demos, and use step 4 builds for development.

---

## 5. Phases

Every phase ends with: how to run it on both phones, and a numbered test checklist.

### Phase 1: Foundation, login and linking
- Expo project (TypeScript, Expo Router), dev build profiles, theme taken from the mockups.
- `src/i18n/strings.ts` with every string in Hindi and English. The language switch applies at once.
- Screens: Language → Role → Phone login → OTP (A1–A4), Family invite code (F1).
- Firestore `users`, `links`, `settings`, `invites`. Functions: `createInvite`, `linkWithCode` (24-hour code, max 5 family), `removeFamily`.
- Senior and Family tab shells with placeholder screens. Senior "My family" screen (S11). Basic Settings: language, log out.
- First version of the Firestore rules, plus the seed script and test phone numbers.
- **What you'll test:** log in as Kamla on one phone and Rahul on the other, with no SMS. See them linked. Create a code and link Priya. Remove Priya. Switch language.

### Phase 2: Message, link, screenshot and file checking
- Cloud Functions set up with the Claude key in Secret Manager, plus the per-user rate limit.
- `checkContent` function for text, links and images, returning Safe, Suspicious or Scam with a reason and an action.
- In-app link checks (lookalike bank and government domains, link shorteners, unusual domain endings, words like kyc, verify and refund) sent along with the link. `.apk` files are always High.
- Check screen (S2) with paste, photo and three result screens; read aloud with Expo Speech.
- Share into Rakshak from WhatsApp, SMS or Gallery (`expo-share-intent`).
- Suspicious and Scam results saved to history and an `alert` created.
- **What you'll test:** paste the fake SBI SMS (Scam), a prize message (Suspicious) and a normal message (Safe). Share a screenshot from Gallery. Share a WhatsApp message. Check a `.apk` link.

### Phase 3: Family alerts, privacy and emergency
- `onAlertCreated` sends a push to every linked family member within seconds.
- Family Home (F2) with live Safe/Alert status, Alert detail (F3) with Call, Join call and Mark as resolved.
- Senior status card turns red while an alert is open and back to green when resolved.
- Privacy screen (S11). Rules enforce Basic, Standard and Full, with the full text kept in a separate private document.
- Emergency button: calls the first linked family member and alerts the others.
- Family Settings (F5): notification switches. The payment limit stepper is added in Phase 5.
- **What you'll test:** a Scam check on Kamla's phone makes Rahul's phone buzz. Tap it and open the detail. Try each privacy level and see what Rahul can see. Mark as resolved and see Kamla go green. Press Emergency.

### Phase 4: Call simulation, live warnings and fake voice
- Hidden Test mode (tap the logo 5 times) (S12).
- Fake incoming call and on-call screens (S4) with scripted captions in English and Hindi.
- Two-step detection: instant keyword check, then a Claude Haiku risk rating every few caption lines.
- Medium shows the yellow banner. High shows the full red warning (S5), read aloud, with an alert sent to family.
- Trusted numbers screen. The fake voice check (S6) compares the claimed relative's number with saved numbers and offers "Call real number".
- When family taps Call or Join, Kamla's phone shows "Rahul is calling to help you" (S7).
- Scenarios 1–4 (digital arrest in English and Hindi, family in trouble, phishing SMS, KYC APK).
- **What you'll test:** run each scenario and watch the warning on Kamla's phone and the alert on Rahul's.

### Phase 5: Payments and family approval
- Pay screen (S9) with the practice UPI form. Payments under the limit go through at once.
- Over the limit: a `pending` payment, the waiting screen with a 15-minute timer (S10), and a push to family.
- Approval screen (F4) with the red banner if a High call alert happened in the last 2 hours.
- `decidePayment` function. A scheduled function runs every minute and expires payments after 15 minutes.
- Family Settings payment limit stepper per senior. Senior sees the limit as view-only.
- Scenario 5: ₹50,000 right after a scam call.
- **What you'll test:** pay ₹2,000 (instant). Pay ₹50,000: approve it, reject it, and let it expire. Change the limit from Rahul's phone. Run scenario 5.

### Phase 6: Rakshak Assistant and Recovery help
- Chat (S3) with typing or speaking (`expo-speech-recognition`, Hindi and English), short replies and a speaker button.
- Assistant prompt rules: never asks for OTP, PIN or bank details; tells the user to hang up and shows Emergency when a scam is happening; can check a pasted message, link or screenshot in the chat.
- Recovery help (S8): call 1930, open cybercrime.gov.in, the bank script, the evidence list, and a complaint drafted from the alert, ready to copy.
- **What you'll test:** "How do I add my son?" in English and Hindi by voice; "A CBI officer says I'm under digital arrest"; paste a scam link in chat; open Recovery from an alert and copy the complaint.

### Phase 7: Finish and handover
- Full Hindi review, large-text and contrast check, and empty and error states (no internet, server busy).
- Firestore rules tests with the Firebase Emulator.
- Final README: Firebase setup, Claude key, both iPhone paths, Android, seed data, and **which features need telecom or bank partnerships**.
- **What you'll test:** the full demo script end to end on both phones.
