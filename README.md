# 🔥 Firebase Kişisel Not Defteri

Backend yazmadan, tamamen **frontend + Firebase** ile yapılmış küçük bir not
uygulaması. Kullanıcı kayıt olur, giriş yapar ve **yalnızca kendine ait** notları
görüp ekleyip düzenleyip silebilir.

## Ne yapıyor?

- E-posta/şifre ile **kayıt** ve **giriş** (Firebase Authentication)
- **Google ile giriş**
- **Şifremi unuttum** (sıfırlama maili)
- **E-posta doğrulama** maili + doğrulanmadıysa uyarı
- Oturum kontrolü (`onAuthStateChanged`) — sayfa yenilenince oturum korunur
- Not **ekleme / listeleme / düzenleme / silme** (Cloud Firestore)
- Her kullanıcı sadece **kendi** notlarını görür (Firestore Security Rules)

## Teknoloji

HTML + CSS + Vanilla JavaScript · Firebase Web SDK (CDN, `type="module"`) ·
Firebase Authentication · Cloud Firestore

## Dosyalar

| Dosya | Görevi |
|-------|--------|
| `index.html` | Giriş/Kayıt ve Notlar ekranları |
| `style.css` | Tasarım |
| `firebase-config.js` | Firebase başlatma + config |
| `auth.js` | Kayıt, giriş, çıkış, Google, şifre sıfırlama, doğrulama, `onAuthStateChanged` |
| `notes.js` | Firestore: not ekle/listele/sil/güncelle |
| `app.js` | UI olayları, ekran geçişleri, hata mesajları |
| `firestore.rules` | Güvenlik kuralları (Console'a kopyalanır) |

## Kurulum (Firebase Console)

1. [Firebase Console](https://console.firebase.google.com/) → yeni proje oluştur.
2. **Build → Authentication → Get Started** → **Email/Password** ve **Google**
   sağlayıcılarını etkinleştir.
3. **Build → Firestore Database → Create database** → test modunda başlat.
4. **Proje Ayarları (⚙️) → Your apps → Web (`</>`)** → verilen `firebaseConfig`
   objesini kopyala ve `firebase-config.js` içine yapıştır.
5. **Firestore → Rules** sekmesine `firestore.rules` içeriğini yapıştırıp yayınla.

## Çalıştırma

Modül (`type="module"`) script'ler `file://` ile **çalışmaz**, yerel sunucu gerekir:

```bash
npx serve
# veya VS Code "Live Server" eklentisi
```

Sonra tarayıcıda `http://localhost:3000` adresini aç.

## Yayınlama (opsiyonel — Firebase Hosting)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # public klasör: . (mevcut), SPA: hayır
firebase deploy
```

## Ekran Görüntüleri

> Buraya 2-3 ekran görüntüsü ekle: giriş, kayıt, notlar.

```
docs/login.png
docs/register.png
docs/notes.png
```

---

## ❓ Sorular ve Cevaplar

**1. `onAuthStateChanged` neden `currentUser`'ı doğrudan okumaktan daha güvenilir?**
Firebase, sayfa açıldığında oturum bilgisini diskten **asenkron** yükler. O an
`auth.currentUser` henüz `null` olabilir — yani aslında giriş yapmış olsan bile.
`onAuthStateChanged`, bu yükleme bittikten sonra (ve her durum değişiminde) tetiklenir,
böylece gerçek oturum durumunu kaçırmazsın.

**2. `apiKey` gizli bir şifre mi? Frontend'de açıkta olması sorun mu?**
Hayır. Firebase `apiKey` bir parola değildir; sadece isteğin hangi projeye gittiğini
belirler ve zaten tarayıcıya gönderildiği için herkes görebilir. Güvenlik **Security
Rules** ve **Authentication** ile sağlanır. (İstersen Console'dan API key kısıtlaması da
ekleyebilirsin ama gizli tutmak gerekmez.)

**3. Firestore Security Rules olmasaydı güvenlik açığı ne olurdu?**
İstemci config herkese açık olduğundan, kötü niyetli biri SDK veya REST API ile
`notes` koleksiyonunun **tamamını** okuyabilir, değiştirebilir veya silebilirdi.
Koddaki `where("userId","==",uid)` sadece bir **arayüz filtresidir**, güvenlik değil —
gerçek erişim kontrolünü sunucu tarafında Rules yapar.

**4. Email/şifre dışında başka hangi giriş yöntemleri var?**
Google, Facebook, Apple, GitHub, Microsoft, Twitter/X gibi OAuth sağlayıcıları;
telefon (SMS) ile giriş; anonim giriş; e-posta bağlantısı (magic link) ile şifresiz giriş.
