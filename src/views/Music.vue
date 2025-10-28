<template>
  <div class="music-view">
    <div class="music-header">
      <h1>
        <i class="bx bx-music"></i>
        Music Player
      </h1>
      <div class="mode-toggle">
        <button
          :class="{ active: musicStore.viewMode === 'video' }"
          @click="musicStore.setViewMode('video')"
        >
          <i class="bx bx-video"></i>
          Video
        </button>
        <button
          :class="{ active: musicStore.viewMode === 'music' }"
          @click="musicStore.setViewMode('music')"
        >
          <i class="bx bx-music"></i>
          Música
        </button>
      </div>
    </div>

    <div class="music-content">
      <!-- Panel izquierdo: Búsqueda y Playlists -->
      <div class="left-panel">
        <!-- Búsqueda -->
        <div class="search-section">
          <h3>
            <i class="bx bx-search"></i>
            Buscar en YouTube
          </h3>
          <div class="search-bar">
            <input
              v-model="searchQuery"
              @keyup.enter="searchYouTube"
              type="text"
              placeholder="Buscar canciones o videos..."
            />
            <button @click="searchYouTube" :disabled="!searchQuery.trim()">
              <i class="bx bx-search"></i>
            </button>
          </div>

          <!-- Resultados de búsqueda -->
          <div v-if="searchResults.length > 0" class="search-results">
            <div
              v-for="result in searchResults"
              :key="result.id"
              class="result-item"
            >
              <img :src="result.thumbnail" :alt="result.title" />
              <div class="result-info">
                <h4>{{ result.title }}</h4>
                <p>{{ result.channel }}</p>
              </div>
              <div class="result-actions">
                <button @click="playSong(result)" class="btn-play">
                  <i class="bx bx-play"></i>
                </button>
                <button @click="addToPlaylist(result)" class="btn-add">
                  <i class="bx bx-plus"></i>
                </button>
              </div>
            </div>
          </div>

          <div v-else-if="isSearching" class="loading">
            <i class="bx bx-loader-alt bx-spin"></i>
            Buscando...
          </div>

          <div v-else-if="searchQuery && !isSearching" class="no-results">
            <i class="bx bx-search-alt"></i>
            <p>Busca canciones en YouTube</p>
          </div>
        </div>

        <!-- Playlists -->
        <div class="playlist-section">
          <div class="playlist-header">
            <h3>
              <i class="bx bx-list-ul"></i>
              Mi Playlist
            </h3>
            <button @click="clearPlaylist" v-if="musicStore.playlist.length > 0" class="btn-clear">
              <i class="bx bx-trash"></i>
            </button>
          </div>

          <div v-if="musicStore.playlist.length > 0" class="playlist-items">
            <div
              v-for="(song, index) in musicStore.playlist"
              :key="index"
              class="playlist-item"
              :class="{ playing: musicStore.currentSong?.id === song.id }"
            >
              <div class="playlist-number">{{ index + 1 }}</div>
              <img :src="song.thumbnail" :alt="song.title" />
              <div class="playlist-info">
                <h4>{{ song.title }}</h4>
                <p>{{ song.channel }}</p>
              </div>
              <div class="playlist-actions">
                <button @click="playSong(song)" class="btn-play-mini">
                  <i class="bx" :class="musicStore.currentSong?.id === song.id ? 'bx-pause' : 'bx-play'"></i>
                </button>
                <button @click="removeSong(index)" class="btn-remove">
                  <i class="bx bx-x"></i>
                </button>
              </div>
            </div>
          </div>

          <div v-else class="empty-playlist">
            <i class="bx bx-music"></i>
            <p>Agrega canciones a tu playlist</p>
          </div>
        </div>
      </div>

      <!-- Panel derecho: Reproductor -->
      <div class="right-panel">
        <div class="player-container" :class="{ 'music-mode': musicStore.viewMode === 'music' }">
          <div v-if="musicStore.currentSong" class="now-playing">
            <h3>
              <i class="bx bx-radio-circle-marked bx-tada"></i>
              Reproduciendo ahora
            </h3>
            <div class="current-song-info">
              <img :src="musicStore.currentSong.thumbnail" :alt="musicStore.currentSong.title" />
              <div>
                <h4>{{ musicStore.currentSong.title }}</h4>
                <p>{{ musicStore.currentSong.channel }}</p>
              </div>
            </div>
          </div>

          <div class="youtube-wrapper" v-if="musicStore.currentSong">
            <YouTube
              :src="musicStore.currentSong.url"
              :vars="playerVars"
              @ready="onReady"
              @state-change="onStateChange"
              ref="youtubePlayer"
            />
          </div>

          <div v-else class="no-song">
            <i class="bx bx-music"></i>
            <h3>Selecciona una canción</h3>
            <p>Busca y reproduce música de YouTube</p>
          </div>

          <!-- Controles de playlist -->
          <div v-if="musicStore.playlist.length > 0" class="playlist-controls">
            <button @click="playPrevious" :disabled="!musicStore.currentSong">
              <i class="bx bx-skip-previous"></i>
            </button>
            
            <!-- Botón Play/Pause principal -->
            <button @click="togglePlayPause" :disabled="!musicStore.currentSong" class="btn-play-pause">
              <i class="bx" :class="musicStore.isPlaying ? 'bx-pause' : 'bx-play'"></i>
            </button>
            
            <button @click="playNext" :disabled="!musicStore.currentSong">
              <i class="bx bx-skip-next"></i>
            </button>
            <button @click="shufflePlaylist">
              <i class="bx bx-shuffle"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import YouTube from "vue3-youtube";
import { useMusicStore } from "@/stores/music";

// Store global
const musicStore = useMusicStore();

// Estados locales (solo para la búsqueda)
const searchQuery = ref("");
const searchResults = ref([]);
const isSearching = ref(false);
const youtubePlayer = ref(null);

// Configuración del reproductor
const playerVars = computed(() => ({
  modestbranding: 1,
  controls: 1,
  showinfo: 0,
  rel: 0,
  autoplay: musicStore.isPlaying ? 1 : 0, // Respetar estado de reproducción
}));

// Cargar playlist desde localStorage al montar
onMounted(() => {
  musicStore.loadPlaylist();
});

// Búsqueda REAL en YouTube usando YouTube Data API v3
const searchYouTube = async () => {
  if (!searchQuery.value.trim()) return;
  
  isSearching.value = true;
  searchResults.value = [];
  
  try {
    // Obtener API Key desde variable de entorno o usar una de prueba
    // Para obtener tu propia API Key GRATIS:
    // 1. Ve a https://console.cloud.google.com/
    // 2. Crea un proyecto
    // 3. Habilita "YouTube Data API v3"
    // 4. Crea credenciales → API Key
    // 5. Crea archivo .env con: VITE_YOUTUBE_API_KEY=tu_key
    
    const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || "AIzaSyDGmRwnwQczDeV7Bu_y3rEET-5bVSa89bY";
    const maxResults = 20; // Número de resultados
    
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${encodeURIComponent(searchQuery.value)}&type=video&key=${API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      console.error("Error de API:", data.error);
      alert(`Error: ${data.error.message}\n\nPara usar búsqueda real, necesitas configurar tu propia API Key de YouTube (es gratis).`);
      searchResults.value = [];
      return;
    }
    
    // Mapear resultados al formato que usamos
    searchResults.value = data.items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));
    
  } catch (error) {
    console.error("Error buscando en YouTube:", error);
    alert("Error al buscar en YouTube. Por favor verifica tu conexión o configura una API Key válida.");
    searchResults.value = [];
  } finally {
    isSearching.value = false;
  }
};

// Usar funciones del store
const playSong = (song) => {
  musicStore.playSong(song);
  musicStore.isPlaying = true; // Asegurar que se marca como reproduciendo
};
const addToPlaylist = (song) => musicStore.addToPlaylist(song);
const removeSong = (index) => musicStore.removeFromPlaylist(index);
const clearPlaylist = () => {
  if (confirm("¿Deseas borrar toda la playlist?")) {
    musicStore.clearPlaylist();
  }
};
const playNext = () => musicStore.playNext();
const playPrevious = () => musicStore.playPrevious();
const shufflePlaylist = () => musicStore.shufflePlaylist();

// Toggle play/pause
const togglePlayPause = () => {
  const player = youtubePlayer.value?.player;
  if (player && player.pauseVideo && player.playVideo) {
    if (musicStore.isPlaying) {
      player.pauseVideo();
      musicStore.isPlaying = false;
    } else {
      player.playVideo();
      musicStore.isPlaying = true;
    }
  }
};

// Eventos del reproductor
const onReady = (event) => {
  // Si el estado es pausado, pausar el reproductor
  if (!musicStore.isPlaying && youtubePlayer.value?.player) {
    youtubePlayer.value.player.pauseVideo();
  }
};

const onStateChange = (event) => {
  // -1 = sin iniciar, 0 = finalizado, 1 = reproduciendo, 2 = pausado, 3 = buffering, 5 = video cued
  if (event.data === 0) {
    // Auto-play siguiente canción
    musicStore.playNext();
  } else if (event.data === 1) {
    // Reproduciendo - actualizar estado
    musicStore.isPlaying = true;
  } else if (event.data === 2) {
    // Pausado - actualizar estado
    musicStore.isPlaying = false;
  }
};
</script>

<style scoped>
.music-view {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
  height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
}

.music-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.music-header h1 {
  font-size: 28px;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 12px;
}

.music-header h1 i {
  color: var(--primary);
  font-size: 32px;
}

.mode-toggle {
  display: flex;
  gap: 8px;
  background: var(--background-secondary);
  padding: 4px;
  border-radius: 12px;
}

.mode-toggle button {
  padding: 10px 20px;
  border: none;
  background: transparent;
  color: var(--text);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.mode-toggle button.active {
  background: var(--primary);
  color: white;
}

.mode-toggle button:hover:not(.active) {
  background: var(--border);
}

.music-content {
  display: grid;
  grid-template-columns: 450px 1fr;
  gap: 24px;
  flex: 1;
  overflow: hidden;
}

/* Panel izquierdo */
.left-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  padding-right: 8px;
}

.search-section,
.playlist-section {
  background: var(--background-secondary);
  padding: 20px;
  border-radius: 16px;
  border: 1px solid var(--border);
}

.search-section h3,
.playlist-section h3 {
  font-size: 18px;
  color: var(--text);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.search-bar input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--background);
  color: var(--text);
  font-size: 14px;
}

.search-bar button {
  padding: 12px 20px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-bar button:hover:not(:disabled) {
  opacity: 0.9;
  transform: scale(1.05);
}

.search-bar button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-results,
.playlist-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.result-item,
.playlist-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.result-item:hover,
.playlist-item:hover {
  border-color: var(--primary);
  transform: translateX(4px);
}

.playlist-item.playing {
  border-color: var(--accent);
  background: rgba(6, 214, 160, 0.05);
}

.result-item img,
.playlist-item img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}

.result-info,
.playlist-info {
  flex: 1;
  min-width: 0;
}

.result-info h4,
.playlist-info h4 {
  font-size: 14px;
  color: var(--text);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-info p,
.playlist-info p {
  font-size: 12px;
  color: var(--text-secondary);
}

.result-actions,
.playlist-actions {
  display: flex;
  gap: 8px;
}

.btn-play,
.btn-add,
.btn-play-mini,
.btn-remove {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-play {
  background: var(--primary);
  color: white;
}

.btn-add {
  background: var(--accent);
  color: white;
}

.btn-play-mini {
  background: var(--primary);
  color: white;
}

.btn-remove {
  background: #ef4444;
  color: white;
}

.btn-play:hover,
.btn-add:hover,
.btn-play-mini:hover,
.btn-remove:hover {
  transform: scale(1.1);
}

.playlist-number {
  width: 24px;
  height: 24px;
  background: var(--primary);
  color: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.btn-clear {
  padding: 8px 16px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  transition: all 0.3s ease;
}

.btn-clear:hover {
  background: #dc2626;
}

.loading,
.no-results,
.empty-playlist,
.no-song {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
}

.loading i,
.no-results i,
.empty-playlist i,
.no-song i {
  font-size: 48px;
  margin-bottom: 12px;
  color: var(--primary);
}

/* Panel derecho */
.right-panel {
  background: var(--background-secondary);
  border-radius: 16px;
  border: 1px solid var(--border);
  padding: 24px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.player-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 20px;
}

.now-playing {
  background: var(--background);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--border);
}

.now-playing h3 {
  font-size: 16px;
  color: var(--primary);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.current-song-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.current-song-info img {
  width: 80px;
  height: 80px;
  border-radius: 10px;
  object-fit: cover;
}

.current-song-info h4 {
  font-size: 18px;
  color: var(--text);
  margin-bottom: 4px;
}

.current-song-info p {
  font-size: 14px;
  color: var(--text-secondary);
}

.youtube-wrapper {
  flex: 1;
  border-radius: 12px;
  overflow: hidden;
  background: #000;
  position: relative;
}

.youtube-wrapper :deep(iframe) {
  width: 100%;
  height: 100%;
  min-height: 400px;
}

/* Modo música: ocultar video */
.player-container.music-mode .youtube-wrapper {
  height: 0;
  min-height: 0;
  opacity: 0;
  pointer-events: none;
  position: absolute;
}

.no-song {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.no-song h3 {
  font-size: 24px;
  color: var(--text);
  margin-bottom: 8px;
}

.playlist-controls {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  background: var(--background);
  border-radius: 12px;
  border: 1px solid var(--border);
}

.playlist-controls button {
  width: 48px;
  height: 48px;
  border: none;
  background: var(--primary);
  color: white;
  border-radius: 10px;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.playlist-controls button:hover:not(:disabled) {
  transform: scale(1.1);
  background: var(--primary-dark);
}

.playlist-controls button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Botón Play/Pause más grande */
.btn-play-pause {
  width: 64px !important;
  height: 64px !important;
  background: var(--accent) !important;
  font-size: 28px !important;
}

.btn-play-pause:hover:not(:disabled) {
  background: #05c39a !important;
  transform: scale(1.15) !important;
}

/* Scrollbar */
.left-panel::-webkit-scrollbar,
.search-results::-webkit-scrollbar,
.playlist-items::-webkit-scrollbar {
  width: 6px;
}

.left-panel::-webkit-scrollbar-track,
.search-results::-webkit-scrollbar-track,
.playlist-items::-webkit-scrollbar-track {
  background: var(--background);
  border-radius: 3px;
}

.left-panel::-webkit-scrollbar-thumb,
.search-results::-webkit-scrollbar-thumb,
.playlist-items::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

.left-panel::-webkit-scrollbar-thumb:hover,
.search-results::-webkit-scrollbar-thumb:hover,
.playlist-items::-webkit-scrollbar-thumb:hover {
  background: var(--primary);
}

/* Responsive */
@media (max-width: 1024px) {
  .music-content {
    grid-template-columns: 1fr;
  }

  .left-panel {
    max-height: 500px;
  }
}
</style>
