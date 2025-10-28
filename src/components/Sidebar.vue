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
      <template v-for="item in menuItems" :key="item.path || item.name">
        <router-link
          v-if="!item.disabled"
          :to="item.path"
          class="nav-item"
          :class="{ active: $route.path === item.path }"
        >
          <i :class="item.icon"></i>
          <span v-if="!isCollapsed">{{ item.name }}</span>
        </router-link>
        <div
          v-else
          class="nav-item disabled has-tooltip"
          :data-tooltip="item.tooltip || 'Coming soon'"
          aria-disabled="true"
          @click.prevent
        >
          <i :class="item.icon"></i>
          <span v-if="!isCollapsed">{{ item.name }}</span>
        </div>
      </template>

      <!-- Submenú Comunidad -->
      <div v-if="isCommunity" class="nav-submenu" :class="{ collapsed: isCollapsed }">
        <router-link to="/feed" class="nav-subitem" :class="{ active: $route.path === '/feed' }">
          <i class="bx bx-news"></i>
          <span v-if="!isCollapsed">Feed</span>
        </router-link>
        <router-link to="/chat" class="nav-subitem" :class="{ active: $route.path === '/chat' }">
          <i class="bx bx-chat"></i>
          <span v-if="!isCollapsed">Chats</span>
        </router-link>
        <router-link to="/friends" class="nav-subitem" :class="{ active: $route.path === '/friends' }">
          <i class="bx bx-user-check"></i>
          <span v-if="!isCollapsed">Amigos</span>
        </router-link>
      </div>
    </nav>
    <div class="sidebar-footer" :class="{ expanded: footerExpanded }">
      <button class="footer-toggle" @click="toggleFooter">
        <i class="bx" :class="footerExpanded ? 'bx-chevron-down' : 'bx-chevron-up'"></i>
        <span v-if="!isCollapsed">Acerca de</span>
      </button>
      <div class="footer-content" v-show="footerExpanded">
        <div class="footer-section">
          <div class="footer-title" v-if="!isCollapsed">LifeSync Team</div>
          
        </div>
        <div class="footer-actions">
          <button class="footer-btn"><i class="bx bx-info-circle"></i><span v-if="!isCollapsed">Sobre</span></button>
          <button class="footer-btn"><i class="bx bx-help-circle"></i><span v-if="!isCollapsed">Soporte</span></button>
        </div>
      </div>
    </div>
  </div>
  <div
    class="sidebar-global-footer"
    v-show="footerExpanded"
    :style="{
      left: isCollapsed ? '70px' : '220px',
      width: `calc(100% - ${isCollapsed ? 70 : 220}px)`
    }"
  >
    <div class="sgf-inner">
      <div class="sgf-left">
        <span>Creado por&nbsp;<strong>Sebastian Rodelo</strong></span>
        <span>|</span>
        <a class="sgf-atomic" href="https://atomiclabs.up.railway.app/" target="_blank" rel="noopener noreferrer">con apoyo de&nbsp;<strong>AtomicLabs</strong></a>
        <span>|</span>
        <span>hecho con Vue, Tailwind y&nbsp;<i class='bx bx-heart'></i></span>
        <span>|</span>
        <span>v1.01 Beta</span>
      </div>
      <div class="sgf-actions">
        <a href="https://github.com/MillerSebastian" class="sgf-btn" target="_blank" rel="noopener noreferrer">
          <i class='bx bxl-github'></i>
          <span>GitHub</span>
        </a>
        <a href="https://www.linkedin.com/in/sebastian-rodelo-139696266/" class="sgf-btn" target="_blank" rel="noopener noreferrer">
          <i class='bx bxl-linkedin-square'></i>
          <span>LinkedIn</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const isCollapsed = ref(false);
const footerExpanded = ref(false);
const links = ref({
  github: "#",
  linkedin: "#",
});

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
    name: "Music",
    path: "/music",
    icon: "bx bx-music",
  },
  {
    path: "chatIA",
    name: "Lisy IA",
    icon: "bx bx-chat",
    disabled: true,
    tooltip: "Coming soon",
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

const toggleFooter = () => {
  footerExpanded.value = !footerExpanded.value;
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

// Mostrar submenú cuando la ruta pertenezca a comunidad
const isCommunity = computed(() => {
  const p = router.currentRoute.value.path;
  return p === "/feed" || p === "/chat" || p === "/friends";
});
</script>

<style scoped>
.sidebar {
  width: 220px;
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

/* Estado deshabilitado con tooltip visible */
.nav-item.disabled {
  cursor: not-allowed;
  opacity: 0.7;
}
.has-tooltip {
  position: relative;
}
.has-tooltip::after {
  content: attr(data-tooltip);
  position: absolute;
  left: 50%;
  top: 0;
  transform: translate(-50%, -110%);
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
  z-index: 2000;
}
.has-tooltip::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  transform: translate(-50%, -4px);
  border-width: 6px;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.85) transparent transparent transparent;
  opacity: 0;
  transition: opacity 0.15s ease;
  z-index: 1999;
}
.has-tooltip:hover::after {
  opacity: 1;
}
.has-tooltip:hover::before {
  opacity: 1;
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

/* Submenú Comunidad */
.nav-submenu {
  margin-top: 8px;
  padding-left: 12px;
}
.nav-submenu.collapsed {
  padding-left: 0;
}
.nav-subitem {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  border-radius: 8px;
  margin: 0 10px 5px 10px;
}
.nav-subitem:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}
.nav-subitem.active {
  background: var(--accent);
  color: #fff;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: var(--primary-dark);
}

.footer-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  border: none;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
}

.footer-toggle:hover {
  background: rgba(255, 255, 255, 0.14);
}

.footer-content {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.footer-title {
  font-weight: 600;
  color: #fff;
}

.footer-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
}

.footer-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.footer-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  border: none;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
}

.footer-btn i {
  font-size: 18px;
}

.footer-btn:hover {
  background: rgba(255, 255, 255, 0.16);
}

.sidebar.sidebar-collapsed .footer-actions {
  grid-template-columns: repeat(3, 36px);
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

/* Footer global desplegable */
.sidebar-global-footer {
  position: fixed;
  right: 0;
  bottom: 0;
  background: var(--background);
  border-top: 1px solid var(--border);
  box-shadow: 0 -2px 12px var(--shadow);
  z-index: 900;
  transition: left 0.3s ease;
}

.sgf-inner {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  padding: 0 16px;
  height: 52px;
  flex-wrap: wrap;
}

.sgf-left {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  color: var(--text);
  font-size: 14px;
}

.sgf-left span,
.sgf-left a {
  display: inline-flex;
  align-items: center;
  height: 24px;
}

.sgf-left i {
  color: #ef4444;
}

.sgf-atomic {
  color: #10b981;
  font-weight: 700;
  text-decoration: none;
}

.sgf-atomic:hover {
  text-decoration: underline;
}

.sgf-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 16px;
}

.sgf-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 6px 10px;
  border-radius: 8px;
  background: var(--background-secondary);
  color: var(--text);
  text-decoration: none;
  border: 1px solid var(--border);
  font-size: 13px;
}

.sgf-btn:hover {
  filter: brightness(0.98);
}

.sgf-btn i {
  font-size: 18px;
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
#theme-dark .has-tooltip::after {
  background: rgba(0, 0, 0, 0.92);
  color: #fff;
}
#theme-dark .has-tooltip::before {
  border-color: rgba(0, 0, 0, 0.92) transparent transparent transparent;
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
