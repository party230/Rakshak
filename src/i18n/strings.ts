/**
 * ALL text shown in the app, in English and Hindi.
 *
 * How to edit:
 *  - Change the words on the right-hand side only. Keep the key (left side) the same.
 *  - Words inside curly braces, like {name}, are filled in by the app. Keep them as they are.
 *  - Every key in `en` must also exist in `hi`. TypeScript will show an error if one is missing.
 *
 * Rules for writing text (from the spec):
 *  - Short sentences. No technical words.
 *  - Every warning ends with one clear instruction.
 */

const en = {
  // ---------- General ----------
  appName: 'Rakshak',
  'common.continue': 'Continue',
  'common.tryAgain': 'Try again',
  'common.cancel': 'Cancel',
  'common.yes': 'Yes',
  'common.no': 'No',
  'common.done': 'Done',
  'common.wait': 'Please wait…',
  'common.error': 'Something went wrong. Please try again.',
  'common.noInternet': 'No internet. Please check your connection and try again.',
  'common.comingSoon': 'This will be ready soon.',
  'common.safe': 'Safe',
  'common.alert': 'Alert',

  // ---------- Language select (A1) ----------
  'language.title': 'Choose your language',
  'language.changeLater': 'You can change this later in Settings.',
  'language.settingsTitle': 'Language',
  'language.saved': 'Language changed.',

  // ---------- Role select (A2) ----------
  'role.title': 'Who is using this phone?',
  'role.senior.title': 'Keep me safe',
  'role.senior.desc': 'I want help with scam calls and messages.',
  'role.family.title': 'I look after family',
  'role.family.desc': 'I want alerts when my parent may be in danger.',
  'role.tapOne': 'Tap one to continue.',

  // ---------- Phone login (A3) ----------
  'login.title': 'Your mobile number',
  'login.subtitle': 'We will send you a code by SMS.',
  'login.phoneLabel': 'Mobile number',
  'login.nameLabel': 'Your name',
  'login.namePlaceholder': 'For example: Kamla Sharma',
  'login.send': 'Send code',
  'login.badPhone': 'Please enter a 10-digit mobile number.',
  'login.needName': 'Please enter your name.',
  'login.tooMany': 'Too many tries. Please wait a while and try again.',

  // ---------- Code entry (A4) ----------
  'otp.title': 'Enter the code',
  'otp.subtitle': 'We sent a 6-digit code to {phone}.',
  'otp.never': 'Type this code only here. Never tell it to anyone on a call.',
  'otp.resendIn': 'Send again in {time}',
  'otp.resend': 'Send the code again',
  'otp.wrong': 'This code is not right. Please check and try again.',
  'otp.expired': 'This code is too old. Please ask for a new one.',
  'otp.sent': 'We sent a new code.',

  // ---------- Tabs ----------
  'tabs.home': 'Home',
  'tabs.check': 'Check',
  'tabs.pay': 'Pay',
  'tabs.settings': 'Settings',

  // ---------- Senior Home (S1) ----------
  'home.greeting': 'Namaste, {name}',
  'home.protected': 'You are protected',
  'home.protectedSub': 'No danger found today.',
  'home.emergency': 'Emergency',
  'home.emergencySub': 'Calls {name} right away',
  'home.emergencyNoFamilySub': 'Add family to use this',
  'home.emergencyNoFamily': 'No family added yet. Go to Settings, then My family.',
  'home.check': 'Check a message',
  'home.talk': 'Talk to Rakshak',

  // ---------- Placeholder screens (built in later phases) ----------
  'check.title': 'Check a message',
  'pay.title': 'Pay someone',
  'assistant.title': 'Talk to Rakshak',

  // ---------- Settings (S11 and F5) ----------
  'settings.title': 'Settings',
  'settings.language': 'Language',
  'settings.myFamily': 'My family',
  'settings.familyCount': '{count} people linked',
  'settings.logout': 'Log out',
  'settings.logoutConfirm': 'Do you want to log out?',

  // ---------- My family + invite code (S11) ----------
  'family.title': 'My family',
  'family.remove': 'Remove',
  'family.removeConfirm': 'Remove {name}? They will stop getting your alerts.',
  'family.none': 'No one is added yet.',
  'family.addTitle': 'Add family',
  'family.addHelp': 'Read this code to them. They type it in their Rakshak app.',
  'family.codeValid': 'Code works for 24 hours',
  'family.share': 'Send code on WhatsApp',
  'family.shareMessage':
    'Please link to me on Rakshak. Open the Rakshak app and enter this code: {code}',
  'family.canAddMore': 'You can add {count} more people.',
  'family.full': 'You have added 5 people. Remove someone to add another.',
  'family.codeError': 'Could not get a code. Please try again.',

  // ---------- Enter invite code (F1) ----------
  'link.title': 'Link to your parent',
  'link.help':
    'Ask them to open Rakshak, go to Settings, then My family, and read out the 6-digit code.',
  'link.button': 'Link',
  'link.more': 'You can link more than one parent.',
  'link.invalid': 'This code is not right. Please check it.',
  'link.expired': 'This code is too old. Ask them for a new one.',
  'link.full': 'This person already has 5 family members linked.',
  'link.self': 'You cannot link to yourself.',
  'link.notFamily': 'Only family accounts can link to a parent.',
  'link.tooMany': 'Too many tries. Please wait a few minutes.',
  'link.success': 'You are now linked to {name}.',

  // ---------- Family Home (F2) ----------
  'familyHome.title': 'Your family',
  'familyHome.linkAnother': 'Link another parent',
  'familyHome.allWell': 'All is well.',
  'familyHome.call': 'Call {name}',
};

/** The list of all text keys. Used to type-check `hi` and the t() function. */
export type StringKey = keyof typeof en;

const hi: Record<StringKey, string> = {
  // ---------- General ----------
  appName: 'रक्षक',
  'common.continue': 'आगे बढ़ें',
  'common.tryAgain': 'फिर से कोशिश करें',
  'common.cancel': 'रद्द करें',
  'common.yes': 'हाँ',
  'common.no': 'नहीं',
  'common.done': 'हो गया',
  'common.wait': 'कृपया रुकें…',
  'common.error': 'कुछ गड़बड़ हुई। कृपया फिर से कोशिश करें।',
  'common.noInternet': 'इंटरनेट नहीं है। कनेक्शन देखकर फिर से कोशिश करें।',
  'common.comingSoon': 'यह जल्द ही तैयार होगा।',
  'common.safe': 'सुरक्षित',
  'common.alert': 'खतरा',

  // ---------- Language select (A1) ----------
  'language.title': 'अपनी भाषा चुनें',
  'language.changeLater': 'आप इसे बाद में सेटिंग में बदल सकते हैं।',
  'language.settingsTitle': 'भाषा',
  'language.saved': 'भाषा बदल गई।',

  // ---------- Role select (A2) ----------
  'role.title': 'यह फ़ोन कौन इस्तेमाल कर रहा है?',
  'role.senior.title': 'मुझे सुरक्षित रखें',
  'role.senior.desc': 'मुझे धोखे वाली कॉल और मैसेज से बचने में मदद चाहिए।',
  'role.family.title': 'परिवार की देखभाल',
  'role.family.desc': 'जब मेरे माता-पिता खतरे में हों, तो मुझे खबर मिले।',
  'role.tapOne': 'आगे बढ़ने के लिए एक चुनें।',

  // ---------- Phone login (A3) ----------
  'login.title': 'आपका मोबाइल नंबर',
  'login.subtitle': 'हम आपको SMS से एक कोड भेजेंगे।',
  'login.phoneLabel': 'मोबाइल नंबर',
  'login.nameLabel': 'आपका नाम',
  'login.namePlaceholder': 'जैसे: कमला शर्मा',
  'login.send': 'कोड भेजें',
  'login.badPhone': 'कृपया 10 अंकों का मोबाइल नंबर डालें।',
  'login.needName': 'कृपया अपना नाम लिखें।',
  'login.tooMany': 'बहुत बार कोशिश हो गई। थोड़ी देर बाद फिर कोशिश करें।',

  // ---------- Code entry (A4) ----------
  'otp.title': 'कोड डालें',
  'otp.subtitle': 'हमने {phone} पर 6 अंकों का कोड भेजा है।',
  'otp.never': 'यह कोड सिर्फ़ यहीं डालें। कॉल पर कभी किसी को न बताएँ।',
  'otp.resendIn': '{time} में दोबारा भेजें',
  'otp.resend': 'कोड दोबारा भेजें',
  'otp.wrong': 'यह कोड सही नहीं है। ध्यान से देखकर फिर डालें।',
  'otp.expired': 'यह कोड पुराना हो गया। नया कोड मँगाएँ।',
  'otp.sent': 'नया कोड भेज दिया है।',

  // ---------- Tabs ----------
  'tabs.home': 'होम',
  'tabs.check': 'जाँचें',
  'tabs.pay': 'भुगतान',
  'tabs.settings': 'सेटिंग',

  // ---------- Senior Home (S1) ----------
  'home.greeting': 'नमस्ते, {name}',
  'home.protected': 'आप सुरक्षित हैं',
  'home.protectedSub': 'आज कोई खतरा नहीं मिला।',
  'home.emergency': 'इमरजेंसी',
  'home.emergencySub': '{name} को तुरंत कॉल करें',
  'home.emergencyNoFamilySub': 'इसके लिए परिवार जोड़ें',
  'home.emergencyNoFamily': 'अभी कोई परिवार नहीं जुड़ा है। सेटिंग में "मेरा परिवार" पर जाएँ।',
  'home.check': 'मैसेज जाँचें',
  'home.talk': 'रक्षक से बात करें',

  // ---------- Placeholder screens (built in later phases) ----------
  'check.title': 'मैसेज जाँचें',
  'pay.title': 'पैसे भेजें',
  'assistant.title': 'रक्षक से बात करें',

  // ---------- Settings (S11 and F5) ----------
  'settings.title': 'सेटिंग',
  'settings.language': 'भाषा',
  'settings.myFamily': 'मेरा परिवार',
  'settings.familyCount': '{count} लोग जुड़े हैं',
  'settings.logout': 'लॉग आउट',
  'settings.logoutConfirm': 'क्या आप लॉग आउट करना चाहते हैं?',

  // ---------- My family + invite code (S11) ----------
  'family.title': 'मेरा परिवार',
  'family.remove': 'हटाएँ',
  'family.removeConfirm': '{name} को हटाएँ? उन्हें आपकी चेतावनियाँ मिलनी बंद हो जाएँगी।',
  'family.none': 'अभी कोई नहीं जुड़ा है।',
  'family.addTitle': 'परिवार जोड़ें',
  'family.addHelp': 'यह कोड उन्हें बताएँ। वे इसे अपने रक्षक ऐप में डालेंगे।',
  'family.codeValid': 'यह कोड 24 घंटे तक चलेगा',
  'family.share': 'कोड WhatsApp पर भेजें',
  'family.shareMessage': 'कृपया रक्षक ऐप में मुझसे जुड़ें। रक्षक ऐप खोलें और यह कोड डालें: {code}',
  'family.canAddMore': 'आप {count} और लोगों को जोड़ सकते हैं।',
  'family.full': 'आपने 5 लोग जोड़ लिए हैं। नया जोड़ने के लिए किसी को हटाएँ।',
  'family.codeError': 'कोड नहीं मिल सका। कृपया फिर से कोशिश करें।',

  // ---------- Enter invite code (F1) ----------
  'link.title': 'अपने माता-पिता से जुड़ें',
  'link.help':
    'उनसे कहें कि रक्षक खोलें, सेटिंग में "मेरा परिवार" पर जाएँ, और 6 अंकों का कोड बताएँ।',
  'link.button': 'जोड़ें',
  'link.more': 'आप एक से ज़्यादा माता-पिता से जुड़ सकते हैं।',
  'link.invalid': 'यह कोड सही नहीं है। कृपया जाँचें।',
  'link.expired': 'यह कोड पुराना हो गया। उनसे नया कोड माँगें।',
  'link.full': 'इनसे पहले ही परिवार के 5 लोग जुड़े हैं।',
  'link.self': 'आप खुद से नहीं जुड़ सकते।',
  'link.notFamily': 'सिर्फ़ परिवार वाले खाते ही माता-पिता से जुड़ सकते हैं।',
  'link.tooMany': 'बहुत बार कोशिश हो गई। कुछ मिनट रुकें।',
  'link.success': 'अब आप {name} से जुड़ गए हैं।',

  // ---------- Family Home (F2) ----------
  'familyHome.title': 'आपका परिवार',
  'familyHome.linkAnother': 'एक और माता-पिता से जुड़ें',
  'familyHome.allWell': 'सब ठीक है।',
  'familyHome.call': '{name} को कॉल करें',
};

export type Language = 'en' | 'hi';

export const strings: Record<Language, Record<StringKey, string>> = { en, hi };

/** Language names are always shown in their own script. */
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  hi: 'हिन्दी',
};
