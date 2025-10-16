<script setup>
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <RouterView />
</template>

<style>
@import url("https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css");
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");
</style>

<style>
@import url("https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css");
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");
/** 
CSS para Theme Light
*/
:root {
  /* ===== PALETA AZUL MARINO ===== */
  --navy-deep: #0f172a;
  --navy-classic: #1e3a8a;
  --navy-vibrant: #3b82f6;
  --navy-light: #60a5fa;
  --navy-pastel: #93c5fd;
  --navy-very-light: #e0e7ff;
  --navy-ice: #f1f5f9;
  
  /* ===== COLORES PRINCIPALES ===== */
  --primary: #1e3a8a;
  --primary-light: #3b82f6;
  --primary-dark: #0f172a;
  
  --secondary: #64748b;
  --secondary-light: #94a3b8;
  
  --accent: #06d6a0;
  --accent-light: #34d399;
  
  --warning: #fbbf24;
  --warning-light: #fcd34d;
  
  /* ===== COLORES DE FONDO ===== */
  --background: #ffffff;
  --background-secondary: #f1f5f9;
  --background-navy: #e0e7ff;
  
  /* ===== COLORES DE TEXTO ===== */
  --text: #0f172a;
  --text-secondary: #1e3a8a;
  --text-light: #60a5fa;
  
  /* ===== COLORES DE INTERFAZ ===== */
  --border: #93c5fd;
  --border-light: #e0e7ff;
  
  /* ===== SOMBRAS ===== */
  --shadow: rgba(30, 58, 138, 0.1);
  --shadow-hover: rgba(30, 58, 138, 0.2);
  --shadow-navy: rgba(15, 23, 42, 0.15);
}

/**
CSS Para Theme Dark
*/
/* Para el body con id="theme-dark" */
#theme-dark {
  --background: #181A20;
  --background-secondary: #23262F;
  --text: #F1F1F1;
  --text-secondary: #85C1E9;
  --primary: #4F8CFF;
  --primary-dark: #1A4D99;
  --primary-light: #A3C8FF;
  --success: #4ADE80;
  --warning: #FACC15;
  --error: #F87171;
  --border: #26334d; /* Borde sutil, azul oscuro */
  --card-border: #4F8CFF; /* Borde azul para resaltar cards */
  --shadow: rgba(0,0,0,0.4);
  --shadow-hover: rgba(0,0,0,0.6);
  
  /* Cards en modo dark */
  .comment-body{
    background-color: #23262F;
    color: #F1F1F1;
    border-radius: 8px;
    padding: 0.4rem 0.8rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    border: 2px solid #4A90E2;
  }

  .input{
    background-color:#1A2332;
  }
  .input::placeholder{
    color: #4A90E2;
  }
  .input[type="text"]{
    color: white;
  }
  .icon{
    color: #4A90E2;
  }
  .subtitle{
    color: #85C1E9;
  }
  .card {
    background: rgba(35, 38, 47, 0.97); /* Fondo sólido, casi opaco */
    border: 1.5px solid var(--card-border);
    box-shadow: 0 2px 12px var(--shadow);
    color: var(--text);
  }
  .card-header {
    background: rgba(44, 62, 80, 0.98);
    border-bottom: 1px solid var(--card-border);
  }
  .card-content {
    background: transparent;
  }

  .card-header{
    background:#2C3E50;
  }

  .title{
    color: #4A90E2;
  }

  .task-boards>div{
    background-color: #0F1419;
  }

  .card-content{
    background-color: #1A2332;
  }
}

/* Asegurar que las cards en modo claro sigan usando variables */
.card {
  background: var(--background);
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow);
  border: 1px solid var(--border);
  transition: all 0.3s ease;
  color: var(--text);
}

.card:hover {
  box-shadow: 0 4px 16px var(--shadow-hover);
  transform: translateY(-2px);
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.btn-accent {
  background: var(--accent);
  color: white;
}

.btn-accent:hover {
  background: var(--accent-light);
  transform: translateY(-1px);
}

.btn-warning {
  background: var(--warning);
  color: var(--text);
}

.btn-warning:hover {
  background: var(--warning-light);
  transform: translateY(-1px);
}

/* Scrollbar personalizada */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--background-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--secondary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--secondary-light);
}
</style>

<!-- <style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style> -->
