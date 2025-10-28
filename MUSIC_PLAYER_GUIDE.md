# 🎵 Guía del Reproductor de Música Global

## ✨ Nueva Funcionalidad Implementada

### **Reproductor Flotante Global**

Ahora la música **continúa reproduciéndose** cuando cambias de vista. El reproductor flotante aparece en la esquina inferior derecha y se mantiene activo en todas las secciones de la aplicación.

## 🎯 Características Principales

### 1. **Persistencia Entre Vistas**
- ✅ La música sigue sonando al navegar a Dashboard, Tareas, Calendario, etc.
- ✅ El reproductor se mantiene flotante sobre cualquier vista
- ✅ La playlist se guarda automáticamente en localStorage

### 2. **Reproductor Flotante**
- 📍 Aparece en la esquina inferior derecha
- 🔼 Se puede minimizar (solo muestra cabecera)
- 🔽 Se puede expandir (muestra video, controles y playlist)
- ❌ Se puede cerrar completamente

### 3. **Dos Modos de Reproducción**
- **🎥 Modo Video**: Muestra el video de YouTube
- **🎵 Modo Música**: Oculta el video (solo audio)
- Los modos se sincronizan entre la vista Music y el reproductor flotante

### 4. **Controles Completos**
- ⏮️ Canción anterior
- ▶️/⏸️ Play/Pause
- ⏭️ Canción siguiente
- 🔀 Vista previa de próximas 5 canciones

## 📋 Cómo Usar

### **Desde la Vista Music**

1. Ve a la sección **Music** en el sidebar
2. Busca una canción en YouTube
3. Haz clic en **Reproducir** (▶️) o **Agregar** (➕)
4. La música comenzará a sonar
5. **¡Cambia a cualquier otra vista!** La música sigue

### **Desde el Reproductor Flotante**

El reproductor flotante aparecerá automáticamente cuando reproduzcas una canción:

#### **Minimizar/Expandir**
- Clic en la cabecera o en el botón ⬇️/⬆️

#### **Cambiar Modo**
- Botón 🎥 para modo Video
- Botón 🎵 para modo Música (solo audio)

#### **Controles**
- ⏮️ Anterior
- ▶️/⏸️ Play/Pause  
- ⏭️ Siguiente

#### **Cerrar**
- Botón ❌ para ocultar el reproductor (la canción se pausa)

## 🗂️ Arquitectura Técnica

### **Estado Global con Pinia**

Se creó un store global (`src/stores/music.js`) que maneja:
- Lista de reproducción
- Canción actual
- Estado de reproducción
- Modo de vista (video/música)

### **Componentes**

1. **FloatingMusicPlayer.vue** (Nuevo)
   - Reproductor flotante global
   - Se muestra en todas las vistas
   - Conectado al store de Pinia

2. **Music.vue** (Actualizado)
   - Ahora usa el store global
   - Cambios se reflejan en el reproductor flotante
   - Búsqueda y gestión de playlist

3. **Layout.vue** (Actualizado)
   - Incluye el FloatingMusicPlayer
   - Disponible en todas las rutas protegidas

### **Sincronización**

```
┌─────────────┐         ┌──────────────┐         ┌───────────────────┐
│  Music.vue  │ ←────→  │ Music Store  │ ←────→  │ FloatingPlayer.vue│
│  (Vista)    │         │   (Pinia)    │         │   (Flotante)      │
└─────────────┘         └──────────────┘         └───────────────────┘
```

Ambos componentes comparten el mismo estado:
- Agregar canción en Music.vue → Aparece en FloatingPlayer
- Reproducir desde FloatingPlayer → Se actualiza Music.vue
- Cambiar modo → Se sincroniza en ambos

## 🎨 Personalización

### **Posición del Reproductor**
Edita `FloatingMusicPlayer.vue`:
```css
.floating-player {
  bottom: 0;
  right: 20px; /* Cambiar a left: 20px para izquierda */
}
```

### **Tamaño**
```css
.floating-player {
  width: 400px; /* Ajustar ancho */
  max-height: 80vh; /* Ajustar altura máxima */
}
```

### **Número de Canciones en Preview**
En `FloatingMusicPlayer.vue`:
```vue
<div v-for="(song, index) in musicStore.playlist.slice(0, 5)">
<!-- Cambiar 5 por el número deseado -->
```

## 🚀 Próximas Mejoras Posibles

- [ ] Control de volumen
- [ ] Barra de progreso de reproducción
- [ ] Modo repeat/loop
- [ ] Ecualizador visual
- [ ] Letras de canciones (usando APIs)
- [ ] Compartir playlist con otros usuarios
- [ ] Temas para el reproductor

## 📱 Responsive

El reproductor es responsive:
- **Desktop**: Esquina inferior derecha (400px ancho)
- **Mobile**: Ocupa todo el ancho de la pantalla

## 🔧 Solución de Problemas

### **La música no sigue al cambiar de vista**
- Verifica que estés usando el reproductor desde la vista Music
- Asegúrate de que el FloatingMusicPlayer esté en Layout.vue

### **No se guarda la playlist**
- Verifica que localStorage esté habilitado
- La playlist se guarda automáticamente con el key `lifesync-playlist`

### **El video no se oculta en modo Música**
- Asegúrate de seleccionar el modo 🎵 Música
- El reproductor continúa funcionando aunque no veas el video

## 💡 Tips

1. **Minimiza el reproductor** cuando no necesites ver el video
2. **Modo Música** ahorra recursos si solo quieres escuchar
3. **La playlist persiste** incluso si cierras la aplicación
4. **Auto-play** está activado, la siguiente canción se reproduce automáticamente

---

¡Disfruta de tu música mientras trabajas en LifeSync! 🎶
