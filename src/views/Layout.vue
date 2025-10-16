<template>
  <div class="layout">
    <Sidebar @toggle="handleSidebarToggle" />
    <div class="main-wrapper">
      <TopNavBar :sidebar-collapsed="isSidebarCollapsed" />
      <main
        class="main-content"
        :class="{ 'sidebar-collapsed': isSidebarCollapsed }"
      >
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Sidebar from "../components/Sidebar.vue";
import TopNavBar from "../components/TopNavBar.vue";

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

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  margin-left: 250px;
  background: var(--background-secondary);
  min-width: 0;
  transition: margin-left 0.3s ease;
  padding-top: 72px;
}

.main-content.sidebar-collapsed {
  margin-left: 70px;
}

/* Responsive */
@media (max-width: 1024px) {
  .main-content {
    margin-left: 70px;
    padding-top: 72px;
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
