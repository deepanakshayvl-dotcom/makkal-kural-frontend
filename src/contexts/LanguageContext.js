import { createContext, useContext, useState } from 'react';

const LanguageContext = createContext(null);

// Tamil-first translations
const translations = {
  ta: {
    // Header
    home: "முகப்பு",
    dashboard: "நிலைப்பலகை",
    raiseIssue: "பிரச்சனை எழுப்பு",
    myIssues: "எனது பிரச்சனைகள்",
    schemes: "திட்டங்கள்",
    profile: "சுயவிவரம்",
    login: "உள்நுழை",
    logout: "வெளியேறு",
    
    // Landing
    heroTitle: "மக்கள் குரல்",
    heroSubtitle: "தமிழ்நாட்டின் முதல் ஜனநாயக, வெளிப்படையான, மக்கள் ஆளுகை தளம்",
    getStarted: "தொடங்குங்கள்",
    viewIssues: "பிரச்சனைகளைக் காண",
    
    // Auth
    enterMobile: "கைபேசி எண் உள்ளிடவும்",
    sendOTP: "OTP அனுப்பு",
    enterOTP: "OTP உள்ளிடவும்",
    verifyOTP: "சரிபார்",
    
    // Issue Form
    selectDistrict: "மாவட்டம் தேர்வு செய்யவும்",
    selectLocalBody: "உள்ளாட்சி அமைப்பு",
    selectCategory: "பிரிவு தேர்வு",
    selectProblem: "பிரச்சனை தேர்வு",
    describeIssue: "விவரிக்கவும்",
    recordVoice: "குரல் பதிவு",
    uploadMedia: "படம்/வீடியோ பதிவேற்று",
    submitIssue: "சமர்ப்பி",
    
    // Issue Details
    support: "ஆதரவு",
    oppose: "எதிர்ப்பு",
    supporters: "ஆதரவாளர்கள்",
    comments: "கருத்துகள்",
    escalationStatus: "தற்போதைய நிலை",
    
    // Status
    pending: "நிலுவையில்",
    area_concern: "பகுதி கவலை",
    serious_issue: "தீவிர பிரச்சனை",
    resolved: "தீர்க்கப்பட்டது",
    
    // Dashboard
    totalIssues: "மொத்த பிரச்சனைகள்",
    resolvedIssues: "தீர்க்கப்பட்டவை",
    pendingIssues: "நிலுவையில்",
    topIssues: "முக்கிய பிரச்சனைகள்",
    
    // Common
    loading: "ஏற்றுகிறது...",
    error: "பிழை",
    success: "வெற்றி",
    submit: "சமர்ப்பி",
    cancel: "ரத்து",
    next: "அடுத்து",
    back: "பின்",
    search: "தேடு",
    filter: "வடிகட்டு",
    noResults: "முடிவுகள் இல்லை",
    
    // Frequency
    daily: "தினமும்",
    weekly: "வாரம்தோறும்",
    seasonal: "பருவகால",
    emergency: "அவசரம்",
    
    // Affected
    only_me: "நான் மட்டும்",
    "10-50": "10-50 பேர்",
    "50-500": "50-500 பேர்",
    entire_area: "முழு பகுதி",
    
    // Duration
    weeks: "வாரங்கள்",
    months: "மாதங்கள்",
    years: "வருடங்கள்"
  },
  en: {
    // Header
    home: "Home",
    dashboard: "Dashboard",
    raiseIssue: "Raise Issue",
    myIssues: "My Issues",
    schemes: "Schemes",
    profile: "Profile",
    login: "Login",
    logout: "Logout",
    
    // Landing
    heroTitle: "Makkal Kural",
    heroSubtitle: "Tamil Nadu's First Democratic, Transparent, People-Powered Governance Platform",
    getStarted: "Get Started",
    viewIssues: "View Issues",
    
    // Auth
    enterMobile: "Enter Mobile Number",
    sendOTP: "Send OTP",
    enterOTP: "Enter OTP",
    verifyOTP: "Verify",
    
    // Issue Form
    selectDistrict: "Select District",
    selectLocalBody: "Select Local Body",
    selectCategory: "Select Category",
    selectProblem: "Select Problem",
    describeIssue: "Describe the Issue",
    recordVoice: "Record Voice",
    uploadMedia: "Upload Photo/Video",
    submitIssue: "Submit Issue",
    
    // Issue Details
    support: "Support",
    oppose: "Oppose",
    supporters: "Supporters",
    comments: "Comments",
    escalationStatus: "Current Status",
    
    // Status
    pending: "Pending",
    area_concern: "Area Concern",
    serious_issue: "Serious Issue",
    resolved: "Resolved",
    
    // Dashboard
    totalIssues: "Total Issues",
    resolvedIssues: "Resolved",
    pendingIssues: "Pending",
    topIssues: "Top Issues",
    
    // Common
    loading: "Loading...",
    error: "Error",
    success: "Success",
    submit: "Submit",
    cancel: "Cancel",
    next: "Next",
    back: "Back",
    search: "Search",
    filter: "Filter",
    noResults: "No results found",
    
    // Frequency
    daily: "Daily",
    weekly: "Weekly",
    seasonal: "Seasonal",
    emergency: "Emergency",
    
    // Affected
    only_me: "Only me",
    "10-50": "10-50 people",
    "50-500": "50-500 people",
    entire_area: "Entire area",
    
    // Duration
    weeks: "Weeks",
    months: "Months",
    years: "Years"
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('lang') || 'ta');

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const toggleLanguage = () => {
    const newLang = language === 'ta' ? 'en' : 'ta';
    setLanguage(newLang);
    localStorage.setItem('lang', newLang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
