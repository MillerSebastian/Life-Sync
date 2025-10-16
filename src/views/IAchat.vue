<template>
  <div class="iachat-layout">
    <FloatingIcons viewType="iachat" />
    <!-- Sidebar de chats -->
    <aside class="chat-sidebar" :class="{ collapsed: isSidebarCollapsed }">
      <div class="sidebar-header">
        <h2 v-if="!isSidebarCollapsed">Lisy IA</h2>
        <span v-else>LS</span>
        <button class="toggle-btn" @click="toggleSidebar">
          <i
            class="bx"
            :class="isSidebarCollapsed ? 'bx-menu' : 'bx-menu-alt-left'"
          ></i>
        </button>
      </div>
      <!-- Botón Nuevo chat -->
      <div class="sidebar-actions">
        <button class="btn btn-accent w-100 mb-2" @click="newChat">
          <i class="bx bx-plus"></i>
          <span v-if="!isSidebarCollapsed" class="ml-2">Nuevo chat</span>
        </button>
      </div>
      <nav class="chat-list">
        <div
          v-for="chat in chats"
          :key="chat.id"
          :class="['chat-item', { active: chat.id === activeChatId }]"
          @click="selectChat(chat.id)"
        >
          <i class="bx bx-message-square-dots"></i>
          <span v-if="!isSidebarCollapsed">{{ chat.title }}</span>
          <button class="delete-chat-btn" @click.stop="eliminarChat(chat.id)">
            <i class="bx bx-trash-alt"></i>
          </button>
        </div>
      </nav>
      <!-- Perfil de usuario (igual que SidebarFeed.vue) -->
      <div class="user-profile">
        <div class="avatar">
          <img :src="user.avatar" alt="avatar" />
        </div>
        <div class="user-info">
          <div class="user-name">{{ user.name }}</div>
          <div class="user-email">{{ user.email || "" }}</div>
        </div>
      </div>
      <!-- Botón Upgrade Now al fondo de la sidebar -->
      <div class="sidebar-upgrade-container">
        <button class="upgrade-btn">
          <span v-if="!isSidebarCollapsed">Upgrade Now</span>
          <span v-else>UP</span>
        </button>
      </div>
    </aside>

    <!-- Zona principal del chat -->
    <section class="chat-main">
      <div class="chat-header">
        <div v-if="loading" class="typing-status">
          <i class="bx bx-radio-circle-marked"></i>
          <span>IA escribiendo...</span>
        </div>
      </div>
      <div class="chat-messages" ref="messagesContainer">
        <div
          v-for="(msg, idx) in activeChatMessages"
          :key="idx"
          :class="['message', msg.role]"
        >
          <div class="message-content">
            <span v-if="msg.role === 'user'" class="user-label">Tú:</span>
            <span v-if="msg.role === 'bot'" class="bot-label">IA:</span>
            <span>{{ msg.content }}</span>
          </div>
        </div>

        <!-- Indicador de typing cuando la IA está escribiendo -->
        <div v-if="loading" class="message bot typing-message">
          <div class="message-content">
            <span class="bot-label">IA:</span>
            <div class="typing-indicator">
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
            </div>
          </div>
        </div>
      </div>
      <form class="chat-input" @submit.prevent="sendMessage">
        <input
          v-model="input"
          type="text"
          placeholder="Escribe tu mensaje..."
          autocomplete="off"
        />
        <button
          class="btn btn-primary"
          type="submit"
          :disabled="loading || !input.trim()"
        >
          <i v-if="!loading" class="bx bx-send"></i>
          <i v-else class="bx bx-loader-alt bx-spin"></i>
        </button>
      </form>
    </section>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  watch,
} from "vue";
import axios from "axios";
import {
  DEEPSEEK_API_KEY,
  DEEPSEEK_API_URL,
  DEEPSEEK_MODEL,
  DEEPSEEK_MAX_TOKENS,
  DEEPSEEK_TEMPERATURE,
} from "@/config/api";
import { db, auth } from "../../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  deleteDoc,
  query as fsQuery,
  orderBy,
  increment,
} from "firebase/firestore";
import FloatingIcons from "../components/FloatingIcons.vue";

// Estado del sidebar
const isSidebarCollapsed = ref(false);
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

// Función para crear un nuevo chat en Firestore
const crearChatEnFirestore = async (chat) => {
  try {
    const userId = auth.currentUser?.uid || localStorage.getItem("uid");
    if (!userId) throw new Error("No se encontró el usuario autenticado.");
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, "user_chats"), {
      userId,
      title: chat.title,
      createdAt: now,
      updatedAt: now,
      messageCount: 0,
    });
    return { ok: true, id: docRef.id };
  } catch (e) {
    return { ok: false, error: e.message };
  }
};

// Función para cargar todos los chats del usuario
const cargarChatsDeFirestore = async () => {
  try {
    const userId = auth.currentUser?.uid || localStorage.getItem("uid");
    if (!userId) return [];

    const chatsQuery = query(
      collection(db, "user_chats"),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc")
    );
    const snapshot = await getDocs(chatsQuery);
    const chatsData = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      chatsData.push({
        id: doc.id,
        title: data.title,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        messageCount: data.messageCount || 0,
        messages: [], // Los mensajes se cargarán por separado
      });
    });

    return chatsData;
  } catch (e) {
    console.error("Error cargando chats:", e);
    return [];
  }
};

// Función para cargar mensajes de un chat específico
const cargarMensajesDeChat = async (chatId) => {
  try {
    const userId = auth.currentUser?.uid || localStorage.getItem("uid");
    if (!userId) return [];

    const mensajesRef = collection(db, "user_chats", chatId, "messages");
    const mensajesQuery = query(mensajesRef, orderBy("timestamp", "asc"));
    const snapshot = await getDocs(mensajesQuery);
    const mensajes = [];

    snapshot.forEach((doc) => {
      mensajes.push(doc.data());
    });

    return mensajes;
  } catch (e) {
    console.error("Error cargando mensajes del chat:", e);
    return [];
  }
};

// Función para actualizar el título del chat
const actualizarTituloChat = async (chatId, nuevoTitulo) => {
  try {
    const chatRef = doc(db, "user_chats", chatId);
    await updateDoc(chatRef, {
      title: nuevoTitulo,
      updatedAt: new Date().toISOString(),
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
};

// Función para eliminar un chat
const eliminarChatDeFirestore = async (chatId) => {
  try {
    const userId = auth.currentUser?.uid || localStorage.getItem("uid");
    if (!userId) throw new Error("No se encontró el usuario autenticado.");

    // Eliminar todos los mensajes del chat
    const mensajesRef = collection(db, "user_chats", chatId, "messages");
    const mensajesSnapshot = await getDocs(mensajesRef);
    const deletePromises = mensajesSnapshot.docs.map((doc) =>
      deleteDoc(doc.ref)
    );
    await Promise.all(deletePromises);

    // Eliminar el chat
    await deleteDoc(doc(db, "user_chats", chatId));

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
};

// Estado de chats (conectado a Firestore)
const chats = ref([]);
const activeChatId = ref(null);
const input = ref("");
const loading = ref(false);

const newChat = async () => {
  const newChatData = {
    title: `Chat ${chats.value.length + 1}`,
    messages: [
      { role: "bot", content: "¡Nuevo chat iniciado! ¿Qué deseas hacer?" },
    ],
  };

  // Crear chat en Firestore
  const resultado = await crearChatEnFirestore(newChatData);
  if (resultado.ok) {
    const chatCreado = {
      id: resultado.id,
      title: newChatData.title,
      messages: newChatData.messages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 1,
    };

    // Agregar mensaje inicial al chat
    await guardarMensajeEnFirestore(newChatData.messages[0], resultado.id);

    // Agregar al inicio de la lista
    chats.value.unshift(chatCreado);
    activeChatId.value = resultado.id;
    nextTick(() => scrollToBottom());
  }
};

const selectChat = async (id) => {
  activeChatId.value = id;

  // Cargar mensajes del chat seleccionado si no están cargados
  const chatSeleccionado = chats.value.find((c) => c.id === id);
  if (chatSeleccionado && chatSeleccionado.messages.length === 0) {
    const mensajes = await cargarMensajesDeChat(id);
    chatSeleccionado.messages = mensajes;
  }

  nextTick(() => scrollToBottom());
};

const eliminarChat = async (chatId) => {
  if (confirm("¿Estás seguro de que quieres eliminar este chat?")) {
    const resultado = await eliminarChatDeFirestore(chatId);
    if (resultado.ok) {
      // Remover el chat de la lista local
      const index = chats.value.findIndex((c) => c.id === chatId);
      if (index !== -1) {
        chats.value.splice(index, 1);
      }

      // Si el chat eliminado era el activo, seleccionar otro
      if (activeChatId.value === chatId) {
        if (chats.value.length > 0) {
          activeChatId.value = chats.value[0].id;
          // Cargar mensajes del nuevo chat activo
          const mensajes = await cargarMensajesDeChat(chats.value[0].id);
          chats.value[0].messages = mensajes;
        } else {
          // Si no hay más chats, crear uno nuevo
          await newChat();
        }
      }
    }
  }
};

const activeChat = computed(() =>
  chats.value.find((c) => c.id === activeChatId.value)
);
const activeChatTitle = computed(() => activeChat.value?.title || "Chat");
const activeChatMessages = computed(() => activeChat.value?.messages || []);

// Watch para hacer scroll automático cuando cambien los mensajes
watch(
  activeChatMessages,
  () => {
    nextTick(() => {
      scrollToBottom();
    });
  },
  { deep: true }
);

const messagesContainer = ref(null);
const scrollToBottom = () => {
  nextTick(() => {
    // Hacer scroll en el contenedor principal del chat
    const chatMain = document.querySelector(".chat-main");
    if (chatMain) {
      chatMain.scrollTop = chatMain.scrollHeight;
    }
  });
};

// Llamada a DeepSeek
const callDeepSeek = async (userMessage) => {
  try {
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: DEEPSEEK_MODEL,
        messages: [
          {
            role: "system",
            content: `Eres un asistente virtual amigable y útil llamada Lisy. Si el usuario te pide explícitamente crear, editar, eliminar o listar una tarea o evento, responde SOLO en formato JSON como se indica abajo. Si el usuario solo conversa, saluda o hace preguntas generales, responde de forma natural y conversacional, NO en formato JSON.

Formato JSON para TAREAS:
Para crear una tarea:
{
  "intencion": "crear_tarea",
  "title": "...",
  "description": "...",
  "dueDate": "...",
  "priority": "baja|media|alta",
  "status": "pendiente|en_progreso|completada"
}

Para editar una tarea:
{
  "intencion": "editar_tarea",
  "title": "...",
  "description": "...",
  "dueDate": "...",
  "priority": "baja|media|alta",
  "status": "pendiente|en_progreso|completada"
}

Para eliminar una tarea:
{
  "intencion": "eliminar_tarea",
  "title": "..."
}

Para listar tareas:
{
  "intencion": "listar_tareas"
}

Formato JSON para EVENTOS:
Para crear un evento:
{
  "intencion": "crear_evento",
  "title": "...",
  "description": "...",
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "duration": "...",
  "location": "...",
  "type": "personal|trabajo|familiar|otro"
}

Para editar un evento:
{
  "intencion": "editar_evento",
  "title": "...",
  "description": "...",
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "duration": "...",
  "location": "...",
  "type": "personal|trabajo|familiar|otro"
}

Para eliminar un evento:
{
  "intencion": "eliminar_evento",
  "title": "..."
}

Para listar eventos:
{
  "intencion": "listar_eventos"
}

IMPORTANTE:
- Los estados de tareas deben ser: "pendiente", "en_progreso", "completada" (en español)
- Las prioridades: "baja", "media", "alta"
- Los tipos de eventos: "personal", "trabajo", "familiar", "otro"
- No uses sinónimos en los nombres de los campos ni en la intención
- Si el usuario solo quiere conversar, responde de forma natural y NO en JSON`,
          },
          { role: "user", content: userMessage },
        ],
        max_tokens: DEEPSEEK_MAX_TOKENS,
        temperature: DEEPSEEK_TEMPERATURE,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        },
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error llamando a DeepSeek:", error);
    if (error.response) {
      console.error("Respuesta del servidor:", error.response.data);
    } else if (error.request) {
      console.error("No hubo respuesta del servidor. Request:", error.request);
    } else {
      console.error("Error al configurar la petición:", error.message);
    }
    return "Ocurrió un error al consultar la IA.";
  }
};

// Función para mapear estados en español a inglés
const mapearEstadoEspanolAIngles = (estadoEspanol) => {
  const mapeo = {
    pendiente: "todo",
    en_progreso: "progress",
    completada: "completed",
  };
  return mapeo[estadoEspanol] || estadoEspanol;
};

// Función para mapear estados en inglés a español
const mapearEstadoInglesAEspanol = (estadoIngles) => {
  const mapeo = {
    todo: "pendiente",
    in_progress: "en_progreso",
    done: "completada",
  };
  return mapeo[estadoIngles] || estadoIngles;
};

// Función para mapear tipos de eventos de español a inglés
const mapearTipoEventoEspanolAIngles = (tipoEspanol) => {
  const mapeo = {
    personal: "personal",
    trabajo: "work",
    familiar: "family",
    otro: "other",
  };
  return mapeo[tipoEspanol] || tipoEspanol;
};

// Función para mapear tipos de eventos de inglés a español
const mapearTipoEventoInglesAEspanol = (tipoIngles) => {
  const mapeo = {
    personal: "personal",
    work: "trabajo",
    family: "familiar",
    other: "otro",
  };
  return mapeo[tipoIngles] || tipoIngles;
};

// Función para crear tarea en Firestore
const crearTareaEnFirestore = async (tarea) => {
  try {
    const userId = auth.currentUser?.uid || localStorage.getItem("uid");
    if (!userId) throw new Error("No se encontró el usuario autenticado.");
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, "tasks"), {
      title: tarea.title,
      description: tarea.description || "",
      category: tarea.category || "sin categoría",
      completedDate: null,
      createdAt: now,
      updatedAt: now,
      dueDate: tarea.dueDate || "",
      priority: tarea.priority || "baja",
      progress: 0,
      status: mapearEstadoEspanolAIngles(tarea.status || "pendiente"), // Mapear a inglés para Firestore
      userId,
    });
    return { ok: true, id: docRef.id };
  } catch (e) {
    return { ok: false, error: e.message };
  }
};

// Función para editar tarea en Firestore
const editarTareaEnFirestore = async (datos) => {
  try {
    const userId = auth.currentUser?.uid || localStorage.getItem("uid");
    if (!userId) throw new Error("No se encontró el usuario autenticado.");
    let tareaEncontrada = null;
    let tareaId = datos.id || null;
    // Buscar por id si existe
    if (tareaId) {
      const tareaRef = doc(db, "tasks", tareaId);
      const tareaSnap = await import("firebase/firestore").then(({ getDoc }) =>
        getDoc(tareaRef)
      );
      if (tareaSnap.exists() && tareaSnap.data().userId === userId) {
        tareaEncontrada = { ...tareaSnap.data(), id: tareaSnap.id };
      }
    }
    // Si no hay id o no se encontró, buscar por coincidencia de título
    if (!tareaEncontrada && datos.title) {
      const tareasQuery = query(
        collection(db, "tasks"),
        where("userId", "==", userId)
      );
      const snapshot = await getDocs(tareasQuery);
      const coincidencias = [];
      snapshot.forEach((docSnap) => {
        const t = docSnap.data();
        if (
          t.title &&
          t.title.toLowerCase().includes(datos.title.toLowerCase())
        ) {
          coincidencias.push({ ...t, id: docSnap.id });
        }
      });
      if (coincidencias.length === 1) {
        tareaEncontrada = coincidencias[0];
        tareaId = tareaEncontrada.id;
      } else if (coincidencias.length > 1) {
        // Si hay varias coincidencias, pedir aclaración
        return {
          ok: false,
          multiple: true,
          coincidencias: coincidencias.map(
            (t) => `${t.title} (${t.status}) - ${t.dueDate || ""}`
          ),
        };
      }
    }
    if (!tareaEncontrada || !tareaId) {
      return { ok: false, error: "No se encontró la tarea a editar." };
    }
    // Construir el objeto de actualización solo con los campos presentes
    const updateFields = {};
    [
      "title",
      "description",
      "dueDate",
      "priority",
      "status",
      "category",
    ].forEach((campo) => {
      if (typeof datos[campo] !== "undefined") {
        // Mapear estado en español a inglés si es necesario
        if (campo === "status") {
          updateFields[campo] = mapearEstadoEspanolAIngles(datos[campo]);
        } else {
          updateFields[campo] = datos[campo];
        }
      }
    });
    updateFields.updatedAt = new Date().toISOString();
    await updateDoc(doc(db, "tasks", tareaId), updateFields);
    return { ok: true, tarea: { ...tareaEncontrada, ...updateFields } };
  } catch (e) {
    return { ok: false, error: e.message };
  }
};

// Función para eliminar tarea en Firestore
const eliminarTareaEnFirestore = async (datos) => {
  try {
    const userId = auth.currentUser?.uid || localStorage.getItem("uid");
    if (!userId) throw new Error("No se encontró el usuario autenticado.");
    let tareaEncontrada = null;
    let tareaId = datos.id || null;
    // Buscar por id si existe
    if (tareaId) {
      const tareaRef = doc(db, "tasks", tareaId);
      const tareaSnap = await import("firebase/firestore").then(({ getDoc }) =>
        getDoc(tareaRef)
      );
      if (tareaSnap.exists() && tareaSnap.data().userId === userId) {
        tareaEncontrada = { ...tareaSnap.data(), id: tareaSnap.id };
      }
    }
    // Si no hay id o no se encontró, buscar por coincidencia de título
    if (!tareaEncontrada && datos.title) {
      const tareasQuery = query(
        collection(db, "tasks"),
        where("userId", "==", userId)
      );
      const snapshot = await getDocs(tareasQuery);
      const coincidencias = [];
      snapshot.forEach((docSnap) => {
        const t = docSnap.data();
        if (
          t.title &&
          t.title.toLowerCase().includes(datos.title.toLowerCase())
        ) {
          coincidencias.push({ ...t, id: docSnap.id });
        }
      });
      if (coincidencias.length === 1) {
        tareaEncontrada = coincidencias[0];
        tareaId = tareaEncontrada.id;
      } else if (coincidencias.length > 1) {
        // Si hay varias coincidencias, pedir aclaración
        return {
          ok: false,
          multiple: true,
          coincidencias: coincidencias.map(
            (t) => `${t.title} (${t.status}) - ${t.dueDate || ""}`
          ),
        };
      }
    }
    if (!tareaEncontrada || !tareaId) {
      return { ok: false, error: "No se encontró la tarea a eliminar." };
    }
    await deleteDoc(doc(db, "tasks", tareaId));
    return { ok: true, tarea: tareaEncontrada };
  } catch (e) {
    return { ok: false, error: e.message };
  }
};

// Función para obtener tareas en Firestore
const obtenerTareasEnFirestore = async () => {
  const userId = auth.currentUser?.uid || localStorage.getItem("uid");
  if (!userId) throw new Error("No se encontró el usuario autenticado.");
  const tareasQuery = query(
    collection(db, "tasks"),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(tareasQuery);
  const tareas = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    tareas.push({
      id: docSnap.id,
      title: data.title,
      status: mapearEstadoInglesAEspanol(data.status), // Mapear a español para mostrar
      dueDate: data.dueDate,
      priority: data.priority,
      description: data.description,
      category: data.category,
    });
  });
  return tareas;
};

// Función para obtener eventos en Firestore
const obtenerEventosEnFirestore = async () => {
  const userId = auth.currentUser?.uid || localStorage.getItem("uid");
  if (!userId) throw new Error("No se encontró el usuario autenticado.");
  const eventosQuery = query(
    collection(db, "events"),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(eventosQuery);
  const eventos = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    eventos.push({
      id: docSnap.id,
      title: data.title,
      date: data.date,
      time: data.time,
      description: data.description,
      duration: data.duration,
      location: data.location,
      type: mapearTipoEventoInglesAEspanol(data.type), // Mapear a español para mostrar
    });
  });
  return eventos;
};

//Crear evento
const crearEventoEnFirestore = async (evento) => {
  try {
    const userId = auth.currentUser?.uid || localStorage.getItem("uid");
    if (!userId) throw new Error("No se encontró el usuario autenticado.");
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, "events"), {
      title: evento.title,
      date: evento.date,
      description: evento.description || "",
      duration: evento.duration,
      location: evento.location || "sin ubicación",
      time: evento.time,
      type: mapearTipoEventoEspanolAIngles(evento.type || "personal"), // Mapear a inglés para Firestore
      userId,
    });
    return { ok: true, id: docRef.id };
  } catch (e) {
    return { ok: false, error: e.message };
  }
};

// Editar evento
const editarEventoEnFirestore = async (datos) => {
  try {
    const userId = auth.currentUser?.uid || localStorage.getItem("uid");
    if (!userId) throw new Error("No se encontró el usuario autenticado.");
    let eventoEncontrado = null;
    let eventoId = datos.id || null;
    // Buscar por id si existe
    if (eventoId) {
      const eventoRef = doc(db, "events", eventoId);
      const eventoSnap = await import("firebase/firestore").then(({ getDoc }) =>
        getDoc(eventoRef)
      );
      if (eventoSnap.exists() && eventoSnap.data().userId === userId) {
        eventoEncontrado = { ...eventoSnap.data(), id: eventoSnap.id };
      }
    }
    // Si no hay id o no se encontró, buscar por coincidencia de título
    if (!eventoEncontrado && datos.title) {
      const eventosQuery = query(
        collection(db, "events"),
        where("userId", "==", userId)
      );
      const snapshot = await getDocs(eventosQuery);
      const coincidencias = [];
      snapshot.forEach((docSnap) => {
        const t = docSnap.data();
        if (
          t.title &&
          t.title.toLowerCase().includes(datos.title.toLowerCase())
        ) {
          coincidencias.push({ ...t, id: docSnap.id });
        }
      });
      if (coincidencias.length === 1) {
        eventoEncontrado = coincidencias[0];
        eventoId = eventoEncontrado.id;
      } else if (coincidencias.length > 1) {
        // Si hay varias coincidencias, pedir aclaración
        return {
          ok: false,
          multiple: true,
          coincidencias: coincidencias.map(
            (t) => `${t.title} (${t.location}) - ${t.date || ""}`
          ),
        };
      }
    }
    if (!eventoEncontrado || !eventoId) {
      return { ok: false, error: "No se encontró el evento a editar." };
    }
    // Construir el objeto de actualización solo con los campos presentes
    const updateFields = {};
    [
      "title",
      "date",
      "description",
      "duration",
      "location",
      "time",
      "type",
    ].forEach((campo) => {
      if (typeof datos[campo] !== "undefined") {
        // Mapear tipo de evento en español a inglés si es necesario
        if (campo === "type") {
          updateFields[campo] = mapearTipoEventoEspanolAIngles(datos[campo]);
        } else {
          updateFields[campo] = datos[campo];
        }
      }
    });
    updateFields.updatedAt = new Date().toISOString();
    await updateDoc(doc(db, "events", eventoId), updateFields);
    return { ok: true, evento: { ...eventoEncontrado, ...updateFields } };
  } catch (e) {
    return { ok: false, error: e.message };
  }
};

// Eliminar evento
const eliminarEventoEnFirestore = async (datos) => {
  try {
    const userId = auth.currentUser?.uid || localStorage.getItem("uid");
    if (!userId) throw new Error("No se encontró el usuario autenticado.");
    let eventoEncontrado = null;
    let eventoId = datos.id || null;
    // Buscar por id si existe
    if (eventoId) {
      const eventoRef = doc(db, "events", eventoId);
      const eventoSnap = await import("firebase/firestore").then(({ getDoc }) =>
        getDoc(eventoRef)
      );
      if (eventoSnap.exists() && eventoSnap.data().userId === userId) {
        eventoEncontrado = { ...eventoSnap.data(), id: eventoSnap.id };
      }
    }
    // Si no hay id o no se encontró, buscar por coincidencia de título
    if (!eventoEncontrado && datos.title) {
      const eventosQuery = query(
        collection(db, "events"),
        where("userId", "==", userId)
      );
      const snapshot = await getDocs(eventosQuery);
      const coincidencias = [];
      snapshot.forEach((docSnap) => {
        const t = docSnap.data();
        if (
          t.title &&
          t.title.toLowerCase().includes(datos.title.toLowerCase())
        ) {
          coincidencias.push({ ...t, id: docSnap.id });
        }
      });
      if (coincidencias.length === 1) {
        eventoEncontrado = coincidencias[0];
        eventoId = eventoEncontrado.id;
      } else if (coincidencias.length > 1) {
        // Si hay varias coincidencias, pedir aclaración
        return {
          ok: false,
          multiple: true,
          coincidencias: coincidencias.map(
            (t) => `${t.title} (${t.location}) - ${t.date || ""}`
          ),
        };
      }
    }
    if (!eventoEncontrado || !eventoId) {
      return { ok: false, error: "No se encontró el evento a eliminar." };
    }
    await deleteDoc(doc(db, "events", eventoId));
    return { ok: true, evento: eventoEncontrado };
  } catch (e) {
    return { ok: false, error: e.message };
  }
};

// Función para generar título automático del chat basado en el primer mensaje
const generarTituloChat = (mensaje) => {
  if (!mensaje || mensaje.length < 10) return "Nuevo chat";

  // Tomar las primeras 30 palabras del mensaje
  const palabras = mensaje.split(" ").slice(0, 30);
  let titulo = palabras.join(" ");

  // Si el título es muy largo, truncarlo
  if (titulo.length > 50) {
    titulo = titulo.substring(0, 47) + "...";
  }

  return titulo;
};

// Función para actualizar el título del chat si es el primer mensaje
const actualizarTituloSiEsPrimerMensaje = async (chatId, mensaje) => {
  const chat = chats.value.find((c) => c.id === chatId);
  if (chat && chat.messages.length === 1) {
    // Solo el mensaje inicial del bot
    const nuevoTitulo = generarTituloChat(mensaje);
    const resultado = await actualizarTituloChat(chatId, nuevoTitulo);
    if (resultado.ok) {
      chat.title = nuevoTitulo;
    }
  }
};

// Guardar mensaje en Firestore (subcolección del chat específico)
const guardarMensajeEnFirestore = async (mensaje, chatId) => {
  const userId = auth.currentUser?.uid || localStorage.getItem("uid");
  if (!userId || !chatId) return;
  try {
    await addDoc(collection(db, "user_chats", chatId, "messages"), {
      userId,
      role: mensaje.role,
      content: mensaje.content,
      timestamp: new Date().toISOString(),
      chatId: chatId, // Añadir el ID del chat al mensaje
    });

    // Actualizar el contador de mensajes del chat
    const chatRef = doc(db, "user_chats", chatId);
    await updateDoc(chatRef, {
      messageCount: increment(1),
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error("Error guardando mensaje en Firestore:", e);
  }
};
const sendMessage = async () => {
  if (!input.value.trim()) return;
  const msg = { role: "user", content: input.value };
  activeChat.value.messages.push(msg);
  await guardarMensajeEnFirestore(msg, activeChat.value.id);

  // Actualizar título del chat si es el primer mensaje del usuario
  await actualizarTituloSiEsPrimerMensaje(activeChat.value.id, input.value);

  scrollToBottom(); // Scroll después del mensaje del usuario
  const userInput = input.value;
  input.value = "";

  // Activar loading inmediatamente para mostrar indicador de typing
  loading.value = true;
  scrollToBottom(); // Scroll para mostrar el indicador de typing

  // Llamada real a DeepSeek
  const iaResponse = await callDeepSeek(userInput);
  let parsed;
  try {
    parsed = JSON.parse(iaResponse.replace(/^```json|```$/g, "").trim());
  } catch (e) {
    const botMsg = { role: "bot", content: iaResponse };
    activeChat.value.messages.push(botMsg);
    await guardarMensajeEnFirestore(botMsg, activeChat.value.id);
    loading.value = false;
    scrollToBottom(); // Scroll después del mensaje de la IA
    return;
  }
  // Log para depuración

  let botMsg = null;
  if (parsed.intencion === "crear_tarea") {
    // Validar que haya título
    if (
      !parsed.title ||
      typeof parsed.title !== "string" ||
      !parsed.title.trim()
    ) {
      activeChat.value.messages.push({
        role: "bot",
        content: "¿Cuál es el título de la tarea que quieres crear?",
      });
      loading.value = false;
      scrollToBottom(); // Scroll después del mensaje de error
      return;
    }
    // Asegurar valores por defecto para los campos opcionales
    const tarea = {
      title: parsed.title,
      description: parsed.description || "",
      category: parsed.category || "sin categoría",
      completedDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: parsed.dueDate || "",
      priority: parsed.priority || "baja",
      progress: 0,
      status: parsed.status || "pendiente", // Estado en español por defecto
    };
    const resultado = await crearTareaEnFirestore(tarea);
    if (resultado.ok) {
      botMsg = {
        role: "bot",
        content: parsed.respuesta || `✅ Tarea creada: ${parsed.title}`,
      };
      activeChat.value.messages.push(botMsg);
      await guardarMensajeEnFirestore(botMsg, activeChat.value.id);
    } else {
      activeChat.value.messages.push({
        role: "bot",
        content: `❌ Error al crear la tarea: ${resultado.error}`,
      });
    }
    scrollToBottom(); // Scroll después de crear tarea
  } else if (parsed.intencion === "editar_tarea") {
    const resultado = await editarTareaEnFirestore(parsed);
    if (resultado.ok) {
      botMsg = {
        role: "bot",
        content:
          parsed.respuesta || `✅ Tarea editada: ${resultado.tarea.title}`,
      };
    } else if (resultado.multiple) {
      botMsg = {
        role: "bot",
        content: `Se encontraron varias tareas con ese nombre. Por favor, especifica a cuál te refieres:\n- ${resultado.coincidencias.join(
          "\n- "
        )}`,
      };
    } else {
      botMsg = {
        role: "bot",
        content: `❌ Error al editar la tarea: ${resultado.error}`,
      };
    }
    activeChat.value.messages.push(botMsg);
    await guardarMensajeEnFirestore(botMsg, activeChat.value.id);
    scrollToBottom(); // Scroll después de editar tarea
  } else if (parsed.intencion === "eliminar_tarea") {
    const resultado = await eliminarTareaEnFirestore(parsed);
    if (resultado.ok) {
      botMsg = {
        role: "bot",
        content:
          parsed.respuesta || `🗑️ Tarea eliminada: ${resultado.tarea.title}`,
      };
    } else if (resultado.multiple) {
      botMsg = {
        role: "bot",
        content: `Se encontraron varias tareas con ese nombre. Por favor, especifica a cuál te refieres:\n- ${resultado.coincidencias.join(
          "\n- "
        )}`,
      };
    } else {
      botMsg = {
        role: "bot",
        content: `❌ Error al eliminar la tarea: ${resultado.error}`,
      };
    }
    activeChat.value.messages.push(botMsg);
    await guardarMensajeEnFirestore(botMsg, activeChat.value.id);
    scrollToBottom(); // Scroll después de eliminar tarea
  } else if (parsed.intencion === "listar_tareas") {
    // Listar tareas del usuario
    const tareas = await obtenerTareasEnFirestore();
    if (tareas.length === 0) {
      botMsg = { role: "bot", content: "No tienes tareas registradas." };
    } else {
      botMsg = {
        role: "bot",
        content: `Tus tareas:\n- ${tareas
          .map((t) => `${t.title} (${t.status}) - ${t.dueDate || ""}`)
          .join("\n- ")}`,
      };
    }
    activeChat.value.messages.push(botMsg);
    await guardarMensajeEnFirestore(botMsg, activeChat.value.id);
    scrollToBottom(); // Scroll después de listar tareas
  } else if (parsed.intencion === "crear_evento") {
    // Validar que haya título
    if (
      !parsed.title ||
      typeof parsed.title !== "string" ||
      !parsed.title.trim()
    ) {
      activeChat.value.messages.push({
        role: "bot",
        content: "¿Cuál es el título del evento que quieres crear?",
      });
      loading.value = false;
      scrollToBottom(); // Scroll después del mensaje de error
      return;
    }
    // Asegurar valores por defecto para los campos opcionales
    const evento = {
      title: parsed.title,
      description: parsed.description || "",
      date: parsed.date || "",
      time: parsed.time || "",
      duration: parsed.duration || "",
      location: parsed.location || "sin ubicación",
      type: parsed.type || "personal",
    };
    const resultado = await crearEventoEnFirestore(evento);
    if (resultado.ok) {
      botMsg = {
        role: "bot",
        content: parsed.respuesta || `✅ Evento creado: ${parsed.title}`,
      };
      activeChat.value.messages.push(botMsg);
      await guardarMensajeEnFirestore(botMsg, activeChat.value.id);
    } else {
      activeChat.value.messages.push({
        role: "bot",
        content: `❌ Error al crear el evento: ${resultado.error}`,
      });
    }
    scrollToBottom(); // Scroll después de crear evento
  } else if (parsed.intencion === "editar_evento") {
    const resultado = await editarEventoEnFirestore(parsed);
    if (resultado.ok) {
      botMsg = {
        role: "bot",
        content:
          parsed.respuesta || `✅ Evento editado: ${resultado.evento.title}`,
      };
    } else if (resultado.multiple) {
      botMsg = {
        role: "bot",
        content: `Se encontraron varios eventos con ese nombre. Por favor, especifica a cuál te refieres:\n- ${resultado.coincidencias.join(
          "\n- "
        )}`,
      };
    } else {
      botMsg = {
        role: "bot",
        content: `❌ Error al editar el evento: ${resultado.error}`,
      };
    }
    activeChat.value.messages.push(botMsg);
    await guardarMensajeEnFirestore(botMsg, activeChat.value.id);
    scrollToBottom(); // Scroll después de editar evento
  } else if (parsed.intencion === "eliminar_evento") {
    const resultado = await eliminarEventoEnFirestore(parsed);
    if (resultado.ok) {
      botMsg = {
        role: "bot",
        content:
          parsed.respuesta || `🗑️ Evento eliminado: ${resultado.evento.title}`,
      };
    } else if (resultado.multiple) {
      botMsg = {
        role: "bot",
        content: `Se encontraron varios eventos con ese nombre. Por favor, especifica a cuál te refieres:\n- ${resultado.coincidencias.join(
          "\n- "
        )}`,
      };
    } else {
      botMsg = {
        role: "bot",
        content: `❌ Error al eliminar el evento: ${resultado.error}`,
      };
    }
    activeChat.value.messages.push(botMsg);
    await guardarMensajeEnFirestore(botMsg, activeChat.value.id);
    scrollToBottom(); // Scroll después de eliminar evento
  } else if (parsed.intencion === "listar_eventos") {
    // Listar eventos del usuario
    const eventos = await obtenerEventosEnFirestore();
    if (eventos.length === 0) {
      botMsg = { role: "bot", content: "No tienes eventos registrados." };
    } else {
      botMsg = {
        role: "bot",
        content: `Tus eventos:\n- ${eventos
          .map((e) => `${e.title} (${e.type}) - ${e.date} ${e.time}`)
          .join("\n- ")}`,
      };
    }
    activeChat.value.messages.push(botMsg);
    await guardarMensajeEnFirestore(botMsg, activeChat.value.id);
    scrollToBottom(); // Scroll después de listar eventos
  } else {
    botMsg = { role: "bot", content: parsed.respuesta || iaResponse };
    activeChat.value.messages.push(botMsg);
    await guardarMensajeEnFirestore(botMsg, activeChat.value.id);
    scrollToBottom(); // Scroll después de mensaje general
  }
  loading.value = false;
};

const user = ref({
  name: "Usuario",
  avatar:
    "https://ui-avatars.com/api/?name=Usuario&background=6366f1&color=fff",
  uid: null,
});
onMounted(() => {
  const cargarUsuario = async () => {
    const currentUser = auth.currentUser;
    let nombre = "";
    let avatar = "";
    let uid = "";
    if (currentUser) {
      uid = currentUser.uid;
      nombre = currentUser.displayName || "";
      avatar = currentUser.photoURL || "";
      user.value.email = currentUser.email || "";
      // Si no hay nombre, buscar en Firestore
      if (!nombre) {
        const userDoc = await import("firebase/firestore").then(({ getDoc }) =>
          getDoc(doc(db, "users", uid))
        );
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
          user.value.email = u.email || "";
          if (!nombre) {
            const userDoc = await import("firebase/firestore").then(
              ({ getDoc }) => getDoc(doc(db, "users", uid))
            );
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
  };
  cargarUsuario();
});

// Bloquear scroll global solo en la vista de chat
onMounted(async () => {
  const cargarChats = async () => {
    const userId = auth.currentUser?.uid || localStorage.getItem("uid");
    if (!userId) return;

    // Cargar todos los chats del usuario
    const chatsData = await cargarChatsDeFirestore();
    chats.value = chatsData;

    // Si hay chats, seleccionar el más reciente y cargar sus mensajes
    if (chatsData.length > 0) {
      const chatMasReciente = chatsData[0];
      activeChatId.value = chatMasReciente.id;

      // Cargar mensajes del chat más reciente
      const mensajes = await cargarMensajesDeChat(chatMasReciente.id);
      chatMasReciente.messages = mensajes;
    } else {
      // Si no hay chats, crear uno nuevo
      await newChat();
    }
  };

  await cargarChats();

  const main = document.querySelector(".main-content");
  if (main) main.classList.add("no-scroll-main");
});
onUnmounted(() => {
  const main = document.querySelector(".main-content");
  if (main) main.classList.remove("no-scroll-main");
});
</script>

<style scoped>
/* --- Modernización visual inspirada en Chatrock --- */
.iachat-layout {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  backdrop-filter: blur(10px);
  width: 100%;
  max-width: none;
  margin: 0;
  height: 100vh;
}

/* --- Sidebar animación y colapsado mejorado --- */
.chat-sidebar {
  width: 280px;
  min-width: 70px;
  max-width: 300px;
  background: linear-gradient(180deg, #6b46c1 0%, #553c9a 100%);
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.4, 2, 0.6, 1);
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 10;
  height: calc(
    100vh - 64px
  ); /* Ajusta la altura para dejar espacio al topbar (ajusta 64px según el alto real de tu topbar) */
  margin-top: 64px; /* Baja el sidebar para que no quede debajo del topbar */
  box-sizing: border-box;
  overflow: hidden;
  border-radius: 0 20px 20px 0;
  padding: 0;
  padding-top: 1%;
  padding-bottom: 4%; /* Quitar el padding-top extra */
}
.chat-sidebar.collapsed {
  width: 70px;
  min-width: 70px;
  max-width: 70px;
  transition: width 0.3s cubic-bezier(0.4, 2, 0.6, 1);
}
.chat-sidebar.collapsed .sidebar-header {
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 6em;
  padding: 20px 8px 0 8px;
}
.chat-sidebar.collapsed .sidebar-header h2,
.chat-sidebar.collapsed .sidebar-header span {
  text-align: center;
  width: 100%;
}
.chat-sidebar.collapsed .toggle-btn {
  margin: 10px auto 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
}
.chat-sidebar.collapsed .sidebar-actions span {
  display: none;
}
.chat-sidebar.collapsed .chat-item span {
  display: none;
}
.chat-sidebar.collapsed .chat-item {
  width: 48px;
  min-width: 48px;
  max-width: 48px;
  padding: 12px 0;
  justify-content: center;
  align-items: center;
  gap: 0;
}
.chat-sidebar.collapsed .chat-item i {
  margin: 0;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.chat-sidebar.collapsed .user-profile {
  flex-direction: column;
  align-items: center;
  left: 0;
  padding: 10px 0;
}
.chat-sidebar.collapsed .user-info {
  display: none;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 12px 20px; /* Menos padding arriba para que quepa bien */
  background: var(--primary-dark, #553c9a);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: static;
  width: 100%;
  z-index: 2;
}

.sidebar-actions {
  padding: 20px 20px 0 20px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chat-list {
  flex: 1;
  padding: 20px 0 20px 0;
  overflow-y: auto;
  background: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.chat-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.9);
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(102, 126, 234, 0.08) 100%
  );
  margin: 0;
  min-width: 160px;
  max-width: 90%;
  width: 90%;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  font-weight: 500;
  font-size: 1rem;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.04);
  position: relative;
}
.chat-item.active,
.chat-item:hover {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.12);
}
.chat-item i {
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-item {
  position: relative;
}

.delete-chat-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  font-size: 14px;
  opacity: 0;
  transition: all 0.2s;
}

.chat-item:hover .delete-chat-btn {
  opacity: 1;
}

.delete-chat-btn:hover {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
}

.chat-sidebar.collapsed .delete-chat-btn {
  display: none;
}

/* Zona principal del chat */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100vh;
  padding-top: 88px;
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  border-radius: 20px 0 0 20px;
  box-shadow: none;
  align-items: stretch; /* Cambiar de center a stretch */
  justify-content: flex-start; /* Cambiar de center a flex-start */
  padding: 40px;
  overflow-y: auto; /* Scroll en el contenedor principal */
  overflow-x: hidden;
}

.chat-header {
  padding: 24px 32px 12px 32px;
  border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  background: var(--background, transparent);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h3 {
  margin: 0;
  font-size: 2rem;
  color: white;
  font-weight: 300;
  margin-bottom: 20px;
}

.typing-status {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  animation: typing-pulse 2s infinite;
}

.typing-status i {
  color: #667eea;
  animation: typing-pulse 2s infinite;
}

@keyframes typing-pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

/* Modo oscuro para el indicador de typing en header */
#theme-dark .typing-status {
  color: rgba(163, 200, 255, 0.8);
}

#theme-dark .typing-status i {
  color: #4f8cff;
}

.chat-messages {
  flex: 1;
  overflow-y: visible; /* Sin scroll interno */
  padding: 20px 60px 16px 60px; /* Más padding lateral */
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: none;
  color: rgba(255, 255, 255, 0.9);
  max-width: calc(100% - 120px); /* Ajustar ancho máximo */
  width: calc(100% - 120px); /* Ajustar ancho */
  margin: 0 auto;
  margin-left: 60px; /* Mover toda la sección hacia la derecha */
  clear: both; /* Limpiar flotantes */
}

.message {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  margin-bottom: 8px;
  width: 100%;
  min-height: 50px;
  position: relative;
  clear: both; /* Limpiar flotantes */
}

.message.user {
  flex-direction: row-reverse;
  justify-content: flex-end;
  width: 100%;
  padding-left: 50%; /* Aumentar aún más el padding */
  margin-left: auto;
  margin-right: 0;
  position: relative;
  right: 0; /* Forzar posición a la derecha */
}

.message.user .message-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px 20px 4px 20px;
  max-width: 70%; /* Reducir para que no se extienda demasiado */
  min-width: 250px;
  margin-left: 0;
  margin-right: 0;
  text-align: left;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  position: relative;
  align-self: flex-end;
  float: right;
  transform: translateX(0);
  right: 0; /* Forzar posición a la derecha */
}

.message.user .message-content::after {
  content: "";
  position: absolute;
  bottom: 0;
  right: -10px;
  width: 0;
  height: 0;
  border: 10px solid transparent;
  border-left-color: #764ba2;
  border-bottom: none;
  border-right: none;
}

.message.bot {
  justify-content: flex-start;
  width: 100%;
  padding-right: 50%; /* Aumentar aún más el padding */
  margin-right: auto;
  margin-left: 0;
  position: relative;
  left: 0; /* Forzar posición a la izquierda */
}

.message.bot .message-content {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  border-radius: 20px 20px 20px 4px;
  max-width: 70%; /* Reducir para que no se extienda demasiado */
  min-width: 250px;
  margin-right: 0;
  margin-left: 0;
  text-align: left;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  position: relative;
  backdrop-filter: blur(10px);
  align-self: flex-start;
  float: left;
  transform: translateX(0);
  left: 0; /* Forzar posición a la izquierda */
}

.message.bot .message-content::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: -10px;
  width: 0;
  height: 0;
  border: 10px solid transparent;
  border-right-color: rgba(255, 255, 255, 0.15);
  border-bottom: none;
  border-left: none;
}

.message-content {
  padding: 16px 20px; /* Padding más grande */
  font-size: 1.1rem; /* Texto más grande */
  line-height: 1.5; /* Mejor espaciado de líneas */
  word-break: break-word;
  white-space: pre-wrap;
  margin-bottom: 0;
  display: inline-block;
}

.user-label {
  font-weight: 600;
  margin-right: 8px; /* Más espacio */
  color: #ffffff;
  font-size: 1rem; /* Texto más grande */
}

.bot-label {
  font-weight: 600;
  margin-right: 8px; /* Más espacio */
  color: #667eea;
  font-size: 1rem; /* Texto más grande */
}
.chat-input {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  padding: 15px 25px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-top: 20px;
  max-width: calc(100% - 120px); /* Mismo ancho que chat-messages */
  width: calc(100% - 120px); /* Mismo ancho que chat-messages */
  margin-left: 60px; /* Mismo margen que chat-messages */
  margin-right: auto;
  position: relative;
  gap: 12px;
  align-self: center; /* Centrar horizontalmente */
  padding-left: 60px; /* Mismo padding que chat-messages */
  padding-right: 60px; /* Mismo padding que chat-messages */
}
.chat-input input {
  flex: 1;
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  outline: none;
  padding: 12px 18px;
  border-radius: 8px;
}
.chat-input input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}
.chat-input button {
  background: linear-gradient(45deg, #667eea, #764ba2);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  font-size: 1.1rem;
  padding: 0;
}
.chat-input button:hover {
  transform: scale(1.1);
}
.chat-input button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.chat-input button:disabled:hover {
  transform: none;
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
.w-100 {
  width: 100%;
}
.mb-2 {
  margin-bottom: 0.75rem;
}
.mr-2 {
  margin-right: 0.5rem;
}

/* --- Mantener el bloqueo de scroll global solo en la vista de chat --- */
.iachat-layout {
  min-height: 100vh;
  height: 100vh;
  width: 100%;
  max-width: none;
  margin: 0;
  overflow: hidden; /* Bloquea el scroll general solo en el chat */
  display: flex;
}
.chat-main,
.chat-sidebar {
  height: 100vh;
  max-height: none;
  border-radius: 0;
}
.chat-main {
  border-radius: 0;
}

.sidebar-upgrade-container {
  margin-top: 0;
  padding: 24px 20px 32px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
/* Mejorar botones */
.toggle-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.08);
}
.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.13);
  transform: scale(1.08);
}
.btn.btn-accent,
.new-list-btn {
  background: linear-gradient(90deg, #764ba2 0%, #667eea 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px;
  margin: 0 auto 10px auto;
  width: 80%;
  min-width: 120px;
  max-width: 220px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.08);
}
.btn.btn-accent:hover,
.new-list-btn:hover {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.18);
}
.upgrade-btn {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  width: 100%;
  transition: all 0.3s;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.12);
}
.upgrade-btn:hover {
  background: linear-gradient(90deg, #764ba2 0%, #667eea 100%);
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
}
.user-profile {
  margin-top: 24px;
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 16px;
  position: relative;
  left: 0.5em;
}
.avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(45deg, #ff6b6b, #feca57);
  border-radius: 50%;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  overflow: hidden;
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
.user-info {
  flex: 1;
}
.user-name {
  color: white;
  font-weight: 500;
  font-size: 14px;
}
.user-email {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}
.chat-sidebar.collapsed .user-profile {
  flex-direction: column;
  align-items: center;
  left: 0;
  padding: 10px 0;
}
.chat-sidebar.collapsed .user-info {
  display: none;
}

/* ===== MODO OSCURO PARA AIchat ===== */
#theme-dark .iachat-layout {
  background: linear-gradient(135deg, #181a20 0%, #23262f 100%) !important;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}
#theme-dark .chat-sidebar {
  background: linear-gradient(180deg, #23262f 0%, #181a20 100%) !important;
  color: #f1f1f1;
  box-shadow: 2px 0 20px rgba(79, 140, 255, 0.1);
  border-right: 1.5px solid #26334d;
}
#theme-dark .sidebar-header {
  background: #1a1d23 !important;
  border-bottom: 1px solid #26334d;
}
#theme-dark .toggle-btn {
  color: #a3c8ff;
}
#theme-dark .toggle-btn:hover {
  background: rgba(79, 140, 255, 0.1);
}
#theme-dark .btn.btn-accent,
#theme-dark .new-list-btn {
  background: rgba(79, 140, 255, 0.1) !important;
  color: #a3c8ff !important;
}
#theme-dark .btn.btn-accent:hover,
#theme-dark .new-list-btn:hover {
  background: rgba(79, 140, 255, 0.18) !important;
}
#theme-dark .chat-list {
  background: none;
}
#theme-dark .chat-item {
  color: #b0b3b8 !important;
  background: transparent !important;
}
#theme-dark .chat-item.active,
#theme-dark .chat-item:hover {
  background: rgba(79, 140, 255, 0.1) !important;
  color: #4f8cff !important;
}
#theme-dark .sidebar-upgrade-container {
  background: none;
}
#theme-dark .upgrade-btn {
  background: linear-gradient(45deg, #4f8cff, #06d6a0) !important;
  color: #181a20 !important;
  box-shadow: 0 5px 15px rgba(79, 140, 255, 0.1);
}
#theme-dark .upgrade-btn:hover {
  background: linear-gradient(45deg, #06d6a0, #4f8cff) !important;
  color: #fff !important;
}
#theme-dark .user-profile {
  border-top: 1px solid #26334d;
  border-bottom: 1px solid #26334d;
}
#theme-dark .avatar {
  background: linear-gradient(45deg, #4f8cff, #06d6a0) !important;
}
#theme-dark .user-name {
  color: #a3c8ff !important;
}
#theme-dark .user-email {
  color: #85c1e9 !important;
}
#theme-dark .chat-main {
  background: linear-gradient(135deg, #23262f 0%, #181a20 100%) !important;
  border-radius: 20px 0 0 20px;
  color: #f1f1f1;
}
#theme-dark .chat-header {
  background: transparent !important;
  border-bottom: 1px solid #26334d !important;
}
#theme-dark .chat-messages {
  color: #f1f1f1 !important;
}
#theme-dark .message.user .message-content {
  background: linear-gradient(135deg, #4f8cff 0%, #06d6a0 100%) !important;
  color: #181a20 !important;
  box-shadow: 0 2px 8px rgba(79, 140, 255, 0.3);
}

#theme-dark .message.user .message-content::after {
  border-left-color: #06d6a0;
}

#theme-dark .message.bot .message-content {
  background: rgba(79, 140, 255, 0.15) !important;
  color: #a3c8ff !important;
  box-shadow: 0 2px 8px rgba(79, 140, 255, 0.1);
  backdrop-filter: blur(10px);
}

#theme-dark .message.bot .message-content::after {
  border-right-color: rgba(79, 140, 255, 0.15);
}

#theme-dark .user-label {
  color: #ffffff !important;
}

#theme-dark .bot-label {
  color: #4f8cff !important;
}
#theme-dark .chat-input {
  background: rgba(79, 140, 255, 0.08) !important;
  border: 1px solid #26334d !important;
}
#theme-dark .chat-input input {
  color: #f1f1f1 !important;
}
#theme-dark .chat-input input::placeholder {
  color: #85c1e9 !important;
}
#theme-dark .chat-input button {
  background: linear-gradient(45deg, #4f8cff, #06d6a0) !important;
  color: #181a20 !important;
}
#theme-dark .chat-input button:hover {
  background: linear-gradient(45deg, #06d6a0, #4f8cff) !important;
  color: #fff !important;
}
/* Mejorar botón Nuevo chat para colapsado y expandido */
.btn.btn-accent.w-100 {
  width: 48px;
  min-width: 48px;
  max-width: 48px;
  height: 48px;
  margin: 0 0 10px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  gap: 0;
  box-sizing: border-box;
}
.chat-sidebar:not(.collapsed) .btn.btn-accent.w-100 {
  width: 90%;
  min-width: 160px;
  max-width: 90%;
  height: auto;
  margin: 0 auto 10px auto;
  padding: 12px 24px;
  gap: 0.5em;
}
.btn.btn-accent.w-100 i {
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.chat-sidebar.collapsed .btn.btn-accent.w-100 span {
  display: none;
}

/* Upgrade Now colapsado */
.upgrade-btn {
  width: 80%;
  min-width: 48px;
  max-width: 220px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: width 0.3s cubic-bezier(0.4, 2, 0.6, 1), padding 0.3s;
}
.chat-sidebar.collapsed .upgrade-btn {
  width: 48px;
  min-width: 48px;
  max-width: 48px;
  padding: 12px 0;
  font-size: 1.1rem;
}

/* Indicador de typing */
.typing-message {
  opacity: 0.8;
}

.typing-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 0;
}

.typing-dot {
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  animation: typing-bounce 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dot:nth-child(2) {
  animation-delay: -0.16s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0s;
}

@keyframes typing-bounce {
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Modo oscuro para el indicador de typing */
#theme-dark .typing-dot {
  background: rgba(79, 140, 255, 0.7);
}

.chat-input {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  padding: 15px 25px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-top: 20px;
  max-width: calc(100% - 120px); /* Mismo ancho que chat-messages */
  width: calc(100% - 120px); /* Mismo ancho que chat-messages */
  margin-left: 60px; /* Mismo margen que chat-messages */
  margin-right: auto;
  position: relative;
  gap: 12px;
  align-self: center; /* Centrar horizontalmente */
  padding-left: 60px; /* Mismo padding que chat-messages */
  padding-right: 60px; /* Mismo padding que chat-messages */
}
</style>

<style>
.no-scroll-main.main-content {
  min-height: 100vh !important;
  padding-top: 0 !important;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  overflow: hidden !important;
}
</style>

/* Estilos personalizados para la barra de scroll del chat */
.chat-main::-webkit-scrollbar { width: 8px; }
.chat-main::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.1);
border-radius: 4px; } .chat-main::-webkit-scrollbar-thumb { background:
rgba(255, 255, 255, 0.3); border-radius: 4px; transition: background 0.3s ease;
} .chat-main::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255,
0.5); } /* Para Firefox */ .chat-main { scrollbar-width: thin; scrollbar-color:
rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1); } /* Modo oscuro para la
barra de scroll */ #theme-dark .chat-main::-webkit-scrollbar-track { background:
rgba(79, 140, 255, 0.1); } #theme-dark .chat-main::-webkit-scrollbar-thumb {
background: rgba(79, 140, 255, 0.3); } #theme-dark
.chat-main::-webkit-scrollbar-thumb:hover { background: rgba(79, 140, 255, 0.5);
} #theme-dark .chat-main { scrollbar-color: rgba(79, 140, 255, 0.3) rgba(79,
140, 255, 0.1); }
