"use client"

import { createContext, useState, useContext, useEffect } from "react"

const LanguageContext = createContext()

export const useLanguage = () => useContext(LanguageContext)

// Translation data
const translations = {
  hi: {
    // Common
    loading: "लोड हो रहा है...",
    error: "त्रुटि",
    success: "सफलता",
    cancel: "रद्द करें",
    save: "सेव करें",
    edit: "संपादित करें",
    delete: "हटाएं",
    back: "वापस",
    next: "अगला",
    submit: "जमा करें",
    search: "खोजें",
    filter: "फिल्टर",
    apply: "आवेदन करें",
    view: "देखें",
    close: "बंद करें",
    pay: "भुगतान करें",
    email: "ईमेल",
    help: "सहायता",
    contact: "संपर्क",
    about: "हमारे बारे में",
    support: "सहायता",

    // Navigation
    home: "होम",
    dashboard: "डैशबोर्ड",
    profile: "प्रोफाइल",
    login: "लॉगिन",
    register: "पंजीकरण",
    logout: "लॉगआउट",
    adminLogin: "एडमिन लॉगिन",

    // Job related
    jobs: "नौकरियां",
    postJob: "नौकरी पोस्ट करें",
    findJobs: "नौकरी खोजें",
    jobTitle: "नौकरी का शीर्षक",
    jobDescription: "नौकरी का विवरण",
    location: "स्थान",
    category: "श्रेणी",
    duration: "अवधि",
    payment: "भुगतान",
    skills: "कौशल",
    experience: "अनुभव",
    applications: "आवेदन",
    applicants: "आवेदक",

    // User types
    jobProvider: "नौकरी प्रदाता",
    jobSeeker: "नौकरी खोजने वाला",

    // Status
    open: "खुला",
    closed: "बंद",
    pending: "लंबित",
    approved: "स्वीकृत",
    rejected: "अस्वीकृत",
    completed: "पूर्ण",

    // Notifications
    notifications: "सूचनाएं",
    newJobMatch: "नई नौकरी मैच",
    applicationReceived: "आवेदन प्राप्त",
    applicationApproved: "आवेदन स्वीकृत",
    jobCompleted: "नौकरी पूर्ण",

    // Payment
    paymentRequired: "भुगतान आवश्यक",
    selectPlan: "योजना चुनें",
    viewApplicants: "आवेदक देखें",

    // Language
    selectLanguage: "भाषा चुनें",
    english: "अंग्रेजी",
    hindi: "हिंदी",
    odia: "ओड़िया",

    // Homepage Hero Section
    heroTitle: "काम खोजें, मजदूर हायर करें",
    heroSubtitle: "भारत का विश्वसनीय असंगठित क्षेत्र नौकरी प्लेटफॉर्म",
    heroDescription:
      "निर्माण, घरेलू सेवाएं, डिलीवरी, आतिथ्य और अन्य क्षेत्रों में कुशल श्रमिकों को नियोक्ताओं से जोड़ें। सुरक्षित, सत्यापित और स्थानीय।",
    joinAsWorker: "मजदूर के रूप में जुड़ें",
    hireWorkers: "मजदूर हायर करें",
    activeWorkers: "सक्रिय मजदूर",
    jobsPosted: "पोस्ट किए गए काम",
    cities: "शहर",
    rating: "रेटिंग",

    // Job Categories
    popularJobCategories: "लोकप्रिय नौकरी श्रेणियां",
    findOpportunities: "विभिन्न क्षेत्रों में अवसर खोजें",
    constructionLabor: "निर्माण और श्रम",
    constructionDesc: "राजमिस्त्री, बढ़ई, पेंटर, इलेक्ट्रीशियन, प्लंबर",
    domesticServices: "घरेलू सेवाएं",
    domesticDesc: "घर की सफाई, खाना बनाना, बच्चों की देखभाल, बुजुर्गों की देखभाल",
    deliveryTransport: "डिलीवरी और परिवहन",
    deliveryDesc: "डिलीवरी बॉय, ड्राइवर, लॉजिस्टिक्स सहायक",
    foodHospitality: "खाना और आतिथ्य",
    foodDesc: "रसोइया, वेटर, रसोई सहायक, कैटरिंग स्टाफ",
    jobsAvailable: "+ नौकरियां",

    // Features
    whyChooseWorkersGlobe: "वर्कर्स ग्लोब क्यों चुनें?",
    trustedByThousands: "हजारों श्रमिकों और नियोक्ताओं द्वारा भरोसेमंद",
    verifiedWorkers: "सत्यापित श्रमिक",
    verifiedWorkersDesc: "सभी श्रमिक उचित दस्तावेजीकरण और पृष्ठभूमि जांच के साथ सत्यापित हैं।",
    localJobs: "स्थानीय नौकरियां",
    localJobsDesc: "अपने शहर और आसपास के क्षेत्रों में काम के अवसर खोजें।",
    flexibleTiming: "लचीला समय",
    flexibleTimingDesc: "अपने शेड्यूल के अनुसार काम करें - दैनिक, साप्ताहिक या मासिक नौकरियां।",
    securePayments: "सुरक्षित भुगतान",
    securePaymentsDesc: "हमारे सुरक्षित भुगतान सिस्टम के माध्यम से समय पर भुगतान प्राप्त करें।",

    // How It Works
    howItWorks: "यह कैसे काम करता है",
    simpleSteps: "शुरू करने के लिए सरल चरण",
    step1: "पंजीकरण करें",
    step1Desc: "श्रमिक या नियोक्ता के रूप में अपना खाता बनाएं",
    step2: "नौकरी खोजें/पोस्ट करें",
    step2Desc: "नौकरियां ब्राउज़ करें या अपनी आवश्यकताएं पोस्ट करें",
    step3: "जुड़ें और काम करें",
    step3Desc: "हायर हों और कमाई शुरू करें",

    // Testimonials
    whatUsersSay: "हमारे उपयोगकर्ता क्या कहते हैं",
    realExperiences: "हमारे समुदाय के वास्तविक अनुभव",
    testimonial1: "मुझे यहाँ रोज़ाना काम मिलता है। अब मुझे काम की तलाश में भटकना नहीं पड़ता।",
    testimonial1Name: "राम कुमार",
    testimonial1Role: "निर्माण श्रमिक",
    testimonial2: "घर बैठे काम मिल जाता है और पेमेंट भी समय पर मिलती है। बहुत अच्छा प्लेटफॉर्म है।",
    testimonial2Name: "सुनीता देवी",
    testimonial2Role: "घरेलू सहायक",
    testimonial3: "अब मैं अपने हिसाब से काम कर सकता हूँ। फ्लेक्सिबल टाइमिंग और अच्छी कमाई।",
    testimonial3Name: "अजय सिंह",
    testimonial3Role: "डिलीवरी पार्टनर",

    // CTA Section
    readyToStart: "शुरू करने के लिए तैयार हैं?",
    joinThousands: "हजारों श्रमिकों और नियोक्ताओं में शामिल हों जो वर्कर्स ग्लोब पर भरोसा करते हैं",
    registerNow: "अभी पंजीकरण करें",
    signIn: "साइन इन करें",

    // Contact Section
    needHelp: "सहायता चाहिए?",
    getInTouch: "हमारी सहायता टीम से संपर्क करें",
    callUs: "हमें कॉल करें",
    mondayToSaturday: "सोमवार-शनिवार, सुबह 9 बजे - शाम 6 बजे",
    emailUs: "हमें ईमेल करें",
    responseTime: "हम 24 घंटे के भीतर जवाब देंगे",

    // Registration
    fullName: "पूरा नाम",
    gender: "लिंग",
    age: "उम्र",
    phoneNumber: "फोन नंबर",
    userType: "उपयोगकर्ता प्रकार",
    permanentAddress: "स्थायी पता",
    presentAddress: "वर्तमान पता",
    workingCity: "काम करने वाला शहर",
    pincode: "पिन कोड",
    bio: "बायो",
    yearsOfExperience: "अनुभव के वर्ष",
    selectGender: "लिंग चुनें",
    male: "पुरुष",
    female: "महिला",
    other: "अन्य",
    selectUserType: "उपयोगकर्ता प्रकार चुनें",
    basicInformation: "बुनियादी जानकारी",
    addressInformation: "पता की जानकारी",
    professionalInformation: "व्यावसायिक जानकारी",
    presentAddressSame: "वर्तमान पता स्थायी पते के समान है",
    skillsCommaSeparated: "कौशल (कॉमा से अलग करें)",
    skillsPlaceholder: "जैसे खेती, निर्माण, खाना बनाना",
    bioPlaceholder: "अपने बारे में और अपने अनुभव के बारे में बताएं",
    createAccount: "खाता बनाएं",
    alreadyHaveAccount: "पहले से खाता है?",

    // Experience options
    zeroYears: "0 वर्ष",
    lessThanOneYear: "< 1 वर्ष",
    lessThanTwoYears: "< 2 वर्ष",
    lessThanThreeYears: "< 3 वर्ष",
    lessThanFourYears: "< 4 वर्ष",
    fiveOrMoreYears: "≥ 5 वर्ष",

    // Login
    enterOTP: "OTP दर्ज करें",
    sendOTP: "OTP भेजें",
    verifyOTP: "OTP सत्यापित करें",
    resendOTP: "OTP फिर से भेजें",
    otpSentTo: "OTP भेजा गया",
    otpExpiresIn: "OTP समाप्त होगा",
    seconds: "सेकंड में",
    backToEmail: "ईमेल पर वापस जाएं",
    dontHaveAccount: "खाता नहीं है?",

    // Login page specific
    loginToWorkersGlobe: "Workers Globe में लॉगिन करें",
    enterEmailToReceiveOTP: "OTP प्राप्त करने के लिए अपना ईमेल दर्ज करें",
    emailAddress: "ईमेल पता",
    enterEmailPlaceholder: "अपना ईमेल पता दर्ज करें",
    otpPlaceholder: "000000",
    otpExpired: "OTP समाप्त हो गया है। कृपया नया मांगें।",
    failedToSendOTP: "OTP भेजने में विफल। कृपया पुनः प्रयास करें।",
    failedToResendOTP: "OTP पुनः भेजने में विफल। कृपया पुनः प्रयास करें।",
    networkError: "नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।",
    invalidOTP: "गलत OTP",
    developmentOTPAutoFilled: "विकास: OTP स्वतः भरा गया",
    devAutoFillOTP: "[DEV] OTP स्वतः भरें",

    // Validation messages
    nameRequired: "नाम आवश्यक है",
    emailRequired: "ईमेल आवश्यक है",
    validEmail: "वैध ईमेल दर्ज करें",
    phoneRequired: "फोन नंबर आवश्यक है",
    phoneValid: "फोन नंबर 10 अंकों का होना चाहिए",
    ageRequired: "उम्र आवश्यक है",
    ageMinimum: "उम्र कम से कम 18 वर्ष होनी चाहिए",
    addressRequired: "पता आवश्यक है",
    bioRequired: "बायो आवश्यक है",
    skillsRequired: "कौशल आवश्यक है",
    experienceRequired: "अनुभव आवश्यक है",
  },
  en: {
    // Common
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    back: "Back",
    next: "Next",
    submit: "Submit",
    search: "Search",
    filter: "Filter",
    apply: "Apply",
    view: "View",
    close: "Close",
    pay: "Pay",
    email: "Email",
    help: "Help",
    contact: "Contact",
    about: "About",
    support: "Support",

    // Navigation
    home: "Home",
    dashboard: "Dashboard",
    profile: "Profile",
    login: "Login",
    register: "Register",
    logout: "Logout",
    adminLogin: "Admin Login",

    // Job related
    jobs: "Jobs",
    postJob: "Post Job",
    findJobs: "Find Jobs",
    jobTitle: "Job Title",
    jobDescription: "Job Description",
    location: "Location",
    category: "Category",
    duration: "Duration",
    payment: "Payment",
    skills: "Skills",
    experience: "Experience",
    applications: "Applications",
    applicants: "Applicants",

    // User types
    jobProvider: "Job Provider",
    jobSeeker: "Job Seeker",

    // Status
    open: "Open",
    closed: "Closed",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    completed: "Completed",

    // Notifications
    notifications: "Notifications",
    newJobMatch: "New Job Match",
    applicationReceived: "Application Received",
    applicationApproved: "Application Approved",
    jobCompleted: "Job Completed",

    // Payment
    paymentRequired: "Payment Required",
    selectPlan: "Select Plan",
    viewApplicants: "View Applicants",

    // Language
    selectLanguage: "Select Language",
    english: "English",
    hindi: "Hindi",
    odia: "Odia",

    // Homepage Hero Section
    heroTitle: "Find Work, Hire Workers",
    heroSubtitle: "India's trusted platform for unorganized sector jobs",
    heroDescription:
      "Connect skilled workers with employers across construction, domestic services, delivery, hospitality and more. Safe, verified, and local.",
    joinAsWorker: "Join as Worker",
    hireWorkers: "Hire Workers",
    activeWorkers: "Active Workers",
    jobsPosted: "Jobs Posted",
    cities: "Cities",
    rating: "Rating",

    // Job Categories
    popularJobCategories: "Popular Job Categories",
    findOpportunities: "Find opportunities across various sectors",
    constructionLabor: "Construction & Labor",
    constructionDesc: "Masons, carpenters, painters, electricians, plumbers",
    domesticServices: "Domestic Services",
    domesticDesc: "House cleaning, cooking, childcare, elderly care",
    deliveryTransport: "Delivery & Transport",
    deliveryDesc: "Delivery boys, drivers, logistics helpers",
    foodHospitality: "Food & Hospitality",
    foodDesc: "Cooks, waiters, kitchen helpers, catering staff",
    jobsAvailable: "+ jobs",

    // Features
    whyChooseWorkersGlobe: "Why Choose Workers Globe?",
    trustedByThousands: "Trusted by thousands of workers and employers",
    verifiedWorkers: "Verified Workers",
    verifiedWorkersDesc: "All workers are verified with proper documentation and background checks.",
    localJobs: "Local Jobs",
    localJobsDesc: "Find work opportunities in your city and nearby areas.",
    flexibleTiming: "Flexible Timing",
    flexibleTimingDesc: "Work according to your schedule - daily, weekly, or monthly jobs.",
    securePayments: "Secure Payments",
    securePaymentsDesc: "Get paid on time through our secure payment system.",

    // How It Works
    howItWorks: "How It Works",
    simpleSteps: "Simple steps to get started",
    step1: "Register",
    step1Desc: "Create your account as a worker or employer",
    step2: "Find/Post Jobs",
    step2Desc: "Browse jobs or post your requirements",
    step3: "Connect & Work",
    step3Desc: "Get hired and start earning",

    // Testimonials
    whatUsersSay: "What Our Users Say",
    realExperiences: "Real experiences from our community",
    testimonial1: "Found good workers for my farm through this platform. Very easy and reliable.",
    testimonial1Name: "Ram Kumar",
    testimonial1Role: "Construction Worker",
    testimonial2: "Got good work near home. No need to go far anymore.",
    testimonial2Name: "Sunita Devi",
    testimonial2Role: "Domestic Helper",
    testimonial3: "Skilled workers are easily available. The rating system is very good.",
    testimonial3Name: "Ajay Singh",
    testimonial3Role: "Delivery Partner",

    // CTA Section
    readyToStart: "Ready to Get Started?",
    joinThousands: "Join thousands of workers and employers who trust Workers Globe",
    registerNow: "Register Now",
    signIn: "Sign In",

    // Contact Section
    needHelp: "Need Help?",
    getInTouch: "Get in touch with our support team",
    callUs: "Call Us",
    mondayToSaturday: "Mon-Sat, 9 AM - 6 PM",
    emailUs: "Email Us",
    responseTime: "We'll respond within 24 hours",

    // Registration
    fullName: "Full Name",
    gender: "Gender",
    age: "Age",
    phoneNumber: "Phone Number",
    userType: "User Type",
    permanentAddress: "Permanent Address",
    presentAddress: "Present Address",
    workingCity: "Working City",
    pincode: "Pincode",
    bio: "Bio",
    yearsOfExperience: "Years of Experience",
    selectGender: "Select Gender",
    male: "Male",
    female: "Female",
    other: "Other",
    selectUserType: "Select User Type",
    basicInformation: "Basic Information",
    addressInformation: "Address Information",
    professionalInformation: "Professional Information",
    presentAddressSame: "Present address same as permanent address",
    skillsCommaSeparated: "Skills (comma separated)",
    skillsPlaceholder: "e.g. farming, construction, cooking",
    bioPlaceholder: "Tell us about yourself and your experience",
    createAccount: "Create Account",
    alreadyHaveAccount: "Already have an account?",

    // Experience options
    zeroYears: "0 years",
    lessThanOneYear: "< 1 year",
    lessThanTwoYears: "< 2 years",
    lessThanThreeYears: "< 3 years",
    lessThanFourYears: "< 4 years",
    fiveOrMoreYears: "≥ 5 years",

    // Login
    enterOTP: "Enter OTP",
    sendOTP: "Send OTP",
    verifyOTP: "Verify OTP",
    resendOTP: "Resend OTP",
    otpSentTo: "OTP sent to",
    otpExpiresIn: "OTP expires in",
    seconds: "seconds",
    backToEmail: "Back to Email",
    dontHaveAccount: "Don't have an account?",

    // Login page specific
    loginToWorkersGlobe: "Login to Workers Globe",
    enterEmailToReceiveOTP: "Enter your email to receive OTP",
    emailAddress: "Email Address",
    enterEmailPlaceholder: "Enter your email address",
    otpPlaceholder: "000000",
    otpExpired: "OTP expired. Please request a new one.",
    failedToSendOTP: "Failed to send OTP. Please try again.",
    failedToResendOTP: "Failed to resend OTP. Please try again.",
    networkError: "Network error. Please try again.",
    invalidOTP: "Invalid OTP",
    developmentOTPAutoFilled: "Development: OTP auto-filled",
    devAutoFillOTP: "[DEV] Auto-fill OTP",

    // Validation messages
    nameRequired: "Name is required",
    emailRequired: "Email is required",
    validEmail: "Please enter a valid email",
    phoneRequired: "Phone number is required",
    phoneValid: "Phone number must be 10 digits",
    ageRequired: "Age is required",
    ageMinimum: "Age must be at least 18 years",
    addressRequired: "Address is required",
    bioRequired: "Bio is required",
    skillsRequired: "Skills are required",
    experienceRequired: "Experience is required",
  },
  od: {
    // Common
    loading: "ଲୋଡ୍ ହେଉଛି...",
    error: "ତ୍ରୁଟି",
    success: "ସଫଳତା",
    cancel: "ବାତିଲ୍ କରନ୍ତୁ",
    save: "ସେଭ୍ କରନ୍ତୁ",
    edit: "ସମ୍ପାଦନା କରନ୍ତୁ",
    delete: "ଡିଲିଟ୍ କରନ୍ତୁ",
    back: "ପଛକୁ",
    next: "ପରବର୍ତ୍ତୀ",
    submit: "ଦାଖଲ କରନ୍ତୁ",
    search: "ଖୋଜନ୍ତୁ",
    filter: "ଫିଲ୍ଟର",
    apply: "ଆବେଦନ କରନ୍ତୁ",
    view: "ଦେଖନ୍ତୁ",
    close: "ବନ୍ଦ କରନ୍ତୁ",
    pay: "ପେମେଣ୍ଟ କରନ୍ତୁ",
    email: "ଇମେଲ",
    help: "ସାହାଯ୍ୟ",
    contact: "ଯୋଗାଯୋଗ",
    about: "ଆମ ବିଷୟରେ",
    support: "ସାହାଯ୍ୟ",

    // Navigation
    home: "ହୋମ୍",
    dashboard: "ଡ୍ୟାସବୋର୍ଡ",
    profile: "ପ୍ରୋଫାଇଲ୍",
    login: "ଲଗଇନ୍",
    register: "ପଞ୍ଜୀକରଣ",
    logout: "ଲଗଆଉଟ୍",
    adminLogin: "ଆଡମିନ ଲଗଇନ",

    // Job related
    jobs: "ଚାକିରି",
    postJob: "ଚାକିରି ପୋଷ୍ଟ କରନ୍ତୁ",
    findJobs: "ଚାକିରି ଖୋଜନ୍ତୁ",
    jobTitle: "ଚାକିରି ଶୀର୍ଷକ",
    jobDescription: "ଚାକିରି ବିବରଣୀ",
    location: "ସ୍ଥାନ",
    category: "ବର୍ଗ",
    duration: "ଅବଧି",
    payment: "ପେମେଣ୍ଟ",
    skills: "କୌଶଳ",
    experience: "ଅଭିଜ୍ଞତା",
    applications: "ଆବେଦନ",
    applicants: "ଆବେଦନକାରୀ",

    // User types
    jobProvider: "ଚାକିରି ପ୍ରଦାନକାରୀ",
    jobSeeker: "ଚାକିରି ଖୋଜୁଥିବା ବ୍ୟକ୍ତି",

    // Status
    open: "ଖୋଲା",
    closed: "ବନ୍ଦ",
    pending: "ବିଚାରାଧୀନ",
    approved: "ଅନୁମୋଦିତ",
    rejected: "ପ୍ରତ୍ୟାଖ୍ୟାନ",
    completed: "ସମ୍ପୂର୍ଣ୍ଣ",

    // Notifications
    notifications: "ବିଜ୍ଞପ୍ତି",
    newJobMatch: "ନୂତନ ଚାକିରି ମ୍ୟାଚ୍",
    applicationReceived: "ଆବେଦନ ପ୍ରାପ୍ତ",
    applicationApproved: "ଆବେଦନ ଅନୁମୋଦିତ",
    jobCompleted: "ଚାକିରି ସମ୍ପୂର୍ଣ୍ଣ",

    // Payment
    paymentRequired: "ପେମେଣ୍ଟ ଆବଶ୍ୟକ",
    selectPlan: "ଯୋଜନା ବାଛନ୍ତୁ",
    viewApplicants: "ଆବେଦନକାରୀ ଦେଖନ୍ତୁ",

    // Language
    selectLanguage: "ଭାଷା ବାଛନ୍ତୁ",
    english: "ଇଂରାଜୀ",
    hindi: "ହିନ୍ଦୀ",
    odia: "ଓଡ଼ିଆ",

    // Homepage Hero Section
    heroTitle: "କାମ ଖୋଜନ୍ତୁ, ଶ୍ରମିକ ନିଯୁକ୍ତି କରନ୍ତୁ",
    heroSubtitle: "ଭାରତର ବିଶ୍ୱସ୍ତ ଅସଂଗଠିତ କ୍ଷେତ୍ର ଚାକିରି ପ୍ଲାଟଫର୍ମ",
    heroDescription:
      "ନିର୍ମାଣ, ଘରୋଇ ସେବା, ଡେଲିଭରି, ଆତିଥ୍ୟ ଏବଂ ଅନ୍ୟାନ୍ୟ କ୍ଷେତ୍ରରେ କୁଶଳ ଶ୍ରମିକମାନଙ୍କୁ ନିଯୁକ୍ତିକର୍ତ୍ତାଙ୍କ ସହିତ ଯୋଡ଼ନ୍ତୁ। ସୁରକ୍ଷିତ, ସତ୍ୟାପିତ ଏବଂ ସ୍ଥାନୀୟ।",
    joinAsWorker: "ଶ୍ରମିକ ଭାବରେ ଯୋଗ ଦିଅନ୍ତୁ",
    hireWorkers: "ଶ୍ରମିକ ନିଯୁକ୍ତି କରନ୍ତୁ",
    activeWorkers: "ସକ୍ରିୟ ଶ୍ରମିକ",
    jobsPosted: "ପୋଷ୍ଟ ହୋଇଥିବା କାମ",
    cities: "ସହର",
    rating: "ରେଟିଂ",

    // Job Categories
    popularJobCategories: "ଲୋକପ୍ରିୟ ଚାକିରି ବର୍ଗ",
    findOpportunities: "ବିଭିନ୍ନ କ୍ଷେତ୍ରରେ ସୁଯୋଗ ଖୋଜନ୍ତୁ",
    constructionLabor: "ନିର୍ମାଣ ଏବଂ ଶ୍ରମ",
    constructionDesc: "ରାଜମିସ୍ତ୍ରୀ, ବଢ଼େଇ, ପେଣ୍ଟର, ଇଲେକ୍ଟ୍ରିସିଆନ, ପ୍ଲମ୍ବର",
    domesticServices: "ଘରୋଇ ସେବା",
    domesticDesc: "ଘର ସଫା କରିବା, ରାନ୍ଧିବା, ଶିଶୁ ଯତ୍ନ, ବୃଦ୍ଧ ଯତ୍ନ",
    deliveryTransport: "ଡେଲିଭରି ଏବଂ ପରିବହନ",
    deliveryDesc: "ଡେଲିଭରି ବାଳକ, ଡ୍ରାଇଭର, ଲଜିଷ୍ଟିକ୍ସ ସହାୟକ",
    foodHospitality: "ଖାଦ୍ୟ ଏବଂ ଆତିଥ୍ୟ",
    foodDesc: "ରାନ୍ଧୁଣୀ, ୱେଟର, ରୋଷେଇ ସହାୟକ, କ୍ୟାଟରିଂ କର୍ମଚାରୀ",
    jobsAvailable: "+ ଚାକିରି",

    // Features
    whyChooseWorkersGlobe: "ୱର୍କର୍ସ ଗ୍ଲୋବ କାହିଁକି ବାଛିବେ?",
    trustedByThousands: "ହଜାରେ ଶ୍ରମିକ ଏବଂ ନିଯୁକ୍ତିକର୍ତ୍ତାଙ୍କ ଦ୍ୱାରା ବିଶ୍ୱସ୍ତ",
    verifiedWorkers: "ସତ୍ୟାପିତ ଶ୍ରମିକ",
    verifiedWorkersDesc: "ସମସ୍ତ ଶ୍ରମିକ ଉପଯୁକ୍ତ ଦଲିଲପତ୍ର ଏବଂ ପୃଷ୍ଠଭୂମି ଯାଞ୍ଚ ସହିତ ସତ୍ୟାପିତ।",
    localJobs: "ସ୍ଥାନୀୟ ଚାକିରି",
    localJobsDesc: "ଆପଣଙ୍କ ସହର ଏବଂ ଆଖପାଖ ଅଞ୍ଚଳରେ କାମର ସୁଯୋଗ ଖୋଜନ୍ତୁ।",
    flexibleTiming: "ନମନୀୟ ସମୟ",
    flexibleTimingDesc: "ଆପଣଙ୍କ ସୂଚୀ ଅନୁଯାୟୀ କାମ କରନ୍ତୁ - ଦୈନିକ, ସାପ୍ତାହିକ କିମ୍ବା ମାସିକ ଚାକିରି।",
    securePayments: "ସୁରକ୍ଷିତ ପେମେଣ୍ଟ",
    securePaymentsDesc: "ଆମର ସୁରକ୍ଷିତ ପେମେଣ୍ଟ ସିଷ୍ଟମ ମାଧ୍ୟମରେ ସମୟରେ ପେମେଣ୍ଟ ପାଆନ୍ତୁ।",

    // How It Works
    howItWorks: "ଏହା କିପରି କାମ କରେ",
    simpleSteps: "ଆରମ୍ଭ କରିବା ପାଇଁ ସରଳ ପଦକ୍ଷେପ",
    step1: "ପଞ୍ଜୀକରଣ କରନ୍ତୁ",
    step1Desc: "ଶ୍ରମିକ କିମ୍ବା ନିଯୁକ୍ତିକର୍ତ୍ତା ଭାବରେ ଆପଣଙ୍କ ଖାତା ସୃଷ୍ଟି କରନ୍ତୁ",
    step2: "ଚାକିରି ଖୋଜନ୍ତୁ/ପୋଷ୍ଟ କରନ୍ତୁ",
    step2Desc: "ଚାକିରି ବ୍ରାଉଜ୍ କରନ୍ତୁ କିମ୍ବା ଆପଣଙ୍କ ଆବଶ୍ୟକତା ପୋଷ୍ଟ କରନ୍ତୁ",
    step3: "ଯୋଡ଼ନ୍ତୁ ଏବଂ କାମ କରନ୍ତୁ",
    step3Desc: "ନିଯୁକ୍ତି ପାଆନ୍ତୁ ଏବଂ ରୋଜଗାର ଆରମ୍ଭ କରନ୍ତୁ",

    // Testimonials
    whatUsersSay: "ଆମର ଉପଯୋଗକର୍ତ୍ତାମାନେ କଣ କୁହନ୍ତି",
    realExperiences: "ଆମର ସମ୍ପ୍ରଦାୟର ପ୍ରକୃତ ଅଭିଜ୍ଞତା",
    testimonial1: "ଏହି ପ୍ଲାଟଫର୍ମ ମାଧ୍ୟମରେ ମୋ ଖେତ ପାଇଁ ଭଲ ଶ୍ରମିକ ପାଇଲି। ବହୁତ ସହଜ ଏବଂ ବିଶ୍ୱସ୍ତ।",
    testimonial1Name: "ରାମ କୁମାର",
    testimonial1Role: "ନିର୍ମାଣ ଶ୍ରମିକ",
    testimonial2: "ଘର ପାଖରେ ଭଲ କାମ ପାଇଲି। ଆଉ ଦୂରକୁ ଯିବାର ଦରକାର ନାହିଁ।",
    testimonial2Name: "ସୁନୀତା ଦେବୀ",
    testimonial2Role: "ଘରୋଇ ସହାୟକ",
    testimonial3: "କୁଶଳ ଶ୍ରମିକ ସହଜରେ ମିଳନ୍ତି। ରେଟିଂ ସିଷ୍ଟମ ବହୁତ ଭଲ।",
    testimonial3Name: "ଅଜୟ ସିଂ",
    testimonial3Role: "ଡେଲିଭରି ପାର୍ଟନର",

    // CTA Section
    readyToStart: "ଆରମ୍ଭ କରିବାକୁ ପ୍ରସ୍ତୁତ?",
    joinThousands: "ହଜାରେ ଶ୍ରମିକ ଏବଂ ନିଯୁକ୍ତିକର୍ତ୍ତାଙ୍କ ସହିତ ଯୋଗ ଦିଅନ୍ତୁ ଯେଉଁମାନେ ୱର୍କର୍ସ ଗ୍ଲୋବ ଉପରେ ବିଶ୍ୱାସ କରନ୍ତି",
    registerNow: "ବର୍ତ୍ତମାନ ପଞ୍ଜୀକରଣ କରନ୍ତୁ",
    signIn: "ସାଇନ ଇନ",

    // Contact Section
    needHelp: "ସାହାଯ୍ୟ ଦରକାର?",
    getInTouch: "ଆମର ସହାୟତା ଦଳ ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ",
    callUs: "ଆମକୁ କଲ କରନ୍ତୁ",
    mondayToSaturday: "ସୋମବାର-ଶନିବାର, ସକାଳ 9ଟା - ସନ୍ଧ୍ୟା 6ଟା",
    emailUs: "ଆମକୁ ଇମେଲ କରନ୍ତୁ",
    responseTime: "ଆମେ 24 ଘଣ୍ଟା ମଧ୍ୟରେ ଉତ୍ତର ଦେବୁ",

    // Registration
    fullName: "ପୂର୍ଣ୍ଣ ନାମ",
    gender: "ଲିଙ୍ଗ",
    age: "ବୟସ",
    phoneNumber: "ଫୋନ ନମ୍ବର",
    userType: "ଉପଯୋଗକର୍ତ୍ତା ପ୍ରକାର",
    permanentAddress: "ସ୍ଥାୟୀ ଠିକଣା",
    presentAddress: "ବର୍ତ୍ତମାନ ଠିକଣା",
    workingCity: "କାମ କରୁଥିବା ସହର",
    pincode: "ପିନ କୋଡ",
    bio: "ବାୟୋ",
    yearsOfExperience: "ଅଭିଜ୍ଞତାର ବର୍ଷ",
    selectGender: "ଲିଙ୍ଗ ବାଛନ୍ତୁ",
    male: "ପୁରୁଷ",
    female: "ମହିଳା",
    other: "ଅନ୍ୟ",
    selectUserType: "ଉପଯୋଗକର୍ତ୍ତା ପ୍ରକାର ବାଛନ୍ତୁ",
    basicInformation: "ମୌଳିକ ସୂଚନା",
    addressInformation: "ଠିକଣା ସୂଚନା",
    professionalInformation: "ବୃତ୍ତିଗତ ସୂଚନା",
    presentAddressSame: "ବର୍ତ୍ତମାନ ଠିକଣା ସ୍ଥାୟୀ ଠିକଣା ସହିତ ସମାନ",
    skillsCommaSeparated: "କୌଶଳ (କମା ଦ୍ୱାରା ପୃଥକ)",
    skillsPlaceholder: "ଯେମିତି କୃଷି, ନିର୍ମାଣ, ରାନ୍ଧିବା",
    bioPlaceholder: "ଆପଣଙ୍କ ବିଷୟରେ ଏବଂ ଆପଣଙ୍କ ଅଭିଜ୍ଞତା ବିଷୟରେ କୁହନ୍ତୁ",
    createAccount: "ଖାତା ସୃଷ୍ଟି କରନ୍ତୁ",
    alreadyHaveAccount: "ପୂର୍ବରୁ ଖାତା ଅଛି?",

    // Experience options
    zeroYears: "0 ବର୍ଷ",
    lessThanOneYear: "< 1 ବର୍ଷ",
    lessThanTwoYears: "< 2 ବର୍ଷ",
    lessThanThreeYears: "< 3 ବର୍ଷ",
    lessThanFourYears: "< 4 ବର୍ଷ",
    fiveOrMoreYears: "≥ 5 ବର୍ଷ",

    // Login
    enterOTP: "OTP ପ୍ରବେଶ କରନ୍ତୁ",
    sendOTP: "OTP ପଠାନ୍ତୁ",
    verifyOTP: "OTP ସତ୍ୟାପନ କରନ୍ତୁ",
    resendOTP: "OTP ପୁନଃ ପଠାନ୍ତୁ",
    otpSentTo: "OTP ପଠାଯାଇଛି",
    otpExpiresIn: "OTP ସମାପ୍ତ ହେବ",
    seconds: "ସେକେଣ୍ଡରେ",
    backToEmail: "ଇମେଲକୁ ଫେରନ୍ତୁ",
    dontHaveAccount: "ଖାତା ନାହିଁ?",

    // Login page specific
    loginToWorkersGlobe: "ୱର୍କର୍ସ ଗ୍ଲୋବରେ ଲଗଇନ କରନ୍ତୁ",
    enterEmailToReceiveOTP: "OTP ପାଇବା ପାଇଁ ଆପଣଙ୍କ ଇମେଲ ପ୍ରବେଶ କରନ୍ତୁ",
    emailAddress: "ଇମେଲ ଠିକଣା",
    enterEmailPlaceholder: "ଆପଣଙ୍କ ଇମେଲ ଠିକଣା ପ୍ରବେଶ କରନ୍ତୁ",
    otpPlaceholder: "000000",
    otpExpired: "OTP ସମାପ୍ତ ହୋଇଛି। ଦୟାକରି ନୂତନ ମାଗନ୍ତୁ।",
    failedToSendOTP: "OTP ପଠାଇବାରେ ବିଫଳ। ଦୟାକରି ପୁନଃ ଚେଷ୍ଟା କରନ୍ତୁ।",
    failedToResendOTP: "OTP ପୁନଃ ପଠାଇବାରେ ବିଫଳ। ଦୟାକରି ପୁନଃ ଚେଷ୍ଟା କରନ୍ତୁ।",
    networkError: "ନେଟୱାର୍କ ତ୍ରୁଟି। ଦୟାକରି ପୁନଃ ଚେଷ୍ଟା କରନ୍ତୁ।",
    invalidOTP: "ଭୁଲ OTP",
    developmentOTPAutoFilled: "ବିକାଶ: OTP ସ୍ୱୟଂଚାଳିତ ଭାବରେ ଭରାଯାଇଛି",
    devAutoFillOTP: "[DEV] OTP ସ୍ୱୟଂଚାଳିତ ଭରଣ",

    // Validation messages
    nameRequired: "ନାମ ଆବଶ୍ୟକ",
    emailRequired: "ଇମେଲ ଆବଶ୍ୟକ",
    validEmail: "ବୈଧ ଇମେଲ ପ୍ରବେଶ କରନ୍ତୁ",
    phoneRequired: "ଫୋନ ନମ୍ବର ଆବଶ୍ୟକ",
    phoneValid: "ଫୋନ ନମ୍ବର 10 ଅଙ୍କର ହେବା ଆବଶ୍ୟକ",
    ageRequired: "ବୟସ ଆବଶ୍ୟକ",
    ageMinimum: "ବୟସ ଅତି କମରେ 18 ବର୍ଷ ହେବା ଆବଶ୍ୟକ",
    addressRequired: "ଠିକଣା ଆବଶ୍ୟକ",
    bioRequired: "ବାୟୋ ଆବଶ୍ୟକ",
    skillsRequired: "କୌଶଳ ଆବଶ୍ୟକ",
    experienceRequired: "ଅଭିଜ୍ଞতা ଆବଶ୍ୟକ",
  },
}

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState("hi") // Default to Hindi

  useEffect(() => {
    const savedLanguage = localStorage.getItem("selectedLanguage")
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLanguage(savedLanguage)
    }
  }, [])

  const changeLanguage = (language) => {
    setCurrentLanguage(language)
    localStorage.setItem("selectedLanguage", language)
  }

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.hi[key] || key
  }

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    availableLanguages: [
      { code: "hi", name: "हिंदी" },
      { code: "en", name: "English" },
      { code: "od", name: "ଓଡ଼ିଆ" },
    ],
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
