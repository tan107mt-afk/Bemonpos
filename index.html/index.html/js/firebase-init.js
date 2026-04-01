/* ═══════════════════════════════════════════════════
   ZENTEA – Firebase Configuration & Initialization
   Khởi tạo Firebase, fbAuth, fbDb
═══════════════════════════════════════════════════ */

// ── CẤU HÌNH FIREBASE ─────────────────────────────────────
// Vào https://console.firebase.google.com → tạo project → thêm web app → copy config vào đây
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyDKbXU5VR4o8nCz5rQlOXqnYWSyhHD5p1I",
  authDomain:        "zentea-qlch.firebaseapp.com",
  databaseURL:       "https://zentea-qlch-default-rtdb.firebaseio.com",
  projectId:         "zentea-qlch",
  storageBucket:     "zentea-qlch.firebasestorage.app",
  messagingSenderId: "1085565734491",
  appId:             "1:1085565734491:web:904b1ec407284c9a39b97e"
};
const FB_CONFIGURED = true; // Real Firebase config

// NAV_SECTIONS defined in config.js
// SUPERADMIN_EMAIL defined in config.js
let fbApp = null, fbAuth = null, fbDb = null;
if (FB_CONFIGURED) {
  try {
    fbApp  = firebase.initializeApp(FIREBASE_CONFIG);
    fbAuth = firebase.auth();
    fbDb   = firebase.database();
    // Expose globally so main script can access
    window.fbApp  = fbApp;
    window.fbAuth = fbAuth;
    window.fbDb   = fbDb;
  } catch(e) { console.warn('Firebase init error:', e); }
}
window.FB_CONFIGURED = FB_CONFIGURED;