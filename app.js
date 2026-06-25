// app.js
// UI (ekran) mantığı: form olayları, ekran geçişleri, hata gösterimi.
// "Firebase işleri" auth.js ve notes.js içinde; burada onları çağırıyoruz.

import {
  register,
  login,
  logout,
  watchAuth,
  loginWithGoogle,
  resetPassword,
  resendVerification,
} from "./auth.js";
import { addNote, watchMyNotes, deleteNote, updateNote } from "./notes.js";

// --- Elementleri seç ---
const $ = (id) => document.getElementById(id);

const loadingScreen = $("loading");
const authScreen = $("auth-screen");
const notesScreen = $("notes-screen");

const tabLogin = $("tab-login");
const tabRegister = $("tab-register");
const loginForm = $("login-form");
const registerForm = $("register-form");
const authMessage = $("auth-message");
const googleBtn = $("google-btn");
const forgotBtn = $("forgot-btn");

const userEmail = $("user-email");
const logoutBtn = $("logout-btn");
const verifyBanner = $("verify-banner");
const resendVerifyBtn = $("resend-verify");

const noteForm = $("note-form");
const noteTitle = $("note-title");
const noteContent = $("note-content");
const noteSubmit = $("note-submit");
const noteCancel = $("note-cancel");
const notesList = $("notes-list");
const emptyState = $("empty-state");

// Düzenleme modunda olunan notun id'si (yoksa null)
let editingId = null;
// Notları dinlemeyi durdurmak için kullanılacak fonksiyon (unsubscribe)
let unsubscribeNotes = null;
// Giriş yapan kullanıcının uid'i (not eklerken kullanılır)
let currentUid = null;

// --- Yardımcı: hata kodlarını Türkçe mesaja çevir ---
function turkishError(code) {
  const map = {
    "auth/invalid-email": "Geçersiz e-posta adresi.",
    "auth/missing-password": "Şifre girmelisin.",
    "auth/weak-password": "Şifre çok kısa (en az 6 karakter).",
    "auth/email-already-in-use": "Bu e-posta zaten kayıtlı.",
    "auth/invalid-credential": "E-posta veya şifre hatalı.",
    "auth/user-not-found": "Böyle bir kullanıcı yok.",
    "auth/wrong-password": "Şifre hatalı.",
    "auth/too-many-requests": "Çok fazla deneme. Biraz sonra tekrar dene.",
    "auth/popup-closed-by-user": "Google penceresi kapatıldı.",
  };
  return map[code] || "Bir hata oluştu: " + code;
}

function showMessage(text, type = "error") {
  authMessage.textContent = text;
  authMessage.className = "message " + type;
}

function clearMessage() {
  authMessage.textContent = "";
  authMessage.className = "message";
}

// --- Sekme geçişleri (Giriş / Kayıt) ---
tabLogin.addEventListener("click", () => {
  tabLogin.classList.add("active");
  tabRegister.classList.remove("active");
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
  clearMessage();
});

tabRegister.addEventListener("click", () => {
  tabRegister.classList.add("active");
  tabLogin.classList.remove("active");
  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
  clearMessage();
});

// --- Aşama 1: Kayıt / Giriş / Google / Şifre sıfırlama ---
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMessage();
  try {
    await register($("register-email").value, $("register-password").value);
    // onAuthStateChanged ekran geçişini otomatik yapacak.
  } catch (err) {
    showMessage(turkishError(err.code));
  }
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMessage();
  try {
    await login($("login-email").value, $("login-password").value);
  } catch (err) {
    showMessage(turkishError(err.code));
  }
});

googleBtn.addEventListener("click", async () => {
  clearMessage();
  try {
    await loginWithGoogle();
  } catch (err) {
    showMessage(turkishError(err.code));
  }
});

forgotBtn.addEventListener("click", async () => {
  const email = $("login-email").value;
  if (!email) {
    showMessage("Önce e-posta alanını doldur.");
    return;
  }
  try {
    await resetPassword(email);
    showMessage("Şifre sıfırlama maili gönderildi 📧", "ok");
  } catch (err) {
    showMessage(turkishError(err.code));
  }
});

// --- Çıkış + e-posta doğrulama mailini yeniden gönder ---
logoutBtn.addEventListener("click", () => logout());

resendVerifyBtn.addEventListener("click", async () => {
  try {
    await resendVerification();
    alert("Doğrulama maili gönderildi. Gelen kutunu kontrol et.");
  } catch (err) {
    alert("Mail gönderilemedi: " + err.code);
  }
});

// --- Aşama 2: Oturum durumunu dinle ve ekranı buna göre değiştir ---
watchAuth((user) => {
  loadingScreen.classList.add("hidden");

  if (user) {
    // Giriş yapılmış → Notlar ekranı
    currentUid = user.uid;
    authScreen.classList.add("hidden");
    notesScreen.classList.remove("hidden");
    userEmail.textContent = user.email;

    // E-posta doğrulanmamışsa uyarı bandını göster
    verifyBanner.classList.toggle("hidden", user.emailVerified);

    // Bu kullanıcının notlarını canlı dinlemeye başla
    if (unsubscribeNotes) unsubscribeNotes();
    unsubscribeNotes = watchMyNotes(user.uid, renderNotes);
  } else {
    // Giriş yapılmamış → Auth ekranı
    currentUid = null;
    notesScreen.classList.add("hidden");
    authScreen.classList.remove("hidden");

    // Not dinlemeyi durdur ve formları temizle
    if (unsubscribeNotes) {
      unsubscribeNotes();
      unsubscribeNotes = null;
    }
    resetNoteForm();
    loginForm.reset();
    registerForm.reset();
  }
});

// --- Aşama 3 + 4: Not ekleme / güncelleme (aynı form) ---
noteForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = noteTitle.value.trim();
  const content = noteContent.value.trim();
  if (!title || !content) return;

  try {
    if (editingId) {
      // Düzenleme modu → güncelle
      await updateNote(editingId, title, content);
    } else {
      // Yeni not → ekle (oturum dinleyicisinde sakladığımız uid ile)
      await addNote(title, content, currentUid);
    }
    resetNoteForm();
  } catch (err) {
    alert("İşlem başarısız: " + (err.code || err.message));
  }
});

noteCancel.addEventListener("click", resetNoteForm);

function resetNoteForm() {
  editingId = null;
  noteForm.reset();
  noteSubmit.textContent = "Ekle";
  noteCancel.classList.add("hidden");
}

// Notları ekrana çiz
function renderNotes(notes) {
  notesList.innerHTML = "";
  emptyState.classList.toggle("hidden", notes.length > 0);

  notes.forEach((note) => {
    const div = document.createElement("div");
    div.className = "note";
    div.innerHTML = `
      <h3></h3>
      <p></p>
      <div class="note-actions">
        <button class="edit">Düzenle</button>
        <button class="delete">Sil</button>
      </div>
    `;
    // textContent kullanıyoruz ki HTML enjeksiyonu olmasın
    div.querySelector("h3").textContent = note.title;
    div.querySelector("p").textContent = note.content;

    div.querySelector(".delete").addEventListener("click", async () => {
      if (confirm("Bu not silinsin mi?")) {
        await deleteNote(note.id);
      }
    });

    div.querySelector(".edit").addEventListener("click", () => {
      editingId = note.id;
      noteTitle.value = note.title;
      noteContent.value = note.content;
      noteSubmit.textContent = "Kaydet";
      noteCancel.classList.remove("hidden");
      noteTitle.focus();
    });

    notesList.appendChild(div);
  });
}
