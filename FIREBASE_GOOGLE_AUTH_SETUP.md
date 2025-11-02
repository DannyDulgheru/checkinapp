# Configurare Autentificare Google în Firebase

Dacă primești eroarea "Eroare la autentificare", probabil că autentificarea Google nu este activată în Firebase Console.

## Pași pentru Activare

### 1. Accesează Firebase Console

1. Mergi la https://console.firebase.google.com
2. Autentifică-te cu contul Google asociat proiectului
3. Selectează proiectul: **dandulgheru-e5fcc**

### 2. Activează Authentication

1. În meniul din stânga, click pe **Authentication**
2. Click pe tab-ul **Sign-in method**
3. Dacă Authentication nu este activat, vei vedea un buton "Get started" - click pe el

### 3. Activează Google Provider

1. În lista de providers, găsește **Google** și click pe el
2. Activează switch-ul **Enable**
3. Lăsă **Project support email** (va fi setat automat)
4. Pentru aplicații web, nu este nevoie de Client ID și Client Secret (opțional)
5. Click pe **Save**

### 4. Adaugă Domainul Autorizat (Important pentru Web)

1. Tot în **Authentication > Sign-in method > Google**
2. Scroll down la **Authorized domains**
3. Adaugă domeniul local pentru development:
   - `localhost` (deja adăugat)
   - `127.0.0.1` (dacă folosești IP direct)
   - Domainul de producție când vei deploya

### 5. Verifică Firestore Rules (Opțional)

Pentru a permite utilizatorilor să scrie date:

1. Mergi la **Firestore Database** > **Rules**
2. Actualizează regulile:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permite citire/scriere doar pentru utilizatorii autentificați
    match /checkinData/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **Publish**

### 6. Testează Autentificarea

După activare:
1. Reîncarcă aplicația în browser
2. Click pe "Conectează-te cu Google"
3. Ar trebui să vezi popup-ul de autentificare Google
4. După autentificare, vei fi redirecționat în aplicație

## Troubleshooting

### Eroare: "auth/unauthorized-domain"

**Soluție:** Adaugă domainul în lista de domenii autorizate în Firebase Console:
- Authentication > Sign-in method > Google > Authorized domains

### Eroare: "auth/configuration-not-found"

**Soluție:** Verifică că Google provider este activat în Firebase Console.

### Eroare: "Popup-ul a fost blocat"

**Soluție:** 
- Permite popup-urile pentru site în setările browserului
- Sau încearcă în modul incognito/private

### Eroare: "Firebase Auth nu este inițializat"

**Soluție:** Verifică că Firebase este instalat:
```bash
npm install firebase
```

Verifică și că `src/services/firebase.ts` are configurația corectă.

## Verificare Rapidă

Dacă tot primești erori, verifică în browser console (F12) pentru mesaje de eroare detaliate. Logurile vor arăta exact ce lipsește.

## Notă Importantă

După ce activezi Google Authentication în Firebase Console, poate dura câteva minute pentru ca schimbările să fie propagate. Dacă nu funcționează imediat, așteaptă 2-3 minute și reîncearcă.

