// auth.js
// Kimlik doğrulama (Authentication) ile ilgili tüm fonksiyonlar burada.
// UI (ekran) işlerini app.js yapar; bu dosya sadece "Firebase işleri"ni yapar.

import { auth } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// --- Aşama 1: Temel Auth ---

// Yeni kullanıcı kaydı. Başarılı olursa kullanıcı otomatik giriş yapmış olur.
// Ayrıca e-posta doğrulama maili gönderiyoruz (Aşama 4 bonusu).
export async function register(email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(cred.user);
  return cred.user;
}

// E-posta + şifre ile giriş
export async function login(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// Çıkış
export async function logout() {
  await signOut(auth);
}

// --- Aşama 2: Oturum durumunu dinleme (en kritik kavram) ---
// onAuthStateChanged, Firebase oturum bilgisini yüklemeyi bitirince çağrılır.
// Bu yüzden auth.currentUser'ı doğrudan okumaktan daha güvenilirdir:
// sayfa ilk açıldığında currentUser henüz null olabilir. (Ödev Soru 1.)
export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

// --- Aşama 4: Bonuslar ---

// Google ile giriş (açılır pencere)
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  return cred.user;
}

// Şifremi unuttum: sıfırlama maili gönder
export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

// E-posta doğrulama mailini (yeniden) gönder
export async function resendVerification() {
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
  }
}
