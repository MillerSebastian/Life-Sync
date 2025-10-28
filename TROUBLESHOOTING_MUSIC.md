# 🔧 Solución de Problemas - Reproductor de Música

## ❌ Error: "postMessage on 'DOMWindow'"

### Descripción
```
Failed to execute 'postMessage' on 'DOMWindow': The target origin provided 
('https://www.youtube.com') does not match the recipient window's origin 
('http://localhost:3000').
```

### ¿Es un problema?
**NO** - Este error es completamente normal y no afecta la funcionalidad del reproductor. 

### ¿Por qué ocurre?
YouTube intenta enviar mensajes entre su iframe y tu aplicación. El navegador bloquea esto por seguridad, pero el reproductor sigue funcionando normalmente.

### Solución
✅ **No requiere solución** - Ignora este error en la consola. El reproductor funciona perfectamente.

---

## ❌ Error: "ERR_BLOCKED_BY_CLIENT"

### Descripción
```
Failed to load resource: net::ERR_BLOCKED_BY_CLIENT
- www.youtube.com/generate_204
- play.google.com/log
- www.youtube.com/youtubei/v1/log_event
```

### ¿Es un problema?
**NO** - Estos son rastreadores de Google bloqueados por tu AdBlocker/extensiones.

### ¿Por qué ocurre?
Tu navegador o extensiones (AdBlock, uBlock, etc.) bloquean peticiones de rastreo de Google/YouTube.

### Solución
✅ **No requiere solución** - El video y audio se reproducen normalmente.

Si quieres eliminar estos errores (opcional):
1. Desactiva AdBlocker temporalmente
2. O agrega `localhost:3000` a la whitelist

---

## ❌ Problema: La página se recarga al cambiar de vista

### Descripción
Al navegar entre vistas (Dashboard → Music → Tasks), la página se recarga completamente y se pierde la música.

### Diagnóstico
Verifica si tienes:
1. Enlaces `<a href>` en lugar de `<router-link>`
2. Navegación con `window.location.href`
3. Recarga forzada en algún componente

### Solución

#### 1. Verifica que uses `<router-link>` en lugar de `<a>`

❌ **Incorrecto:**
```vue
<a href="/dashboard">Dashboard</a>
```

✅ **Correcto:**
```vue
<router-link to="/dashboard">Dashboard</router-link>
```

#### 2. Verifica navegación programática

❌ **Incorrecto:**
```javascript
window.location.href = '/dashboard';
```

✅ **Correcto:**
```javascript
import { useRouter } from 'vue-router';
const router = useRouter();
router.push('/dashboard');
```

#### 3. Abre la consola del navegador

Presiona `F12` y ve a la pestaña **Network**. Si ves que se recarga `index.html` al navegar, el problema es navegación incorrecta.

---

## ❌ Problema: No se puede reproducir desde el reproductor flotante

### Síntomas
- El reproductor flotante aparece
- Los botones no responden
- No se escucha audio

### Soluciones

### A. Limpia localStorage
```javascript
// En la consola del navegador (F12)
localStorage.removeItem('lifesync-playlist');
location.reload();
```

### B. Verifica que hay canciones en la playlist
1. Ve a Music
2. Busca una canción
3. Haz clic en ➕ para agregar a playlist
4. Haz clic en ▶️ para reproducir

### C. Reinicia el servidor de desarrollo
```bash
# Ctrl+C para detener
npm run dev
```

---

## 🔍 Cómo Verificar que Funciona Correctamente

### Test 1: Reproducción Básica
1. Ve a **Music**
2. Busca "test"
3. Haz clic en ▶️ en cualquier resultado
4. Debe aparecer el reproductor flotante
5. Debe empezar a sonar

### Test 2: Persistencia entre Vistas
1. Reproduce una canción (Test 1)
2. Ve a **Dashboard**
3. El reproductor flotante debe seguir visible
4. La música debe seguir sonando
5. Los controles deben funcionar

### Test 3: Controles del Reproductor
1. Reproduce una canción
2. Haz clic en ⏸️ (pausar) → Debe pausar
3. Haz clic en ▶️ (reproducir) → Debe reanudar
4. Haz clic en ⏭️ (siguiente) → Debe cambiar de canción

### Test 4: Playlist Persistente
1. Agrega 3 canciones a la playlist
2. Recarga la página (F5)
3. La playlist debe seguir ahí (guardada en localStorage)

---

## 🛠️ Comandos Útiles de Depuración

### Ver estado del reproductor (en consola F12)
```javascript
// Ver playlist
JSON.parse(localStorage.getItem('lifesync-playlist'))

// Ver si hay canción actual
import { useMusicStore } from '@/stores/music'
const musicStore = useMusicStore()
console.log(musicStore.currentSong)
console.log(musicStore.playlist)
```

### Limpiar todo y empezar de cero
```javascript
// En consola del navegador
localStorage.clear();
location.reload();
```

---

## 📝 Checklist de Verificación

Antes de reportar un problema, verifica:

- [ ] ✅ El servidor está corriendo (`npm run dev`)
- [ ] ✅ No hay errores de compilación en la terminal
- [ ] ✅ El navegador está actualizado
- [ ] ✅ Has probado en modo incógnito (sin extensiones)
- [ ] ✅ Has limpiado localStorage
- [ ] ✅ Has recargado la página (F5)
- [ ] ✅ Estás usando `router-link` para navegar
- [ ] ✅ El FloatingMusicPlayer está en Layout.vue

---

## 🎯 Comportamiento Esperado

### Al Reproducir una Canción
1. Aparece el reproductor flotante (esquina inferior derecha)
2. Comienza la reproducción automáticamente
3. Se muestra el video (si está en modo Video)
4. Se muestra la mini-playlist

### Al Cambiar de Vista
1. La música **sigue sonando**
2. El reproductor **sigue visible**
3. Los controles **siguen funcionando**
4. La URL cambia sin recargar la página

### Al Cerrar el Reproductor (❌)
1. El reproductor desaparece
2. La música se pausa
3. La playlist se mantiene guardada

---

## 🆘 Si Nada Funciona

1. **Detén el servidor**: `Ctrl+C` en la terminal
2. **Borra node_modules**: `rm -rf node_modules`
3. **Reinstala**: `npm install`
4. **Reinicia**: `npm run dev`
5. **Limpia navegador**: `localStorage.clear()` en consola
6. **Recarga**: `F5`

---

## 📞 Información de Debug

Si sigues teniendo problemas, proporciona:
1. Mensaje de error completo de la consola
2. Pasos exactos para reproducir el problema
3. Navegador y versión
4. Screenshot del error

---

## ✅ Soluciones Implementadas

- ✅ Agregado `origin` al playerVars para evitar warnings
- ✅ Mejorado manejo de estado con watch
- ✅ Playlist se carga al iniciar la app (main.js)
- ✅ Key en componente YouTube para forzar recreación
- ✅ isPlaying sincronizado con el store
