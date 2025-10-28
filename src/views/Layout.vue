<template>
  <div class="layout">
    <Sidebar @toggle="handleSidebarToggle" />
    <div class="main-wrapper">
      <TopNavBar :sidebar-collapsed="isSidebarCollapsed" />
      <main
        class="main-content"
        :class="{ 'sidebar-collapsed': isSidebarCollapsed }"
      >
        <div class="content-container">
          <router-view />
        </div>
      </main>
    </div>
    
    <!-- Reproductor flotante global -->
    <FloatingMusicPlayer />
  </div>
</template>

<script setup>
import { ref } from "vue";
import Sidebar from "../components/Sidebar.vue";
import TopNavBar from "../components/TopNavBar.vue";
import FloatingMusicPlayer from "../components/FloatingMusicPlayer.vue";

const isSidebarCollapsed = ref(false);

const handleSidebarToggle = (collapsed) => {
  isSidebarCollapsed.value = collapsed;
};
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.content-container {
  width: 100%;
  max-width: 100%;
  margin: 0;
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  margin-left: 220px;
  background: var(--background-secondary);
  min-width: 0;
  transition: margin-left 0.3s ease;
  padding-top: 72px;
  padding-left: 24px;
  padding-right: 24px;
  padding-bottom: 24px;
  overflow: visible;
}

.main-content.sidebar-collapsed {
  margin-left: 70px;
}

/* Responsive */
@media (max-width: 1024px) {
  .main-content {
    margin-left: 70px;
    padding-top: 72px;
    padding-left: 16px;
    padding-right: 16px;
    padding-bottom: 16px;
  }

  .content-container {
    max-width: 1000px;
  }

  .main-content.sidebar-collapsed {
    margin-left: 70px;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding-top: 0;
  }
}
</style>
