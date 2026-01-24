# Firebase y login (Castle)

Este proyecto usa **Firebase Auth (Twitter)** y **Firestore** para usuarios y puntuaciones, igual que **Tiny-Sword**.

## 1. Variables de entorno

Copia `.env.example` a `.env` y rellena los valores. Necesitas:

- **Servidor (Firebase Admin):** `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- **Cliente (Vite):** `VITE_FIREBASE_*` (apiKey, authDomain, projectId, etc.)

## 2. Firebase Console

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/).
2. Habilita **Authentication** → proveedor **Twitter**.
3. Habilita **Firestore Database**.
4. Crea una app web en Project Settings y usa esa config para los `VITE_FIREBASE_*`.
5. En Service accounts, genera una clave privada y usa ese JSON para las variables de Admin.

## 3. Twitter OAuth

En [Twitter Developer Portal](https://developer.twitter.com/) configura la app y la **Callback URL**:

```
https://TU_PROJECT_ID.firebaseapp.com/__/auth/handler
```

Luego en Firebase → Authentication → Twitter añade API Key y API Secret.

## 4. Firestore

Se usan las colecciones `users` y `scores`. Si quieres reglas y estructura detallada, revisa la guía en tu copia de **Tiny-Sword** (`GUIA_CONFIGURACION.md`).

## 5. Ejecutar

```bash
npm install
npm run dev
```

Con `.env` configurado, deberías poder hacer login con Twitter en `/login`, guardar wallet y usar el leaderboard y el juego.
