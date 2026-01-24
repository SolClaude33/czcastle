# Subir Castle a GitHub (czcastle)

## Repo: https://github.com/SolClaude33/czcastle

### Opción A: Castle como repo propio (recomendado)

Desde la carpeta **castle**:

```bash
cd "c:\Users\nicol\Desktop\proyectos xd\castle"

# Inicializar repo limpio
git init
git add .
git commit -m "Castle Clash: login, Firebase, Vercel"

# Conectar y subir a czcastle (reemplaza el contenido actual)
git remote add origin https://github.com/SolClaude33/czcastle.git
git branch -M main
git push -u origin main --force
```

`--force` reemplaza el contenido de **czcastle** con este proyecto. Si prefieres no pisar el historial, clona czcastle, copia los archivos de castle, commit y push.

### Opción B: Sin force push

Si **czcastle** ya tiene historial que quieres mantener:

1. Clona czcastle: `git clone https://github.com/SolClaude33/czcastle.git czcastle-clone`
2. Borra todo dentro de `czcastle-clone` (excepto `.git`)
3. Copia el contenido de **castle** en `czcastle-clone`
4. `git add . && git commit -m "..." && git push`

### Después del push

1. En **Vercel**: importa o reconecta el repo **czcastle**
2. Configura las variables de entorno (Firebase) según **VERCEL_DEPLOY.md**
3. Añade tu dominio de Vercel en **Firebase → Authorized domains**
