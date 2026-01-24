# 🔥 Guía Completa de Configuración - Firebase y Variables de Entorno

Proyecto **Castle Clash / czcastle**. Misma guía que Tiny-Sword: Firebase Auth (Twitter) + Firestore.

## 📋 Tabla de Contenidos
1. [Crear Proyecto en Firebase](#1-crear-proyecto-en-firebase)
2. [Configurar Authentication con Twitter](#2-configurar-authentication-con-twitter)
3. [Configurar Firestore Database](#3-configurar-firestore-database)
4. [Obtener Credenciales del Cliente](#4-obtener-credenciales-del-cliente)
5. [Obtener Credenciales del Servidor (Admin)](#5-obtener-credenciales-del-servidor-admin)
6. [Configurar Variables de Entorno en Vercel](#6-configurar-variables-de-entorno-en-vercel)
7. [Configurar Variables de Entorno Localmente](#7-configurar-variables-de-entorno-localmente)
8. [Verificar que Todo Funciona](#8-verificar-que-todo-funciona)

---

## 1. Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. **Agregar proyecto** → nombre (ej. `castle-clash-duel`) → Crear proyecto

---

## 2. Configurar Authentication con Twitter

1. **Authentication** → **Comenzar** → habilitar **Twitter**
2. [Twitter Developer Portal](https://developer.twitter.com/): crear app, **Callback URL**  
   `https://TU_PROJECT_ID.firebaseapp.com/__/auth/handler`
3. Copiar **API Key** y **API Secret** → pegarlos en Firebase → Twitter
4. **Authentication** → **Settings** → **Authorized domains**:  
   `localhost`, `tu-proyecto.vercel.app`, `TU_PROJECT_ID.firebaseapp.com`

---

## 3. Configurar Firestore Database

1. **Firestore Database** → **Crear base de datos** (modo prueba)
2. **Rules** → usar:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /scores/{scoreId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }
  }
}
```

---

## 4. Obtener Credenciales del Cliente

1. **Project settings** → **Your apps** → **</>** (Web)
2. Registrar app y copiar `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`  
   → Variables `VITE_FIREBASE_*`

---

## 5. Obtener Credenciales del Servidor (Admin)

1. **Project settings** → **Service accounts** → **Generate new private key**
2. Del JSON: `project_id` → `FIREBASE_PROJECT_ID`, `client_email` → `FIREBASE_CLIENT_EMAIL`, `private_key` → `FIREBASE_PRIVATE_KEY` (con `\n`)

---

## 6. Configurar Variables de Entorno en Vercel

**Settings** → **Environment Variables**:

- **VITE_***: apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId  
- **FIREBASE_PROJECT_ID**, **FIREBASE_CLIENT_EMAIL**, **FIREBASE_PRIVATE_KEY**

Luego **Deployments** → **Redeploy**.

---

## 7. Configurar Variables de Entorno Localmente

Crear `.env` en la raíz (no subir a Git). Ver `.env.example` y completar los mismos valores.

---

## 8. Verificar que Todo Funciona

1. Abrir el sitio (Vercel o `http://localhost:5000`)
2. **Defense** → redirige a `/login`
3. **Sign in with Twitter** → autorizar → guardar wallet → **Jugar**
4. Firebase Console → **Firestore** → colección `users` con tu usuario

---

## 🆘 Solución de Problemas

- **auth/unauthorized-domain**: añadir dominio en **Authorized domains**
- **FIREBASE_PROJECT_ID must be set**: revisar env en Vercel
- **Invalid API key**: revisar `VITE_FIREBASE_API_KEY`
- **Private key**: incluir `\n`; en Vercel probar escape `\"-----BEGIN...\\n...\\n-----END...\\n\"`

---

**Deploy en Vercel:** ver [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md).
