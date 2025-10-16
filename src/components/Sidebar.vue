<template>
  <div class="sidebar" :class="{ 'sidebar-collapsed': isCollapsed }">
    <div class="sidebar-header">
      <div class="logo">
        <h2 v-if="!isCollapsed">LifeSync</h2>
        <span v-else>LS</span>
      </div>
      <button class="toggle-btn" @click="toggleSidebar">
        <i class="bx" :class="isCollapsed ? 'bx-menu' : 'bx-menu-alt-left'"></i>
      </button>
    </div>

    <nav class="sidebar-nav">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ active: $route.path === item.path }"
      >
        <i :class="item.icon"></i>
        <span v-if="!isCollapsed">{{ item.name }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const isCollapsed = ref(false);

const emit = defineEmits(["toggle"]);

const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: "bx bx-home-alt",
  },
  {
    name: "Tareas",
    path: "/tasks",
    icon: "bx bx-task",
  },
  {
    name: "Calendario",
    path: "/calendar",
    icon: "bx bx-calendar",
  },
  {
    name: "Wallet",
    path: "/wallet",
    icon: "bx bx-wallet",
  },
  {
    name: "Comidas",
    path: "/meals",
    icon: "bx bx-restaurant",
  },
  {
    path: "chatIA",
    name: "Lisy IA",
    icon: "bx bx-chat",
  },
  {
    name: "Comunidad",
    path: "/feed",
    icon: "bx bx-group",
  },
];

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
  emit("toggle", isCollapsed.value);
};

const logout = () => {
  // Aquí puedes agregar la lógica de logout
  router.push("/login");
};

// Emitir el estado inicial
watch(
  isCollapsed,
  (newValue) => {
    emit("toggle", newValue);
  },
  { immediate: true }
);
</script>

<style scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  background: var(--primary);
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  box-shadow: 2px 0 8px rgba(99, 102, 241, 0.2);
}

.sidebar-collapsed {
  width: 70px;
}

/* Mejoras para centrar íconos y botón hamburguesa en modo colapsado */
.sidebar.sidebar-collapsed .sidebar-header {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 0;
}

.sidebar.sidebar-collapsed .logo span {
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin-bottom: 8px;
}

.sidebar.sidebar-collapsed .toggle-btn {
  margin: 0;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar.sidebar-collapsed .sidebar-nav {
  padding: 8px 0;
}

.sidebar.sidebar-collapsed .nav-item {
  justify-content: center;
  padding: 12px 0;
  gap: 0;
  margin: 0 4px 5px 4px;
}

.sidebar.sidebar-collapsed .nav-item i {
  margin: 0;
  font-size: 22px;
}

.sidebar.sidebar-collapsed .nav-item span {
  display: none;
}

.sidebar.sidebar-collapsed .sidebar-footer {
  padding: 12px 0;
  display: flex;
  justify-content: center;
}

.sidebar.sidebar-collapsed .logout-btn {
  justify-content: center;
  gap: 0;
  padding: 10px 0;
}

.sidebar.sidebar-collapsed .logout-btn span {
  display: none;
}

.sidebar-header {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: var(--primary-dark);
}

.logo h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: white;
}

.logo span {
  font-size: 24px;
  font-weight: bold;
  color: white;
}

.toggle-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s ease;
  gap: 15px;
  margin: 0 10px;
  border-radius: 8px;
  margin-bottom: 5px;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateX(5px);
}

/* Desactivar translateX cuando la sidebar está colapsada */
.sidebar.sidebar-collapsed .nav-item:hover {
  transform: none;
}

.nav-item.active {
  background: var(--accent);
  color: white;
  box-shadow: 0 2px 8px rgba(6, 214, 160, 0.3);
}

.nav-item i {
  font-size: 20px;
  min-width: 20px;
}

.nav-item span {
  font-size: 14px;
  font-weight: 500;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: var(--primary-dark);
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 15px;
  background: #ef4444;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.logout-btn i {
  font-size: 18px;
}

/* Scrollbar personalizada para el sidebar */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    transform: translateX(-100%);
  }

  .sidebar-collapsed {
    transform: translateX(0);
  }
}

/* ===== MODO OSCURO ===== */
#theme-dark .sidebar {
  background: #23262f;
  color: #f1f1f1;
  box-shadow: 2px 0 8px rgba(79, 140, 255, 0.1);
}
#theme-dark .sidebar-header {
  background: #1a1d23;
  border-bottom: 1px solid #26334d;
}
#theme-dark .logo h2,
#theme-dark .logo span {
  color: #f1f1f1;
}
#theme-dark .toggle-btn {
  color: #f1f1f1;
}
#theme-dark .toggle-btn:hover {
  background: rgba(79, 140, 255, 0.1);
}
#theme-dark .sidebar-nav {
  background: transparent;
}
#theme-dark .nav-item {
  color: #b0b3b8;
  background: transparent;
}
#theme-dark .nav-item:hover {
  background: rgba(79, 140, 255, 0.1);
  color: #4f8cff;
}
#theme-dark .nav-item.active {
  background: #4f8cff;
  color: #181a20;
  box-shadow: 0 2px 8px rgba(79, 140, 255, 0.15);
}
#theme-dark .sidebar-footer {
  background: #1a1d23;
  border-top: 1px solid #26334d;
}
#theme-dark .logout-btn {
  background: #f87171;
  color: #181a20;
}
#theme-dark .logout-btn:hover {
  background: #dc2626;
  color: #fff;
  box-shadow: 0 4px 12px rgba(248, 113, 113, 0.18);
}
#theme-dark .sidebar-nav::-webkit-scrollbar-track {
  background: rgba(79, 140, 255, 0.05);
}
#theme-dark .sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(79, 140, 255, 0.18);
}
#theme-dark .sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(79, 140, 255, 0.28);
}
</style>
