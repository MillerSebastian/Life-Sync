# 🚀 Deployment en GitHub Pages

## 📋 Pasos para desplegar Life-Syn2 en GitHub Pages

### 1. **Configurar GitHub Pages**

1. Ve a tu repositorio en GitHub
2. Ve a `Settings` > `Pages`
3. En `Source`, selecciona `Deploy from a branch`
4. Selecciona la rama `main` y la carpeta `/docs` o `/root`
5. Haz clic en `Save`

### 2. **Build del proyecto**

```bash
cd Frontend
npm run build:gh-pages
```

### 3. **Configurar la carpeta de deployment**

- Si usas `/docs`: Copia el contenido de `dist/` a una carpeta `docs/` en la raíz
- Si usas `/root`: Copia el contenido de `dist/` a la raíz del repositorio

### 4. **Configurar Firebase**

Asegúrate de que tu proyecto Firebase tenga configurado:

- **Authentication**: Habilitado
- **Firestore Database**: Habilitado
- **Realtime Database**: Habilitado
- **Storage**: Habilitado (si usas archivos)

### 5. **Configurar dominios autorizados**

En Firebase Console > Authentication > Settings > Authorized domains:

- Agrega: `tu-usuario.github.io`
- Agrega: `tu-usuario.github.io/Life-Syn2`

### 6. **Variables de entorno**

Crea un archivo `.env.production` en la carpeta Frontend:

```env
VITE_FIREBASE_API_KEY=tu-api-key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
VITE_FIREBASE_APP_ID=tu-app-id
VITE_FIREBASE_DATABASE_URL=https://tu-proyecto-default-rtdb.firebaseio.com
```

### 7. **Commit y Push**

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

## ⚠️ **Consideraciones importantes**

### **Rutas de SPA**

- GitHub Pages no soporta rutas dinámicas por defecto
- Usa el archivo `_redirects` para manejar rutas de SPA
- Considera usar Hash Router si tienes problemas

### **Firebase Security Rules**

Asegúrate de que tus reglas de seguridad permitan acceso desde GitHub Pages:

```javascript
// Firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}

// Realtime Database
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

### **CORS y dominios**

- Configura CORS en Firebase Storage si usas archivos
- Agrega tu dominio de GitHub Pages a las reglas de CORS

## 🔧 **Solución de problemas comunes**

### **Error 404 en rutas**

- Verifica que el archivo `_redirects` esté en la carpeta correcta
- Considera usar Hash Router como alternativa

### **Firebase no funciona**

- Verifica que los dominios estén autorizados
- Revisa las reglas de seguridad
- Confirma que las variables de entorno estén correctas

### **Build falla**

- Verifica que todas las dependencias estén instaladas
- Revisa los logs de build para errores específicos

## 📱 **URL final**

Tu aplicación estará disponible en:
`https://tu-usuario.github.io/Life-Syn2/`
