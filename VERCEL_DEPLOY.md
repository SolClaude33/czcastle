# Deploy en Vercel (Castle Clash / czcastle)

## 1. Conectar el repositorio

1. Ve a [vercel.com](https://vercel.com) e inicia sesión.
2. **Import** → selecciona el repo `SolClaude33/czcastle` (o tu fork).
3. Vercel detectará `vercel.json` y la configuración del proyecto.

## 2. Variables de entorno en Vercel

En el proyecto → **Settings** → **Environment Variables**, añade:

### Firebase Admin (servidor)

| Variable | Descripción |
|----------|-------------|
| `FIREBASE_PROJECT_ID` | ID del proyecto Firebase |
| `FIREBASE_CLIENT_EMAIL` | Email del Service Account |
| `FIREBASE_PRIVATE_KEY` | Private key del Service Account (con `\n` literales) |

### Firebase Client (Vite / frontend)

| Variable | Descripción |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | API Key de la app web |
| `VITE_FIREBASE_AUTH_DOMAIN` | `tu-proyecto.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Mismo que Admin |
| `VITE_FIREBASE_STORAGE_BUCKET` | `tu-proyecto.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID |
| `VITE_FIREBASE_APP_ID` | App ID |

### Otros

| Variable | Valor |
|----------|--------|
| `NODE_ENV` | `production` |

Puedes copiar los valores desde tu `.env` local (o desde `.env.example`).

## 3. Firebase y dominios

1. **Firebase Console** → **Authentication** → **Settings** → **Authorized domains**.
2. Añade tu dominio de Vercel (ej. `czcastle.vercel.app` o `tu-proyecto.vercel.app`).

## 4. Build en Vercel

Vercel usará por defecto (según `vercel.json`):

- **Build Command**: `npm run build`
- **Output Directory**: `dist/public`
- **Install Command**: `npm install`

El build ejecuta Vite (cliente → `dist/public`) y las rutas `/api/*` se sirven con la app Express en `api/index.ts`.

## 5. Deploy

- Cada push a la rama conectada (ej. `main`) dispara un deploy automático.
- O desde la CLI:
  ```bash
  npm i -g vercel
  vercel
  ```

## 6. Notas

- El proyecto usa **Firebase Firestore** y **Firebase Auth (Twitter)**. No se usa PostgreSQL.
- La API (auth, wallet, scores) corre como **serverless** en `/api`.
- Los estáticos (SPA, `game.html`, assets) se sirven desde `dist/public`.
- Si algo falla, revisa **Functions** y **Build logs** en el dashboard de Vercel y que todas las variables de Firebase estén bien configuradas.

## 7. Guía completa Firebase

Para crear el proyecto Firebase, Twitter OAuth, Firestore y reglas, sigue **GUIA_CONFIGURACION.md** o **FIREBASE_SETUP.md**.
