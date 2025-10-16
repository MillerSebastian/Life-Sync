<template>
  <section class="section profile-section">
    <div class="container">
      <div class="columns is-centered">
        <div class="column is-10-tablet is-8-desktop is-7-widescreen">
          <div class="box profile-box">
            <!-- Foto de perfil -->
            <div class="has-text-centered mb-5">
              <div class="profile-photo-wrapper mb-2">
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
                  @error="onPhotoError"
                />
                <div class="mt-3">
                  <input
                    v-if="editing"
                    class="input url-input"
                    type="url"
                    v-model="form.photo"
                    placeholder="Pega la URL de tu foto de perfil"
                    @input="onPhotoUrlInput"
                  />
                </div>
              </div>
              <h2 class="title is-3 mb-1">{{ user.name }}</h2>
              <button
                v-if="!isOwnProfile"
                class="button is-success mt-2"
                @click="addFriend"
              >
                Agregar como amigo
              </button>
            </div>

            <!-- Datos básicos -->
            <form @submit.prevent="saveProfile">
              <div
                class="columns is-variable is-2 is-multiline profile-form-row"
              >
                <div class="column is-6">
                  <div class="field">
                    <label class="label">Nombre</label>
                    <div class="control">
                      <input
                        class="input"
                        type="text"
                        v-model="form.name"
                        :disabled="!editing"
                        required
                        @input="onNameInput"
                      />
                    </div>
                  </div>
                </div>
                <div class="column is-6">
                  <div class="field">
                    <label class="label">Correo electrónico</label>
                    <div class="control">
                      <input
                        class="input"
                        type="email"
                        v-model="form.email"
                        :disabled="!editing"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div class="column is-12">
                  <div class="field">
                    <label class="label">Biografía</label>
                    <div class="control">
                      <textarea
                        class="textarea"
                        v-model="form.bio"
                        :disabled="!editing"
                        rows="3"
                        maxlength="180"
                      ></textarea>
                    </div>
                    <p class="help is-pulled-right">
                      {{ form.bio.length }}/180
                    </p>
                  </div>
                </div>
              </div>
              <div class="buttons is-centered mt-5">
                <button
                  v-if="!editing"
                  type="button"
                  class="button is-primary is-medium"
                  @click="editing = true"
                >
                  <i class="bx bx-edit mr-1"></i>Editar
                </button>
                <button
                  v-else
                  type="submit"
                  class="button is-success is-medium"
                >
                  <i class="bx bx-save mr-1"></i>Guardar
                </button>
                <button
                  v-if="editing"
                  type="button"
                  class="button is-light is-medium"
                  @click="cancelEdit"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { auth, db } from "../../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import Swal from "sweetalert2";

const route = useRoute();
const user = reactive({
  name: "",
  email: "",
  bio: "",
  photo: "",
  uid: "",
});
const form = reactive({
  name: "",
  email: "",
  bio: "",
  photo: "",
});
const editing = ref(false);
const isOwnProfile = ref(true);
const currentUserUid = ref("");

async function fetchUserProfile() {
  const uid = route.params.uid || auth.currentUser?.uid;
  if (!uid) return;
  currentUserUid.value = auth.currentUser?.uid;
  isOwnProfile.value = uid === currentUserUid.value;
  const userDoc = await getDoc(doc(db, "users", uid));
  if (userDoc.exists()) {
    const data = userDoc.data();
    user.name = data.name || "";
    user.email = data.email || "";
    user.bio = data.bio || "";
    user.photo = data.photo || "";
    user.uid = uid;
    form.name = user.name;
    form.email = user.email;
    form.bio = user.bio;
    form.photo = user.photo;
  }
  editing.value = false;
}

onMounted(() => {
  const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
    if (firebaseUser) {
      fetchUserProfile();
    }
    unsubscribe();
  });
});

watch(() => route.params.uid, fetchUserProfile);

async function saveProfile() {
  if (!isOwnProfile.value) return;
  const currentUser = auth.currentUser;
  if (!currentUser) return;
  await updateDoc(doc(db, "users", currentUser.uid), {
    name: form.name,
    email: form.email,
    bio: form.bio,
    photo: form.photo,
  });
  user.name = form.name;
  user.email = form.email;
  user.bio = form.bio;
  user.photo = form.photo;
  editing.value = false;
}

function cancelEdit() {
  form.name = user.name;
  form.email = user.email;
  form.bio = user.bio;
  form.photo = user.photo;
  editing.value = false;
}

function logout() {}

function onPhotoError(e) {
  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user.name || "U"
  )}&size=150`;
}

function onPhotoUrlInput() {
  // Preview instantáneo al cambiar la URL
}

function onNameInput() {
  if (!form.photo) {
    user.photo = "";
  }
}

async function addFriend() {
  if (!auth.currentUser || !route.params.uid) return;

  try {

    const currentUserId = auth.currentUser.uid;
    const targetUserId = route.params.uid;

    // Verificar primero si ya son amigos
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
    const currentUserDoc = await getDoc(doc(db, "users", currentUserId));
    const currentUserData = currentUserDoc.exists()
      ? currentUserDoc.data()
      : {};

    // Crear solicitud de amistad
    await addDoc(collection(db, "friend_requests"), {
      fromUserId: currentUserId,
      toUserId: targetUserId,
      fromUserName: currentUserData.name || "Usuario",
      fromUserEmail: auth.currentUser.email || "",
      fromUserPhoto: currentUserData.photo || "",
      status: "pending",
      createdAt: serverTimestamp(),
      message: `${
        currentUserData.name || "Usuario"
      } te envió una solicitud de amistad`,
    });

    // Crear notificación para el usuario destinatario
    await addDoc(collection(db, "notifications"), {
      toUserId: targetUserId,
      fromUserId: currentUserId,
      type: "friend_request",
      title: "Nueva solicitud de amistad",
      message: `${
        currentUserData.name || "Usuario"
      } te envió una solicitud de amistad`,
      read: false,
      createdAt: serverTimestamp(),
    });


    Swal.fire({
      icon: "success",
      title: "Solicitud enviada",
      text: "Se ha enviado la solicitud de amistad",
      showConfirmButton: false,
      timer: 2000,
    });
  } catch (error) {
    console.error("Error enviando solicitud desde Profile:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo enviar la solicitud",
      confirmButtonText: "OK",
    });
  }
}
</script>

<style scoped>
.profile-section {
  min-height: 100vh;
  height: 100vh;
  background: var(--background-navy);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.profile-box {
  border-radius: 24px;
  box-shadow: 0 8px 32px var(--shadow-navy);
  padding: 3.5rem 3rem 3rem 3rem;
  background: var(--background);
  max-width: 900px;
  margin: 0 auto;
  max-height: 90vh;
  overflow: auto;
  border: 2px solid var(--primary-light);
}
.profile-photo-wrapper {
  position: relative;
  display: inline-block;
}
.profile-photo {
  width: 180px;
  height: 180px;
  object-fit: cover;
  border-radius: 50%;
  border: 4px solid var(--primary-light);
  box-shadow: 0 4px 24px var(--shadow);
  background: #f3f4f6;
  transition: box-shadow 0.2s, border-color 0.2s;
}
.profile-photo:hover {
  box-shadow: 0 8px 32px var(--shadow-hover);
  border-color: var(--primary);
}
.url-input {
  margin-top: 1rem;
  max-width: 320px;
  display: inline-block;
}
.profile-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 0.5rem;
  letter-spacing: 0.5px;
}
.profile-content {
  margin-bottom: 2rem;
}
.profile-description {
  color: var(--secondary);
  font-size: 1.1rem;
}
.profile-form-row {
  margin-bottom: 0.5rem;
}
.field label.label {
  color: var(--primary-dark);
  font-weight: 600;
  letter-spacing: 0.2px;
}
.field {
  border-bottom: 1px solid var(--border-light);
  margin-bottom: 1.2rem;
  padding-bottom: 0.7rem;
}
.field:last-child {
  border-bottom: none;
}
.buttons.is-centered {
  justify-content: center;
  display: flex;
  gap: 1.5rem;
}
@media (max-width: 1024px) {
  .profile-box {
    padding: 2rem 0.5rem;
    max-width: 98vw;
  }
  .profile-photo {
    width: 120px;
    height: 120px;
  }
  .profile-form-row .column.is-6 {
    width: 100%;
    max-width: 100%;
    flex: 0 0 100%;
  }
}
</style>
