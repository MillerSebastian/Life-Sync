# Configuración de YouTube Data API

## 📝 Estado Actual

✅ **La búsqueda está configurada con YouTube Data API REAL**

La aplicación ya está lista para buscar videos reales de YouTube. Tiene una API Key de prueba incluida, pero es recomendable que obtengas tu propia API Key gratuita para evitar límites compartidos.

## 🔑 Pasos para Configurar YouTube API

### 1. Obtener API Key

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **YouTube Data API v3**
4. Ve a "Credenciales" → "Crear credenciales" → "Clave de API"
5. Copia tu API Key

### 2. Configurar tu Propia API Key (Opcional pero Recomendado)

#### Opción A: Usar archivo .env (Recomendado)

1. Copia el archivo `.env.example` y renómbralo a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Abre el archivo `.env` y pega tu API Key:
   ```env
   VITE_YOUTUBE_API_KEY=TU_API_KEY_AQUI
   ```

3. Reinicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

#### Opción B: Reemplazar directamente en el código

Abre `src/views/Music.vue` y busca la línea 230:
```javascript
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || "API_KEY_DE_PRUEBA";
```

Reemplázala con:
```javascript
const API_KEY = "TU_API_KEY_AQUI";
```

**⚠️ Nota:** Si usas Git, asegúrate de que `.env` esté en `.gitignore` para no compartir tu API Key.

## 🎵 Características Implementadas

### ✅ Modos de Reproducción
- **Video**: Muestra el reproductor de YouTube con video
- **Música**: Oculta el video (solo se escucha el audio)

### ✅ Funcionalidades
- 🔍 Búsqueda de canciones/videos en YouTube
- ▶️ Reproducción de videos
- ➕ Agregar canciones a playlist
- 🗑️ Eliminar canciones de playlist
- 💾 Guardado automático en localStorage
- ⏭️ Siguiente/Anterior canción
- 🔀 Mezclar playlist
- 🔄 Auto-play al finalizar canción

## 📋 Límites de API

YouTube Data API tiene límites de cuotas:
- **10,000 unidades por día** (gratis)
- Una búsqueda = ~100 unidades
- ~100 búsquedas por día

## 🎨 Personalización

Puedes personalizar:
- Número de resultados: cambia `maxResults` en la URL
- Tipo de contenido: agrega `&videoCategoryId=10` para solo música
- Duración: agrega `&videoDuration=short|medium|long`

## 🚀 Próximos Pasos

1. Obtener API Key de YouTube
2. Crear archivo `.env`
3. Actualizar función `searchYouTube`
4. Probar búsqueda real
5. (Opcional) Implementar filtros avanzados
