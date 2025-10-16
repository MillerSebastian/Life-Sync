<template>
  <div class="communicate-page">
    <div class="container">
      <!-- Header -->
      <div class="page-header">
        <h1 class="title is-2 text-primary">CommunitySync</h1>
        <p class="subtitle is-6 text-secondary">
          Conecta y colabora con tu equipo
        </p>
      </div>

      <!-- Contenido principal -->
      <div class="content-section">
        <div class="card">
          <div class="card-content">
            <h2 class="title is-4">Bienvenido a la sección de comunicación</h2>
            <p class="subtitle is-6">
              Aquí podrás gestionar tus comunicaciones y colaboraciones.
            </p>
            <div class="features-grid">
              <div class="feature-item">
                <i class="bx bx-message-square-detail"></i>
                <h3>Mensajes</h3>
                <p>Gestiona tus conversaciones</p>
              </div>
              <div class="feature-item">
                <i class="bx bx-group"></i>
                <h3>Equipos</h3>
                <p>Colabora con tu equipo</p>
              </div>
              <div class="feature-item">
                <i class="bx bx-calendar-check"></i>
                <h3>Reuniones</h3>
                <p>Programa y gestiona reuniones</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Grid de publicaciones -->
      <div class="posts-section">
        <h2 class="title is-4 mt-6 mb-3">Publicaciones de la comunidad</h2>
        <div class="posts-grid">
          <div
            class="post-card"
            v-for="post in posts"
            :key="post.id"
            :class="{ 'full-width': post.destacada }"
          >
            <h3 class="post-title">{{ post.titulo }}</h3>
            <p class="post-desc">{{ post.descripcion }}</p>
            <div v-if="post.imagen" class="post-img-wrapper">
              <img :src="post.imagen" alt="Imagen publicación" class="post-img" />
            </div>
            <div class="post-meta">
              <span>Por {{ post.autor }}</span> · <span>{{ post.fecha }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Lógica del componente aquí
import { ref } from 'vue';

// Datos de ejemplo para publicaciones
const posts = ref([
  {
    id: 1,
    titulo: '¡Bienvenidos a la comunidad!',
    descripcion: 'Comparte tus ideas, dudas y logros con todos.',
    autor: 'Admin',
    fecha: '2024-06-01',
    destacada: true,
    imagen: '',
  },
  {
    id: 2,
    titulo: 'Tips de productividad',
    descripcion: '¿Cómo organizas tu día? Comparte tus mejores consejos.',
    autor: 'María',
    fecha: '2024-06-02',
    destacada: false,
    imagen: '',
  },
  {
    id: 3,
    titulo: 'Reunión semanal',
    descripcion: 'No olvides la reunión del viernes a las 10:00.',
    autor: 'Equipo',
    fecha: '2024-06-03',
    destacada: false,
    imagen: '',
  },
  {
    id: 4,
    titulo: '¡Comparte tu progreso!',
    descripcion: 'Cuéntanos qué has logrado esta semana.',
    autor: 'Carlos',
    fecha: '2024-06-04',
    destacada: true,
    imagen: '',
  },
]);
</script>

<style scoped>
.communicate-page {
  padding: 2rem 0;
  min-height: 100vh;
  background: var(--background-secondary);
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.content-section {
  max-width: 800px;
  margin: 0 auto;
}

.card {
  background: var(--background);
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow);
  overflow: hidden;
}

.card-content {
  padding: 2rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.feature-item {
  text-align: center;
  padding: 1.5rem;
  background: var(--background-secondary);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.feature-item i {
  font-size: 2rem;
  color: var(--primary);
  margin-bottom: 1rem;
}

.feature-item h3 {
  margin-bottom: 0.5rem;
  color: var(--text);
}

.feature-item p {
  color: var(--secondary);
  font-size: 0.9rem;
}

/* Grid de publicaciones */
.posts-section {
  margin-top: 2.5rem;
}
.posts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}
.post-card {
  background: var(--background);
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}
.post-card.full-width {
  grid-column: span 2;
}
.post-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.post-desc {
  font-size: 1rem;
  margin-bottom: 1rem;
}
.post-img-wrapper {
  margin-bottom: 1rem;
  text-align: center;
}
.post-img {
  max-width: 100%;
  border-radius: 8px;
}
.post-meta {
  font-size: 0.85rem;
  color: var(--secondary);
  margin-top: 0.5rem;
}
@media (max-width: 900px) {
  .posts-grid {
    grid-template-columns: 1fr;
  }
  .post-card.full-width {
    grid-column: span 1;
  }
}
@media (max-width: 768px) {
  .communicate-page {
    padding: 1rem 0;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>