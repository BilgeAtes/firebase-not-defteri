// firebase-config.js
// Firebase Web SDK'yı CDN üzerinden modüler (modular) olarak içe aktarıyoruz.
// Not: Bu dosya GitHub'a girebilir. apiKey GİZLİ BİR ŞİFRE DEĞİLDİR — sadece
// hangi Firebase projesine bağlanılacağını söyler. Gerçek güvenlik, Authentication
// + Firestore Security Rules ile sağlanır. (Ödev Soru 2'nin cevabı.)

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Firebase Console → Proje Ayarları (⚙️) → Your apps → Web → "firebaseConfig"
const firebaseConfig = {
  apiKey: "AIzaSyC9ttYeGAwZFRSZbRWnmMIXTTevsEjBjfQ",
  authDomain: "not-defteri-kisisel.firebaseapp.com",
  projectId: "not-defteri-kisisel",
  storageBucket: "not-defteri-kisisel.firebasestorage.app",
  messagingSenderId: "956027523085",
  appId: "1:956027523085:web:f9e2c09175f5a0386a4544",
  measurementId: "G-XK8X5VV16F",
};

// Firebase uygulamasını başlat
const app = initializeApp(firebaseConfig);

// Diğer dosyaların kullanacağı servisleri dışa aktar
export const auth = getAuth(app);
export const db = getFirestore(app);
