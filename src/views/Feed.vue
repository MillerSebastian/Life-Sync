<template>
  <div class="feed-layout">
    <SidebarFeed
      :user="user"
      :isSidebarCollapsed="isSidebarCollapsed"
      :activeSection="activeSection"
      :pendingRequestsCount="pendingRequestsCount"
      @toggle-sidebar="toggleSidebar"
      @update:activeSection="(val) => (activeSection = val)"
    />
    <div class="feed-main">
      <Chat v-if="activeSection === 'chat'" />
      <Friends v-else-if="activeSection === 'friends'" :user="user" />
      <template v-else>
        <div class="feed-header">
          <button class="btn btn-primary" @click="showPostModal = true">
            Crear publicación
          </button>
        </div>
        <transition name="fade-modal">
          <div
            v-if="userProfileUid"
            class="modal-feed"
            @click.self="closeUserProfileModal"
          >
            <div class="modal-feed-content">
              <UserProfile
                :uid="userProfileUid"
                @close="closeUserProfileModal"
              />
            </div>
          </div>
        </transition>
        <transition name="fade-modal">
          <div v-if="showPostModal" class="modal is-active">
            <div class="modal-background" @click="closePostModal"></div>
            <div class="modal-card">
              <header class="modal-card-head">
                <p class="modal-card-title">Nueva publicación</p>
                <button class="delete" @click="closePostModal"></button>
              </header>
              <section class="modal-card-body">
                <form @submit.prevent="addPost">
                  <div class="field">
                    <label class="label">Título</label>
                    <div class="control">
                      <input
                        v-model="newPostTitle"
                        class="input"
                        placeholder="Título"
                        required
                      />
                    </div>
                  </div>
                  <div class="field">
                    <label class="label">Mensaje</label>
                    <div class="control">
                      <textarea
                        v-model="newPostContent"
                        class="textarea"
                        placeholder="¿Qué quieres compartir?"
                        rows="3"
                        required
                      ></textarea>
                    </div>
                  </div>
                  <div class="field">
                    <label class="label">URL de imagen (opcional)</label>
                    <div class="control">
                      <input
                        v-model="newPostImageUrl"
                        class="input"
                        placeholder="URL de imagen"
                        type="url"
                      />
                    </div>
                  </div>
                  <div class="field">
                    <label class="label">Visibilidad</label>
                    <div class="control">
                      <label class="radio"
                        ><input
                          type="radio"
                          value="public"
                          v-model="newPostVisibility"
                        />
                        Público</label
                      >
                      <label class="radio"
                        ><input
                          type="radio"
                          value="friends"
                          v-model="newPostVisibility"
                        />
                        Solo amigos</label
                      >
                    </div>
                  </div>
                  <footer class="modal-card-foot buttons">
                    <button class="btn btn-primary" type="submit">
                      Publicar
                    </button>
                    <button
                      class="btn button is-danger has-text-white-bis"
                      type="button"
                      @click="closePostModal"
                    >
                      Cancelar
                    </button>
                  </footer>
                </form>
              </section>
            </div>
          </div>
        </transition>
        <transition-group name="fade-list" tag="div" class="feed-list">
          <div v-for="post in posts" :key="post.id" class="feed-post">
            <div class="post-header">
              <img
                class="avatar"
                :src="post.user.avatar"
                alt="avatar"
                @click="openUserProfileModal(post.user.uid)"
                style="cursor: pointer"
              />
              <div class="post-user-info">
                <span class="post-user">{{ post.user.name }}</span>
                <span class="post-date">{{ post.date || "" }}</span>
              </div>
              <div v-if="post.user.uid === user.uid" class="post-actions-right">
                <button class="btn-icon" @click="startEditPost(post)">
                  <i class="bx bx-edit"></i>
                </button>
                <button class="btn-icon" @click="deletePost(post.id)">
                  <i class="bx bx-trash"></i>
                </button>
              </div>
            </div>
            <div class="post-content" @click="openModal(post)">
              <template v-if="editingPostId === post.id">
                <textarea
                  v-model="editPostContent"
                  rows="3"
                  class="edit-textarea"
                ></textarea>
                <div class="edit-actions">
                  <button
                    class="btn btn-primary"
                    @click.stop="saveEditPost(post)"
                  >
                    Guardar
                  </button>
                  <button class="btn btn-accent" @click.stop="cancelEditPost">
                    Cancelar
                  </button>
                </div>
              </template>
              <template v-else>
                <p>{{ post.content }}</p>
                <img
                  v-if="post.image"
                  :src="post.image"
                  class="post-img"
                  alt="imagen de publicación"
                />
              </template>
            </div>
            <div class="post-actions">
              <button
                v-for="reaction in reactions"
                :key="reaction.type"
                class="reaction-btn"
                :class="{
                  selected: post.userReaction === reaction.type,
                  bounce: bounceReactionId === post.id + '-' + reaction.type,
                }"
                @click="reactWithBounce(post.id, reaction.type)"
              >
                <span :aria-label="reaction.label">{{ reaction.emoji }}</span>
                <span v-if="post.reactions[reaction.type]">{{
                  post.reactions[reaction.type]
                }}</span>
              </button>
            </div>
            <transition-group name="fade-list" tag="div" class="post-comments">
              <div
                v-for="comment in post.comments"
                :key="comment.id"
                class="comment"
              >
                <img
                  class="avatar avatar-sm"
                  :src="comment.avatar"
                  alt="avatar"
                  @click="goToUserProfile(comment.uid)"
                  style="cursor: pointer"
                />
                <div class="comment-body">
                  <template v-if="editingCommentId === comment.id">
                    <input
                      v-model="editCommentContent"
                      class="edit-comment-input"
                    />
                    <div class="edit-actions">
                      <button
                        class="btn btn-primary"
                        @click.stop="saveEditComment(post, comment)"
                      >
                        Guardar
                      </button>
                      <button
                        class="btn btn-accent"
                        @click.stop="cancelEditComment"
                      >
                        Cancelar
                      </button>
                    </div>
                  </template>
                  <template v-else>
                    <span class="comment-user">{{ comment.user }}</span>
                    <span class="comment-text">{{ comment.text }}</span>
                    <span
                      v-if="comment.uid === user.uid"
                      class="comment-actions"
                    >
                      <button
                        class="btn-icon"
                        @click.stop="startEditComment(comment)"
                      >
                        <i class="bx bx-edit"></i>
                      </button>
                      <button
                        class="btn-icon"
                        @click.stop="deleteComment(post, comment)"
                      >
                        <i class="bx bx-trash"></i>
                      </button>
                    </span>
                  </template>
                </div>
              </div>
            </transition-group>
            <form
              class="add-comment-form"
              @submit.prevent="addComment(post.id)"
            >
              <input
                v-model="commentInputs[post.id]"
                placeholder="Agrega un comentario..."
              />
              <button type="submit" class="btn btn-accent">Comentar</button>
            </form>
          </div>
        </transition-group>
        <transition name="fade-modal">
          <div v-if="modalPost" class="modal-feed" @click.self="closeModal">
            <div class="modal-feed-content">
              <button class="modal-close" @click="closeModal">&times;</button>
              <div class="post-header">
                <img class="avatar" :src="modalPost.user.avatar" alt="avatar" />
                <div class="post-user-info">
                  <span class="post-user">{{ modalPost.user.name }}</span>
                  <span class="post-date">{{ modalPost.date || "" }}</span>
                </div>
                <div
                  v-if="modalPost.user.uid === user.uid"
                  class="post-actions-right"
                >
                  <button
                    class="btn-icon"
                    @click="startEditPost(modalPost, true)"
                  >
                    <i class="bx bx-edit"></i>
                  </button>
                  <button
                    class="btn-icon"
                    @click="deletePost(modalPost.id, true)"
                  >
                    <i class="bx bx-trash"></i>
                  </button>
                </div>
              </div>
              <div class="post-content">
                <template v-if="editingPostId === modalPost.id">
                  <textarea
                    v-model="editPostContent"
                    rows="3"
                    class="edit-textarea"
                  ></textarea>
                  <div class="edit-actions">
                    <button
                      class="btn btn-primary"
                      @click.stop="saveEditPost(modalPost, true)"
                    >
                      Guardar
                    </button>
                    <button class="btn btn-accent" @click.stop="cancelEditPost">
                      Cancelar
                    </button>
                  </div>
                </template>
                <template v-else>
                  <p>{{ modalPost.content }}</p>
                  <img
                    v-if="modalPost.image"
                    :src="modalPost.image"
                    class="post-img"
                    alt="imagen de publicación"
                  />
                </template>
              </div>
              <div class="post-actions">
                <button
                  v-for="reaction in reactions"
                  :key="reaction.type"
                  class="reaction-btn"
                  :class="{
                    selected: modalPost.userReaction === reaction.type,
                    bounce:
                      bounceReactionId === modalPost.id + '-' + reaction.type,
                  }"
                  @click="reactWithBounce(modalPost.id, reaction.type, true)"
                >
                  <span :aria-label="reaction.label">{{ reaction.emoji }}</span>
                  <span v-if="modalPost.reactions[reaction.type]">{{
                    modalPost.reactions[reaction.type]
                  }}</span>
                </button>
              </div>
              <transition-group
                name="fade-list"
                tag="div"
                class="post-comments"
              >
                <div
                  v-for="comment in modalPost.comments"
                  :key="comment.id"
                  class="comment"
                >
                  <img
                    class="avatar avatar-sm"
                    :src="comment.avatar"
                    alt="avatar"
                  />
                  <div class="comment-body">
                    <template v-if="editingCommentId === comment.id">
                      <input
                        v-model="editCommentContent"
                        class="edit-comment-input"
                      />
                      <div class="edit-actions">
                        <button
                          class="btn btn-primary"
                          @click.stop="
                            saveEditComment(modalPost, comment, true)
                          "
                        >
                          Guardar
                        </button>
                        <button
                          class="btn btn-accent"
                          @click.stop="cancelEditComment"
                        >
                          Cancelar
                        </button>
                      </div>
                    </template>
                    <template v-else>
                      <span class="comment-user">{{ comment.user }}</span>
                      <span class="comment-text">{{ comment.text }}</span>
                      <span
                        v-if="comment.uid === user.uid"
                        class="comment-actions"
                      >
                        <button
                          class="btn-icon"
                          @click.stop="startEditComment(comment)"
                        >
                          <i class="bx bx-edit"></i>
                        </button>
                        <button
                          class="btn-icon"
                          @click.stop="deleteComment(modalPost, comment, true)"
                        >
                          <i class="bx bx-trash"></i>
                        </button>
                      </span>
                    </template>
                  </div>
                </div>
              </transition-group>
              <form
                class="add-comment-form"
                @submit.prevent="addComment(modalPost.id, true)"
              >
                <input
                  v-model="commentInputs[modalPost.id]"
                  placeholder="Agrega un comentario..."
                />
                <button type="submit" class="btn btn-accent">Comentar</button>
              </form>
            </div>
          </div>
        </transition>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from "vue";
import NavbarFeed from "../components/NavbarFeed.vue";
import SidebarFeed from "../components/SidebarFeed.vue";
import { useRouter } from "vue-router";
import { auth, db, storage } from "../../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  getDoc,
  where,
  getDocs,
} from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import UserProfile from "./UserProfile.vue";
import Chat from "./Chat.vue";
import Friends from "./Friends.vue";

const router = useRouter();
const user = ref({
  name: "Usuario",
  avatar:
    "https://ui-avatars.com/api/?name=Usuario&background=6366f1&color=fff",
  uid: null,
});
const posts = ref([]);
const newPostContent = ref("");
const newPostImage = ref(null);
const newPostImageUrl = ref("");
const commentInputs = reactive({});
const modalPost = ref(null);
const editingPostId = ref(null);
const editPostContent = ref("");
const editingCommentId = ref(null);
const editCommentContent = ref("");
const bounceReactionId = ref("");
const isSidebarCollapsed = ref(false);
const activeSection = ref("feed");
const pendingRequestsCount = ref(0);

function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
}

// Cargar solicitudes de amistad pendientes
async function loadPendingFriendRequests() {
  if (!user.value.uid) return;

  try {
    const requestsQuery = query(
      collection(db, "friend_requests"),
      where("toUserId", "==", user.value.uid),
      where("status", "==", "pending")
    );

    const snapshot = await getDocs(requestsQuery);
    pendingRequestsCount.value = snapshot.size;
  } catch (error) {
    console.error("Error cargando solicitudes pendientes:", error);
  }
}

// Escuchar cambios en las solicitudes de amistad
function listenToFriendRequests() {
  if (!user.value.uid) return;

  const requestsQuery = query(
    collection(db, "friend_requests"),
    where("toUserId", "==", user.value.uid),
    where("status", "==", "pending")
  );

  onSnapshot(requestsQuery, (snapshot) => {
    pendingRequestsCount.value = snapshot.size;
  });
}

// Función para enviar notificaciones de feed
const sendFeedNotification = async (type, post, actionUser) => {
  if (!post || !post.user || !actionUser) return;

  // No enviar notificación si el usuario se notifica a sí mismo
  if (post.user.uid === actionUser.uid) return;

  try {
    let title = "";
    let message = "";
    let notificationType = "feed_update";

    switch (type) {
      case "comment":
        title = "Nuevo comentario";
        message = `${actionUser.name} comentó en tu publicación "${post.title}"`;
        notificationType = "feed_comment";
        break;
      case "reaction":
        title = "Nueva reacción";
        message = `${actionUser.name} reaccionó a tu publicación "${post.title}"`;
        notificationType = "feed_reaction";
        break;
      default:
        return;
    }

    const notificationData = {
      toUserId: post.user.uid,
      fromUserId: actionUser.uid,
      fromUserName: actionUser.name,
      fromUserPhoto: actionUser.avatar,
      type: notificationType,
      title,
      message,
      postId: post.id,
      postTitle: post.title,
      read: false,
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, "notifications"), notificationData);
  } catch (error) {
    console.error("Error enviando notificación de feed:", error);
  }
};

const reactions = [
  { type: "like", emoji: "👍", label: "Me gusta" },
  { type: "love", emoji: "❤️", label: "Me encanta" },
  { type: "laugh", emoji: "😂", label: "Me divierte" },
  { type: "wow", emoji: "😮", label: "Me asombra" },
  { type: "sad", emoji: "😢", label: "Me entristece" },
  { type: "angry", emoji: "😡", label: "Me enoja" },
];

const showPostModal = ref(false);
const newPostTitle = ref("");
const newPostVisibility = ref("public");
function closePostModal() {
  showPostModal.value = false;
  newPostTitle.value = "";
  newPostContent.value = "";
  newPostImageUrl.value = "";
  newPostVisibility.value = "public";
}

const userProfileUid = ref(null);
function openUserProfileModal(uid) {
  userProfileUid.value = uid;
}
function closeUserProfileModal() {
  userProfileUid.value = null;
}

onMounted(async () => {
  const currentUser = auth.currentUser;
  let nombre = "";
  let avatar = "";
  let uid = "";
  if (currentUser) {
    uid = currentUser.uid;
    nombre = currentUser.displayName || "";
    avatar = currentUser.photoURL || "";
    // Si no hay nombre, buscar en Firestore
    if (!nombre) {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        nombre = data.name || "";
        avatar = data.photo || "";
      }
    }
    user.value.name = nombre || "Usuario";
    user.value.avatar =
      avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user.value.name
      )}&background=6366f1&color=fff`;
    user.value.uid = uid;
  } else {
    auth.onAuthStateChanged(async (u) => {
      if (u) {
        uid = u.uid;
        nombre = u.displayName || "";
        avatar = u.photoURL || "";
        if (!nombre) {
          const userDoc = await getDoc(doc(db, "users", uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            nombre = data.name || "";
            avatar = data.photo || "";
          }
        }
        user.value.name = nombre || "Usuario";
        user.value.avatar =
          avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            user.value.name
          )}&background=6366f1&color=fff`;
        user.value.uid = uid;
      }
    });
  }
  // Escuchar publicaciones en tiempo real
  const postsQuery = query(
    collection(db, "feed_posts"),
    orderBy("createdAt", "desc")
  );
  onSnapshot(postsQuery, (snapshot) => {
    const prevPosts = posts.value.map((p) => ({ ...p }));
    posts.value = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      // Si no hay avatar, genera uno con las iniciales del nombre
      if (!data.user.avatar) {
        data.user.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
          data.user.name
        )}&background=6366f1&color=fff`;
      }
      return {
        id: docSnap.id,
        ...data,
        comments: data.comments || [],
        reactions: data.reactions || {},
        userReaction:
          data.userReactions && user.value.uid
            ? data.userReactions[user.value.uid]
            : null,
      };
    });
    // Detectar notificaciones
    nextTick(() => {
      posts.value.forEach((post) => {
        if (post.user && post.user.uid === user.value.uid) {
        }
      });
    });
  });
  loadPendingFriendRequests();
  listenToFriendRequests();
});

function onImageChange(e) {
  const file = e.target.files[0];
  if (file) {
    newPostImage.value = file;
    const reader = new FileReader();
    reader.onload = (ev) => {
      newPostImageUrl.value = ev.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    newPostImage.value = null;
    newPostImageUrl.value = "";
  }
}

async function addPost() {
  if (!user.value.name || user.value.name === "Usuario") {
    return;
  }
  if (!newPostTitle.value.trim() || !newPostContent.value.trim()) return;
  await addDoc(collection(db, "feed_posts"), {
    user: {
      name: user.value.name,
      avatar: user.value.avatar,
      uid: user.value.uid,
    },
    title: newPostTitle.value,
    content: newPostContent.value,
    image: newPostImageUrl.value,
    visibility: newPostVisibility.value,
    createdAt: serverTimestamp(),
    comments: [],
    reactions: {},
    userReactions: {},
  });
  closePostModal();
}

async function reactToPost(postId, type, isModal = false) {
  const post = posts.value.find((p) => p && p.id === postId);
  if (!post || !user.value.uid) return;
  const postRef = doc(db, "feed_posts", postId);
  // Lógica: solo una reacción por usuario
  const prevReaction = post.userReactions && post.userReactions[user.value.uid];
  let newReactions = { ...post.reactions };
  let newUserReactions = { ...post.userReactions };
  if (prevReaction && prevReaction !== type) {
    if (newReactions[prevReaction]) {
      newReactions[prevReaction]--;
      if (newReactions[prevReaction] === 0) delete newReactions[prevReaction];
    }
  }
  if (prevReaction === type) {
    if (newReactions[type]) {
      newReactions[type]--;
      if (newReactions[type] === 0) delete newReactions[type];
    }
    delete newUserReactions[user.value.uid];
  } else {
    if (!newReactions[type]) newReactions[type] = 0;
    newReactions[type]++;
    newUserReactions[user.value.uid] = type;

    // Enviar notificación solo cuando se agrega una nueva reacción
    await sendFeedNotification("reaction", post, user.value);
  }
  await updateDoc(postRef, {
    reactions: newReactions,
    userReactions: newUserReactions,
  });
}

async function addComment(postId, isModal = false) {
  const text = commentInputs[postId];
  if (!text || !text.trim()) return;
  const postRef = doc(db, "feed_posts", postId);
  const post = posts.value.find((p) => p && p.id === postId);
  if (!post) return;
  const newComment = {
    id: Date.now(),
    user: user.value.name,
    avatar: user.value.avatar,
    text,
    uid: user.value.uid,
    createdAt: new Date().toISOString(),
  };
  const updatedComments = [...(post.comments || []), newComment];
  await updateDoc(postRef, {
    comments: updatedComments,
  });

  // Enviar notificación de comentario
  await sendFeedNotification("comment", post, user.value);

  commentInputs[postId] = "";
}

function openModal(post) {
  modalPost.value = JSON.parse(JSON.stringify(post));
}
function closeModal() {
  modalPost.value = null;
}

function goBackToApp() {
  router.push("/dashboard");
}

function startEditPost(post, isModal = false) {
  editingPostId.value = post.id;
  editPostContent.value = post.content;
}
function cancelEditPost() {
  editingPostId.value = null;
  editPostContent.value = "";
}
async function saveEditPost(post, isModal = false) {
  if (!editPostContent.value.trim()) return;
  const postRef = doc(db, "feed_posts", post.id);
  await updateDoc(postRef, { content: editPostContent.value });
  editingPostId.value = null;
  editPostContent.value = "";
  if (isModal && modalPost.value)
    modalPost.value.content = editPostContent.value;
}
async function deletePost(postId, isModal = false) {
  if (!window.confirm("¿Seguro que quieres eliminar esta publicación?")) return;
  await deleteDoc(doc(db, "feed_posts", postId));
  if (isModal) closeModal();
}
function startEditComment(comment) {
  editingCommentId.value = comment.id;
  editCommentContent.value = comment.text;
}
function cancelEditComment() {
  editingCommentId.value = null;
  editCommentContent.value = "";
}
async function saveEditComment(post, comment, isModal = false) {
  if (!editCommentContent.value.trim()) return;
  const postRef = doc(db, "feed_posts", post.id);
  const updatedComments = post.comments.map((c) =>
    c.id === comment.id ? { ...c, text: editCommentContent.value } : c
  );
  await updateDoc(postRef, { comments: updatedComments });
  editingCommentId.value = null;
  editCommentContent.value = "";
  if (isModal && modalPost.value) modalPost.value.comments = updatedComments;
}
async function deleteComment(post, comment, isModal = false) {
  if (!window.confirm("¿Seguro que quieres eliminar este comentario?")) return;
  const postRef = doc(db, "feed_posts", post.id);
  const updatedComments = post.comments.filter((c) => c.id !== comment.id);
  await updateDoc(postRef, { comments: updatedComments });
  if (isModal && modalPost.value) modalPost.value.comments = updatedComments;
}

function reactWithBounce(postId, type, isModal = false) {
  bounceReactionId.value = postId + "-" + type;
  setTimeout(() => {
    bounceReactionId.value = "";
  }, 500);
  reactToPost(postId, type, isModal);
}

function goToUserProfile(uid) {
  if (!uid) return;
  openUserProfileModal(uid);
}
</script>

<style scoped>
html,
body {
  overflow: hidden !important;
  height: 100vh !important;
}
.feed-layout {
  display: flex;
  background: var(--background-secondary);
  min-height: 100vh;
  width: 100%;
  /* No height, no overflow */
}
.feed-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100vh;
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  box-shadow: none;
  align-items: stretch;
  justify-content: flex-start;
  padding: 88px 40px 40px 40px;
  margin: 0;
  overflow-y: auto;
}
.feed-full {
  min-height: 100vh;
  width: 100vw;
  max-width: 100vw;
  padding: 0;
  margin: 0;
  background: var(--background-secondary, #f8fafc);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.feed-header {
  margin-bottom: 2rem;
  margin-top: 2rem;
  width: 100%;
  max-width: 600px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 0.5rem;
}
.btn-create-post {
  background: var(--primary);
  color: #fff;
  font-weight: 600;
  font-size: 1.1rem;
  padding: 0.75rem 2.2rem 0.75rem 1.5rem;
  border-radius: 999px;
  border: none;
  box-shadow: 0 4px 16px rgba(30, 58, 138, 0.12);
  display: flex;
  align-items: center;
  gap: 0.7rem;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
  outline: none;
  position: relative;
}
.btn-create-post:hover,
.btn-create-post:focus {
  background: var(--primary-light);
  box-shadow: 0 8px 24px rgba(30, 58, 138, 0.18);
  transform: translateY(-2px) scale(1.04);
}
.btn-create-post i {
  font-size: 1.3em;
  margin-right: 0.2em;
}
.new-post-form {
  background: var(--background, #fff);
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow, rgba(0, 0, 0, 0.08));
  padding: 1.5rem;
  border: 1px solid var(--border-color, #e2e8f0);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.new-post-top {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}
.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  background: #e0e7ff;
}
.avatar-sm {
  width: 32px;
  height: 32px;
}
.new-post-form textarea {
  border-radius: 8px;
  border: 1px solid var(--border-color, #e2e8f0);
  padding: 0.75rem;
  font-size: 1rem;
  resize: vertical;
  width: 100%;
}
.new-post-actions {
  display: flex;
  justify-content: flex-end;
}
.feed-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.5rem;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  /* No max-height, no overflow-y, no height */
}
.feed-post {
  background: var(--background, #fff);
  border-radius: 16px;
  box-shadow: 0 2px 12px var(--shadow, rgba(0, 0, 0, 0.1));
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  border: 1px solid var(--border-color, #e2e8f0);
  transition: box-shadow 0.2s;
  cursor: pointer;
  width: 100%;
  margin-bottom: 0;
  box-sizing: border-box;
}
.feed-post:hover {
  box-shadow: 0 6px 24px var(--shadow-hover, rgba(99, 102, 241, 0.12));
}
.post-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}
.post-user-info {
  display: flex;
  flex-direction: column;
}
.post-user {
  font-weight: 600;
  color: var(--primary, #6366f1);
}
.post-date {
  font-size: 0.85rem;
  color: var(--secondary, #64748b);
}
.post-content {
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
  word-break: break-word;
}
.post-actions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  align-items: center;
}
.reaction-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem 0.7rem;
  border-radius: 50px;
  transition: background 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  position: relative;
}
.reaction-btn.selected {
  background: var(--primary-light, #e0e7ff);
  box-shadow: 0 2px 8px var(--primary, #6366f1, 0.08);
  color: var(--primary, #6366f1);
}
.reaction-btn:hover {
  background: var(--primary-light, #e0e7ff);
}
.post-comments {
  background: var(--background-secondary, #f8fafc);
  border-radius: 0 0 12px 12px;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  padding: 1rem 1.2rem;
  max-height: 220px;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
}
.comment {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  margin-bottom: 0.5rem;
  font-size: 0.97rem;
}
.comment-body {
  background: #fff;
  border-radius: 8px;
  padding: 0.4rem 0.8rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.comment-user {
  font-weight: 600;
  margin-right: 0.5rem;
  color: var(--primary, #6366f1);
}
.add-comment-form {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.add-comment-form input {
  flex: 1;
  border-radius: 6px;
  border: 1px solid var(--border-color, #e2e8f0);
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
}
.btn {
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1rem;
}
.btn-primary {
  background: var(--primary, #6366f1);
  color: #fff;
}
.btn-primary:hover {
  background: var(--primary-dark, #4338ca);
}
.btn-accent {
  background: var(--accent, #06d6a0);
  color: #fff;
}
.btn-accent:hover {
  background: #059669;
}
/* Modal Feed */
.modal-feed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.modal-feed-content {
  background: #fff;
  border-radius: 18px;
  max-width: 500px;
  width: 95vw;
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  height: 40em;
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
.image-upload-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--primary-light, #e0e7ff);
  color: var(--primary, #6366f1);
  border-radius: 6px;
  padding: 0.3rem 0.8rem;
  font-weight: 500;
  cursor: pointer;
  font-size: 1rem;
  border: 1px solid var(--primary, #6366f1);
  transition: background 0.2s, color 0.2s;
}
.image-upload-btn:hover {
  background: var(--primary, #6366f1);
  color: #fff;
}
.image-preview {
  position: relative;
  display: inline-block;
  margin-right: 1rem;
}
.image-preview img {
  max-width: 80px;
  max-height: 80px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
.remove-img-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}
.post-img {
  margin-top: 0.7rem;
  max-width: 100%;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.btn-icon {
  background: none;
  border: none;
  color: var(--secondary, #64748b);
  font-size: 1.1rem;
  margin-left: 0.2rem;
  cursor: pointer;
  border-radius: 4px;
  padding: 0.2rem 0.4rem;
  transition: background 0.2s, color 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.btn-icon:hover {
  background: var(--primary-light, #e0e7ff);
  color: var(--primary, #6366f1);
}
.post-actions-right {
  display: flex;
  gap: 0.2rem;
  margin-left: auto;
}
.edit-textarea {
  width: 100%;
  border-radius: 8px;
  border: 1px solid var(--border-color, #e2e8f0);
  padding: 0.75rem;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}
.edit-actions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.edit-comment-input {
  width: 100%;
  border-radius: 6px;
  border: 1px solid var(--border-color, #e2e8f0);
  padding: 0.4rem 0.7rem;
  font-size: 1rem;
  margin-bottom: 0.3rem;
}
.comment-actions {
  margin-left: 0.5rem;
  display: inline-flex;
  gap: 0.2rem;
}
.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.3s;
}
.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}
.fade-list-enter-active,
.fade-list-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 2, 0.6, 1);
}
.fade-list-enter-from,
.fade-list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
.reaction-btn.bounce {
  animation: bounce 0.5s;
}
@keyframes bounce {
  0% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.3);
  }
  60% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
}

#theme-dark .feed-layout {
  background: linear-gradient(135deg, #181a20 0%, #23262f 100%) !important;
}
#theme-dark .feed-main {
  background: linear-gradient(135deg, #23262f 0%, #181a20 100%) !important;
  color: #f1f1f1;
}
/* === INPUTS Y BOTONES ESTILO IACHAT === */
.new-post-form textarea,
.add-comment-form input {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 15px 25px;
  color: #23262f;
  font-size: 1rem;
  outline: none;
  margin-bottom: 0.5rem;
  transition: background 0.2s, color 0.2s;
}
.new-post-form textarea::placeholder,
.add-comment-form input::placeholder {
  color: rgba(99, 102, 241, 0.5);
}
.new-post-actions .btn,
.add-comment-form .btn {
  background: linear-gradient(45deg, #667eea, #764ba2);
  border: none;
  border-radius: 50px;
  color: white;
  font-weight: 500;
  font-size: 1rem;
  padding: 12px 28px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.12);
}
.new-post-actions .btn:hover,
.add-comment-form .btn:hover {
  transform: scale(1.1);
}
#theme-dark .new-post-form textarea,
#theme-dark .add-comment-form input {
  background: rgba(79, 140, 255, 0.08) !important;
  color: #f1f1f1 !important;
  border: 1px solid #26334d !important;
}
#theme-dark .new-post-form textarea::placeholder,
#theme-dark .add-comment-form input::placeholder {
  color: #85c1e9 !important;
}
#theme-dark .new-post-actions .btn,
#theme-dark .add-comment-form .btn {
  background: linear-gradient(45deg, #4f8cff, #06d6a0) !important;
  color: #181a20 !important;
}
#theme-dark .new-post-actions .btn:hover,
#theme-dark .add-comment-form .btn:hover {
  background: linear-gradient(45deg, #06d6a0, #4f8cff) !important;
  color: #fff !important;
}
.user-id {
  font-size: 0.85em;
  color: #888;
  margin-left: 0.5em;
}
.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-align: center;
}
.modal-input {
  width: 100%;
  border-radius: 8px;
  border: 1px solid var(--border-color, #e2e8f0);
  padding: 0.75rem;
  font-size: 1rem;
  margin-bottom: 1rem;
}
.modal-select-group {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.2rem;
  justify-content: center;
}
#theme-dark .modal-feed {
  background: rgba(24, 26, 32, 0.85);
}
#theme-dark .modal-feed-content {
  background: #23262f;
  color: #f1f1f1;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(79, 140, 255, 0.1);
}
#theme-dark .modal-title {
  color: #a3c8ff;
}
#theme-dark .modal-input {
  background: #181a20;
  color: #f1f1f1;
  border: 1.5px solid #4f8cff;
}
#theme-dark .modal-input::placeholder {
  color: #85c1e9;
  opacity: 1;
}
#theme-dark .modal-select-group label {
  color: #a3c8ff;
}
#theme-dark .modal-close {
  color: #a3c8ff;
}
#theme-dark .btn.btn-primary {
  background: linear-gradient(45deg, #4f8cff, #06d6a0) !important;
  color: #181a20 !important;
}
#theme-dark .btn.btn-primary:hover {
  background: linear-gradient(45deg, #06d6a0, #4f8cff) !important;
  color: #fff !important;
}
.modal {
  display: none;
}
.modal.is-active {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
}
.modal-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(24, 26, 32, 0.85);
}
.modal-card {
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  max-width: 500px;
  width: 95vw;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  position: relative;
  display: flex;
  flex-direction: column;
}
.modal-card-head {
  background: #6366f1;
  color: white;
  padding: 1.2rem 1.5rem 1.2rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e2e8f0;
}
.modal-card-title {
  color: white;
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
}
.delete {
  background: none;
  border: none;
  font-size: 2rem;
  color: #fff;
  cursor: pointer;
  margin-left: 1rem;
}
.modal-card-body {
  background: #fff;
  color: #23262f;
  padding: 2rem 1.5rem 1.5rem 1.5rem;
}
.modal-card-foot {
  background: #fff;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.2rem 1.5rem;
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
@media (max-width: 600px) {
  .feed-header,
  .feed-list,
  .modal-feed-content {
    max-width: 100vw;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  .feed-post {
    padding: 1rem 0.5rem 0.5rem 0.5rem;
  }
}
</style>
