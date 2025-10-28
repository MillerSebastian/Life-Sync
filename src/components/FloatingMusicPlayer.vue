<template>
  <Transition name="slide-up">
    <div v-if="musicStore.isPlayerVisible" class="floating-player" :class="{ minimized: musicStore.isPlayerMinimized }">
      <div class="player-header" @click="musicStore.toggleMinimize">
        <div class="song-info">
          <img v-if="musicStore.currentSong" :src="musicStore.currentSong.thumbnail" :alt="musicStore.currentSong.title" />
          <div class="info-text">
            <h4>{{ musicStore.currentSong?.title || 'Sin canción' }}</h4>
            <p>{{ musicStore.currentSong?.channel || '-' }}</p>
          </div>
        </div>
        <div class="header-actions">
          <button @click.stop="musicStore.toggleMinimize" class="btn-minimize">
            <i class="bx" :class="musicStore.isPlayerMinimized ? 'bx-chevron-up' : 'bx-chevron-down'"></i>
          </button>
          <button @click.stop="musicStore.closePlayer" class="btn-close">
            <i class="bx bx-x"></i>
          </button>
        </div>
      </div>

      <div v-show="!musicStore.isPlayerMinimized" class="player-body">
        <!-- Reproductor YouTube -->
        <div class="youtube-container" :class="{ hidden: musicStore.viewMode === 'music' }">
          <YouTube
            v-if="musicStore.currentSong"
            :key="musicStore.currentSong.id"
            :src="musicStore.currentSong.url"
            :vars="playerVars"
            @ready="onReady"
            @state-change="onStateChange"
            ref="youtubePlayer"
          />
        </div>

        <!-- Controles -->
        <div class="player-controls">
          <div class="control-buttons">
            <button 
              @click="musicStore.playPrevious" 
              :disabled="!musicStore.canPlayPrevious"
              class="btn-control"
            >
              <i class="bx bx-skip-previous"></i>
            </button>
            
            <button @click="togglePlayPause" class="btn-control btn-play">
              <i class="bx" :class="isPlaying ? 'bx-pause' : 'bx-play'"></i>
            </button>
            
            <button 
              @click="musicStore.playNext" 
              :disabled="!musicStore.canPlayNext"
              class="btn-control"
            >
              <i class="bx bx-skip-next"></i>
            </button>
          </div>

          <div class="mode-toggle-mini">
            <button
              :class="{ active: musicStore.viewMode === 'video' }"
              @click="musicStore.setViewMode('video')"
              title="Modo Video"
            >
              <i class="bx bx-video"></i>
            </button>
            <button
              :class="{ active: musicStore.viewMode === 'music' }"
              @click="musicStore.setViewMode('music')"
              title="Solo Audio"
            >
              <i class="bx bx-music"></i>
            </button>
          </div>
        </div>

        <!-- Playlist mini -->
        <div v-if="musicStore.playlist.length > 0" class="mini-playlist">
          <div class="playlist-title">
            <i class="bx bx-list-ul"></i>
            Siguiente ({{ musicStore.playlist.length }})
          </div>
          <div class="playlist-scroll">
            <div
              v-for="(song, index) in musicStore.playlist.slice(0, 5)"
              :key="index"
              class="mini-song"
              :class="{ active: musicStore.currentSong?.id === song.id }"
              @click="musicStore.playSong(song)"
            >
              <span class="song-number">{{ index + 1 }}</span>
              <img :src="song.thumbnail" :alt="song.title" />
              <span class="song-name">{{ song.title }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useMusicStore } from '@/stores/music';
import YouTube from 'vue3-youtube';

const musicStore = useMusicStore();
const youtubePlayer = ref(null);
const isPlaying = ref(false);

const playerVars = computed(() => ({
  modestbranding: 1,
  controls: 1,
  showinfo: 0,
  rel: 0,
  autoplay: musicStore.isPlaying ? 1 : 0, // Respetar estado de reproducción
  enablejsapi: 1,
  origin: window.location.origin,
}));

const onReady = (event) => {
  // Respetar el estado actual del store
  isPlaying.value = musicStore.isPlaying;
  
  // Si debe estar pausado, pausar el video
  if (!musicStore.isPlaying && event.target) {
    setTimeout(() => {
      event.target.pauseVideo();
    }, 100);
  }
};

const onStateChange = (event) => {
  // -1 = sin iniciar, 0 = finalizado, 1 = reproduciendo, 2 = pausado, 3 = buffering, 5 = video cued
  if (event.data === 0) {
    // Video finalizado, reproducir siguiente
    musicStore.playNext();
  } else if (event.data === 1) {
    isPlaying.value = true;
    musicStore.isPlaying = true;
  } else if (event.data === 2) {
    isPlaying.value = false;
    musicStore.isPlaying = false;
  }
};

const togglePlayPause = () => {
  const player = youtubePlayer.value?.player;
  if (player && player.pauseVideo && player.playVideo) {
    if (isPlaying.value) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  }
};

// Sincronizar estado cuando cambia la canción
watch(() => musicStore.currentSong, (newSong) => {
  if (newSong) {
    nextTick(() => {
      isPlaying.value = true;
    });
  }
});
</script>

<style scoped>
.floating-player {
  position: fixed;
  bottom: 0;
  right: 20px;
  width: 400px;
  max-height: 80vh;
  background: var(--background-secondary);
  border: 1px solid var(--border);
  border-bottom: none;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -4px 20px var(--shadow);
  z-index: 9999;
  transition: all 0.3s ease;
  overflow: hidden;
}

.floating-player.minimized {
  max-height: 72px;
}

.player-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--primary);
  color: white;
  cursor: pointer;
  user-select: none;
}

.player-header:hover {
  background: var(--primary-dark);
}

.song-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.song-info img {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.info-text {
  flex: 1;
  min-width: 0;
}

.info-text h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-text p {
  font-size: 12px;
  margin: 0;
  opacity: 0.9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.btn-minimize,
.btn-close {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-minimize:hover,
.btn-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.player-body {
  padding: 16px;
  max-height: calc(80vh - 72px);
  overflow-y: auto;
}

.youtube-container {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  background: #000;
  margin-bottom: 16px;
  aspect-ratio: 16/9;
}

.youtube-container.hidden {
  display: none;
}

.youtube-container :deep(iframe) {
  width: 100%;
  height: 100%;
}

.player-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--background);
  border-radius: 12px;
  margin-bottom: 16px;
}

.control-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn-control {
  width: 44px;
  height: 44px;
  border: none;
  background: var(--primary);
  color: white;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.2s ease;
}

.btn-control:hover:not(:disabled) {
  transform: scale(1.1);
  background: var(--primary-dark);
}

.btn-control:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-play {
  width: 52px;
  height: 52px;
  background: var(--accent);
}

.btn-play:hover:not(:disabled) {
  background: #05c39a;
}

.mode-toggle-mini {
  display: flex;
  gap: 6px;
  background: var(--background-secondary);
  padding: 4px;
  border-radius: 8px;
}

.mode-toggle-mini button {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: var(--text);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.mode-toggle-mini button.active {
  background: var(--primary);
  color: white;
}

.mode-toggle-mini button:hover:not(.active) {
  background: var(--border);
}

.mini-playlist {
  background: var(--background);
  border-radius: 12px;
  padding: 12px;
}

.playlist-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.playlist-scroll {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.mini-song {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mini-song:hover {
  background: var(--background-secondary);
}

.mini-song.active {
  background: rgba(99, 102, 241, 0.1);
  border-left: 3px solid var(--primary);
}

.song-number {
  width: 20px;
  height: 20px;
  background: var(--primary);
  color: white;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.mini-song img {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.song-name {
  font-size: 13px;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

/* Scrollbar */
.player-body::-webkit-scrollbar,
.playlist-scroll::-webkit-scrollbar {
  width: 6px;
}

.player-body::-webkit-scrollbar-track,
.playlist-scroll::-webkit-scrollbar-track {
  background: var(--background);
  border-radius: 3px;
}

.player-body::-webkit-scrollbar-thumb,
.playlist-scroll::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

.player-body::-webkit-scrollbar-thumb:hover,
.playlist-scroll::-webkit-scrollbar-thumb:hover {
  background: var(--primary);
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .floating-player {
    right: 0;
    left: 0;
    width: 100%;
    border-radius: 16px 16px 0 0;
  }
}

/* Modo oscuro */
#theme-dark .player-header {
  background: #4f8cff;
}

#theme-dark .player-header:hover {
  background: #4080ff;
}

#theme-dark .btn-control {
  background: #4f8cff;
}

#theme-dark .btn-control:hover:not(:disabled) {
  background: #4080ff;
}

#theme-dark .btn-play {
  background: #10b981;
}

#theme-dark .btn-play:hover:not(:disabled) {
  background: #059669;
}
</style>
