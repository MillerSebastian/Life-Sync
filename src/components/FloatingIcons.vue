<template>
  <div class="floating-icons-container" :class="viewType">
    <!-- Iconos flotantes con diferentes animaciones -->
    <div class="floating-icon icon-1">
      <i class="bx bx-home"></i>
    </div>
    <div class="floating-icon icon-2">
      <i class="bx bx-chart"></i>
    </div>
    <div class="floating-icon icon-3">
      <i class="bx bx-calendar"></i>
    </div>
    <div class="floating-icon icon-4">
      <i class="bx bx-task"></i>
    </div>
    <div class="floating-icon icon-5">
      <i class="bx bx-wallet"></i>
    </div>
    <div class="floating-icon icon-6">
      <i class="bx bx-restaurant"></i>
    </div>
    <div class="floating-icon icon-7">
      <i class="bx bx-message-square"></i>
    </div>
    <div class="floating-icon icon-8">
      <i class="bx bx-brain"></i>
    </div>
    <div class="floating-icon icon-9">
      <i class="bx bx-user"></i>
    </div>
    <div class="floating-icon icon-10">
      <i class="bx bx-bell"></i>
    </div>
    <div class="floating-icon icon-11">
      <i class="bx bx-heart"></i>
    </div>
    <div class="floating-icon icon-12">
      <i class="bx bx-star"></i>
    </div>
    <div class="floating-icon icon-13">
      <i class="bx bx-trending-up"></i>
    </div>
    <div class="floating-icon icon-14">
      <i class="bx bx-cog"></i>
    </div>
    <div class="floating-icon icon-15">
      <i class="bx bx-bulb"></i>
    </div>
    <div class="floating-icon icon-16">
      <i class="bx bx-rocket"></i>
    </div>
  </div>
</template>

<script setup>
// Props para personalizar según la vista
const props = defineProps({
  viewType: {
    type: String,
    default: "dashboard",
    validator: (value) =>
      [
        "dashboard",
        "tasks",
        "calendar",
        "wallet",
        "meals",
        "chat",
        "iachat",
        "login",
      ].includes(value),
  },
});

// Debug: ver qué viewType se está recibiendo
</script>

<style scoped>
.floating-icons-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0; /* Cambiar a 0 para estar detrás del contenido */
  overflow: hidden;
}

.floating-icon {
  position: absolute;
  color: rgba(30, 58, 138, 0.4); /* Más visible para debug */
  font-size: 2.5rem; /* Tamaño más equilibrado */
  animation: float 6s ease-in-out infinite;
  opacity: 0.6; /* Más opaco para debug */
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2)); /* Sombra más visible */
  text-shadow: 0 0 10px rgba(30, 58, 138, 0.3); /* Brillo más visible */
}

.floating-icon:hover {
  opacity: 1; /* Completamente opaco al hover */
  transform: scale(1.3);
  color: rgba(30, 58, 138, 0.8);
  text-shadow: 0 0 20px rgba(30, 58, 138, 0.5);
}

/* Efecto de pulso sutil */
.floating-icon::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    circle,
    rgba(30, 58, 138, 0.1) 0%,
    transparent 70%
  );
  transform: translate(-50%, -50%);
  border-radius: 50%;
  animation: pulse 4s ease-in-out infinite;
  z-index: -1;
}

@keyframes pulse {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.1;
  }
}

/* Posiciones y animaciones específicas para cada icono - MEJOR SEPARADOS */
.icon-1 {
  top: 10%;
  left: 5%;
  animation-duration: 8s;
}

.icon-2 {
  top: 15%;
  right: 8%;
  animation-duration: 7s;
}

.icon-3 {
  top: 25%;
  left: 50%;
  transform: translateX(-50%);
  animation-duration: 9s;
}

.icon-4 {
  top: 20%;
  right: 25%;
  animation-duration: 6s;
}

.icon-5 {
  top: 35%;
  left: 15%;
  animation-duration: 8s;
}

.icon-6 {
  top: 30%;
  right: 15%;
  animation-duration: 7s;
}

.icon-7 {
  top: 45%;
  left: 8%;
  animation-duration: 9s;
}

.icon-8 {
  top: 40%;
  right: 35%;
  animation-duration: 6s;
}

.icon-9 {
  top: 55%;
  left: 50%;
  transform: translateX(-50%);
  animation-duration: 8s;
}

.icon-10 {
  top: 50%;
  right: 8%;
  animation-duration: 7s;
}

.icon-11 {
  top: 65%;
  left: 25%;
  animation-duration: 9s;
}

.icon-12 {
  top: 60%;
  right: 20%;
  animation-duration: 6s;
}

.icon-13 {
  top: 75%;
  left: 12%;
  animation-duration: 8s;
}

.icon-14 {
  top: 70%;
  right: 30%;
  animation-duration: 7s;
}

.icon-15 {
  top: 85%;
  left: 50%;
  transform: translateX(-50%);
  animation-duration: 9s;
}

.icon-16 {
  top: 80%;
  right: 12%;
  animation-duration: 6s;
}

/* Animación de flotación - SIN DELAYS para que esté siempre activa */
@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-20px) rotate(3deg);
  }
  50% {
    transform: translateY(-10px) rotate(-2deg);
  }
  75% {
    transform: translateY(-15px) rotate(1deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .floating-icon {
    font-size: 2rem;
  }

  /* Iconos más grandes para login en móviles */
  .floating-icons-container.login .floating-icon {
    font-size: 2.8rem;
  }

  /* Ajustar posiciones para móviles - distribuidos por toda la pantalla */
  .icon-1 {
    top: 8%;
    left: 5%;
  }
  .icon-2 {
    top: 12%;
    right: 8%;
  }
  .icon-3 {
    top: 20%;
    left: 50%;
    transform: translateX(-50%);
  }
  .icon-4 {
    top: 18%;
    right: 20%;
  }
  .icon-5 {
    top: 30%;
    left: 12%;
  }
  .icon-6 {
    top: 28%;
    right: 15%;
  }
  .icon-7 {
    top: 40%;
    left: 8%;
  }
  .icon-8 {
    top: 35%;
    right: 30%;
  }
  .icon-9 {
    top: 50%;
    left: 50%;
    transform: translateX(-50%);
  }
  .icon-10 {
    top: 45%;
    right: 10%;
  }
  .icon-11 {
    top: 60%;
    left: 20%;
  }
  .icon-12 {
    top: 55%;
    right: 18%;
  }
  .icon-13 {
    top: 70%;
    left: 10%;
  }
  .icon-14 {
    top: 65%;
    right: 25%;
  }
  .icon-15 {
    top: 80%;
    left: 50%;
    transform: translateX(-50%);
  }
  .icon-16 {
    top: 75%;
    right: 12%;
  }
}

/* Modo oscuro - iconos más visibles */
#theme-dark .floating-icon {
  color: rgba(79, 140, 255, 0.5); /* Más visible en modo oscuro */
  filter: drop-shadow(0 2px 8px rgba(79, 140, 255, 0.4));
  text-shadow: 0 0 15px rgba(79, 140, 255, 0.4);
}

#theme-dark .floating-icon:hover {
  color: rgba(79, 140, 255, 0.9);
  filter: drop-shadow(0 4px 12px rgba(79, 140, 255, 0.6));
  text-shadow: 0 0 25px rgba(79, 140, 255, 0.6);
}

#theme-dark .floating-icon::before {
  background: radial-gradient(
    circle,
    rgba(79, 140, 255, 0.15) 0%,
    transparent 70%
  );
}

/* Efectos específicos para diferentes vistas */
.floating-icons-container.dashboard .floating-icon {
  color: rgba(30, 58, 138, 0.4);
}

.floating-icons-container.tasks .floating-icon {
  color: rgba(6, 214, 160, 0.4);
}

.floating-icons-container.calendar .floating-icon {
  color: rgba(251, 191, 36, 0.4);
}

.floating-icons-container.wallet .floating-icon {
  color: rgba(34, 197, 94, 0.4);
}

.floating-icons-container.meals .floating-icon {
  color: rgba(239, 68, 68, 0.4);
}

.floating-icons-container.chat .floating-icon {
  color: rgba(99, 102, 241, 0.4);
}

.floating-icons-container.iachat .floating-icon {
  color: rgba(168, 85, 247, 0.4);
}

.floating-icons-container.login .floating-icon {
  color: rgba(255, 159, 67, 0.4); /* Naranja */
  font-size: 3.5rem; /* Iconos más grandes para login */
}

.floating-icons-container.login .floating-icon:hover {
  opacity: 1;
  transform: scale(1.4); /* Hover más grande para login */
  color: rgba(255, 159, 67, 0.8);
  text-shadow: 0 0 25px rgba(255, 159, 67, 0.6);
}

.floating-icons-container.login .floating-icon:nth-child(1) {
  color: rgba(255, 99, 132, 0.5); /* Rosa */
}
.floating-icons-container.login .floating-icon:nth-child(2) {
  color: rgba(54, 162, 235, 0.5); /* Azul */
}
.floating-icons-container.login .floating-icon:nth-child(3) {
  color: rgba(255, 205, 86, 0.5); /* Amarillo */
}
.floating-icons-container.login .floating-icon:nth-child(4) {
  color: rgba(75, 192, 192, 0.5); /* Verde azulado */
}
.floating-icons-container.login .floating-icon:nth-child(5) {
  color: rgba(153, 102, 255, 0.5); /* Púrpura */
}
.floating-icons-container.login .floating-icon:nth-child(6) {
  color: rgba(255, 159, 67, 0.5); /* Naranja */
}
.floating-icons-container.login .floating-icon:nth-child(7) {
  color: rgba(255, 99, 132, 0.5); /* Rosa */
}
.floating-icons-container.login .floating-icon:nth-child(8) {
  color: rgba(54, 162, 235, 0.5); /* Azul */
}
.floating-icons-container.login .floating-icon:nth-child(9) {
  color: rgba(255, 205, 86, 0.5); /* Amarillo */
}
.floating-icons-container.login .floating-icon:nth-child(10) {
  color: rgba(75, 192, 192, 0.5); /* Verde azulado */
}
.floating-icons-container.login .floating-icon:nth-child(11) {
  color: rgba(153, 102, 255, 0.5); /* Púrpura */
}
.floating-icons-container.login .floating-icon:nth-child(12) {
  color: rgba(255, 159, 67, 0.5); /* Naranja */
}
.floating-icons-container.login .floating-icon:nth-child(13) {
  color: rgba(255, 99, 132, 0.5); /* Rosa */
}
.floating-icons-container.login .floating-icon:nth-child(14) {
  color: rgba(54, 162, 235, 0.5); /* Azul */
}
.floating-icons-container.login .floating-icon:nth-child(15) {
  color: rgba(255, 205, 86, 0.5); /* Amarillo */
}
.floating-icons-container.login .floating-icon:nth-child(16) {
  color: rgba(75, 192, 192, 0.5); /* Verde azulado */
}

/* Modo oscuro con colores específicos */
#theme-dark .floating-icons-container.dashboard .floating-icon {
  color: rgba(79, 140, 255, 0.5);
}

#theme-dark .floating-icons-container.tasks .floating-icon {
  color: rgba(6, 214, 160, 0.5);
}

#theme-dark .floating-icons-container.calendar .floating-icon {
  color: rgba(251, 191, 36, 0.5);
}

#theme-dark .floating-icons-container.wallet .floating-icon {
  color: rgba(34, 197, 94, 0.5);
}

#theme-dark .floating-icons-container.meals .floating-icon {
  color: rgba(239, 68, 68, 0.5);
}

#theme-dark .floating-icons-container.chat .floating-icon {
  color: rgba(99, 102, 241, 0.5);
}

#theme-dark .floating-icons-container.iachat .floating-icon {
  color: rgba(168, 85, 247, 0.5);
}

#theme-dark .floating-icons-container.login .floating-icon {
  color: rgba(255, 159, 67, 0.5); /* Naranja */
}

#theme-dark .floating-icons-container.login .floating-icon:nth-child(1) {
  color: rgba(255, 99, 132, 0.7); /* Rosa */
}
#theme-dark .floating-icons-container.login .floating-icon:nth-child(2) {
  color: rgba(54, 162, 235, 0.7); /* Azul */
}
#theme-dark .floating-icons-container.login .floating-icon:nth-child(3) {
  color: rgba(255, 205, 86, 0.7); /* Amarillo */
}
#theme-dark .floating-icons-container.login .floating-icon:nth-child(4) {
  color: rgba(75, 192, 192, 0.7); /* Verde azulado */
}
#theme-dark .floating-icons-container.login .floating-icon:nth-child(5) {
  color: rgba(153, 102, 255, 0.7); /* Púrpura */
}
#theme-dark .floating-icons-container.login .floating-icon:nth-child(6) {
  color: rgba(255, 159, 67, 0.7); /* Naranja */
}
#theme-dark .floating-icons-container.login .floating-icon:nth-child(7) {
  color: rgba(255, 99, 132, 0.7); /* Rosa */
}
#theme-dark .floating-icons-container.login .floating-icon:nth-child(8) {
  color: rgba(54, 162, 235, 0.7); /* Azul */
}
#theme-dark .floating-icons-container.login .floating-icon:nth-child(9) {
  color: rgba(255, 205, 86, 0.7); /* Amarillo */
}
#theme-dark .floating-icons-container.login .floating-icon:nth-child(10) {
  color: rgba(75, 192, 192, 0.7); /* Verde azulado */
}
#theme-dark .floating-icons-container.login .floating-icon:nth-child(11) {
  color: rgba(153, 102, 255, 0.7); /* Púrpura */
}
#theme-dark .floating-icons-container.login .floating-icon:nth-child(12) {
  color: rgba(255, 159, 67, 0.7); /* Naranja */
}
#theme-dark .floating-icons-container.login .floating-icon:nth-child(13) {
  color: rgba(255, 99, 132, 0.7); /* Rosa */
}
#theme-dark .floating-icons-container.login .floating-icon:nth-child(14) {
  color: rgba(54, 162, 235, 0.7); /* Azul */
}
#theme-dark .floating-icons-container.login .floating-icon:nth-child(15) {
  color: rgba(255, 205, 86, 0.7); /* Amarillo */
}
#theme-dark .floating-icons-container.login .floating-icon:nth-child(16) {
  color: rgba(75, 192, 192, 0.7); /* Verde azulado */
}
</style>
