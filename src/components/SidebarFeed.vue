<template>
  <aside class="feed-sidebar" :class="{ collapsed: isSidebarCollapsed }">
    <div class="sidebar-header">
      <h2 v-if="!isSidebarCollapsed">Comunidad</h2>
      <span v-else>CM</span>
      <button class="toggle-btn" @click="$emit('toggle-sidebar')">
        <i
          class="bx"
          :class="isSidebarCollapsed ? 'bx-menu' : 'bx-menu-alt-left'"
        ></i>
      </button>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-section">MENÚ</div>
      <div
        class="nav-item"
        :class="{ active: activeSection === 'feed' }"
        @click="$emit('update:activeSection', 'feed')"
      >
        <i class="bx bx-group"></i>
        <span v-if="!isSidebarCollapsed">Comunidad</span>
      </div>
      <div
        class="nav-item"
        :class="{ active: activeSection === 'chat' }"
        @click="$emit('update:activeSection', 'chat')"
      >
        <i class="bx bx-chat"></i>
        <span v-if="!isSidebarCollapsed">Chats</span>
      </div>
      <div
        class="nav-item"
        :class="{ active: activeSection === 'friends' }"
        @click="$emit('update:activeSection', 'friends')"
      >
        <i class="bx bx-user-check"></i>
        <span v-if="!isSidebarCollapsed">Amigos</span>
        <span
          v-if="!isSidebarCollapsed && pendingRequestsCount > 0"
          class="pending-badge"
        >
          {{ pendingRequestsCount }}
        </span>
      </div>
    </nav>
    <div class="user-profile">
      <div class="avatar">
        <img :src="user.avatar" alt="avatar" />
      </div>
      <div class="user-info">
        <div class="user-name">{{ user.name }}</div>
        <div class="user-email">{{ user.email || "" }}</div>
      </div>
    </div>
  </aside>
</template>

<script setup>
const props = defineProps({
  user: { type: Object, required: true },
  isSidebarCollapsed: { type: Boolean, default: false },
  activeSection: { type: String, default: "feed" },
  pendingRequestsCount: { type: Number, default: 0 },
});
</script>

<style scoped>
.feed-sidebar {
  width: 300px;
  min-width: 70px;
  max-width: 300px;
  background: linear-gradient(180deg, #6366f1 0%, #553c9a 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.4, 2, 0.6, 1);
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 10;
  height: 92.5vh;
  max-height: 100dvh;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: 0;
  padding: 0;
}
.feed-sidebar.collapsed {
  width: 70px;
  min-width: 70px;
  max-width: 70px;
  transition: width 0.3s cubic-bezier(0.4, 2, 0.6, 1);
}
.feed-sidebar.collapsed .sidebar-header {
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 6em;
  padding: 20px 8px 0 8px;
}
.feed-sidebar.collapsed .sidebar-header h2,
.feed-sidebar.collapsed .sidebar-header span {
  text-align: center;
  width: 100%;
}
.feed-sidebar.collapsed .toggle-btn {
  margin: 10px auto 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
}
.feed-sidebar.collapsed .nav-item span {
  display: none;
}
.feed-sidebar.collapsed .nav-item {
  justify-content: center;
  align-items: center;
  display: flex;
  padding: 18px 0;
  margin: 0 auto 5px auto;
  width: 100%;
}
.feed-sidebar.collapsed .nav-item i {
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  font-size: 24px;
}
.feed-sidebar.collapsed .nav-section {
  text-align: center;
  width: 100%;
  font-size: 0.7rem;
  margin-left: 0;
  margin-bottom: 10px;
  letter-spacing: 1px;
}
.feed-sidebar.collapsed .user-profile {
  flex-direction: column;
  align-items: center;
  left: 0;
  padding: 10px 0;
}
.feed-sidebar.collapsed .user-info {
  display: none;
}
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 0 20px;
  background: #4338ca;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  height: 6em;
}
.toggle-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s;
}
.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}
.sidebar-nav {
  padding: 24px 0 0 0;
  flex: 1;
}
.nav-section {
  font-size: 0.8rem;
  font-weight: 700;
  color: #b3b3ff;
  margin-left: 24px;
  margin-bottom: 10px;
  letter-spacing: 1px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 14px 20px;
  border-radius: 8px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 10px 5px 10px;
  transition: background 0.2s, color 0.2s;
  position: relative;
}
.nav-item.active,
.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}
.nav-item i {
  font-size: 20px;
}

.nav-item {
  position: relative;
}

.pending-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.feed-sidebar.collapsed .pending-badge {
  display: none;
}

.user-profile {
  margin-top: 24px;
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 16px;
  position: relative;
  left: 0.5em;
}
.avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(45deg, #ff6b6b, #feca57);
  border-radius: 50%;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  overflow: hidden;
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
.user-info {
  flex: 1;
}
.user-name {
  color: white;
  font-weight: 500;
  font-size: 14px;
}
.user-email {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}
#theme-dark .feed-sidebar {
  background: linear-gradient(180deg, #23262f 0%, #181a20 100%) !important;
  color: #f1f1f1;
  box-shadow: 2px 0 20px rgba(79, 140, 255, 0.1);
  border-right: 1.5px solid #26334d;
}
#theme-dark .sidebar-header {
  background: #1a1d23 !important;
  border-bottom: 1px solid #26334d;
}
#theme-dark .toggle-btn {
  color: #a3c8ff;
}
#theme-dark .toggle-btn:hover {
  background: rgba(79, 140, 255, 0.1);
}
#theme-dark .nav-item {
  color: #b0b3b8 !important;
  background: transparent !important;
}
#theme-dark .nav-item.active,
#theme-dark .nav-item:hover {
  background: rgba(79, 140, 255, 0.1) !important;
  color: #4f8cff !important;
}
#theme-dark .user-profile {
  border-top: 1px solid #26334d;
  border-bottom: 1px solid #26334d;
}
#theme-dark .avatar {
  background: linear-gradient(45deg, #4f8cff, #06d6a0) !important;
}
#theme-dark .user-name {
  color: #a3c8ff !important;
}
#theme-dark .user-email {
  color: #85c1e9 !important;
}
</style>
