'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Locale = 'en' | 'hi' | 'mr';

type Translations = {
  // Sidebar
  dashboard: string;
  pricePrediction: string;
  diseaseDiagnosis: string;
  weatherPrediction: string;
  marketplace: string;
  community: string;
  messages: string;
  profile: string;
  settings: string;
  logout: string;
  login: string;
  signup: string;
  aiTools: string;
  platform: string;
  account: string;
  // Dashboard
  welcomeFarmer: string;
  dashboardSubtitle: string;
  aiPoweredInsights: string;
  communityCommerce: string;
  getStarted: string;
  comingSoon: string;
  goTo: string;
  noAiToolsFound: string;
  noPlatformFeaturesFound: string;
  cropPricePredictionTitle: string;
  cropPricePredictionDesc: string;
  cropDiseaseDiagnosisTitle: string;
  cropDiseaseDiagnosisDesc: string;
  weatherPredictionTitle: string;
  weatherPredictionDesc: string;
  marketplaceTitle: string;
  marketplaceDesc: string;
  communityHubTitle: string;
  communityHubDesc: string;
  // Page subtitles
  pricePredictionSubtitle: string;
  diseaseDiagnosisSubtitle: string;
  weatherPredictionSubtitle: string;
  marketplaceSubtitle: string;
  communityHubSubtitle: string;
  // Settings nav
  settingsProfile: string;
  settingsAppearance: string;
  settingsNotifications: string;
  settingsTranslation: string;
  settingsOrders: string;
  // Settings - Profile
  profileHeading: string;
  profileSubtitle: string;
  accountHeading: string;
  accountSubtitle: string;
  username: string;
  displayName: string;
  defaultRegion: string;
  updateProfile: string;
  userId: string;
  emailAddress: string;
  emailCannotChange: string;
  sendPasswordReset: string;
  loadingProfile: string;
  // Settings - Appearance
  appearanceHeading: string;
  appearanceSubtitle: string;
  theme: string;
  selectTheme: string;
  light: string;
  dark: string;
  system: string;
  // Settings - Notifications
  notificationsHeading: string;
  notificationsSubtitle: string;
  emailNotifications: string;
  emailNotificationsDesc: string;
  pushNotifications: string;
  pushNotificationsDesc: string;
  mentions: string;
  mentionsDesc: string;
  newMessages: string;
  newMessagesDesc: string;
  productUpdates: string;
  productUpdatesDesc: string;
  everything: string;
  sameAsEmail: string;
  noPushNotifications: string;
  saveChanges: string;
};

const translations: Record<Locale, Translations> = {
  en: {
    // Sidebar
    dashboard: 'Dashboard',
    pricePrediction: 'Price Prediction',
    diseaseDiagnosis: 'Disease Diagnosis',
    weatherPrediction: 'Weather Prediction',
    marketplace: 'Marketplace',
    community: 'Community',
    messages: 'Messages',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',
    login: 'Login',
    signup: 'Sign up',
    aiTools: 'AI Tools',
    platform: 'Platform',
    account: 'Account',
    // Dashboard
    welcomeFarmer: 'Welcome, Farmer!',
    dashboardSubtitle: 'Your all-in-one solution for modern farming. What would you like to do today?',
    aiPoweredInsights: 'AI-Powered Insights',
    communityCommerce: 'Community & Commerce',
    getStarted: 'Get Started',
    comingSoon: 'Coming Soon',
    goTo: 'Go to',
    noAiToolsFound: 'No matching AI tools found.',
    noPlatformFeaturesFound: 'No matching platform features found.',
    cropPricePredictionTitle: 'Crop Price Prediction',
    cropPricePredictionDesc: 'Get AI-powered price forecasts for your crops.',
    cropDiseaseDiagnosisTitle: 'Crop Disease Diagnosis',
    cropDiseaseDiagnosisDesc: 'Upload a photo to diagnose crop diseases instantly.',
    weatherPredictionTitle: 'Weather Prediction & Advice',
    weatherPredictionDesc: 'Get forecasts and actionable farming tips for your location.',
    marketplaceTitle: 'Marketplace',
    marketplaceDesc: 'Buy and sell agricultural products directly.',
    communityHubTitle: 'Community Hub',
    communityHubDesc: 'Connect with fellow farmers and share knowledge.',
    // Page subtitles
    pricePredictionSubtitle: 'Enter your crop details to get an AI-powered price prediction and listing recommendation.',
    diseaseDiagnosisSubtitle: 'Upload a photo of an affected plant to get an instant AI-powered diagnosis and treatment recommendations.',
    weatherPredictionSubtitle: 'Get AI-powered weather forecasts and actionable farming tips for your location.',
    marketplaceSubtitle: 'Buy and sell fresh produce and farming supplies directly.',
    communityHubSubtitle: 'Connect with fellow farmers, share knowledge, and grow together. Explore a community or search for content below.',
    // Settings nav
    settingsProfile: 'Profile',
    settingsAppearance: 'Appearance',
    settingsNotifications: 'Notifications',
    settingsTranslation: 'Translation',
    settingsOrders: 'Orders',
    // Settings - Profile
    profileHeading: 'Profile',
    profileSubtitle: 'This is how others will see you on the site.',
    accountHeading: 'Account',
    accountSubtitle: 'Manage your account security and identification.',
    username: 'Username',
    displayName: 'Display Name',
    defaultRegion: 'Default Region',
    updateProfile: 'Update profile',
    userId: 'User ID',
    emailAddress: 'Email Address',
    emailCannotChange: 'Your email address is {email}. This cannot be changed.',
    sendPasswordReset: 'Send Password Reset Email',
    loadingProfile: 'Loading profile...',
    // Settings - Appearance
    appearanceHeading: 'Appearance',
    appearanceSubtitle: 'Customize the appearance of the app. Automatically switch between day and night themes.',
    theme: 'Theme',
    selectTheme: 'Select the theme for the application.',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    // Settings - Notifications
    notificationsHeading: 'Notifications',
    notificationsSubtitle: 'Configure how you receive notifications.',
    emailNotifications: 'Email Notifications',
    emailNotificationsDesc: 'Choose which email notifications you want to receive.',
    pushNotifications: 'Push Notifications',
    pushNotificationsDesc: 'Choose which push notifications you want to receive on your devices.',
    mentions: 'Mentions',
    mentionsDesc: 'When someone mentions you in a post or comment.',
    newMessages: 'New Messages',
    newMessagesDesc: 'When you receive a new direct message.',
    productUpdates: 'Product Updates',
    productUpdatesDesc: 'News, updates, and marketing from Farmingo.',
    everything: 'Everything',
    sameAsEmail: 'Same as email',
    noPushNotifications: 'No push notifications',
    saveChanges: 'Save Changes',
  },
  hi: {
    // Sidebar
    dashboard: 'डैशबोर्ड',
    pricePrediction: 'मूल्य पूर्वानुमान',
    diseaseDiagnosis: 'रोग निदान',
    weatherPrediction: 'मौसम पूर्वानुमान',
    marketplace: 'बाज़ार',
    community: 'समुदाय',
    messages: 'संदेश',
    profile: 'प्रोफ़ाइल',
    settings: 'सेटिंग्स',
    logout: 'लॉग आउट',
    login: 'लॉग इन',
    signup: 'साइन अप',
    aiTools: 'AI उपकरण',
    platform: 'प्लेटफ़ॉर्म',
    account: 'खाता',
    // Dashboard
    welcomeFarmer: 'स्वागत है, किसान!',
    dashboardSubtitle: 'आधुनिक खेती के लिए आपका सर्वसमावेशी समाधान। आज आप क्या करना चाहेंगे?',
    aiPoweredInsights: 'AI-संचालित जानकारी',
    communityCommerce: 'समुदाय और व्यापार',
    getStarted: 'शुरू करें',
    comingSoon: 'जल्द आ रहा है',
    goTo: 'जाएं',
    noAiToolsFound: 'कोई मिलता-जुलता AI उपकरण नहीं मिला।',
    noPlatformFeaturesFound: 'कोई मिलती-जुलती सुविधा नहीं मिली।',
    cropPricePredictionTitle: 'फसल मूल्य पूर्वानुमान',
    cropPricePredictionDesc: 'अपनी फसलों के लिए AI-संचालित मूल्य पूर्वानुमान प्राप्त करें।',
    cropDiseaseDiagnosisTitle: 'फसल रोग निदान',
    cropDiseaseDiagnosisDesc: 'फसल रोगों का तुरंत निदान करने के लिए फोटो अपलोड करें।',
    weatherPredictionTitle: 'मौसम पूर्वानुमान और सलाह',
    weatherPredictionDesc: 'अपने स्थान के लिए पूर्वानुमान और खेती की सलाह प्राप्त करें।',
    marketplaceTitle: 'बाज़ार',
    marketplaceDesc: 'कृषि उत्पाद सीधे खरीदें और बेचें।',
    communityHubTitle: 'समुदाय केंद्र',
    communityHubDesc: 'साथी किसानों से जुड़ें और ज्ञान साझा करें।',
    // Page subtitles
    pricePredictionSubtitle: 'AI-संचालित मूल्य पूर्वानुमान और लिस्टिंग सिफारिश पाने के लिए अपनी फसल का विवरण दर्ज करें।',
    diseaseDiagnosisSubtitle: 'तत्काल AI-संचालित निदान और उपचार सिफारिशें पाने के लिए प्रभावित पौधे की फोटो अपलोड करें।',
    weatherPredictionSubtitle: 'अपने स्थान के लिए AI-संचालित मौसम पूर्वानुमान और खेती की सलाह प्राप्त करें।',
    marketplaceSubtitle: 'ताजा उपज और खेती की आपूर्ति सीधे खरीदें और बेचें।',
    communityHubSubtitle: 'साथी किसानों से जुड़ें, ज्ञान साझा करें और एक साथ बढ़ें। नीचे एक समुदाय खोजें या सामग्री खोजें।',
    // Settings nav
    settingsProfile: 'प्रोफ़ाइल',
    settingsAppearance: 'दिखावट',
    settingsNotifications: 'सूचनाएं',
    settingsTranslation: 'अनुवाद',
    settingsOrders: 'ऑर्डर',
    // Settings - Profile
    profileHeading: 'प्रोफ़ाइल',
    profileSubtitle: 'साइट पर अन्य लोग आपको इस तरह देखेंगे।',
    accountHeading: 'खाता',
    accountSubtitle: 'अपनी खाता सुरक्षा और पहचान प्रबंधित करें।',
    username: 'उपयोगकर्ता नाम',
    displayName: 'प्रदर्शन नाम',
    defaultRegion: 'डिफ़ॉल्ट क्षेत्र',
    updateProfile: 'प्रोफ़ाइल अपडेट करें',
    userId: 'उपयोगकर्ता ID',
    emailAddress: 'ईमेल पता',
    emailCannotChange: 'आपका ईमेल पता {email} है। इसे बदला नहीं जा सकता।',
    sendPasswordReset: 'पासवर्ड रीसेट ईमेल भेजें',
    loadingProfile: 'प्रोफ़ाइल लोड हो रही है...',
    // Settings - Appearance
    appearanceHeading: 'दिखावट',
    appearanceSubtitle: 'ऐप की दिखावट अनुकूलित करें। दिन और रात थीम के बीच स्वचालित रूप से स्विच करें।',
    theme: 'थीम',
    selectTheme: 'एप्लिकेशन के लिए थीम चुनें।',
    light: 'हल्का',
    dark: 'गहरा',
    system: 'सिस्टम',
    // Settings - Notifications
    notificationsHeading: 'सूचनाएं',
    notificationsSubtitle: 'कॉन्फ़िगर करें कि आप सूचनाएं कैसे प्राप्त करते हैं।',
    emailNotifications: 'ईमेल सूचनाएं',
    emailNotificationsDesc: 'चुनें कि आप कौन सी ईमेल सूचनाएं प्राप्त करना चाहते हैं।',
    pushNotifications: 'पुश सूचनाएं',
    pushNotificationsDesc: 'चुनें कि आप अपने डिवाइस पर कौन सी पुश सूचनाएं प्राप्त करना चाहते हैं।',
    mentions: 'उल्लेख',
    mentionsDesc: 'जब कोई किसी पोस्ट या टिप्पणी में आपका उल्लेख करे।',
    newMessages: 'नए संदेश',
    newMessagesDesc: 'जब आपको कोई नया सीधा संदेश मिले।',
    productUpdates: 'उत्पाद अपडेट',
    productUpdatesDesc: 'Farmingo से समाचार, अपडेट और मार्केटिंग।',
    everything: 'सब कुछ',
    sameAsEmail: 'ईमेल जैसा ही',
    noPushNotifications: 'कोई पुश सूचना नहीं',
    saveChanges: 'परिवर्तन सहेजें',
  },
  mr: {
    // Sidebar
    dashboard: 'डॅशबोर्ड',
    pricePrediction: 'किंमत अंदाज',
    diseaseDiagnosis: 'रोग निदान',
    weatherPrediction: 'हवामान अंदाज',
    marketplace: 'बाजारपेठ',
    community: 'समुदाय',
    messages: 'संदेश',
    profile: 'प्रोफाइल',
    settings: 'सेटिंग्ज',
    logout: 'लॉग आउट',
    login: 'लॉग इन',
    signup: 'साइन अप',
    aiTools: 'AI साधने',
    platform: 'प्लॅटफॉर्म',
    account: 'खाते',
    // Dashboard
    welcomeFarmer: 'स्वागत आहे, शेतकरी!',
    dashboardSubtitle: 'आधुनिक शेतीसाठी तुमचे सर्वसमावेशक समाधान. आज तुम्हाला काय करायचे आहे?',
    aiPoweredInsights: 'AI-चालित माहिती',
    communityCommerce: 'समुदाय आणि व्यापार',
    getStarted: 'सुरू करा',
    comingSoon: 'लवकरच येत आहे',
    goTo: 'जा',
    noAiToolsFound: 'कोणतेही जुळणारे AI साधन सापडले नाही.',
    noPlatformFeaturesFound: 'कोणतेही जुळणारे वैशिष्ट्य सापडले नाही.',
    cropPricePredictionTitle: 'पीक किंमत अंदाज',
    cropPricePredictionDesc: 'तुमच्या पिकांसाठी AI-चालित किंमत अंदाज मिळवा.',
    cropDiseaseDiagnosisTitle: 'पीक रोग निदान',
    cropDiseaseDiagnosisDesc: 'पीक रोगांचे त्वरित निदान करण्यासाठी फोटो अपलोड करा.',
    weatherPredictionTitle: 'हवामान अंदाज आणि सल्ला',
    weatherPredictionDesc: 'तुमच्या ठिकाणासाठी अंदाज आणि शेती टिप्स मिळवा.',
    marketplaceTitle: 'बाजारपेठ',
    marketplaceDesc: 'कृषी उत्पादने थेट खरेदी आणि विक्री करा.',
    communityHubTitle: 'समुदाय केंद्र',
    communityHubDesc: 'सहकारी शेतकऱ्यांशी जोडा आणि ज्ञान सामायिक करा.',
    // Page subtitles
    pricePredictionSubtitle: 'AI-चालित किंमत अंदाज आणि लिस्टिंग शिफारस मिळवण्यासाठी तुमच्या पिकाचे तपशील प्रविष्ट करा.',
    diseaseDiagnosisSubtitle: 'त्वरित AI-चालित निदान आणि उपचार शिफारसी मिळवण्यासाठी प्रभावित वनस्पतीचा फोटो अपलोड करा.',
    weatherPredictionSubtitle: 'तुमच्या ठिकाणासाठी AI-चालित हवामान अंदाज आणि शेती टिप्स मिळवा.',
    marketplaceSubtitle: 'ताजी उत्पादने आणि शेती पुरवठा थेट खरेदी आणि विक्री करा.',
    communityHubSubtitle: 'सहकारी शेतकऱ्यांशी जोडा, ज्ञान सामायिक करा आणि एकत्र वाढा. खाली समुदाय शोधा किंवा सामग्री शोधा.',
    // Settings nav
    settingsProfile: 'प्रोफाइल',
    settingsAppearance: 'देखावा',
    settingsNotifications: 'सूचना',
    settingsTranslation: 'भाषांतर',
    settingsOrders: 'ऑर्डर',
    // Settings - Profile
    profileHeading: 'प्रोफाइल',
    profileSubtitle: 'साइटवर इतर लोक तुम्हाला असे पाहतील.',
    accountHeading: 'खाते',
    accountSubtitle: 'तुमची खाते सुरक्षा आणि ओळख व्यवस्थापित करा.',
    username: 'वापरकर्तानाव',
    displayName: 'प्रदर्शन नाव',
    defaultRegion: 'डीफॉल्ट प्रदेश',
    updateProfile: 'प्रोफाइल अपडेट करा',
    userId: 'वापरकर्ता ID',
    emailAddress: 'ईमेल पत्ता',
    emailCannotChange: 'तुमचा ईमेल पत्ता {email} आहे. हे बदलता येत नाही.',
    sendPasswordReset: 'पासवर्ड रीसेट ईमेल पाठवा',
    loadingProfile: 'प्रोफाइल लोड होत आहे...',
    // Settings - Appearance
    appearanceHeading: 'देखावा',
    appearanceSubtitle: 'अॅपचा देखावा सानुकूलित करा. दिवस आणि रात्र थीम दरम्यान आपोआप स्विच करा.',
    theme: 'थीम',
    selectTheme: 'अनुप्रयोगासाठी थीम निवडा.',
    light: 'हलकी',
    dark: 'गडद',
    system: 'सिस्टम',
    // Settings - Notifications
    notificationsHeading: 'सूचना',
    notificationsSubtitle: 'तुम्ही सूचना कसे प्राप्त करता ते कॉन्फिगर करा.',
    emailNotifications: 'ईमेल सूचना',
    emailNotificationsDesc: 'तुम्हाला कोणत्या ईमेल सूचना प्राप्त करायच्या आहेत ते निवडा.',
    pushNotifications: 'पुश सूचना',
    pushNotificationsDesc: 'तुमच्या डिव्हाइसवर कोणत्या पुश सूचना प्राप्त करायच्या आहेत ते निवडा.',
    mentions: 'उल्लेख',
    mentionsDesc: 'जेव्हा कोणी पोस्ट किंवा टिप्पणीत तुमचा उल्लेख करते.',
    newMessages: 'नवीन संदेश',
    newMessagesDesc: 'जेव्हा तुम्हाला नवीन थेट संदेश मिळतो.',
    productUpdates: 'उत्पादन अपडेट',
    productUpdatesDesc: 'Farmingo कडून बातम्या, अपडेट आणि मार्केटिंग.',
    everything: 'सर्व काही',
    sameAsEmail: 'ईमेल प्रमाणेच',
    noPushNotifications: 'कोणत्याही पुश सूचना नाहीत',
    saveChanges: 'बदल जतन करा',
  },
};

type LanguageContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale;
    if (saved && saved in translations) setLocaleState(saved);
  }, []);

  const setLocale = (lang: Locale) => {
    setLocaleState(lang);
    localStorage.setItem('locale', lang);
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
