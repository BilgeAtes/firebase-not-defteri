// notes.js
// Notlarla ilgili Firestore işlemleri. Her not "notes" koleksiyonunda saklanır
// ve içinde userId alanı bulunur. Böylece "kimin notu" olduğunu biliriz.

import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const notesRef = collection(db, "notes");

// --- Aşama 3: Not ekle ---
// Not'a userId yazıyoruz; Security Rules bunun giriş yapan kullanıcıyla
// eşleşmesini zorunlu kılar.
export async function addNote(title, content, uid) {
  await addDoc(notesRef, {
    title,
    content,
    userId: uid,
    createdAt: serverTimestamp(),
  });
}

// Sadece bu kullanıcının notlarını CANLI dinle (onSnapshot).
// where(...) ile sadece kendi userId'imize ait notları çekiyoruz.
// Liste her değiştiğinde (ekleme/silme/güncelleme) callback yeniden çağrılır.
// Not: Sıralamayı istemci tarafında yapıyoruz; böylece Firestore'da ayrı bir
// composite index oluşturmaya gerek kalmıyor.
export function watchMyNotes(uid, callback) {
  const q = query(notesRef, where("userId", "==", uid));
  return onSnapshot(q, (snapshot) => {
    const notes = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    // En yeni en üstte (createdAt'e göre azalan). Yeni eklenen notta createdAt
    // bir an null olabilir (server zamanı bekleniyor); onları en üste alıyoruz.
    notes.sort((a, b) => (b.createdAt?.seconds ?? Infinity) - (a.createdAt?.seconds ?? Infinity));
    callback(notes);
  });
}

// --- Aşama 3: Not sil ---
export async function deleteNote(id) {
  await deleteDoc(doc(db, "notes", id));
}

// --- Aşama 4 bonusu: Not güncelle ---
export async function updateNote(id, title, content) {
  await updateDoc(doc(db, "notes", id), { title, content });
}
