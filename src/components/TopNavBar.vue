<template>
  <nav
    class="navbar top-navbar"
    role="navigation"
    aria-label="main navigation"
    :style="navbarStyle"
  >
    <div class="navbar-brand">
      <div class="navbar-item is-hidden-desktop">
        <span class="icon">
          <i class="bx bx-search"></i>
        </span>
      </div>
      <div
        class="navbar-item is-hidden-mobile"
        style="width: 350px; position: relative"
      >
        <div class="control has-icons-left is-expanded">
          <input
            class="input"
            type="text"
            placeholder="Buscar..."
            v-model="searchQuery"
            @focus="showResults = true"
            @input="showResults = true"
            @blur="handleBlur"
          />
          <span class="icon is-left">
            <i class="bx bx-search"></i>
          </span>
        </div>
        <div v-if="showResults && results.length" class="search-dropdown">
          <div
            v-for="(result, idx) in results"
            :key="result.type + result.id + idx"
            class="search-result-item"
            @mousedown.prevent="goToResult(result)"
          >
            <span class="tag">{{ result.type }}</span>
            <span
              v-html="highlightMatch(result.label, result.highlight)"
            ></span>
            <small v-if="result.extra">
              -
              <span
                v-html="highlightMatch(result.extra, result.highlight)"
              ></span
            ></small>
          </div>
        </div>
      </div>
    </div>
    <div class="navbar-menu is-active">
      <div class="navbar-end">
        <div class="navbar-item">
          <button class="button nav-button" @click="showNotifications = true">
            <span class="icon">
              <i class="bx bx-bell"></i>
            </span>
            <span
              v-if="unreadNotificationsCount > 0"
              class="notification-badge"
            >
              {{
                unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount
              }}
            </span>
          </button>
          <!-- Botón temporal para debug -->
        </div>
        <div class="navbar-item">
          <button class="button nav-button" @click.prevent="cambiarTema">
            <span class="icon">
              <i class="bx bx-moon"></i>
            </span>
          </button>
        </div>
        <div class="navbar-item">
          <button class="button nav-button">
            <span class="icon">
              <i class="bx bx-globe"></i>
            </span>
          </button>
        </div>
        <div class="navbar-item has-dropdown is-hoverable">
          <a class="navbar-link">
            <figure class="image is-32x32 is-rounded">
              <img
                class="is-rounded"
                :src="
                  user.photo
                    ? user.photo
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user.name || 'U'
                      )}&size=64`
                "
                :alt="`Foto de ${user.name}`"
                @error="onPhotoError"
              />
            </figure>
          </a>
          <div class="navbar-dropdown is-right">
            <a class="navbar-item" @click="profile">
              <span class="icon"><i class="bx bx-user"></i></span>
              Perfil
            </a>
            <hr class="navbar-divider" />
            <a class="navbar-item" @click="logout">
              <span class="icon"><i class="bx bx-log-out"></i></span>
              Logout
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de notificaciones -->
    <div class="modal" :class="{ 'is-active': showNotifications }">
      <div class="modal-background" @click="showNotifications = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Notificaciones</p>
          <button
            class="delete"
            aria-label="close"
            @click="showNotifications = false"
          ></button>
        </header>
        <section class="modal-card-body">
          <div
            v-if="notifications.length === 0"
            class="content has-text-centered"
          >
            <span class="icon is-large mb-2">
              <i class="bx bx-bell is-size-2"></i>
            </span>
            <p>No hay notificaciones nuevas.</p>
          </div>
          <div v-else class="notifications-list">
            <div
              v-for="notification in notifications"
              :key="notification.id"
              class="notification-item"
              :class="{ unread: !notification.read }"
            >
              <div class="notification-avatar">
                <img
                  :src="
                    notification.fromUserPhoto ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      notification.fromUserName || 'U'
                    )}&size=64`
                  "
                  :alt="notification.fromUserName"
                  @error="onNotificationPhotoError"
                />
              </div>
              <div class="notification-content">
                <div class="notification-header">
                  <strong>{{ notification.title }}</strong>
                  <small class="notification-time">{{
                    formatTime(notification.createdAt)
                  }}</small>
                </div>
                <p class="notification-message">{{ notification.message }}</p>
                <div
                  v-if="notification.type === 'friend_request'"
                  class="notification-actions"
                >
                  <!-- Estado de la solicitud -->
                  <div
                    v-if="notification.status === 'accepted'"
                    class="notification-status accepted"
                  >
                    <i class="bx bx-check-circle"></i>
                    <span>Solicitud aceptada</span>
                  </div>
                  <div
                    v-else-if="notification.status === 'rejected'"
                    class="notification-status rejected"
                  >
                    <i class="bx bx-x-circle"></i>
                    <span>Solicitud rechazada</span>
                  </div>
                  <!-- Botones de acción solo si está pendiente -->
                  <div v-else class="notification-buttons">
                    <button
                      class="button is-success is-small"
                      @click="acceptFriendRequest(notification)"
                      :disabled="processingNotification === notification.id"
                    >
                      <i
                        v-if="processingNotification === notification.id"
                        class="bx bx-loader-alt bx-spin"
                      ></i>
                      <span v-else>Aceptar</span>
                    </button>
                    <button
                      class="button is-danger is-small"
                      @click="rejectFriendRequest(notification)"
                      :disabled="processingNotification === notification.id"
                    >
                      <i
                        v-if="processingNotification === notification.id"
                        class="bx bx-loader-alt bx-spin"
                      ></i>
                      <span v-else>Rechazar</span>
                    </button>
                  </div>
                </div>

                <!-- Acciones para notificaciones de tareas, eventos y feed -->
                <div
                  v-if="
                    notification.type &&
                    (notification.type.startsWith('task_') ||
                      notification.type.startsWith('event_') ||
                      notification.type.startsWith('feed_'))
                  "
                  class="notification-actions"
                >
                  <div class="task-notification-info">
                    <i
                      :class="getNotificationIcon(notification.type)"
                      :style="{
                        color: getNotificationColor(notification.type),
                      }"
                    ></i>
                    <span>{{ getNotificationText(notification.type) }}</span>
                  </div>
                </div>

                <!-- Respuesta rápida para mensajes directos -->
                <div
                  v-if="notification.type === 'dm_message'"
                  class="notification-actions"
                >
                  <div v-if="!quickReplyVisible[notification.id]">
                    <button
                      class="button is-link is-small"
                      @click="quickReplyVisible[notification.id] = true"
                    >
                      <i class="bx bx-reply"></i>
                      <span>Responder</span>
                    </button>
                  </div>
                  <div
                    v-else
                    class="quick-reply-input"
                    style="
                      display: flex;
                      gap: 8px;
                      align-items: flex-start;
                      padding-top: 6px;
                    "
                  >
                    <input
                      type="text"
                      class="input"
                      placeholder="Escribe tu respuesta..."
                      v-model="quickReply[notification.id]"
                      @keyup.enter="sendQuickReply(notification)"
                      autofocus
                    />
                    <button
                      class="button is-success is-small"
                      @click="sendQuickReply(notification)"
                      :disabled="
                        !quickReply[notification.id] ||
                        quickReplyStatus[notification.id] === 'enviando'
                      "
                      style="margin-top: 2px"
                    >
                      <i
                        v-if="quickReplyStatus[notification.id] === 'enviando'"
                        class="bx bx-loader-alt bx-spin"
                      ></i>
                      <span v-else>Enviar</span>
                    </button>
                  </div>
                  <div
                    v-if="quickReplyStatus[notification.id] === 'enviado'"
                    class="notification-feedback"
                  >
                    <span class="icon is-small">
                      <i class="bx bx-check-circle"></i>
                    </span>
                    <span>Mensaje enviado</span>
                  </div>
                  <div
                    v-if="quickReplyStatus[notification.id] === 'error'"
                    class="notification-feedback"
                  >
                    <span class="icon is-small">
                      <i class="bx bx-x-circle"></i>
                    </span>
                    <span>Error al enviar</span>
                  </div>
                </div>
              </div>

              <!-- Botón de borrar movido fuera del contenido principal -->
              <div class="notification-delete">
                <button
                  class="button is-small is-light"
                  @click="deleteNotification(notification.id)"
                  title="Eliminar notificación"
                >
                  <i class="bx bx-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot is-justify-content-flex-end">
          <button class="button" @click="showNotifications = false">
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  </nav>
</template>

<script setup>
import Profile from "@/views/Profile.vue";
import { getAuth, signOut } from "firebase/auth";
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useSearchStore } from "@/stores/search";
import { auth, db } from "@/../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";
import { reactive } from "vue";
import { alertError, alertSuccess } from "./alert";

// Boton para Modo dark y light
const btnTheme = document.getElementById("btnTheme");

const showNotifications = ref(false);
const router = useRouter();
const notifications = ref([]);
const processingNotification = ref(null);

// Búsqueda global
const searchStore = useSearchStore();
const searchQuery = ref("");
const showResults = ref(false);

function cambiarTema() {
  const body = document.body;
  if (body.id === "theme-light") {
    body.id = "theme-dark";
  } else {
    body.id = "theme-light";
  }
}

function handleBlur() {
  setTimeout(() => (showResults.value = false), 200);
}

// Variable para almacenar el unsubscribe del listener
let notificationsUnsubscribe = null;

// Esperar a que el usuario esté autenticado antes de sincronizar
watch(
  () => auth.currentUser,
  (user) => {
    if (user) {
      searchStore.syncAll();
      loadNotifications();
    } else {
      // Limpiar listener si el usuario se desautentica
      if (notificationsUnsubscribe) {
        notificationsUnsubscribe();
        notificationsUnsubscribe = null;
        notifications.value = [];
      }
    }
  },
  { immediate: true }
);

// Función para manejar errores de carga de fotos de notificaciones
const onNotificationPhotoError = (event) => {
  const target = event.target;
  const notificationName = target.alt || "U";
  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    notificationName
  )}&size=64`;
};

// Cargar notificaciones del usuario
async function loadNotifications() {
  if (!auth.currentUser) return;

  // Limpiar listener anterior si existe
  if (notificationsUnsubscribe) {
    notificationsUnsubscribe();
  }

  const notificationsQuery = query(
    collection(db, "notifications"),
    where("toUserId", "==", auth.currentUser.uid),
    orderBy("createdAt", "desc")
  );

  // Cargar notificaciones inicialmente
  const initialSnapshot = await getDocs(notificationsQuery);

  // Cargar notificaciones y enriquecer con datos de usuario si es necesario
  const enrichedNotifications = await Promise.all(
    initialSnapshot.docs.map(async (doc) => {
      const notificationData = doc.data();

      // Si es una notificación de tarea, evento o feed y no tiene datos de usuario, cargarlos
      if (
        notificationData.type &&
        (notificationData.type.startsWith("task_") ||
          notificationData.type.startsWith("event_") ||
          notificationData.type.startsWith("feed_")) &&
        !notificationData.fromUserName
      ) {
        try {
          const userDoc = await getDoc(
            doc(db, "users", notificationData.fromUserId)
          );
          const userData = userDoc.data();
          return {
            id: doc.id,
            ...notificationData,
            fromUserName: userData?.name || "Usuario",
            fromUserPhoto: userData?.photo || null,
          };
        } catch (error) {
          console.error("Error cargando datos de usuario:", error);
          return {
            id: doc.id,
            ...notificationData,
            fromUserName: "Usuario",
            fromUserPhoto: null,
          };
        }
      }

      return {
        id: doc.id,
        ...notificationData,
      };
    })
  );

  notifications.value = enrichedNotifications;

  // Configurar listener para cambios futuros
  notificationsUnsubscribe = onSnapshot(
    notificationsQuery,
    (snapshot) => {
      // Cargar notificaciones directamente (ya vienen con datos de usuario)
      const loadedNotifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      notifications.value = loadedNotifications;
    },
    (error) => {
      console.error("Error en listener de notificaciones:", error);
    }
  );
}

// Aceptar solicitud de amistad desde notificación
async function acceptFriendRequest(notification) {
  if (!auth.currentUser) return;

  processingNotification.value = notification.id;

  try {
    // Buscar la solicitud de amistad
    const requestQuery = query(
      collection(db, "friend_requests"),
      where("fromUserId", "==", notification.fromUserId),
      where("toUserId", "==", auth.currentUser.uid),
      where("status", "==", "pending")
    );

    const requestSnapshot = await getDocs(requestQuery);

    if (!requestSnapshot.empty) {
      const requestDoc = requestSnapshot.docs[0];

      // Actualizar estado de la solicitud
      await updateDoc(doc(db, "friend_requests", requestDoc.id), {
        status: "accepted",
        updatedAt: serverTimestamp(),
      });

      // Crear relación de amistad (estructura correcta)
      await addDoc(collection(db, "friendships"), {
        userId: auth.currentUser.uid,
        friendId: notification.fromUserId,
        createdAt: serverTimestamp(),
      });

      // Crear amistad recíproca
      await addDoc(collection(db, "friendships"), {
        userId: notification.fromUserId,
        friendId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });

      // Crear notificación para el usuario que envió la solicitud
      await addDoc(collection(db, "notifications"), {
        toUserId: notification.fromUserId,
        fromUserId: auth.currentUser.uid,
        type: "friend_request_accepted",
        title: "Solicitud de amistad aceptada",
        message: `${
          user.value.name || "Alguien"
        } aceptó tu solicitud de amistad`,
        read: false,
        createdAt: serverTimestamp(),
      });

      // Actualizar notificación con estado aceptado
      await updateDoc(doc(db, "notifications", notification.id), {
        read: true,
        status: "accepted",
        message: "Solicitud de amistad aceptada",
        updatedAt: serverTimestamp(),
      });

      alertSuccess("Solicitud de amistad aceptada");
    } else {
    }
  } catch (error) {
    console.error("Error aceptando solicitud:", error);
    alertError("Error al aceptar la solicitud");
  } finally {
    processingNotification.value = null;
  }
}

// Rechazar solicitud de amistad desde notificación
async function rejectFriendRequest(notification) {
  if (!auth.currentUser) return;

  processingNotification.value = notification.id;

  try {
    // Buscar la solicitud de amistad
    const requestQuery = query(
      collection(db, "friend_requests"),
      where("fromUserId", "==", notification.fromUserId),
      where("toUserId", "==", auth.currentUser.uid),
      where("status", "==", "pending")
    );

    const requestSnapshot = await getDocs(requestQuery);

    if (!requestSnapshot.empty) {
      // Eliminar la solicitud
      await deleteDoc(doc(db, "friend_requests", requestSnapshot.docs[0].id));

      // Actualizar notificación con estado rechazado
      await updateDoc(doc(db, "notifications", notification.id), {
        read: true,
        status: "rejected",
        message: "Solicitud de amistad rechazada",
        updatedAt: serverTimestamp(),
      });

      alertSuccess("Solicitud de amistad rechazada");
    }
  } catch (error) {
    console.error("Error rechazando solicitud:", error);
    alertError("Error al rechazar la solicitud");
  } finally {
    processingNotification.value = null;
  }
}

// Formatear tiempo de notificación
function formatTime(timestamp) {
  if (!timestamp) return "";

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 1) return "Ahora";
  if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
  if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
  return `Hace ${Math.floor(diffInMinutes / 1440)}d`;
}

// Contar notificaciones no leídas
const unreadNotificationsCount = computed(() => {
  const count = notifications.value.filter((n) => !n.read).length;
  return count;
});

// Borrar notificación
async function deleteNotification(notificationId) {
  try {
    await deleteDoc(doc(db, "notifications", notificationId));
    alertSuccess("Notificación eliminada");
  } catch (error) {
    console.error("Error eliminando notificación:", error);
    alertError("Error al eliminar la notificación");
  }
}

// Funciones auxiliares para notificaciones de tareas
function getNotificationIcon(type) {
  // Notificaciones de tareas
  if (type.startsWith("task_")) {
    switch (type) {
      case "task_created":
        return "bx bx-plus-circle";
      case "task_completed":
        return "bx bx-check-circle";
      case "task_progress":
        return "bx bx-loader-alt";
      case "task_reopened":
        return "bx bx-refresh";
      case "task_due_soon":
        return "bx bx-time";
      case "task_overdue":
        return "bx bx-error-circle";
      default:
        return "bx bx-task";
    }
  }

  // Notificaciones de eventos
  if (type.startsWith("event_")) {
    switch (type) {
      case "event_two_days_before":
        return "bx bx-calendar-x";
      case "event_day_of":
        return "bx bx-calendar-check";
      default:
        return "bx bx-calendar";
    }
  }

  // Notificaciones de feed
  if (type.startsWith("feed_")) {
    switch (type) {
      case "feed_comment":
        return "bx bx-comment";
      case "feed_reaction":
        return "bx bx-heart";
      default:
        return "bx bx-news";
    }
  }

  return "bx bx-bell";
}

function getNotificationColor(type) {
  // Notificaciones de tareas
  if (type.startsWith("task_")) {
    switch (type) {
      case "task_created":
        return "#6366f1";
      case "task_completed":
        return "#06d6a0";
      case "task_progress":
        return "#f59e0b";
      case "task_reopened":
        return "#8b5cf6";
      case "task_due_soon":
        return "#ef4444";
      case "task_overdue":
        return "#dc2626";
      default:
        return "#64748b";
    }
  }

  // Notificaciones de eventos
  if (type.startsWith("event_")) {
    switch (type) {
      case "event_two_days_before":
        return "#f59e0b";
      case "event_day_of":
        return "#06d6a0";
      default:
        return "#64748b";
    }
  }

  // Notificaciones de feed
  if (type.startsWith("feed_")) {
    switch (type) {
      case "feed_comment":
        return "#3b82f6";
      case "feed_reaction":
        return "#ef4444";
      default:
        return "#64748b";
    }
  }

  return "#64748b";
}

function getNotificationText(type) {
  // Notificaciones de tareas
  if (type.startsWith("task_")) {
    switch (type) {
      case "task_created":
        return "Nueva tarea creada";
      case "task_completed":
        return "Tarea completada";
      case "task_progress":
        return "Tarea en progreso";
      case "task_reopened":
        return "Tarea reabierta";
      case "task_due_soon":
        return "Vence pronto";
      case "task_overdue":
        return "Tarea vencida";
      default:
        return "Actualización de tarea";
    }
  }

  // Notificaciones de eventos
  if (type.startsWith("event_")) {
    switch (type) {
      case "event_two_days_before":
        return "Evento en 2 días";
      case "event_day_of":
        return "Evento hoy";
      default:
        return "Actualización de evento";
    }
  }

  // Notificaciones de feed
  if (type.startsWith("feed_")) {
    switch (type) {
      case "feed_comment":
        return "Nuevo comentario";
      case "feed_reaction":
        return "Nueva reacción";
      default:
        return "Actualización de feed";
    }
  }

  return "Notificación";
}

const results = computed(() => {
  if (!searchQuery.value.trim()) return [];
  const q = searchQuery.value.toLowerCase();
  const res = [];
  // Wallet
  searchStore.transactions.forEach((t) => {
    if (
      (t.title && t.title.toLowerCase().includes(q)) ||
      (t.notes && t.notes.toLowerCase().includes(q))
    ) {
      res.push({
        type: "Transacción",
        label: t.title,
        id: t.id,
        route: "/wallet",
        extra: t.notes,
        highlight: q,
      });
    }
  });
  // Meals
  searchStore.meals.forEach((m) => {
    if (
      (m.name && m.name.toLowerCase().includes(q)) ||
      (m.description && m.description.toLowerCase().includes(q))
    ) {
      res.push({
        type: "Comida",
        label: m.name,
        id: m.id,
        route: "/meals",
        extra: m.description,
        highlight: q,
      });
    }
  });
  // Tasks
  searchStore.tasks.forEach((t) => {
    if (
      (t.title && t.title.toLowerCase().includes(q)) ||
      (t.description && t.description.toLowerCase().includes(q))
    ) {
      res.push({
        type: "Tarea",
        label: t.title,
        id: t.id,
        route: "/tasks",
        extra: t.description,
        highlight: q,
      });
    }
  });
  // Notes
  searchStore.notes.forEach((n) => {
    if (
      (n.title && n.title.toLowerCase().includes(q)) ||
      (n.content && n.content.toLowerCase().includes(q))
    ) {
      res.push({
        type: "Nota",
        label: n.title,
        id: n.id,
        route: "/tasks", // Notas están en la vista de tareas
        extra: n.content,
        highlight: q,
        isNote: true,
      });
    }
  });
  // Events
  searchStore.events &&
    searchStore.events.forEach((e) => {
      if (
        (e.title && e.title.toLowerCase().includes(q)) ||
        (e.description && e.description.toLowerCase().includes(q))
      ) {
        res.push({
          type: "Evento",
          label: e.title,
          id: e.id,
          route: "/calendar",
          extra: e.description,
          highlight: q,
        });
      }
    });
  return res;
});

function goToResult(result) {
  router.push({
    path: result.route,
    query: { highlight: result.id, type: result.type },
  });
  showResults.value = false;
  searchQuery.value = "";
}

const props = defineProps({
  sidebarCollapsed: {
    type: Boolean,
    default: false,
  },
});

function highlightMatch(text, q) {
  if (!text || !q) return text;
  const regex = new RegExp(`(${q})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

const navbarStyle = computed(() => {
  if (window.innerWidth <= 768) {
    return {};
  }
  const left = props.sidebarCollapsed ? "70px" : "250px";
  const width = props.sidebarCollapsed
    ? "calc(100% - 70px)"
    : "calc(100% - 250px)";
  return {
    left,
    width,
    position: "fixed",
    top: "0",
    zIndex: 20,
    transition: "left 0.3s, width 0.3s",
  };
});

const profile = () => {
  router.push({ name: "profile" });
};

const logout = async () => {
  const auth = getAuth();
  signOut(auth)
    .then(() => {
      localStorage.setItem("isLoggedIn", "false");
      alertSuccess("sesion finalizada");
      router.push("/login");
    })
    .catch((error) => {});
};

const user = reactive({
  name: "",
  photo: "",
});

async function fetchUserProfile() {
  const currentUser = auth.currentUser;
  if (!currentUser) return;
  const userDoc = await getDoc(doc(db, "users", currentUser.uid));
  if (userDoc.exists()) {
    const data = userDoc.data();
    user.name = data.name;
    user.photo = data.photo;
  }
}

onMounted(() => {
  fetchUserProfile();
});

function onPhotoError(e) {
  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user.name || "U"
  )}&size=64`;
}

// Estado para la respuesta rápida
const quickReply = reactive({});
const quickReplyStatus = reactive({});

// Estado para mostrar/ocultar el input de respuesta rápida
const quickReplyVisible = reactive({});

// Mensajes locales pending global para acceso desde notificaciones
if (typeof window !== "undefined") {
  if (!window.localPendingMessages) window.localPendingMessages = [];
}

// Modifica sendQuickReply para ocultar el input tras enviar
const sendQuickReply = async (notification) => {
  const text = quickReply[notification.id]?.trim();
  const senderUid = auth.currentUser?.uid;
  if (!text || !senderUid) {
    quickReplyStatus[notification.id] = "error";
    console.error(
      "No se puede enviar: UID de usuario no definido o mensaje vacío"
    );
    setTimeout(() => (quickReplyStatus[notification.id] = null), 2000);
    return;
  }
  try {
    // Mensaje pending local
    const tempId = `pending-${Date.now()}-${Math.random()}`;
    const pendingMsg = {
      id: tempId,
      text,
      author: user.name,
      senderId: senderUid,
      receiverId: notification.fromUserId,
      pending: true,
    };
    if (typeof window !== "undefined" && window.localPendingMessages) {
      window.localPendingMessages.push(pendingMsg);
    }
    // Guardar mensaje en la colección de mensajes
    const messageData = {
      text,
      author: user.name,
      timestamp: serverTimestamp(),
      senderId: senderUid,
      receiverId: notification.fromUserId,
      read: false,
    };
    await addDoc(collection(db, "messages"), messageData);
    // Notificar al amigo
    const senderDoc = await getDoc(doc(db, "users", senderUid));
    const senderData = senderDoc.exists() ? senderDoc.data() : {};
    const notificationData = {
      toUserId: notification.fromUserId,
      fromUserId: senderUid,
      fromUserName: senderData.name || user.name || "Usuario",
      fromUserPhoto: senderData.photo || user.photo || null,
      type: "dm_message",
      title: "Nuevo mensaje de tu amigo",
      message: text,
      chatUserId: senderUid,
      read: false,
      createdAt: serverTimestamp(),
    };
    await addDoc(collection(db, "notifications"), notificationData);
    quickReplyStatus[notification.id] = "enviado";
    quickReply[notification.id] = "";
    quickReplyVisible[notification.id] = false;
    setTimeout(() => (quickReplyStatus[notification.id] = null), 2000);
  } catch (error) {
    console.error("Error al enviar respuesta rápida:", error);
    quickReplyStatus[notification.id] = "error";
    setTimeout(() => (quickReplyStatus[notification.id] = null), 2000);
  }
};
</script>

<style scoped>
.top-navbar {
  background: var(--background);
  box-shadow: 0 2px 8px var(--shadow);
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid var(--border);
}

.nav-button {
  background: transparent;
  border: none;
  color: var(--text);
  padding: 0.5rem;
  border-radius: 8px;
  transition: background 0.2s, color 0.2s, transform 0.2s;
  position: relative;
}

.nav-button:hover,
.navbar-item.has-dropdown.is-hoverable > .navbar-link:hover {
  background: var(--primary-light);
  color: var(--primary-dark);
  transform: translateY(-2px) scale(1.08);
  box-shadow: 0 2px 8px var(--shadow-hover);
}

.nav-button {
  position: relative;
}

.notification-badge {
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

.navbar-item .icon {
  font-size: 1.3rem;
}

.image.is-32x32 {
  width: 32px;
  height: 32px;
  overflow: hidden;
  border-radius: 50%;
  border: 2px solid var(--border);
  transition: all 0.3s ease;
}

.image.is-32x32:hover {
  border-color: var(--primary);
  transform: scale(1.05);
}

.navbar-dropdown {
  min-width: 170px;
  background: var(--background-secondary);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 4px 16px var(--shadow-hover);
  padding: 0.5rem 0;
  transition: background 0.2s, border 0.2s;
}

.navbar-item {
  color: var(--text);
  transition: background 0.2s, color 0.2s;
}

.navbar-dropdown .navbar-item {
  padding: 0.7rem 1.2rem;
  border-radius: 6px;
  margin: 0 0.3rem;
}

.navbar-dropdown .navbar-item:hover {
  background: var(--primary-light);
  color: var(--primary-dark);
  box-shadow: 0 2px 8px var(--shadow-hover);
}

.navbar-divider {
  background: var(--border);
  margin: 0.5rem 0;
}

.input {
  border: 1px solid var(--border);
  border-radius: 8px;
  transition: all 0.3s ease;
  background: #fff;
  color: #1e293b;
}
.input::placeholder {
  color: #64748b;
  opacity: 1;
}
.search-dropdown {
  background: #fff;
  color: #1e293b;
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 4px 16px var(--shadow-hover);
}

/* DARK MODE SOLO PARA EL INPUT Y DROPDOWN DE BÚSQUEDA */
#theme-dark .top-navbar .input {
  background: #23262f;
  color: #f1f1f1;
  border: 1.5px solid #4f8cff;
}
#theme-dark .top-navbar .input::placeholder {
  color: #85c1e9;
  opacity: 1;
}
#theme-dark .top-navbar .search-dropdown {
  background: #23262f;
  color: #f1f1f1;
  border: 1.5px solid #4f8cff;
  box-shadow: 0 4px 16px rgba(79, 140, 255, 0.1);
}
#theme-dark .top-navbar .search-result-item:hover {
  background: #1a4d99;
  color: #a3c8ff;
}

/* Estilos para notificaciones */
.notifications-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 12px 40px 12px 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: background 0.2s;
  border: 1px solid var(--border-color, #e2e8f0);
  position: relative;
}

.notification-item:hover {
  background: var(--primary-light, #f1f5f9);
}

.notification-item.unread {
  background: rgba(99, 102, 241, 0.05);
  border-left: 3px solid var(--primary, #6366f1);
}

.notification-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.notification-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.notification-time {
  color: var(--secondary, #64748b);
  font-size: 0.8rem;
  white-space: nowrap;
  margin-left: 8px;
}

.notification-message {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text, #1e293b);
  line-height: 1.4;
}

.notification-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.notification-actions .button {
  font-size: 0.8rem;
  padding: 4px 12px;
  height: auto;
}

.button.is-danger.is-small {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 12px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.2s;
}

.button.is-danger.is-small:hover {
  background: #dc2626;
}

.button.is-success.is-small {
  background: #06d6a0;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 12px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.2s;
}

.button.is-success.is-small:hover {
  background: #059669;
}

/* Modo oscuro para notificaciones */
#theme-dark .notification-item {
  background: #23262f;
  border-color: #26334d;
}

#theme-dark .notification-item:hover {
  background: #1a4d99;
}

#theme-dark .notification-item.unread {
  background: rgba(79, 140, 255, 0.1);
  border-left-color: #4f8cff;
}

#theme-dark .notification-time {
  color: #85c1e9;
}

#theme-dark .notification-message {
  color: #f1f1f1;
}

#theme-dark .notification-actions .button.is-success.is-small {
  background: #06d6a0;
  color: #181a20;
}

#theme-dark .notification-actions .button.is-danger.is-small {
  background: #ef4444;
  color: white;
}

/* Estilos para estados de notificación */
.notification-status {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 0.85rem;
  font-weight: 500;
}

.notification-status.accepted {
  color: #059669;
}

.notification-status.accepted i {
  color: #06d6a0;
}

.notification-status.rejected {
  color: #dc2626;
}

.notification-status.rejected i {
  color: #ef4444;
}

.notification-buttons {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.notification-delete {
  position: absolute;
  top: 12px;
  right: 12px;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 10;
}

.notification-item:hover .notification-delete {
  opacity: 1;
}

.notification-delete .button {
  padding: 3px;
  min-width: auto;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
  font-size: 0.8rem;
}

.notification-delete .button:hover {
  background: #ef4444;
  color: white;
}

/* Modo oscuro para nuevos elementos */
#theme-dark .notification-status.accepted {
  color: #06d6a0;
}

#theme-dark .notification-status.rejected {
  color: #f87171;
}

#theme-dark .notification-delete .button {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.3);
}

#theme-dark .notification-delete .button:hover {
  background: #ef4444;
  color: white;
}

/* Estilos para notificaciones de tareas */
.task-notification-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 0.85rem;
  font-weight: 500;
}

.task-notification-info i {
  font-size: 1.1rem;
}

/* Modo oscuro para notificaciones de tareas */
#theme-dark .task-notification-info {
  color: #f1f1f1;
}

.search-result-item {
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.search-result-item:hover {
  /* Quitar sombra negra, dejar solo fondo suave */
  background: var(--primary-light);
  box-shadow: none;
  color: var(--primary-dark);
}

.search-result-item mark {
  background: var(--primary-light);
  color: var(--primary);
  border-radius: 3px;
  padding: 0 2px;
}

/* Ajustar el icono de búsqueda */
.icon.is-left {
  top: 50%;
  transform: translateY(-50%);
  position: absolute;
  left: 10px;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  height: 100%;
}

.input {
  padding-left: 2.5rem;
}

@media (max-width: 1024px) {
  .top-navbar {
    left: 70px !important;
    width: calc(100% - 70px) !important;
  }
}

@media (max-width: 768px) {
  .navbar-item.is-hidden-mobile {
    display: none !important;
  }

  .navbar-item.is-hidden-desktop {
    display: block !important;
  }

  .top-navbar {
    left: 0 !important;
    width: 100% !important;
    position: static !important;
  }
}

@media (min-width: 769px) {
  .navbar-item.is-hidden-desktop {
    display: none !important;
  }
}
#theme-dark .modal-card {
  background: #23262f;
  color: #f1f1f1;
  border: 1.5px solid #4f8cff;
  box-shadow: 0 4px 24px rgba(79, 140, 255, 0.1);
}
#theme-dark .modal-card-head {
  background: #1a4d99;
  color: #f1f1f1;
  border-bottom: 1px solid #4f8cff;
}
#theme-dark .modal-card-title {
  color: #a3c8ff;
}
#theme-dark .modal-card-body {
  background: #23262f;
  color: #f1f1f1;
}
#theme-dark .modal-card-foot {
  background: #23262f;
  border-top: 1px solid #4f8cff;
}
#theme-dark .modal-background {
  background: rgba(24, 26, 32, 0.85) !important;
}
</style>
