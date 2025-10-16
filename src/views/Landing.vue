<template>
  <div class="landing-container">
    <section
      v-for="(section, i) in sections"
      :key="section.title"
      class="landing-section"
      :class="{ 'is-visible': visibleSections[i] }"
      :style="{ background: section.bg }"
      :ref="(el) => (sectionRefs[i] = el)"
    >
      <div class="section-content">
        <div class="icon" :style="{ color: section.color }">
          <i :class="section.icon"></i>
        </div>
        <h1>{{ section.title }}</h1>
        <p>{{ section.desc }}</p>
        <!-- Botón de login solo en la última sección -->
        <button
          v-if="i === sections.length - 1"
          class="btn-login"
          @click="goToLogin"
        >
          Iniciar sesión
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const sections = [
  {
    title: "Calendar",
    desc: "Organiza tus eventos y nunca olvides una cita importante.",
    icon: "bx bx-calendar",
    color: "#6366f1",
    bg: "linear-gradient(135deg, #e0e7ff 0%, #6366f1 100%)",
  },
  {
    title: "Tasks",
    desc: "Gestiona tus tareas y mantente productivo cada día.",
    icon: "bx bx-task",
    color: "#06d6a0",
    bg: "linear-gradient(135deg, #f1f8e9 0%, #06d6a0 100%)",
  },
  {
    title: "Meals",
    desc: "Planifica tus comidas y lleva un registro saludable.",
    icon: "bx bx-bowl-hot",
    color: "#f59e42",
    bg: "linear-gradient(135deg, #fffbe7 0%, #f59e42 100%)",
  },
  {
    title: "Wallet",
    desc: "Controla tus finanzas personales de forma sencilla.",
    icon: "bx bx-wallet",
    color: "#4f8cff",
    bg: "linear-gradient(135deg, #e0f7fa 0%, #4f8cff 100%)",
  },
  {
    title: "Feed",
    desc: "Comparte y descubre novedades con tus amigos.",
    icon: "bx bx-news",
    color: "#ef4444",
    bg: "linear-gradient(135deg, #ffe0e0 0%, #ef4444 100%)",
  },
  {
    title: "IAchat",
    desc: "Habla con tu asistente inteligente y resuelve tus dudas.",
    icon: "bx bx-bot",
    color: "#8b5cf6",
    bg: "linear-gradient(135deg, #ede9fe 0%, #8b5cf6 100%)",
  },
  {
    title: "Comunidad Sync",
    desc: "Únete a la comunidad, comparte, aprende y crece con otros usuarios.",
    icon: "bx bx-group",
    color: "#06b6d4",
    bg: "linear-gradient(135deg, #e0f2fe 0%, #06b6d4 100%)",
  },
];

const sectionRefs = ref([]);
const visibleSections = ref(Array(sections.length).fill(false));

const handleScroll = () => {
  sectionRefs.value.forEach((el, i) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.8) {
      visibleSections.value[i] = true;
    }
  });
};

onMounted(async () => {
  await nextTick();
  window.addEventListener("scroll", handleScroll);
  handleScroll();
});

const goToLogin = () => {
  router.push("/login");
};
</script>

<style scoped>
.landing-container {
  width: 100vw;
  background: #f8fafc;
  display: block;
}
.landing-section {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translateY(60px) scale(0.98);
  transition: opacity 0.8s cubic-bezier(0.4, 2, 0.3, 1),
    transform 0.8s cubic-bezier(0.4, 2, 0.3, 1);
}
.landing-section.is-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.section-content {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 32px;
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.08);
  padding: 3rem 2.5rem;
  max-width: 480px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.section-content .icon {
  font-size: 4.5rem;
  margin-bottom: 1.5rem;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.08));
}
.section-content h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  letter-spacing: -1px;
}
.section-content p {
  font-size: 1.25rem;
  color: #374151;
  margin-bottom: 0;
}
.btn-login {
  margin-top: 2.5rem;
  background: linear-gradient(90deg, #6366f1 0%, #06d6a0 100%);
  color: #fff;
  font-size: 1.3rem;
  font-weight: 700;
  padding: 1.1rem 3.5rem;
  border: none;
  border-radius: 999px;
  box-shadow: 0 4px 24px rgba(99, 102, 241, 0.13);
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}
.btn-login:hover {
  background: linear-gradient(90deg, #06d6a0 0%, #6366f1 100%);
  transform: scale(1.05);
}
@media (max-width: 600px) {
  .section-content {
    padding: 2rem 1rem;
    max-width: 95vw;
  }
  .section-content h1 {
    font-size: 2rem;
  }
  .section-content .icon {
    font-size: 3rem;
  }
}
</style>

<!--
Recomendado: agrega esto en src/assets/base.css o en tu CSS global para asegurar scroll en todo el sitio:
html, body {
  height: 100%;
  min-height: 100%;
  width: 100%;
  overflow-x: hidden;
  background: #f8fafc;
}
-->
