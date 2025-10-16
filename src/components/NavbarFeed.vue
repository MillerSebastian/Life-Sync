<template>
  <nav class="navbar-feed">
    <div class="navbar-feed-left">
      <span class="navbar-feed-user">
        <i class="bx bx-user"></i>
        {{ user.name }}
      </span>
    </div>
    <div class="navbar-feed-center">
      <span class="navbar-feed-title">Comunidad</span>
    </div>
    <div class="navbar-feed-right">
      <button class="navbar-feed-btn" @click="$emit('go-back')">
        <i class="bx bx-arrow-back"></i> <span class="hide-mobile">Volver</span>
      </button>
      <button class="navbar-feed-btn">
        <i class="bx bx-bell"></i>
      </button>
    </div>
  </nav>
</template>

<script setup>
const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
.navbar-feed {
  width: 100vw;
  background: var(--primary, #6366f1);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}
.navbar-feed-left, .navbar-feed-center, .navbar-feed-right {
  display: flex;
  align-items: center;
}
.navbar-feed-user {
  font-weight: 600;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.navbar-feed-title {
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: 1px;
  margin: 0 1.5rem;
}
.navbar-feed-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  margin-left: 1rem;
  cursor: pointer;
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.navbar-feed-btn:hover {
  background: rgba(255,255,255,0.12);
}
.hide-mobile {
  display: inline;
}
@media (max-width: 600px) {
  .navbar-feed {
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem;
  }
  .navbar-feed-title {
    margin: 0.5rem 0;
  }
  .hide-mobile {
    display: none;
  }
}
</style> 