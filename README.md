# Tiny Sword / Castle Clash Duel

Un juego de estrategia tipo tower defense/real-time strategy desarrollado con React, Phaser 3, Express.js y Firebase.

## Características

- **Juego de estrategia**: Defiende tu castillo y destruye al enemigo
- **Múltiples unidades**: Guerreros y arqueros con diferentes habilidades
- **Sistema de niveles**: 3 niveles con dificultad progresiva
- **Leaderboard**: Tabla de puntuaciones con top 10
- **Multiidioma**: Soporte para inglés y chino
- **Progreso persistente**: Guardado local de niveles desbloqueados
- **Autenticación**: Login con Twitter/X
- **Wallet Integration**: Guarda la dirección de wallet del usuario

## Tecnologías

- **Frontend**: React + TypeScript + Vite
- **Juego**: Phaser 3
- **Backend**: Express.js
- **Base de datos**: Firebase Firestore
- **Autenticación**: Firebase Auth (Twitter/X)
- **UI**: Tailwind CSS + Radix UI

## Instalación

```bash
npm install
```

## Configuración

Crea un archivo `.env` con las variables indicadas en `.env.example` (Firebase Admin + Firebase Client). Ver **FIREBASE_SETUP.md** y **GUIA_CONFIGURACION.md**.

## Desarrollo

```bash
npm run dev
```

El servidor se iniciará en `http://localhost:5000`.

## Base de datos

El proyecto usa **Firebase Firestore** para usuarios y puntuaciones, y **Firebase Auth (Twitter)** para login.

1. Sigue **FIREBASE_SETUP.md** o **GUIA_CONFIGURACION.md**
2. Configura las variables de entorno (ver `.env.example`)
3. Habilita Authentication con Twitter en Firebase Console
4. Configura las reglas de seguridad de Firestore

## Build y producción

```bash
npm run build
npm start
```

## Deploy en Vercel

1. Conecta el repo en [Vercel](https://vercel.com)
2. Configura las variables de entorno (Firebase) en **Settings → Environment Variables**
3. Añade tu dominio de Vercel en **Firebase → Authentication → Authorized domains**
4. Ver **VERCEL_DEPLOY.md** para más detalles

## Scripts

- `npm run dev` – Servidor de desarrollo
- `npm run build` – Build para producción
- `npm start` – Servidor en producción (Node)
- `npm run check` – Verificación de tipos TypeScript

## Estructura

```
├── client/       # Frontend React
├── server/       # Backend Express
├── api/          # Handler Vercel (serverless)
├── shared/       # Schemas y rutas compartidas
└── script/       # Scripts de build
```

## Licencia

MIT
