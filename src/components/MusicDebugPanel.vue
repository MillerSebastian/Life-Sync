<template>
  <div v-if="showDebug" class="debug-panel">
    <div class="debug-header" @click="collapsed = !collapsed">
      <span>🔍 Music Debug</span>
      <button @click.stop="showDebug = false" class="btn-close-debug">×</button>
    </div>
    
    <div v-show="!collapsed" class="debug-body">
      <div class="debug-item">
        <strong>Playlist:</strong> {{ musicStore.playlist.length }} canciones
      </div>
      <div class="debug-item">
        <strong>Canción actual:</strong> 
        <span v-if="musicStore.currentSong">{{ musicStore.currentSong.title }}</span>
        <span v-else class="text-muted">Ninguna</span>
      </div>
      <div class="debug-item">
        <strong>Reproduciendo:</strong> 
        <span :class="musicStore.isPlaying ? 'text-success' : 'text-danger'">
          {{ musicStore.isPlaying ? '✓ Sí' : '✗ No' }}
        </span>
      </div>
      <div class="debug-item">
        <strong>Modo:</strong> {{ musicStore.viewMode }}
      </div>
      <div class="debug-item">
        <strong>Player visible:</strong> 
        <span :class="musicStore.isPlayerVisible ? 'text-success' : 'text-danger'">
          {{ musicStore.isPlayerVisible ? '✓ Sí' : '✗ No' }}
        </span>
      </div>
      <div class="debug-item">
        <strong>Ruta:</strong> {{ currentRoute }}
      </div>
      <div class="debug-item">
        <strong>localStorage:</strong> 
        <span class="text-small">{{ playlistInStorage.length }} canciones</span>
      </div>
      
      <div class="debug-actions">
        <button @click="clearPlaylist" class="btn-debug">Limpiar Playlist</button>
        <button @click="reloadPlaylist" class="btn-debug">Recargar Playlist</button>
      </div>
    </div>
  </div>
  
  <!-- Botón para mostrar debug -->
  <button v-else @click="showDebug = true" class="btn-show-debug" title="Mostrar Debug Panel">
    🔍
  </button>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useMusicStore } from '@/stores/music';

const musicStore = useMusicStore();
const route = useRoute();

const showDebug = ref(false);
const collapsed = ref(false);

const currentRoute = computed(() => route.path);

const playlistInStorage = computed(() => {
  try {
    const stored = localStorage.getItem('lifesync-playlist');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
});

const clearPlaylist = () => {
  if (confirm('¿Limpiar playlist y localStorage?')) {
    musicStore.clearPlaylist();
    alert('Playlist limpiada');
  }
};

const reloadPlaylist = () => {
  musicStore.loadPlaylist();
  alert('Playlist recargada desde localStorage');
};
</script>

<style scoped>
.debug-panel {
  position: fixed;
  top: 80px;
  right: 20px;
  width: 320px;
  background: #1a1a1a;
  color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  z-index: 10000;
  font-family: monospace;
  font-size: 12px;
}

.debug-header {
  padding: 12px 16px;
  background: #2a2a2a;
  border-radius: 12px 12px 0 0;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
}

.debug-header span {
  font-weight: bold;
}

.btn-close-debug {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  line-height: 1;
}

.btn-close-debug:hover {
  color: #ff4444;
}

.debug-body {
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.debug-item {
  padding: 8px 0;
  border-bottom: 1px solid #333;
}

.debug-item:last-child {
  border-bottom: none;
}

.debug-item strong {
  color: #4CAF50;
  display: block;
  margin-bottom: 4px;
}

.text-muted {
  color: #888;
}

.text-success {
  color: #4CAF50;
}

.text-danger {
  color: #ff4444;
}

.text-small {
  font-size: 10px;
  color: #aaa;
}

.debug-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}

.btn-debug {
  flex: 1;
  padding: 8px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 11px;
}

.btn-debug:hover {
  background: #45a049;
}

.btn-show-debug {
  position: fixed;
  top: 80px;
  right: 20px;
  width: 48px;
  height: 48px;
  background: #1a1a1a;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  z-index: 10000;
  transition: all 0.3s ease;
}

.btn-show-debug:hover {
  background: #2a2a2a;
  transform: scale(1.1);
}

.debug-body::-webkit-scrollbar {
  width: 6px;
}

.debug-body::-webkit-scrollbar-track {
  background: #1a1a1a;
}

.debug-body::-webkit-scrollbar-thumb {
  background: #4CAF50;
  border-radius: 3px;
}
</style>
