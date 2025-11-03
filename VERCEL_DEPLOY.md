# Deploy to Vercel

## Pas cu pas pentru deploy pe Vercel

### Opțiunea 1: Deploy prin GitLab (Recomandat)

1. **Mergi la https://vercel.com**
   - Loghează-te cu contul tău
   - Sau creează cont nou dacă nu ai

2. **Import Project**
   - Click pe "Add New Project"
   - Selectează "Import Git Repository"
   - Click pe "GitLab"
   - Authorize Vercel să acceseze GitLab-ul tău
   - Selectează repository-ul: `quorbik/checkinapp`

3. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (sau lasă gol)
   - **Build Command**: `npm run build` (deja setat în vercel.json)
   - **Output Directory**: `dist` (deja setat în vercel.json)
   - **Install Command**: `npm install` (default)

4. **Environment Variables** (dacă sunt necesare)
   - De obicei nu sunt necesare pentru acest proiect
   - Firebase config este deja în cod

5. **Deploy**
   - Click "Deploy"
   - Așteaptă build-ul să se finalizeze
   - Vei primi un URL: `https://checkinapp-xxx.vercel.app`

### Opțiunea 2: Deploy prin Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

Urmărește instrucțiunile din CLI.

## Configurare după deploy

### 1. Adaugă domain-ul Vercel în Firebase

1. Mergi la **Firebase Console** → **Authentication** → **Sign-in method**
2. Scroll la **Authorized domains**
3. Adaugă domain-ul tău Vercel (ex: `checkinapp.vercel.app`)

### 2. Firestore Rules

Asigură-te că regulile Firestore permit accesul:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /checkinData/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3. Custom Domain (Opțional)

Dacă ai un domeniu propriu:
1. În Vercel Dashboard → Project Settings → Domains
2. Adaugă domeniul tău
3. Configurează DNS-ul conform instrucțiunilor
4. Adaugă domeniul și în Firebase Authorized domains

## Verificare

După deploy:
- ✅ Aplicația ar trebui să fie accesibilă la URL-ul Vercel
- ✅ Login-ul cu email ar trebui să funcționeze
- ✅ Timer-ul ar trebui să sincronizeze cu Firestore
- ✅ Datele ar trebui să se salveze în Firebase

## Troubleshooting

### Build fails
- Verifică că toate dependențele sunt în `package.json`
- Verifică că build command este corect: `npm run build`

### Firebase connection errors
- Verifică că domain-ul Vercel este în Firebase Authorized domains
- Verifică Firestore rules

### Icons not showing
- Verifică că iconițele sunt în `public/icons/`
- Șterge cache-ul browserului

