import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useMusicStore = defineStore('music', () => {
  // Estado
  const playlist = ref([]);
  const currentSong = ref(null);
  const isPlaying = ref(false);
  const currentIndex = ref(-1);
  const isPlayerVisible = ref(false);
  const isPlayerMinimized = ref(false);
  const viewMode = ref('video'); // 'video' o 'music'

  // Cargar playlist desde localStorage
  const loadPlaylist = () => {
    const savedPlaylist = localStorage.getItem('lifesync-playlist');
    if (savedPlaylist) {
      playlist.value = JSON.parse(savedPlaylist);
    }
  };

  // Guardar playlist en localStorage
  const savePlaylist = () => {
    localStorage.setItem('lifesync-playlist', JSON.stringify(playlist.value));
  };

  // Reproducir canción
  const playSong = (song) => {
    currentSong.value = song;
    isPlaying.value = true;
    isPlayerVisible.value = true;
    
    // Actualizar índice actual
    const index = playlist.value.findIndex(s => s.id === song.id);
    currentIndex.value = index;
  };

  // Agregar a playlist
  const addToPlaylist = (song) => {
    const exists = playlist.value.some(s => s.id === song.id);
    if (!exists) {
      playlist.value.push(song);
      savePlaylist();
      return true;
    }
    return false;
  };

  // Remover de playlist
  const removeFromPlaylist = (index) => {
    // Si estamos reproduciendo esta canción, pausar
    if (currentIndex.value === index) {
      currentSong.value = null;
      isPlaying.value = false;
      currentIndex.value = -1;
    } else if (currentIndex.value > index) {
      currentIndex.value--;
    }
    
    playlist.value.splice(index, 1);
    savePlaylist();
  };

  // Limpiar playlist
  const clearPlaylist = () => {
    playlist.value = [];
    currentSong.value = null;
    isPlaying.value = false;
    currentIndex.value = -1;
    savePlaylist();
  };

  // Siguiente canción
  const playNext = () => {
    if (playlist.value.length === 0) return;
    
    const nextIndex = (currentIndex.value + 1) % playlist.value.length;
    currentIndex.value = nextIndex;
    currentSong.value = playlist.value[nextIndex];
    isPlaying.value = true;
  };

  // Canción anterior
  const playPrevious = () => {
    if (playlist.value.length === 0) return;
    
    const prevIndex = currentIndex.value - 1 < 0 
      ? playlist.value.length - 1 
      : currentIndex.value - 1;
    currentIndex.value = prevIndex;
    currentSong.value = playlist.value[prevIndex];
    isPlaying.value = true;
  };

  // Mezclar playlist
  const shufflePlaylist = () => {
    playlist.value = playlist.value.sort(() => Math.random() - 0.5);
    savePlaylist();
  };

  // Toggle play/pause
  const togglePlay = () => {
    isPlaying.value = !isPlaying.value;
  };

  // Toggle minimizar
  const toggleMinimize = () => {
    isPlayerMinimized.value = !isPlayerMinimized.value;
  };

  // Cerrar reproductor
  const closePlayer = () => {
    isPlayerVisible.value = false;
    isPlaying.value = false;
  };

  // Cambiar modo de vista
  const setViewMode = (mode) => {
    viewMode.value = mode;
  };

  // Computed
  const hasPlaylist = computed(() => playlist.value.length > 0);
  const canPlayNext = computed(() => playlist.value.length > 0 && currentSong.value);
  const canPlayPrevious = computed(() => playlist.value.length > 0 && currentSong.value);

  return {
    // Estado
    playlist,
    currentSong,
    isPlaying,
    currentIndex,
    isPlayerVisible,
    isPlayerMinimized,
    viewMode,
    
    // Métodos
    loadPlaylist,
    savePlaylist,
    playSong,
    addToPlaylist,
    removeFromPlaylist,
    clearPlaylist,
    playNext,
    playPrevious,
    shufflePlaylist,
    togglePlay,
    toggleMinimize,
    closePlayer,
    setViewMode,
    
    // Computed
    hasPlaylist,
    canPlayNext,
    canPlayPrevious,
  };
});
