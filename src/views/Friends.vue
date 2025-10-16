<template>
  <div class="friends-container">
    <!-- Header con navegación -->
    <div class="friends-header">
      <h2>Mis Amigos</h2>
      <div class="friends-nav">
        <button
          class="nav-btn"
          :class="{ active: activeSection === 'pending' }"
          @click="activeSection = 'pending'"
        >
          <i class="bx bx-user-plus"></i>
          Solicitudes Pendientes
          <span v-if="pendingRequests.length > 0" class="badge">{{
            pendingRequests.length
          }}</span>
        </button>
        <button
          class="nav-btn"
          :class="{ active: activeSection === 'sent' }"
          @click="activeSection = 'sent'"
        >
          <i class="bx bx-send"></i>
          Solicitudes Enviadas
          <span v-if="sentRequests.length > 0" class="badge">{{
            sentRequests.length
          }}</span>
        </button>
        <button
          class="nav-btn"
          :class="{ active: activeSection === 'friends' }"
          @click="activeSection = 'friends'"
        >
          <i class="bx bx-user-check"></i>
          Mis Amigos
          <span v-if="friends.length > 0" class="badge">{{
            friends.length
          }}</span>
        </button>
      </div>
    </div>

    <!-- Estadísticas -->
    <div class="friends-stats">
      <div class="stat-card">
        <i class="bx bx-user-plus"></i>
        <div class="stat-info">
          <span class="stat-number">{{ pendingRequests.length }}</span>
          <span class="stat-label">Pendientes</span>
        </div>
      </div>
      <div class="stat-card">
        <i class="bx bx-send"></i>
        <div class="stat-info">
          <span class="stat-number">{{ sentRequests.length }}</span>
          <span class="stat-label">Enviadas</span>
        </div>
      </div>
      <div class="stat-card">
        <i class="bx bx-user-check"></i>
        <div class="stat-info">
          <span class="stat-number">{{ friends.length }}</span>
          <span class="stat-label">Amigos</span>
        </div>
      </div>
    </div>

    <!-- Contenido de las secciones -->
    <div class="friends-content">
      <!-- Solicitudes Pendientes -->
      <div v-if="activeSection === 'pending'" class="section-content">
        <h3>Solicitudes Pendientes</h3>
        <div v-if="pendingRequests.length === 0" class="empty-state">
          <i class="bx bx-user-plus"></i>
          <p>No tienes solicitudes pendientes</p>
        </div>
        <div v-else class="requests-grid">
          <div
            v-for="request in pendingRequests"
            :key="request.id"
            class="request-card"
          >
            <div class="request-avatar">
              <img
                :src="
                  request.fromUserPhoto ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    request.fromUserName || 'U'
                  )}&size=64`
                "
                :alt="request.fromUserName"
                @error="onPhotoError"
              />
            </div>
            <div class="request-info">
              <h4>{{ request.fromUserName }}</h4>
              <p>{{ request.fromUserEmail }}</p>
              <small>{{ formatTime(request.createdAt) }}</small>
            </div>
            <div class="request-actions">
              <button class="btn-accept" @click="acceptRequest(request)">
                <i class="bx bx-check"></i>
                Aceptar
              </button>
              <button class="btn-reject" @click="rejectRequest(request)">
                <i class="bx bx-x"></i>
                Rechazar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Solicitudes Enviadas -->
      <div v-if="activeSection === 'sent'" class="section-content">
        <h3>Solicitudes Enviadas</h3>
        <div v-if="sentRequests.length === 0" class="empty-state">
          <i class="bx bx-send"></i>
          <p>No has enviado solicitudes</p>
        </div>
        <div v-else class="requests-grid">
          <div
            v-for="request in sentRequests"
            :key="request.id"
            class="request-card"
          >
            <div class="request-avatar">
              <img
                :src="
                  request.toUserPhoto ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    request.toUserName || 'U'
                  )}&size=64`
                "
                :alt="request.toUserName"
                @error="onPhotoError"
              />
            </div>
            <div class="request-info">
              <h4>{{ request.toUserName }}</h4>
              <p>{{ request.toUserEmail }}</p>
              <small>{{ formatTime(request.createdAt) }}</small>
            </div>
            <div class="request-actions">
              <button class="btn-cancel" @click="cancelRequest(request)">
                <i class="bx bx-x"></i>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Mis Amigos -->
      <div v-if="activeSection === 'friends'" class="section-content">
        <h3>Mis Amigos</h3>
        <div v-if="friends.length === 0" class="empty-state">
          <i class="bx bx-user-check"></i>
          <p>No tienes amigos aún</p>
          <p class="empty-hint">¡Agrega amigos desde el feed!</p>
        </div>
        <div v-else class="friends-grid">
          <div v-for="friend in friends" :key="friend.id" class="friend-card">
            <div class="friend-avatar">
              <img
                :src="
                  friend.photo ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    friend.name || 'U'
                  )}&size=64`
                "
                :alt="friend.name"
                @error="onPhotoError"
              />
            </div>
            <div class="friend-info">
              <h4>{{ friend.name }}</h4>
              <p>{{ friend.email }}</p>
              <small
                >Amigos desde {{ formatTime(friend.friendshipDate) }}</small
              >
            </div>
            <div class="friend-actions">
              <button class="btn-profile" @click="openUserProfile(friend.uid)">
                <i class="bx bx-user"></i>
                Ver Perfil
              </button>
              <button class="btn-message" @click="sendMessage(friend)">
                <i class="bx bx-message"></i>
                Mensaje
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  addDoc,
  serverTimestamp,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../../firebase";

const friends = ref([]);
const pendingRequests = ref([]);
const sentRequests = ref([]);
const activeSection = ref("pending");

// Cargar amigos
async function loadFriends() {
  if (!auth.currentUser?.uid) return;

  try {
    // Query 1: friendships donde el usuario actual es userId
    const friendshipsQuery1 = query(
      collection(db, "friendships"),
      where("userId", "==", auth.currentUser.uid)
    );
    const snapshot1 = await getDocs(friendshipsQuery1);

    // Query 2: friendships donde el usuario actual es friendId
    const friendshipsQuery2 = query(
      collection(db, "friendships"),
      where("friendId", "==", auth.currentUser.uid)
    );
    const snapshot2 = await getDocs(friendshipsQuery2);

    const friendsData = [];
    const processedFriendIds = new Set(); // Para evitar duplicados

    // Procesar friendships donde el usuario actual es userId
    for (const docSnap of snapshot1.docs) {
      const friendship = docSnap.data();

      // Solo procesar si no hemos procesado este friendId antes
      if (!processedFriendIds.has(friendship.friendId)) {
        // Obtener información del amigo usando el ID del documento
        try {
          const friendDocRef = doc(db, "users", friendship.friendId);
          const friendDocSnap = await getDoc(friendDocRef);

          if (friendDocSnap.exists()) {
            const friendData = friendDocSnap.data();
            friendsData.push({
              id: docSnap.id,
              uid: friendship.friendId,
              name: friendData.name || "Usuario",
              email: friendData.email || "",
              photo: friendData.photo || "",
              friendshipDate: friendship.createdAt,
            });
            processedFriendIds.add(friendship.friendId);
          } else {
            // No se encontró el usuario con ese ID
          }
        } catch (error) {
          console.error("Error obteniendo datos del amigo 1:", error);
        }
      }
    }

    // Procesar friendships donde el usuario actual es friendId
    for (const docSnap of snapshot2.docs) {
      const friendship = docSnap.data();

      // Solo procesar si no hemos procesado este userId antes
      if (!processedFriendIds.has(friendship.userId)) {
        // Obtener información del amigo usando el ID del documento
        try {
          const friendDocRef = doc(db, "users", friendship.userId);
          const friendDocSnap = await getDoc(friendDocRef);

          if (friendDocSnap.exists()) {
            const friendData = friendDocSnap.data();
            friendsData.push({
              id: docSnap.id,
              uid: friendship.userId,
              name: friendData.name || "Usuario",
              email: friendData.email || "",
              photo: friendData.photo || "",
              friendshipDate: friendship.createdAt,
            });
            processedFriendIds.add(friendship.userId);
          } else {
          }
        } catch (error) {
          console.error("Error obteniendo datos del amigo 2:", error);
        }
      }
    }

    friends.value = friendsData;
  } catch (error) {
    console.error("Error cargando amigos:", error);
  }
}

// Cargar solicitudes pendientes (recibidas)
async function loadPendingRequests() {
  if (!auth.currentUser?.uid) return;

  try {
    const requestsQuery = query(
      collection(db, "friend_requests"),
      where("toUserId", "==", auth.currentUser.uid),
      where("status", "==", "pending")
    );
    const snapshot = await getDocs(requestsQuery);

    const requestsData = [];

    snapshot.forEach((docSnap) => {
      const request = docSnap.data();
      requestsData.push({
        id: docSnap.id,
        fromUserId: request.fromUserId,
        fromUserName: request.fromUserName || "Usuario",
        fromUserEmail: request.fromUserEmail || "",
        fromUserPhoto: request.fromUserPhoto || "",
        createdAt: request.createdAt,
      });
    });

    pendingRequests.value = requestsData;
  } catch (error) {
    console.error("Error cargando solicitudes pendientes:", error);
  }
}

// Cargar solicitudes enviadas
async function loadSentRequests() {
  if (!auth.currentUser?.uid) return;

  try {
    const requestsQuery = query(
      collection(db, "friend_requests"),
      where("fromUserId", "==", auth.currentUser.uid),
      where("status", "==", "pending")
    );
    const snapshot = await getDocs(requestsQuery);

    const requestsData = [];

    for (const docSnap of snapshot.docs) {
      const request = docSnap.data();

      // Obtener información del usuario que recibió la solicitud usando el ID del documento
      try {
        const userDocRef = doc(db, "users", request.toUserId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          requestsData.push({
            id: docSnap.id,
            toUserId: request.toUserId,
            toUserName: userData.name || "Usuario",
            toUserEmail: userData.email || "",
            toUserPhoto: userData.photo || "",
            createdAt: request.createdAt,
          });
        } else {
          // No se encontró el usuario con ese ID
        }
      } catch (error) {
        console.error("Error obteniendo datos del usuario:", error);
      }
    }

    sentRequests.value = requestsData;
  } catch (error) {
    console.error("Error cargando solicitudes enviadas:", error);
  }
}

// Escuchar cambios en tiempo real
function listenToChanges() {
  if (!auth.currentUser?.uid) return;

  // Escuchar cambios en friendships (ambas direcciones)
  const friendshipsQuery1 = query(
    collection(db, "friendships"),
    where("userId", "==", auth.currentUser.uid)
  );

  const friendshipsQuery2 = query(
    collection(db, "friendships"),
    where("friendId", "==", auth.currentUser.uid)
  );

  // Listener para friendships donde soy userId
  onSnapshot(friendshipsQuery1, (snapshot) => {
    loadFriends();
  });

  // Listener para friendships donde soy friendId
  onSnapshot(friendshipsQuery2, (snapshot) => {
    loadFriends();
  });

  // Escuchar cambios en friend_requests (recibidas)
  const pendingRequestsQuery = query(
    collection(db, "friend_requests"),
    where("toUserId", "==", auth.currentUser.uid),
    where("status", "==", "pending")
  );

  onSnapshot(pendingRequestsQuery, (snapshot) => {
    loadPendingRequests();
  });

  // Escuchar cambios en friend_requests (enviadas)
  const sentRequestsQuery = query(
    collection(db, "friend_requests"),
    where("fromUserId", "==", auth.currentUser.uid),
    where("status", "==", "pending")
  );

  onSnapshot(sentRequestsQuery, (snapshot) => {
    loadSentRequests();
  });
}

// Aceptar solicitud
async function acceptRequest(request) {
  try {
    // Actualizar el estado de la solicitud
    await updateDoc(doc(db, "friend_requests", request.id), {
      status: "accepted",
      updatedAt: serverTimestamp(),
    });

    // Crear la amistad
    await addDoc(collection(db, "friendships"), {
      userId: auth.currentUser.uid,
      friendId: request.fromUserId,
      createdAt: serverTimestamp(),
    });

    // Crear amistad recíproca
    await addDoc(collection(db, "friendships"), {
      userId: request.fromUserId,
      friendId: auth.currentUser.uid,
      createdAt: serverTimestamp(),
    });

    // Enviar notificación al usuario que envió la solicitud
    await addDoc(collection(db, "notifications"), {
      toUserId: request.fromUserId,
      fromUserId: auth.currentUser.uid,
      type: "friend_request_accepted",
      title: "Solicitud de amistad aceptada",
      message: `${
        auth.currentUser.displayName || "Alguien"
      } aceptó tu solicitud de amistad`,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error aceptando solicitud:", error);
  }
}

// Rechazar solicitud
async function rejectRequest(request) {
  try {
    await deleteDoc(doc(db, "friend_requests", request.id));
  } catch (error) {
    console.error("Error rechazando solicitud:", error);
  }
}

// Cancelar solicitud enviada
async function cancelRequest(request) {
  try {
    await deleteDoc(doc(db, "friend_requests", request.id));
  } catch (error) {
    console.error("Error cancelando solicitud:", error);
  }
}

// Abrir perfil de usuario
function openUserProfile(uid) {
  // Implementar navegación al perfil
}

// Enviar mensaje
function sendMessage(friend) {
  // Implementar navegación al chat
}

// Formatear tiempo
function formatTime(timestamp) {
  if (!timestamp) return "";

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `Hace ${minutes} min`;
  if (hours < 24) return `Hace ${hours} h`;
  if (days < 7) return `Hace ${days} días`;

  return date.toLocaleDateString();
}

// Manejar error de imagen
function onPhotoError(e) {
  e.target.src = `https://ui-avatars.com/api/?name=U&size=64`;
}

onMounted(() => {
  loadFriends();
  loadPendingRequests();
  loadSentRequests();
  listenToChanges();
});
</script>

<style scoped>
.friends-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
  min-height: 100vh;
}

.friends-header {
  margin-bottom: 30px;
  text-align: center;
}

.friends-header h2 {
  font-size: 2.5rem;
  color: white;
  margin-bottom: 25px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  font-weight: 700;
}

.friends-nav {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 25px;
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  position: relative;
  backdrop-filter: blur(10px);
  font-size: 1rem;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.nav-btn.active {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.nav-btn i {
  font-size: 1.3rem;
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff4757;
  color: white;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(255, 71, 87, 0.4);
}

.friends-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
  margin-bottom: 35px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 25px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  background: rgba(255, 255, 255, 0.15);
}

.stat-card i {
  font-size: 2.5rem;
  color: #ffd700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 2.2rem;
  font-weight: bold;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.stat-label {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.friends-content {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.section-content {
  padding: 35px;
}

.section-content h3 {
  font-size: 1.8rem;
  color: white;
  margin-bottom: 25px;
  text-align: center;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: rgba(255, 255, 255, 0.7);
}

.empty-state i {
  font-size: 5rem;
  margin-bottom: 25px;
  opacity: 0.6;
  color: rgba(255, 255, 255, 0.5);
}

.empty-state p {
  font-size: 1.3rem;
  margin-bottom: 15px;
  font-weight: 500;
}

.empty-hint {
  font-size: 1rem;
  opacity: 0.8;
  font-style: italic;
}

.requests-grid,
.friends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}

.request-card,
.friend-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 25px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.request-card:hover,
.friend-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  background: rgba(255, 255, 255, 0.15);
}

.request-avatar,
.friend-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 3px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.request-avatar img,
.friend-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.request-info,
.friend-info {
  flex: 1;
  min-width: 0;
}

.request-info h4,
.friend-info h4 {
  font-size: 1.3rem;
  font-weight: 600;
  color: white;
  margin-bottom: 8px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.request-info p,
.friend-info p {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
  font-weight: 500;
}

.request-info small,
.friend-info small {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}

.request-actions,
.friend-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-shrink: 0;
}

.btn-accept,
.btn-reject,
.btn-cancel,
.btn-profile,
.btn-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.btn-accept {
  background: linear-gradient(45deg, #28a745, #20c997);
  color: white;
}

.btn-accept:hover {
  background: linear-gradient(45deg, #20c997, #28a745);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
}

.btn-reject,
.btn-cancel {
  background: linear-gradient(45deg, #dc3545, #e74c3c);
  color: white;
}

.btn-reject:hover,
.btn-cancel:hover {
  background: linear-gradient(45deg, #e74c3c, #dc3545);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
}

.btn-profile {
  background: linear-gradient(45deg, #007bff, #0056b3);
  color: white;
}

.btn-profile:hover {
  background: linear-gradient(45deg, #0056b3, #007bff);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
}

.btn-message {
  background: linear-gradient(45deg, #ff4757, #ff3742);
  color: white;
}

.btn-message:hover {
  background: linear-gradient(45deg, #ff3742, #ff4757);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 71, 87, 0.4);
}

/* Modo oscuro */

#theme-dark .friends-header h2 {
  color: #e8f4fd;
}

#theme-dark .nav-btn {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.15);
}

#theme-dark .nav-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

#theme-dark .nav-btn.active {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
}

#theme-dark .stat-card {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
}

#theme-dark .stat-card:hover {
  background: rgba(255, 255, 255, 0.12);
}

#theme-dark .stat-card i {
  color: #ffd700;
}

#theme-dark .stat-number {
  color: #e8f4fd;
}

#theme-dark .stat-label {
  color: rgba(232, 244, 253, 0.8);
}

#theme-dark .friends-content {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
}

#theme-dark .section-content h3 {
  color: #e8f4fd;
}

#theme-dark .empty-state {
  color: rgba(232, 244, 253, 0.7);
}

#theme-dark .request-card,
#theme-dark .friend-card {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
}

#theme-dark .request-card:hover,
#theme-dark .friend-card:hover {
  background: rgba(255, 255, 255, 0.12);
}

#theme-dark .request-info h4,
#theme-dark .friend-info h4 {
  color: #e8f4fd;
}

#theme-dark .request-info p,
#theme-dark .friend-info p {
  color: rgba(232, 244, 253, 0.8);
}

#theme-dark .request-info small,
#theme-dark .friend-info small {
  color: rgba(232, 244, 253, 0.6);
}

/* Responsive */
@media (max-width: 768px) {
  .friends-container {
    padding: 15px;
  }

  .friends-header h2 {
    font-size: 2rem;
  }

  .friends-nav {
    flex-direction: column;
    gap: 10px;
  }

  .nav-btn {
    justify-content: center;
    padding: 12px 20px;
  }

  .friends-stats {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .stat-card {
    padding: 20px;
  }

  .requests-grid,
  .friends-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .request-card,
  .friend-card {
    flex-direction: column;
    text-align: center;
    padding: 20px;
  }

  .request-actions,
  .friend-actions {
    flex-direction: row;
    justify-content: center;
    gap: 10px;
  }

  .btn-accept,
  .btn-reject,
  .btn-cancel,
  .btn-profile,
  .btn-message {
    padding: 10px 15px;
    font-size: 0.9rem;
  }
}
</style>
