<template>
  <section class="section user-profile-section">
    <div class="container">
      <div class="profile-box" style="position: relative">
        <button class="modal-close" @click="$emit('close')">&times;</button>
        <div class="profile-photo-wrapper">
          <img
            :src="
              user.photo
                ? user.photo
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user.name || 'U'
                  )}&size=150`
            "
            :alt="`Foto de ${user.name}`"
            class="profile-photo"
          />
        </div>
        <h2 class="profile-title">{{ user.name }}</h2>
        <p class="profile-description">{{ user.bio }}</p>

        <!-- Estados del botón según la relación de amistad -->
        <div v-if="!isOwnProfile" class="friend-actions">
          <button
            v-if="friendshipStatus === 'none'"
            class="button is-success mt-2"
            @click="sendFriendRequest"
            :disabled="loading"
          >
            <i v-if="loading" class="bx bx-loader-alt bx-spin"></i>
            <span v-else>Agregar como amigo</span>
          </button>

          <button
            v-else-if="friendshipStatus === 'pending_sent'"
            class="button is-warning mt-2"
            @click="cancelFriendRequest"
            :disabled="loading"
          >
            <i v-if="loading" class="bx bx-loader-alt bx-spin"></i>
            <span v-else>Solicitud enviada</span>
          </button>

          <button
            v-else-if="friendshipStatus === 'pending_received'"
            class="button is-info mt-2"
            @click="acceptFriendRequest"
            :disabled="loading"
          >
            <i v-if="loading" class="bx bx-loader-alt bx-spin"></i>
            <span v-else>Aceptar solicitud</span>
          </button>

          <button
            v-else-if="friendshipStatus === 'friends'"
            class="button is-primary mt-2"
            disabled
          >
            <i class="bx bx-check"></i>
            <span>Ya son amigos</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, watch, defineProps, defineEmits, computed } from "vue";
import { db, auth } from "../../firebase";
import {
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import Swal from "sweetalert2";

const props = defineProps({ uid: String });
const emit = defineEmits(["close"]);
const user = ref({ name: "", bio: "", photo: "" });
const loading = ref(false);
const friendshipStatus = ref("none"); // none, pending_sent, pending_received, friends

// Verificar si es el perfil propio
const isOwnProfile = computed(() => {
  return auth.currentUser?.uid === props.uid;
});

async function fetchUserProfile() {
  const uid = props.uid;
  if (!uid) return;

  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      user.value.name = data.name || "";
      user.value.bio = data.bio || "";
      user.value.photo = data.photo || "";
    }

    // Verificar estado de amistad
    await checkFriendshipStatus();
  } catch (error) {
    console.error("Error cargando perfil:", error);
  }
}

async function checkFriendshipStatus() {
  if (!auth.currentUser || !props.uid) return;

  try {
    const currentUserId = auth.currentUser.uid;
    const targetUserId = props.uid;

    // Verificar si ya son amigos (nueva estructura)
    const friendsQuery1 = query(
      collection(db, "friendships"),
      where("userId", "==", currentUserId),
      where("friendId", "==", targetUserId)
    );

    const friendsQuery2 = query(
      collection(db, "friendships"),
      where("userId", "==", targetUserId),
      where("friendId", "==", currentUserId)
    );

    const [friendsSnapshot1, friendsSnapshot2] = await Promise.all([
      getDocs(friendsQuery1),
      getDocs(friendsQuery2),
    ]);

    const isFriend = !friendsSnapshot1.empty || !friendsSnapshot2.empty;

    if (isFriend) {
      friendshipStatus.value = "friends";

      return;
    }

    // Verificar solicitudes pendientes enviadas
    const pendingQuery = query(
      collection(db, "friend_requests"),
      where("fromUserId", "==", currentUserId),
      where("toUserId", "==", targetUserId),
      where("status", "==", "pending")
    );

    const pendingSnapshot = await getDocs(pendingQuery);
    if (!pendingSnapshot.empty) {
      friendshipStatus.value = "pending_sent";

      return;
    }

    // Verificar si recibió solicitud
    const receivedQuery = query(
      collection(db, "friend_requests"),
      where("fromUserId", "==", targetUserId),
      where("toUserId", "==", currentUserId),
      where("status", "==", "pending")
    );

    const receivedSnapshot = await getDocs(receivedQuery);
    if (!receivedSnapshot.empty) {
      friendshipStatus.value = "pending_received";

      return;
    }

    friendshipStatus.value = "none";
  } catch (error) {
    console.error("Error verificando estado de amistad:", error);
  }
}

async function sendFriendRequest() {
  if (!auth.currentUser || !props.uid) return;

  loading.value = true;
  try {
    const currentUser = auth.currentUser;

    // Verificar primero si ya son amigos
    const currentUserId = auth.currentUser.uid;
    const targetUserId = props.uid;

    const friendsQuery1 = query(
      collection(db, "friendships"),
      where("userId", "==", currentUserId),
      where("friendId", "==", targetUserId)
    );

    const friendsQuery2 = query(
      collection(db, "friendships"),
      where("userId", "==", targetUserId),
      where("friendId", "==", currentUserId)
    );

    const [friendsSnapshot1, friendsSnapshot2] = await Promise.all([
      getDocs(friendsQuery1),
      getDocs(friendsQuery2),
    ]);

    const isAlreadyFriend = !friendsSnapshot1.empty || !friendsSnapshot2.empty;

    if (isAlreadyFriend) {
      Swal.fire({
        icon: "warning",
        title: "Ya son amigos",
        text: "No puedes enviar una solicitud a alguien que ya es tu amigo",
        confirmButtonText: "OK",
      });
      return;
    }

    // Verificar si ya hay una solicitud pendiente
    const existingRequestQuery = query(
      collection(db, "friend_requests"),
      where("fromUserId", "==", currentUserId),
      where("toUserId", "==", targetUserId),
      where("status", "==", "pending")
    );

    const existingRequestSnapshot = await getDocs(existingRequestQuery);
    if (!existingRequestSnapshot.empty) {
      Swal.fire({
        icon: "warning",
        title: "Solicitud ya enviada",
        text: "Ya has enviado una solicitud de amistad a este usuario",
        confirmButtonText: "OK",
      });
      return;
    }

    // Obtener datos del usuario actual
    const currentUserDoc = await getDoc(doc(db, "users", currentUser.uid));
    const currentUserData = currentUserDoc.exists()
      ? currentUserDoc.data()
      : {};

    // Crear solicitud de amistad
    await addDoc(collection(db, "friend_requests"), {
      fromUserId: currentUser.uid,
      toUserId: props.uid,
      fromUserName:
        currentUserData.name || currentUser.displayName || "Usuario",
      fromUserEmail: currentUser.email || "",
      fromUserPhoto: currentUserData.photo || currentUser.photoURL || "",
      status: "pending",
      createdAt: serverTimestamp(),
      message: `${
        currentUserData.name || currentUser.displayName || "Usuario"
      } te envió una solicitud de amistad`,
    });

    // Crear notificación para el usuario destinatario
    await addDoc(collection(db, "notifications"), {
      toUserId: props.uid,
      fromUserId: currentUser.uid,
      type: "friend_request",
      title: "Nueva solicitud de amistad",
      message: `${
        currentUserData.name || currentUser.displayName || "Usuario"
      } te envió una solicitud de amistad`,
      read: false,
      createdAt: serverTimestamp(),
    });

    friendshipStatus.value = "pending_sent";

    Swal.fire({
      icon: "success",
      title: "Solicitud enviada",
      text: "Se ha enviado la solicitud de amistad",
      showConfirmButton: false,
      timer: 2000,
    });
  } catch (error) {
    console.error("Error enviando solicitud:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo enviar la solicitud",
      confirmButtonText: "OK",
    });
  } finally {
    loading.value = false;
  }
}

async function cancelFriendRequest() {
  if (!auth.currentUser || !props.uid) return;

  loading.value = true;
  try {
    // Buscar la solicitud pendiente
    const pendingQuery = query(
      collection(db, "friend_requests"),
      where("fromUserId", "==", auth.currentUser.uid),
      where("toUserId", "==", props.uid),
      where("status", "==", "pending")
    );

    const pendingSnapshot = await getDocs(pendingQuery);

    if (!pendingSnapshot.empty) {
      // Eliminar la solicitud
      await deleteDoc(doc(db, "friend_requests", pendingSnapshot.docs[0].id));

      // Eliminar la notificación correspondiente
      const notificationQuery = query(
        collection(db, "notifications"),
        where("userId", "==", props.uid),
        where("fromUserId", "==", auth.currentUser.uid),
        where("type", "==", "friend_request"),
        where("read", "==", false)
      );

      const notificationSnapshot = await getDocs(notificationQuery);
      if (!notificationSnapshot.empty) {
        await deleteDoc(
          doc(db, "notifications", notificationSnapshot.docs[0].id)
        );
      }

      friendshipStatus.value = "none";

      Swal.fire({
        icon: "success",
        title: "Solicitud cancelada",
        text: "La solicitud de amistad ha sido cancelada",
        showConfirmButton: false,
        timer: 2000,
      });
    }
  } catch (error) {
    console.error("Error cancelando solicitud:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo cancelar la solicitud",
      confirmButtonText: "OK",
    });
  } finally {
    loading.value = false;
  }
}

async function acceptFriendRequest() {
  if (!auth.currentUser || !props.uid) return;

  loading.value = true;
  try {
    // Buscar la solicitud recibida
    const receivedQuery = query(
      collection(db, "friend_requests"),
      where("fromUserId", "==", props.uid),
      where("toUserId", "==", auth.currentUser.uid),
      where("status", "==", "pending")
    );

    const receivedSnapshot = await getDocs(receivedQuery);

    if (!receivedSnapshot.empty) {
      const requestDoc = receivedSnapshot.docs[0];
      const requestData = requestDoc.data();

      // Actualizar estado de la solicitud
      await updateDoc(doc(db, "friend_requests", requestDoc.id), {
        status: "accepted",
        updatedAt: serverTimestamp(),
      });

      // Crear relación de amistad (estructura correcta)
      await addDoc(collection(db, "friendships"), {
        userId: auth.currentUser.uid,
        friendId: props.uid,
        createdAt: serverTimestamp(),
      });

      // Crear amistad recíproca
      await addDoc(collection(db, "friendships"), {
        userId: props.uid,
        friendId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });

      // Crear notificación para el usuario que envió la solicitud
      await addDoc(collection(db, "notifications"), {
        toUserId: props.uid,
        fromUserId: auth.currentUser.uid,
        type: "friend_request_accepted",
        title: "Solicitud de amistad aceptada",
        message: `${user.value.name} aceptó tu solicitud de amistad`,
        read: false,
        createdAt: serverTimestamp(),
      });

      // Eliminar la notificación original
      const notificationQuery = query(
        collection(db, "notifications"),
        where("toUserId", "==", auth.currentUser.uid),
        where("fromUserId", "==", props.uid),
        where("type", "==", "friend_request"),
        where("read", "==", false)
      );

      const notificationSnapshot = await getDocs(notificationQuery);
      if (!notificationSnapshot.empty) {
        await deleteDoc(
          doc(db, "notifications", notificationSnapshot.docs[0].id)
        );
      }

      friendshipStatus.value = "friends";

      Swal.fire({
        icon: "success",
        title: "¡Amigos!",
        text: "Ahora son amigos",
        showConfirmButton: false,
        timer: 2000,
      });
    } else {
    }
  } catch (error) {
    console.error("Error aceptando solicitud:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo aceptar la solicitud",
      confirmButtonText: "OK",
    });
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchUserProfile();
});
watch(
  () => props.uid,
  () => {
    fetchUserProfile();
  }
);
</script>

<style scoped>
.user-profile-section {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background-navy, #f8fafc);
}
.container {
  display: flex;
  align-items: center;
  justify-content: center;
}
.profile-box {
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.1);
  padding: 3.5rem 3rem 3rem 3rem;
  background: #fff;
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
}
.profile-photo-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 1.5rem;
}
.profile-photo {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 50%;
  border: 4px solid #6366f1;
  box-shadow: 0 4px 24px rgba(99, 102, 241, 0.1);
  background: #f3f4f6;
}
.profile-title {
  font-size: 2rem;
  font-weight: 700;
  color: #6366f1;
  margin-bottom: 0.5rem;
  letter-spacing: 0.5px;
}
.profile-description {
  color: #64748b;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}
.button.is-success {
  background: #06d6a0;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7em 2em;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.button.is-success:hover {
  background: #059669;
}

.button.is-warning {
  background: #f59e0b;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7em 2em;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.button.is-warning:hover {
  background: #d97706;
}

.button.is-info {
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7em 2em;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.button.is-info:hover {
  background: #2563eb;
}

.button.is-primary {
  background: #6366f1;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7em 2em;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.button.is-primary:hover {
  background: #4f46e5;
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.friend-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}

.bx-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  color: #888;
  cursor: pointer;
  z-index: 10;
}
#theme-dark .profile-box {
  background: #23262f;
  color: #f1f1f1;
  border: 1.5px solid #4f8cff;
  box-shadow: 0 4px 24px rgba(79, 140, 255, 0.1);
}
#theme-dark .profile-title {
  color: #a3c8ff;
}
#theme-dark .profile-description {
  color: #85c1e9;
}
#theme-dark .button.is-success {
  background: linear-gradient(45deg, #4f8cff, #06d6a0) !important;
  color: #181a20 !important;
}
#theme-dark .button.is-success:hover {
  background: linear-gradient(45deg, #06d6a0, #4f8cff) !important;
  color: #fff !important;
}
#theme-dark .modal-close {
  color: #a3c8ff;
}
</style>
