<template>
  <div class="chat-page">
    <FloatingIcons viewType="chat" />
    <div class="columns">
      <div class="column is-one-quarter">
        <div class="box">
          <h2 class="title is-4">Mis Amigos</h2>
          <div v-if="loadingUsers" class="has-text-centered py-4">
            <span class="icon is-large">
              <i class="bx bx-loader-alt bx-spin"></i>
            </span>
            <p>Cargando amigos...</p>
          </div>
          <div
            v-else-if="filteredUsers.length === 0"
            class="has-text-centered py-4"
          >
            <span class="icon is-large">
              <i class="bx bx-user-plus"></i>
            </span>
            <p class="mt-2">No tienes amigos aún</p>
            <p class="is-size-7 has-text-grey">
              Agrega amigos desde el feed para poder chatear
            </p>
          </div>
          <ul v-else>
            <li
              v-for="user in filteredUsers"
              :key="user.uid"
              @click="selectUser(user)"
              :class="{
                'is-active': selectedUser && selectedUser.uid === user.uid,
              }"
              class="is-flex is-align-items-center is-justify-content-space-between"
            >
              <div class="is-flex is-align-items-center">
                <div
                  class="user-status-indicator mr-2"
                  :class="{
                    'is-online': isUserOnline(user.uid),
                    'is-offline': !isUserOnline(user.uid),
                  }"
                ></div>
                <div class="user-name">
                  {{ user.name }}
                </div>
              </div>
              <div class="user-actions is-flex">
                <span
                  v-if="unreadMessages[user.uid]"
                  class="notification-badge"
                >
                  {{ unreadMessages[user.uid] }}
                </span>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="column">
        <div class="box">
          <h2 class="title is-4">
            Chat con
            <span
              v-if="selectedUser"
              :style="{ color: getUserColor(selectedUser.uid) }"
            >
              {{ selectedUser.name }}
            </span>
            <span v-else>...</span>
          </h2>
          <div class="messages" ref="messagesContainer">
            <div v-if="!selectedUser" class="no-chat-selected">
              <p>Selecciona un usuario para comenzar a chatear</p>
            </div>
            <div v-else-if="messages.length === 0" class="no-messages">
              <p>No hay mensajes aún. ¡Envía el primer mensaje!</p>
            </div>
            <div v-else class="messages-list">
              <div
                v-for="message in sortedMessages"
                :key="message.id"
                :class="[
                  'message-wrapper',
                  message.senderId === auth.currentUser?.uid
                    ? 'sent'
                    : 'received',
                ]"
              >
                <div
                  class="message-bubble"
                  :class="
                    message.senderId === auth.currentUser?.uid
                      ? 'sent-bubble'
                      : 'received-bubble'
                  "
                  :style="
                    message.senderId !== auth.currentUser?.uid
                      ? { borderColor: getUserColor(message.senderId) }
                      : {}
                  "
                >
                  <div class="message-header">
                    <span
                      class="message-author"
                      :style="{ color: getUserColor(message.senderId) }"
                    >
                      {{ message.author }}
                    </span>
                    <div class="message-time-container">
                      <span class="message-time">
                        {{ formatTime(message.timestamp) }}
                        <span v-if="message.edited" class="edited-indicator"
                          >(editado)</span
                        >
                      </span>
                      <button
                        v-if="message.senderId === auth.currentUser?.uid"
                        @click="toggleMessageMenu(message.id)"
                        class="message-menu-button"
                        title="Opciones del mensaje"
                      >
                        <span class="icon is-small">
                          <i class="bx bx-dots-vertical-rounded"></i>
                        </span>
                      </button>
                    </div>
                  </div>
                  <div class="message-content">
                    <!-- Renderizar mensajes con emojis -->
                    <div
                      v-if="message.text"
                      v-html="formatMessageWithEmojis(message.text)"
                    ></div>
                    <div v-if="message.pending" class="pending-message">
                      <i class="bx bx-loader-alt bx-spin"></i> Enviando...
                    </div>
                  </div>

                  <!-- Modal de opciones del mensaje -->
                  <div
                    v-if="activeMessageMenu === message.id"
                    class="message-menu-modal"
                    @click.stop
                  >
                    <div class="message-menu-content">
                      <button
                        @click="editMessage(message)"
                        class="menu-option edit-option"
                      >
                        <span class="icon is-small">
                          <i class="bx bx-edit"></i>
                        </span>
                        <span>Editar</span>
                      </button>
                      <button
                        @click="deleteMessage(message.id)"
                        class="menu-option delete-option"
                      >
                        <span class="icon is-small">
                          <i class="bx bx-trash"></i>
                        </span>
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Input de mensaje dentro del contenedor de mensajes -->
          <form
            @submit.prevent="sendMessage"
            v-if="selectedUser"
            class="message-form"
          >
            <!-- Interfaz de edición de mensaje -->
            <div v-if="editingMessage" class="edit-message-container">
              <div class="edit-message-header">
                <span class="edit-label">Editando mensaje:</span>
                <button @click="cancelMessageEdit" class="cancel-edit-button">
                  <span class="icon is-small">
                    <i class="bx bx-x"></i>
                  </span>
                </button>
              </div>
              <div class="edit-message-input-container">
                <input
                  v-model="editMessageText"
                  placeholder="Editar mensaje..."
                  class="input edit-input"
                />
                <button
                  @click="saveMessageEdit"
                  class="button is-success is-small"
                  :disabled="!editMessageText.trim()"
                >
                  <span class="icon is-small">
                    <i class="bx bx-check"></i>
                  </span>
                </button>
              </div>
            </div>

            <!-- Formulario normal de envío de mensajes -->
            <div v-else class="message-input-container">
              <input
                v-model="newMessage"
                placeholder="Escribe un mensaje..."
                class="input"
              />
              <button
                type="button"
                @click="toggleEmojiPicker"
                class="emoji-button"
                title="Emojis"
              >
                <span class="icon">
                  <i class="bx bx-smile"></i>
                </span>
              </button>
            </div>
            <button
              type="submit"
              class="button is-primary"
              v-if="!editingMessage"
            >
              <span class="icon">
                <i class="bx bx-send"></i>
              </span>
            </button>
          </form>
        </div>
      </div>

      <!-- Selector de emojis -->
      <div v-if="showEmojiPicker" class="emoji-picker">
        <div class="emoji-picker-header">
          <h4>Emojis</h4>
          <button @click="toggleEmojiPicker" class="close-button">×</button>
        </div>
        <div class="emoji-list">
          <button
            v-for="emoji in commonEmojis"
            :key="emoji"
            @click="addEmoji(emoji)"
            class="emoji-item"
          >
            {{ emoji }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick, onUnmounted } from "vue";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  getDocs,
  deleteDoc,
  doc,
  where,
  updateDoc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref as dbRef,
  set,
  onValue,
  off,
  onDisconnect,
} from "firebase/database";
import { db, auth, database } from "../../firebase";
import { useRouter } from "vue-router";
import FloatingIcons from "../components/FloatingIcons.vue";

// Interfaces actualizadas para reflejar la estructura de datos del registro
interface User {
  uid: string;
  name: string;
  email: string;
  photo: string;
  bio: string;
}

interface Message {
  id: string;
  text: string;
  author: string;
  timestamp: any;
  senderId: string;
  receiverId: string;
  read?: boolean;
  edited?: boolean;
  editedAt?: any;
  pending?: boolean; // Nuevo campo para mensajes pendientes
}

interface ReadStatus {
  [userId: string]: {
    lastReadTimestamp: any;
  };
}

interface UserColors {
  [userId: string]: string;
}

const users = ref<User[]>([]);
const selectedUser = ref<User | null>(null);
const messages = ref<Message[]>([]);
const newMessage = ref<string>("");
const currentUser = ref<User | null>(null);
const messagesContainer = ref<HTMLElement | null>(null);
const unreadMessages = ref<Record<string, number>>({});
const readStatus = ref<ReadStatus>({});
const userColors = ref<UserColors>({});
const loadingUsers = ref<boolean>(true);
const showEmojiPicker = ref<boolean>(false);
const isUploading = ref<boolean>(false);
const activeMessageMenu = ref<string | null>(null);
const editingMessage = ref<Message | null>(null);
const editMessageText = ref<string>("");
const onlineUsers = ref<Set<string>>(new Set());
const userPresenceRefs = ref<Map<string, any>>(new Map());

// Mensajes locales pending
const localPendingMessages = ref<Message[]>([]);

// Add this to your existing script setup
const router = useRouter();

// Variable global para saber con quién está chateando el usuario
if (typeof window !== "undefined") {
  window.activeChatUserId = null;
}

watch(selectedUser, (newVal) => {
  if (typeof window !== "undefined") {
    window.activeChatUserId = newVal ? newVal.uid : null;
  }
});

// Function to check user online status
const isUserOnline = (userId: string): boolean => {
  return onlineUsers.value.has(userId);
};

// Función para establecer el estado online del usuario actual
const setUserOnline = async () => {
  if (!auth.currentUser) return;

  const userStatusRef = dbRef(database, `status/${auth.currentUser.uid}`);

  // Establecer estado online
  await set(userStatusRef, {
    online: true,
    lastSeen: Date.now(),
    uid: auth.currentUser.uid,
  });

  // Establecer estado offline cuando el usuario se desconecte
  await onDisconnect(userStatusRef).set({
    online: false,
    lastSeen: Date.now(),
    uid: auth.currentUser.uid,
  });
};

// Función para escuchar el estado online de otros usuarios
const listenToUserPresence = (userId: string) => {
  if (userPresenceRefs.value.has(userId)) return; // Ya está escuchando

  const userStatusRef = dbRef(database, `status/${userId}`);

  const unsubscribe = onValue(userStatusRef, (snapshot) => {
    const data = snapshot.val();
    if (data && data.online) {
      onlineUsers.value.add(userId);
    } else {
      onlineUsers.value.delete(userId);
    }
  });

  userPresenceRefs.value.set(userId, unsubscribe);
};

// Función para limpiar los listeners de presencia
const cleanupPresenceListeners = () => {
  userPresenceRefs.value.forEach((unsubscribe) => {
    if (unsubscribe) unsubscribe();
  });
  userPresenceRefs.value.clear();
  onlineUsers.value.clear();
};

// Emojis comunes para el selector
const commonEmojis = [
  "😀",
  "😁",
  "😂",
  "🤣",
  "😃",
  "😄",
  "😅",
  "😆",
  "😉",
  "😊",
  "😋",
  "😎",
  "😍",
  "😘",
  "🥰",
  "😗",
  "😙",
  "😚",
  "🙂",
  "🤗",
  "🤔",
  "🤨",
  "😐",
  "😑",
  "😶",
  "🙄",
  "😏",
  "😣",
  "😥",
  "😮",
  "🤐",
  "😯",
  "😪",
  "😫",
  "😴",
  "😌",
  "😛",
  "😜",
  "😝",
  "🤤",
  "😒",
  "😓",
  "😔",
  "😕",
  "🙃",
  "🤑",
  "😲",
  "☹️",
  "🙁",
  "😖",
  "😞",
  "😟",
  "😤",
  "😢",
  "😭",
  "😦",
  "😧",
  "😨",
  "😩",
  "🤯",
  "👍",
  "👎",
  "👏",
  "🙌",
  "👌",
  "✌️",
  "🤘",
  "🤙",
  "👋",
  "❤️",
  "💔",
  "💯",
  "🔥",
  "⚡",
  "🌟",
  "💤",
  "💭",
  "🎵",
  "🎶",
  "🎂",
];

const usersCollection = collection(db, "users");
const messagesCollection = collection(db, "messages");
const readStatusCollection = collection(db, "readStatus");

// Lista de colores para asignar a los usuarios
const colorPalette = [
  "#FF5733",
  "#33A8FF",
  "#33FF57",
  "#FF33A8",
  "#A833FF",
  "#FF8C33",
  "#33FFC5",
  "#FF33F5",
  "#C5FF33",
  "#337BFF",
  "#FF5E3A",
  "#3AFF8C",
  "#8C3AFF",
  "#FFD13A",
  "#3AFFD1",
  "#F5A533",
  "#33FFCC",
  "#F533FF",
  "#FF3357",
  "#33FF92",
  "#FF8CFF",
  "#C533FF",
  "#33FF57",
  "#FF335B",
  "#FF8C80",
  "#33F5A8",
  "#8CFF33",
  "#A8FF33",
  "#33FF72",
  "#FF6333",
  "#FF57E5",
  "#33C5FF",
  "#F7FF33",
  "#F533D1",
  "#FF6B33",
  "#C533A8",
  "#6CFF33",
  "#33FF6C",
  "#3AFF5C",
  "#FF3A8C",
  "#9BFF33",
  "#6B33FF",
  "#33FF48",
  "#A8FF8C",
  "#FF91A8",
  "#33FFEC",
  "#FF336B",
  "#F5FF33",
  "#FF33B3",
  "#C733FF",
  "#F533FF",
  "#FF33F7",
  "#8CFFFB",
  "#FF8CF3",
  "#7CFF33",
  "#FF33AA",
  "#C8FF33",
  "#8CFFCC",
  "#33C9FF",
  "#FF3377",
  "#A8FF75",
  "#FF75A8",
  "#FF33C5",
  "#A8336B",
  "#B333FF",
  "#3A8CFF",
  "#33FF97",
  "#FF3333",
  "#FF339D",
  "#33FFFD",
  "#FF7F33",
  "#33D1FF",
  "#8CFF57",
  "#FF33F0",
  "#A833FF",
  "#D8FF33",
  "#5733FF",
  "#FF3A8C",
  "#FF6342",
  "#4BFF33",
  "#B9FF33",
];

// Computed property para filtrar al usuario actual y verificar existencia
const filteredUsers = computed(() => {
  if (!auth.currentUser) return [];

  // Filtrar solo amigos del usuario actual
  const filtered = users.value.filter((user) => {
    // Excluir al usuario actual
    if (user.uid === auth.currentUser?.uid) {
      return false;
    }

    // Verificar si el usuario tiene nombre y email
    if (!user.name || !user.email) {
      return false;
    }

    // Verificar si es amigo
    const isFriend = isUserFriend(user.uid);

    return isFriend;
  });

  return filtered;
});

// Computed property para ordenar los mensajes cronológicamente
const sortedMessages = computed(() => {
  const validMsgs = [...messages.value]
    .filter((m) => m.timestamp)
    .sort((a, b) => {
      const getMillis = (ts) =>
        ts.toMillis
          ? ts.toMillis()
          : ts.seconds
          ? ts.seconds * 1000
          : new Date(ts).getTime();
      return getMillis(a.timestamp) - getMillis(b.timestamp);
    });
  return [...validMsgs, ...localPendingMessages.value];
});

// Función para generar un color consistente para cada usuario
const getUserColor = (userId: string): string => {
  if (!userColors.value[userId]) {
    const hashCode = userId.split("").reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);

    const colorIndex = hashCode % colorPalette.length;
    userColors.value[userId] = colorPalette[colorIndex];
  }

  return userColors.value[userId];
};

const formatTime = (timestamp: any): string => {
  if (!timestamp) return "";

  const date = timestamp.toDate();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${hours}:${minutes}`;
};

// Función para identificar y convertir emojis en el texto
const formatMessageWithEmojis = (text: string): string => {
  // Expresión regular para enlaces
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // Reemplaza URLs con enlaces HTML
  const withLinks = text.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" class="message-link">${url}</a>`;
  });

  return withLinks;
};

const loadUsers = async () => {
  loadingUsers.value = true;
  try {
    // Primero cargar amigos

    await loadFriends();

    // Configurar listener en tiempo real para friendships

    const unsubscribe = listenToFriendships();
    if (unsubscribe) {
      friendshipsListeners.value.push(unsubscribe);
    } else {
    }

    const usersSnapshot = await getDocs(usersCollection);
    const loadedUsers: User[] = [];

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data() as User;

      if (userData.name && userData.email) {
        loadedUsers.push({ uid: doc.id, ...userData });
      }
    }

    users.value = loadedUsers;

    if (auth.currentUser) {
      const currentUserDoc = usersSnapshot.docs.find(
        (doc) => doc.id === auth.currentUser?.uid
      );
      if (currentUserDoc && currentUserDoc.data().name) {
        currentUser.value = {
          uid: currentUserDoc.id,
          ...currentUserDoc.data(),
        } as User;

        await loadReadStatus();
        setUserOnline(); // Establecer estado online del usuario actual
        listenToUserPresence(auth.currentUser.uid); // Escuchar estado online del usuario actual
      }
    }

    // Asignar colores a todos los usuarios
    loadedUsers.forEach((user) => {
      getUserColor(user.uid);
      // Escuchar el estado online de cada usuario
      listenToUserPresence(user.uid);
    });

    setupGlobalMessagesListener();
  } catch (error) {
    console.error("Error al cargar usuarios:", error);
  } finally {
    loadingUsers.value = false;
  }
};

// Cargar el estado de lectura de mensajes del usuario actual
const loadReadStatus = async () => {
  if (!auth.currentUser) return;

  try {
    const statusDoc = doc(readStatusCollection, auth.currentUser.uid);
    const statusSnapshot = await getDoc(statusDoc);

    if (statusSnapshot.exists()) {
      readStatus.value = statusSnapshot.data() as ReadStatus;
    } else {
      await setDoc(statusDoc, {});
    }

    calculateUnreadMessages();
  } catch (error) {
    console.error("Error al cargar el estado de lectura:", error);
  }
};

// Calcular mensajes recibidos no leídos
const calculateUnreadMessages = async () => {
  if (!auth.currentUser) return;

  for (const user of users.value) {
    if (user.uid === auth.currentUser.uid) continue;

    const lastReadTimestamp =
      readStatus.value[user.uid]?.lastReadTimestamp || new Timestamp(0, 0);

    const unreadQuery = query(
      messagesCollection,
      where("senderId", "==", user.uid),
      where("receiverId", "==", auth.currentUser.uid),
      where("timestamp", ">", lastReadTimestamp)
    );

    const unreadSnapshot = await getDocs(unreadQuery);
    unreadMessages.value[user.uid] = unreadSnapshot.size;
  }
};

const selectUser = async (user: User) => {
  selectedUser.value = user;

  loadMessages();

  // Marcar todos los mensajes como leídos para este usuario
  if (auth.currentUser) {
    const currentTimestamp = Timestamp.now();

    if (!readStatus.value[user.uid]) {
      readStatus.value[user.uid] = { lastReadTimestamp: currentTimestamp };
    } else {
      readStatus.value[user.uid].lastReadTimestamp = currentTimestamp;
    }

    const statusDoc = doc(readStatusCollection, auth.currentUser.uid);
    await updateDoc(statusDoc, {
      [user.uid]: {
        lastReadTimestamp: currentTimestamp,
      },
    }).catch(async (error) => {
      if (error.code === "not-found") {
        await setDoc(statusDoc, {
          [user.uid]: {
            lastReadTimestamp: currentTimestamp,
          },
        });
      } else {
        console.error("Error al actualizar el estado de lectura:", error);
      }
    });

    unreadMessages.value[user.uid] = 0;
  }
};

const loadMessages = () => {
  if (!selectedUser.value || !auth.currentUser) return;

  // IMPORTANTE: Ordenando por timestamp para asegurar orden cronológico
  const messagesQuery = query(messagesCollection, orderBy("timestamp"));

  onSnapshot(messagesQuery, (snapshot) => {
    messages.value = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as Message))
      .filter((message) => {
        const currentUserID = auth.currentUser?.uid;
        const selectedUserID = selectedUser.value?.uid;

        return (
          (message.senderId === currentUserID &&
            message.receiverId === selectedUserID) ||
          (message.senderId === selectedUserID &&
            message.receiverId === currentUserID)
        );
      });

    scrollToBottom();
  });
};

const setupGlobalMessagesListener = () => {
  if (!auth.currentUser) return;

  const messagesQuery = query(messagesCollection, orderBy("timestamp"));

  const startListeningTime = Timestamp.now();

  onSnapshot(messagesQuery, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const message = {
          uid: change.doc.uid,
          ...change.doc.data(),
        } as Message;

        if (
          message.receiverId === auth.currentUser?.uid &&
          message.senderId !== auth.currentUser?.uid &&
          message.timestamp.toDate() > startListeningTime.toDate()
        ) {
          // playNotificationSound(); // Eliminado porque no está definido

          if (
            !selectedUser.value ||
            selectedUser.value.uid !== message.senderId
          ) {
            const lastReadTimestamp =
              readStatus.value[message.senderId]?.lastReadTimestamp ||
              new Timestamp(0, 0);

            if (message.timestamp > lastReadTimestamp) {
              if (!unreadMessages.value[message.senderId]) {
                unreadMessages.value[message.senderId] = 0;
              }
              unreadMessages.value[message.senderId]++;
            }
          } else {
            markMessagesAsRead(message.senderId);
          }
        }
      }
    });
  });
};

const markMessagesAsRead = async (senderId: string) => {
  if (!auth.currentUser) return;

  const currentTimestamp = Timestamp.now();

  if (!readStatus.value[senderId]) {
    readStatus.value[senderId] = { lastReadTimestamp: currentTimestamp };
  } else {
    readStatus.value[senderId].lastReadTimestamp = currentTimestamp;
  }

  const statusDoc = doc(readStatusCollection, auth.currentUser.uid);
  await updateDoc(statusDoc, {
    [senderId]: {
      lastReadTimestamp: currentTimestamp,
    },
  }).catch(async (error) => {
    if (error.code === "not-found") {
      await setDoc(statusDoc, {
        [senderId]: {
          lastReadTimestamp: currentTimestamp,
        },
      });
    } else {
      console.error("Error al actualizar el estado de lectura:", error);
    }
  });

  unreadMessages.value[senderId] = 0;
};

// Función para alternar el selector de emojis
const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value;
};

// Función para alternar el menú de opciones del mensaje
const toggleMessageMenu = (messageId: string) => {
  if (activeMessageMenu.value === messageId) {
    activeMessageMenu.value = null;
  } else {
    activeMessageMenu.value = messageId;
  }
};

// Función para cerrar el menú de opciones
const closeMessageMenu = () => {
  activeMessageMenu.value = null;
};

// Función para editar un mensaje
const editMessage = (message: Message) => {
  editingMessage.value = message;
  editMessageText.value = message.text;
  closeMessageMenu();
};

// Función para guardar la edición del mensaje
const saveMessageEdit = async () => {
  if (!editingMessage.value || !editMessageText.value.trim()) return;

  try {
    const messageRef = doc(db, "messages", editingMessage.value.id);
    await updateDoc(messageRef, {
      text: editMessageText.value.trim(),
      edited: true,
      editedAt: Timestamp.now(),
    });

    editingMessage.value = null;
    editMessageText.value = "";
  } catch (error) {
    console.error("Error al editar el mensaje:", error);
  }
};

// Función para cancelar la edición
const cancelMessageEdit = () => {
  editingMessage.value = null;
  editMessageText.value = "";
};

// Función para añadir un emoji al mensaje
const addEmoji = (emoji: string) => {
  newMessage.value += emoji;
};

// Función para enviar notificación de mensaje privado
const sendMessageNotification = async (messageData: Message) => {
  // No notificar si el usuario se envía mensaje a sí mismo
  if (messageData.senderId === messageData.receiverId) return;

  // Verificar si el receptor es amigo
  if (!isUserFriend(messageData.receiverId)) return;

  // NO enviar notificación si el receptor está en el chat con el emisor
  if (
    typeof window !== "undefined" &&
    window.activeChatUserId === messageData.senderId
  )
    return;

  // Obtener datos del usuario emisor
  const senderDoc = await getDoc(doc(db, "users", messageData.senderId));
  const senderData = senderDoc.exists() ? senderDoc.data() : {};

  // Crear notificación
  const notificationData = {
    toUserId: messageData.receiverId,
    fromUserId: messageData.senderId,
    fromUserName: senderData.name || messageData.author || "Usuario",
    fromUserPhoto: senderData.photo || null,
    type: "dm_message",
    title: "Nuevo mensaje de tu amigo",
    message: messageData.text,
    chatUserId: messageData.senderId,
    read: false,
    createdAt: serverTimestamp(),
  };
  await addDoc(collection(db, "notifications"), notificationData);
};

const sendMessage = async () => {
  if (
    !newMessage.value.trim() ||
    !selectedUser.value ||
    !currentUser.value ||
    !auth.currentUser
  )
    return;

  // Crear mensaje local pending
  const tempId = `pending-${Date.now()}-${Math.random()}`;
  const pendingMsg = {
    id: tempId,
    text: newMessage.value,
    author: currentUser.value.name,
    senderId: auth.currentUser.uid,
    receiverId: selectedUser.value.uid,
    pending: true,
  };
  localPendingMessages.value.push(pendingMsg);

  // Crear mensaje para Firestore
  const messageData = {
    text: newMessage.value,
    author: currentUser.value.name,
    timestamp: Timestamp.now(),
    senderId: auth.currentUser.uid,
    receiverId: selectedUser.value.uid,
    read: false,
  };

  // Agregar mensaje a Firestore
  await addDoc(messagesCollection, messageData);

  // Enviar notificación de mensaje privado
  await sendMessageNotification(messageData);

  // Resetear campo después de enviar
  newMessage.value = "";

  scrollToBottom();
};

const deleteMessage = async (messageId: string) => {
  try {
    await deleteDoc(doc(db, "messages", messageId));
  } catch (error) {
    console.error("Error al eliminar el mensaje:", error);
  }
};

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

watch(messages, (msgs) => {
  if (!localPendingMessages.value.length) return;
  localPendingMessages.value = localPendingMessages.value.filter((pending) => {
    // Elimina el pending si hay un mensaje real con el mismo texto, autor, sender, receiver y timestamp válido
    return !msgs.some(
      (msg) =>
        !msg.pending &&
        msg.text === pending.text &&
        msg.author === pending.author &&
        msg.senderId === pending.senderId &&
        msg.receiverId === pending.receiverId &&
        msg.timestamp // Solo si ya tiene timestamp
    );
  });
});

onMounted(() => {
  loadUsers();

  // Event listener para cerrar el modal cuando se hace clic fuera
  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    // Solo cerrar si no se hace clic en el botón del menú o en el modal
    if (
      !target.closest(".message-menu-modal") &&
      !target.closest(".message-menu-button") &&
      !target.closest(".message-time-container")
    ) {
      closeMessageMenu();
    }
  });
});

// Limpiar listeners cuando el componente se desmonte
onUnmounted(() => {
  cleanupPresenceListeners();
  friendshipsListeners.value.forEach((unsubscribe) => {
    if (unsubscribe) unsubscribe();
  });
  friendshipsListeners.value = [];
});

// Función para verificar si un usuario es amigo del usuario actual
const isUserFriend = (friendUid: string): boolean => {
  if (!auth.currentUser) return false;

  // Debug: mostrar información

  // Buscar en la colección de friendships
  // Un usuario es amigo si existe un documento en friendships donde:
  // - userId es el usuario actual Y friendId es el amigo, O
  // - userId es el amigo Y friendId es el usuario actual
  const isFriend = friends.value.some((friendship) => {
    const condition1 =
      friendship.userId === auth.currentUser?.uid &&
      friendship.friendId === friendUid;
    const condition2 =
      friendship.userId === friendUid &&
      friendship.friendId === auth.currentUser?.uid;

    return condition1 || condition2;
  });

  return isFriend;
};

// Agregar estado para amigos
const friends = ref<any[]>([]);
const friendshipsListeners = ref<any[]>([]);

// Función para cargar amigos del usuario actual
const loadFriends = async () => {
  if (!auth.currentUser) return;

  try {
    // Cargar friendships donde el usuario actual es userId
    const friendshipsQuery1 = query(
      collection(db, "friendships"),
      where("userId", "==", auth.currentUser.uid)
    );
    const snapshot1 = await getDocs(friendshipsQuery1);

    // Cargar friendships donde el usuario actual es friendId
    const friendshipsQuery2 = query(
      collection(db, "friendships"),
      where("friendId", "==", auth.currentUser.uid)
    );
    const snapshot2 = await getDocs(friendshipsQuery2);

    const friendsData: any[] = [];
    const processedFriendIds = new Set(); // Para evitar duplicados

    // Procesar friendships donde el usuario actual es userId
    snapshot1.forEach((doc) => {
      const friendship = doc.data();

      // Solo agregar si no hemos procesado este friendId antes
      if (!processedFriendIds.has(friendship.friendId)) {
        friendsData.push({
          id: doc.id,
          userId: friendship.userId,
          friendId: friendship.friendId,
          createdAt: friendship.createdAt,
        });
        processedFriendIds.add(friendship.friendId);
      }
    });

    // Procesar friendships donde el usuario actual es friendId
    snapshot2.forEach((doc) => {
      const friendship = doc.data();

      // Solo agregar si no hemos procesado este userId antes
      if (!processedFriendIds.has(friendship.userId)) {
        friendsData.push({
          id: doc.id,
          userId: friendship.userId,
          friendId: friendship.friendId,
          createdAt: friendship.createdAt,
        });
        processedFriendIds.add(friendship.userId);
      }
    });

    friends.value = friendsData;
  } catch (error) {
    console.error("Error al cargar amigos:", error);
  }
};

// Función para escuchar cambios en friendships en tiempo real
const listenToFriendships = () => {
  if (!auth.currentUser) {
    return;
  }

  // Crear una función que combine ambas queries
  const updateFriendships = async () => {
    try {
      // Query 1: friendships donde el usuario actual es userId
      const friendshipsQuery1 = query(
        collection(db, "friendships"),
        where("userId", "==", auth.currentUser.uid)
      );

      // Query 2: friendships donde el usuario actual es friendId
      const friendshipsQuery2 = query(
        collection(db, "friendships"),
        where("friendId", "==", auth.currentUser.uid)
      );

      // Ejecutar ambas queries
      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(friendshipsQuery1),
        getDocs(friendshipsQuery2),
      ]);

      const allFriendsData: any[] = [];
      const processedFriendIds = new Set(); // Para evitar duplicados

      // Procesar friendships donde el usuario actual es userId
      snapshot1.forEach((doc) => {
        const friendship = doc.data();

        // Solo agregar si no hemos procesado este friendId antes
        if (!processedFriendIds.has(friendship.friendId)) {
          allFriendsData.push({
            id: doc.id,
            userId: friendship.userId,
            friendId: friendship.friendId,
            createdAt: friendship.createdAt,
          });
          processedFriendIds.add(friendship.friendId);
        }
      });

      // Procesar friendships donde el usuario actual es friendId
      snapshot2.forEach((doc) => {
        const friendship = doc.data();

        // Solo agregar si no hemos procesado este userId antes
        if (!processedFriendIds.has(friendship.userId)) {
          allFriendsData.push({
            id: doc.id,
            userId: friendship.userId,
            friendId: friendship.friendId,
            createdAt: friendship.createdAt,
          });
          processedFriendIds.add(friendship.userId);
        }
      });

      friends.value = allFriendsData;
    } catch (error) {
      console.error("Error actualizando friendships:", error);
    }
  };

  // Configurar listener para la colección friendships completa
  const friendshipsCollectionRef = collection(db, "friendships");
  const unsubscribe = onSnapshot(friendshipsCollectionRef, (snapshot) => {
    snapshot.docChanges().forEach((change) => {});

    // Actualizar friendships cuando hay cambios
    updateFriendships();
  });

  // Ejecutar la primera vez
  updateFriendships();

  return unsubscribe;
};
</script>

<style scoped>
.columns {
  height: 85vh;
  margin-top: 20px;
  align-items: stretch;
}

.box {
  height: calc(100% - 80px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* Estilo específico para el sidebar de amigos */
.column.is-one-quarter .box {
  height: calc(100% - 80px);
  display: flex;
  flex-direction: column;
}

.column.is-one-quarter .box ul {
  flex: 1;
  overflow-y: auto;
}

/* Estilo específico para el área de chat */
.column:not(.is-one-quarter) .box {
  height: calc(100% - 80px);
  display: flex;
  flex-direction: column;
}

.column:not(.is-one-quarter) .messages {
  flex: 1;
  overflow-y: auto;
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

li {
  padding: 10px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s;
  border-radius: 4px;
  margin-bottom: 5px;
  flex-shrink: 0;
}

li:hover {
  background-color: #00d1b2;
}

li.is-active {
  background-color: #00d1b2;
  color: rgb(255, 255, 255);
}

.user-name {
  font-weight: 500;
}

.title.is-4 {
  margin-bottom: 10px;
  flex-shrink: 0;
}

.notification-badge {
  background-color: #ff3860;
  color: white;
  border-radius: 50%;
  padding: 2px 8px;
  font-size: 0.8rem;
  margin-left: 5px;
  font-weight: bold;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  /* background-color: hsl(220, 74%, 63%); */
  border-radius: 8px;
  min-height: 300px;
  position: relative;
}

.messages-list {
  display: flex;
  flex-direction: column;
}

.no-chat-selected,
.no-messages {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #888;
  font-style: italic;
}

.message-wrapper {
  display: flex;
  margin-bottom: 10px;
  width: 100%;
  position: relative;
}

.sent {
  justify-content: flex-end;
}

.received {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 70%;
  padding: 8px 12px;
  border-radius: 12px;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  color: black;
}

.sent-bubble {
  background-color: #dcf8c6;
  border-top-right-radius: 2px;
}

.received-bubble {
  background-color: white;
  border-top-left-radius: 2px;
  border-left: 3px solid;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 0.8rem;
}

.message-author {
  font-weight: bold;
}

.message-time {
  opacity: 0.7;
  margin-left: 8px;
}

.message-time-container {
  display: flex;
  align-items: center;
}

.edited-indicator {
  font-size: 0.7rem;
  opacity: 0.6;
  font-style: italic;
  margin-left: 4px;
}

.message-content {
  word-break: break-word;
  line-height: 1.4;
}

.message-link {
  color: #3273dc;
  text-decoration: underline;
}

.message-menu-button {
  background-color: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 2px 4px;
  opacity: 0;
  transition: opacity 0.2s;
  border-radius: 50%;
  margin-left: 8px;
}

.message-time-container:hover .message-menu-button {
  opacity: 0.8;
}

.message-menu-button:hover {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.1);
}

.message-menu-modal {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  min-width: 120px;
  border: 1px solid #ddd;
  margin-top: 4px;
}

.message-menu-content {
  padding: 4px 0;
}

.menu-option {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 0.9rem;
}

.menu-option:hover {
  background-color: #f5f5f5;
}

.menu-option .icon {
  margin-right: 8px;
}

.edit-option {
  color: #3273dc;
}

.delete-option {
  color: #ff3860;
}

.edit-message-container {
  width: 100%;
  margin-bottom: 10px;
}

.edit-message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 8px 12px;
  background-color: #f0f8ff;
  border-radius: 6px;
  border-left: 3px solid #3273dc;
}

.edit-label {
  font-size: 0.9rem;
  color: #3273dc;
  font-weight: 500;
}

.cancel-edit-button {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.cancel-edit-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.edit-message-input-container {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 20px;
  padding: 5px 15px;
  border: 2px solid #3273dc;
}

.edit-input {
  flex: 1;
  border: none;
  box-shadow: none;
  background: transparent;
}

.delete-button {
  background-color: transparent;
  border: none;
  color: #ff3860;
  cursor: pointer;
  font-size: 0.7rem;
  padding: 0;
  opacity: 0;
  position: absolute;
  right: 4px;
  bottom: 4px;
  transition: opacity 0.2s;
}

.message-bubble:hover .delete-button {
  opacity: 0.8;
}

.delete-button:hover {
  opacity: 1;
}

.message-form {
  display: flex;
  margin-top: auto;
  padding: 10px;
  background-color: transparent;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  width: 100%;
  align-items: center;
  gap: 10px;
  position: sticky;
  bottom: 0;
  border-radius: 0 0 8px 8px;
}

.message-input-container {
  display: flex;
  flex: 1;
  position: relative;
  align-items: center;
  background-color: white;
  border-radius: 20px;
  padding: 5px 15px;
  border: 2px solid #3273dc;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  min-width: 0;
}

.message-input-container:hover {
  border-color: #4f8cff;
  box-shadow: 0 0 0 3px rgba(50, 115, 220, 0.1);
}

.message-input-container:focus-within {
  border-color: #4f8cff;
  box-shadow: 0 0 0 3px rgba(50, 115, 220, 0.2);
}

.message-input-container .input {
  flex: 1;
  border-radius: 20px;
  padding-left: 15px;
  border: none;
  box-shadow: none;
}

.emoji-button,
.file-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: #0000009e;
  transition: color 0.2s;
  font-size: 1.2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.emoji-button:hover,
.file-button:hover {
  color: #00d1b2;
  background-color: rgba(255, 255, 255, 0.1);
}

button.is-primary {
  border-radius: 50%;
  width: 40px;
  height: 40px;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.emoji-picker {
  position: absolute;
  bottom: 80px;
  right: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  width: 320px;
  max-height: 300px;
  z-index: 1000;
  overflow-y: auto;
}

.emoji-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
}

.emoji-picker-header h4 {
  margin: 0;
  font-weight: 500;
}

.close-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
}

.emoji-list {
  display: flex;
  flex-wrap: wrap;
  padding: 10px;
}

.emoji-item {
  width: 35px;
  height: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  cursor: pointer;
  background: none;
  border: none;
  transition: background-color 0.2s;
  border-radius: 5px;
}

.emoji-item:hover {
  background-color: #f5f5f5;
}

.upload-indicator {
  display: flex;
  align-items: center;
  margin-top: 8px;
  padding: 8px;
  background-color: #f5f5f5;
  border-radius: 5px;
}

.upload-indicator .icon {
  margin-right: 8px;
  color: #00d1b2;
}

.user-status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
  border: 2px solid white;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.user-status-indicator.is-online {
  background-color: #48bb78; /* Green */
  animation: pulse 2s infinite;
}

.user-status-indicator.is-offline {
  background-color: #a0aec0; /* Gray */
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(72, 187, 120, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(72, 187, 120, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(72, 187, 120, 0);
  }
}

.user-actions {
  align-items: center;
}

/* Estilo para dispositivos móviles */
@media screen and (max-width: 768px) {
  .column.is-one-quarter {
    width: 40%;
  }

  .message-bubble {
    max-width: 85%;
  }

  .emoji-picker {
    width: 280px;
    right: 20px;
  }
}

/* Estilos para el mensaje de no amigos */
.has-text-centered .icon.is-large {
  color: #00d1b2;
  margin-bottom: 1rem;
}

.has-text-centred p {
  margin-bottom: 0.5rem;
}

.has-text-grey {
  color: #888 !important;
}

/* ===== MODO OSCURO PARA CHAT ===== */
#theme-dark .columns {
  background: linear-gradient(135deg, #181a20 0%, #23262f 100%);
}

#theme-dark .box {
  background: #23262f;
  color: #f1f1f1;
  border: 1.5px solid #4f8cff;
  box-shadow: 0 2px 12px rgba(79, 140, 255, 0.1);
}

#theme-dark .title {
  color: #a3c8ff;
}

#theme-dark .messages {
  /* background: #181a20; */
  border: 1px solid #26334d;
}

#theme-dark .no-chat-selected,
#theme-dark .no-messages {
  color: #85c1e9;
}

#theme-dark .message-bubble {
  color: #f1f1f1;
}

#theme-dark .sent-bubble {
  background: linear-gradient(45deg, #4f8cff, #06d6a0);
  color: #181a20;
}

#theme-dark .received-bubble {
  background: rgba(79, 140, 255, 0.1);
  color: #a3c8ff;
  border-left: 3px solid #4f8cff;
}

#theme-dark .message-author {
  color: #a3c8ff;
}

#theme-dark .message-time {
  color: #85c1e9;
}

#theme-dark .message-link {
  color: #4f8cff;
}

#theme-dark .delete-button {
  color: #f87171;
}

#theme-dark .delete-button:hover {
  color: #dc2626;
  background-color: rgba(248, 113, 113, 0.1);
}

#theme-dark .message-form {
  border-top: 1px solid #26334d;
}

#theme-dark .message-input-container {
  background: rgba(79, 140, 255, 0.08);
  border: 2px solid #4f8cff;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

#theme-dark .message-input-container:hover {
  border-color: #6ba3ff;
  box-shadow: 0 0 0 3px rgba(79, 140, 255, 0.2);
}

#theme-dark .message-input-container:focus-within {
  border-color: #6ba3ff;
  box-shadow: 0 0 0 3px rgba(79, 140, 255, 0.3);
}

#theme-dark .message-input-container .input {
  background: transparent;
  color: #f1f1f1;
  border: none;
}

#theme-dark .message-input-container .input::placeholder {
  color: #85c1e9;
}

#theme-dark .emoji-button {
  color: #a3c8ff;
}

#theme-dark .emoji-button:hover {
  color: #4f8cff;
  background-color: rgba(79, 140, 255, 0.1);
}

#theme-dark button.is-primary {
  background: linear-gradient(45deg, #4f8cff, #06d6a0);
  color: #181a20;
}

#theme-dark button.is-primary:hover {
  background: linear-gradient(45deg, #06d6a0, #4f8cff);
  color: #fff;
}

#theme-dark .emoji-picker {
  background: #23262f;
  border: 1.5px solid #4f8cff;
  box-shadow: 0 4px 24px rgba(79, 140, 255, 0.1);
}

#theme-dark .emoji-picker-header {
  background: #1a4d99;
  border-bottom: 1px solid #4f8cff;
}

#theme-dark .emoji-picker-header h4 {
  color: #a3c8ff;
}

#theme-dark .close-button {
  color: #a3c8ff;
}

#theme-dark .emoji-item {
  color: #f1f1f1;
}

#theme-dark .emoji-item:hover {
  background: rgba(79, 140, 255, 0.1);
}

#theme-dark li {
  color: #f1f1f1;
  border: 1px solid transparent;
}

#theme-dark li:hover {
  background: rgba(79, 140, 255, 0.1);
  border-color: #4f8cff;
}

#theme-dark li.is-active {
  background: #4f8cff;
  color: #181a20;
  border-color: #4f8cff;
}

#theme-dark .user-name {
  color: #f1f1f1;
}

#theme-dark .user-status-indicator.is-online {
  background: #4ade80;
}

#theme-dark .user-status-indicator.is-offline {
  background: #6b7280;
}

#theme-dark .notification-badge {
  background: #f87171;
  color: #181a20;
}

#theme-dark .button.is-small.is-light {
  background: rgba(79, 140, 255, 0.1);
  color: #a3c8ff;
  border: 1px solid #4f8cff;
}

#theme-dark .button.is-small.is-light:hover {
  background: rgba(79, 140, 255, 0.2);
  color: #4f8cff;
}

/* Estilos del modal de opciones del mensaje en modo oscuro */
#theme-dark .message-menu-button {
  color: #a3c8ff;
}

#theme-dark .message-time-container:hover .message-menu-button {
  opacity: 0.8;
}

#theme-dark .message-menu-button:hover {
  background-color: rgba(79, 140, 255, 0.1);
}

#theme-dark .message-menu-modal {
  background: #23262f;
  border: 1.5px solid #4f8cff;
  box-shadow: 0 4px 24px rgba(79, 140, 255, 0.1);
}

#theme-dark .menu-option {
  color: #f1f1f1;
}

#theme-dark .menu-option:hover {
  background-color: rgba(79, 140, 255, 0.1);
}

#theme-dark .edit-option {
  color: #4f8cff;
}

#theme-dark .delete-option {
  color: #f87171;
}

/* Estilos de la interfaz de edición en modo oscuro */
#theme-dark .edit-message-header {
  background: rgba(79, 140, 255, 0.1);
  border-left: 3px solid #4f8cff;
}

#theme-dark .edit-label {
  color: #4f8cff;
}

#theme-dark .cancel-edit-button {
  color: #a3c8ff;
}

#theme-dark .cancel-edit-button:hover {
  background-color: rgba(79, 140, 255, 0.1);
}

#theme-dark .edit-message-input-container {
  background: rgba(79, 140, 255, 0.08);
  border: 2px solid #4f8cff;
}

#theme-dark .edit-input {
  background: transparent;
  color: #f1f1f1;
}

#theme-dark .edit-input::placeholder {
  color: #85c1e9;
}

#theme-dark .edited-indicator {
  color: #85c1e9;
  opacity: 0.8;
}

#theme-dark .user-status-indicator {
  border: 2px solid #23262f;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
}

#theme-dark .user-status-indicator.is-online {
  background: #4ade80;
  animation: pulse-dark 2s infinite;
}

#theme-dark .user-status-indicator.is-offline {
  background: #6b7280;
}

@keyframes pulse-dark {
  0% {
    box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(74, 222, 128, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(74, 222, 128, 0);
  }
}

/* Estilos para el mensaje de no amigos en modo oscuro */
#theme-dark .has-text-centered .icon.is-large {
  color: #4f8cff;
}

#theme-dark .has-text-grey {
  color: #85c1e9 !important;
}

/* Estilos del modal de opciones del mensaje en modo oscuro */
</style>
