<template>
  <div class="tasks-page">
    <FloatingIcons viewType="tasks" />
    <div class="container">
      <!-- Header -->
      <div class="page-header">
        <h1 class="title is-2 text-primary">Gestión de Tareas</h1>
        <p class="subtitle is-6 text-secondary">
          Organiza y prioriza tus actividades diarias
        </p>
      </div>

      <!-- Cards de Resumen -->
      <div class="columns is-multiline mb-4">
        <div class="column">
          <div class="card summary-card">
            <div class="card-content py-4 px-3">
              <div
                class="is-flex is-align-items-center is-justify-content-space-between"
              >
                <div>
                  <p class="title is-4 mb-1">{{ taskCounts.total }}</p>
                  <p class="subtitle is-6 text-secondary">Total Tareas</p>
                </div>
                <span class="icon is-large">
                  <i class="bx bx-task text-primary is-size-2"></i>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="column">
          <div class="card summary-card">
            <div class="card-content py-4 px-3">
              <div
                class="is-flex is-align-items-center is-justify-content-space-between"
              >
                <div>
                  <p class="title is-4 mb-1">{{ taskCounts.todo }}</p>
                  <p class="subtitle is-6 text-secondary">Pendientes</p>
                </div>
                <span class="icon is-large">
                  <i class="bx bx-time text-secondary is-size-2"></i>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="column">
          <div class="card summary-card">
            <div class="card-content py-4 px-3">
              <div
                class="is-flex is-align-items-center is-justify-content-space-between"
              >
                <div>
                  <p class="title is-4 mb-1">{{ taskCounts.progress }}</p>
                  <p class="subtitle is-6 text-secondary">En Progreso</p>
                </div>
                <span class="icon is-large">
                  <i class="bx bx-loader-alt text-info is-size-2"></i>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="column">
          <div class="card summary-card">
            <div class="card-content py-4 px-3">
              <div
                class="is-flex is-align-items-center is-justify-content-space-between"
              >
                <div>
                  <p class="title is-4 mb-1">{{ taskCounts.completed }}</p>
                  <p class="subtitle is-6 text-secondary">Completadas</p>
                </div>
                <span class="icon is-large">
                  <i class="bx bx-check-circle text-success is-size-2"></i>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Controles principales -->
      <div class="controls-section mb-4">
        <div
          class="is-flex is-justify-content-space-between is-align-items-center"
        >
          <div class="is-flex is-align-items-center gap-3">
            <button class="btn btn-primary" @click="showAddTaskModal = true">
              <i class="bx bx-plus mr-2"></i>Nueva Tarea
            </button>
            <button class="btn btn-accent" @click="showAddNoteModal = true">
              <i class="bx bx-sticker mr-2"></i>Agregar Nota
            </button>
          </div>
          <div class="is-flex is-align-items-center gap-2">
            <span class="text-secondary">Filtrar por:</span>
            <select
              v-model="filterPriority"
              class="select is-small select-month"
            >
              <option value="">Todas las prioridades</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Tableros Kanban -->
      <div class="kanban-boards">
        <div
          class="kanban-column"
          v-for="column in kanbanColumns"
          :key="column.id"
          @dragover.prevent
          @drop="dropTask($event, column.id)"
        >
          <div class="column-header">
            <h3 class="title is-5 has-text-white-ter">{{ column.title }}</h3>
            <span class="task-count">{{ column.tasks.length }}</span>
          </div>
          <div class="column-content">
            <div
              v-for="task in getFilteredTasks(column.id)"
              :key="task.id"
              :id="'task-' + task.id"
              class="task-card draggable"
              :class="'priority-' + task.priority"
              draggable="true"
              @dragstart="dragStart($event, task)"
              @dragend="dragEnd"
              @click="selectTask(task)"
            >
              <div class="task-header">
                <div class="task-badges">
                  <span
                    class="task-priority-badge"
                    :class="'priority-' + task.priority"
                  >
                    {{ task.priority }}
                  </span>
                  <span
                    class="task-status-badge"
                    :class="getTaskStatusClass(task)"
                  >
                    {{ getTaskStatus(task) }}
                  </span>
                </div>
                <div class="task-actions">
                  <button class="btn-icon" @click.stop="editTask(task)">
                    <i class="bx bx-edit"></i>
                  </button>
                  <button class="btn-icon" @click.stop="deleteTask(task.id)">
                    <i class="bx bx-trash"></i>
                  </button>
                </div>
              </div>
              <div class="task-content">
                <h4 class="task-title">{{ task.title }}</h4>
                <p class="task-description">{{ task.description }}</p>
                <div class="task-meta">
                  <span class="task-date">
                    <i class="bx bx-calendar mr-1"></i>{{ task.dueDate }}
                  </span>
                  <span v-if="task.category" class="task-category">
                    <i class="bx bx-tag mr-1"></i>{{ task.category }}
                  </span>
                </div>
              </div>
              <div class="task-footer">
                <div class="task-progress" v-if="getTaskProgress(task) > 0">
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      :style="{ width: getTaskProgress(task) + '%' }"
                    ></div>
                  </div>
                  <span class="progress-text"
                    >{{ getTaskProgress(task) }}%</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stickers de Notas -->
      <div
        class="notes-section mt-5"
        @click="showAddNoteModal = true"
        style="cursor: pointer"
        @dragover.prevent
        @drop="dropNote($event)"
      >
        <template v-if="notes.length === 0">
          <div class="notes-add">Agregar notas</div>
        </template>
        <template v-else>
          <div class="notes-grid">
            <div
              v-for="note in notes"
              :key="note.id"
              :id="'note-' + note.id"
              class="note-sticker draggable"
              :style="{
                backgroundColor: note.color,
                position: note.position ? 'absolute' : 'relative',
                left: note.position ? note.position.x + 'px' : 'auto',
                top: note.position ? note.position.y + 'px' : 'auto',
              }"
              draggable="true"
              @click.stop="editNote(note)"
              @dragstart="dragNoteStart($event, note)"
              @dragend="dragNoteEnd"
            >
              <div class="note-header">
                <span class="note-date">{{ note.date }}</span>
                <button class="btn-icon" @click.stop="deleteNote(note.id)">
                  <i class="bx bx-x"></i>
                </button>
              </div>
              <div class="note-content">
                <h4 class="note-title">{{ note.title }}</h4>
                <p class="note-text">{{ note.content }}</p>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Modal para agregar/editar tarea -->
    <div class="modal" :class="{ 'is-active': showAddTaskModal }">
      <div class="modal-background" @click="showAddTaskModal = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            {{ editingTask ? "Editar Tarea" : "Nueva Tarea" }}
          </p>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <label class="label">Título</label>
            <div class="control">
              <input
                v-model="taskForm.title"
                class="input"
                type="text"
                placeholder="Título de la tarea"
              />
            </div>
          </div>
          <div class="field">
            <label class="label">Descripción</label>
            <div class="control">
              <textarea
                v-model="taskForm.description"
                class="textarea"
                placeholder="Descripción de la tarea"
              ></textarea>
            </div>
          </div>
          <div class="columns">
            <div class="column is-6">
              <div class="field">
                <label class="label">Prioridad</label>
                <div class="control">
                  <div class="select is-fullwidth">
                    <select v-model="taskForm.priority">
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div class="column is-6">
              <div class="field">
                <label class="label">Fecha límite</label>
                <div class="control">
                  <input v-model="taskForm.dueDate" class="input" type="date" />
                </div>
              </div>
            </div>
          </div>
          <div class="field">
            <label class="label">Categoría</label>
            <div class="control">
              <input
                v-model="taskForm.category"
                class="input"
                type="text"
                placeholder="Categoría (opcional)"
              />
            </div>
          </div>
        </section>
        <footer class="modal-card-foot buttons">
          <button class="btn btn-primary" @click="saveTask">Guardar</button>
          <button
            class="btn button is-danger has-text-white-bis"
            @click="showAddTaskModal = false"
          >
            Cancelar
          </button>
        </footer>
      </div>
    </div>

    <!-- Modal para agregar/editar nota -->
    <div class="modal" :class="{ 'is-active': showAddNoteModal }">
      <div class="modal-background" @click="showAddNoteModal = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            {{ editingNote ? "Editar Nota" : "Nueva Nota" }}
          </p>
          <button class="delete" @click="showAddNoteModal = false"></button>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <label class="label">Título</label>
            <div class="control">
              <input
                v-model="noteForm.title"
                class="input"
                type="text"
                placeholder="Título de la nota"
              />
            </div>
          </div>
          <div class="field">
            <label class="label">Contenido</label>
            <div class="control">
              <textarea
                v-model="noteForm.content"
                class="textarea"
                placeholder="Contenido de la nota"
              ></textarea>
            </div>
          </div>
          <div class="field">
            <label class="label">Color</label>
            <div class="control">
              <div class="color-picker">
                <div
                  v-for="color in noteColors"
                  :key="color"
                  class="color-option"
                  :style="{ backgroundColor: color }"
                  :class="{ selected: noteForm.color === color }"
                  @click="noteForm.color = color"
                ></div>
              </div>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot buttons">
          <button class="btn btn-primary" @click="saveNote">Guardar</button>
          <button
            class="btn button is-danger has-text-white-bis"
            @click="showAddNoteModal = false"
          >
            Cancelar
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from "vue";
import { db, auth } from "../../firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { useRoute } from "vue-router";
import { alertQuestion, alertSuccess } from "@/components/alert";
import FloatingIcons from "../components/FloatingIcons.vue";

// Función para enviar notificaciones de tareas
const sendTaskNotification = async (type, task, oldStatus = null) => {
  const userId = getUserId();
  if (!userId) return;

  // Validar que la tarea tenga los campos necesarios
  if (!task || !task.id || !task.title) {
    console.error("Tarea inválida para notificación:", task);
    return;
  }

  // Para notificaciones de fechas, validar que la tarea tenga una fecha válida
  if (
    (type === "due_soon" || type === "overdue") &&
    (!task.dueDate ||
      (typeof task.dueDate === "string" &&
        (task.dueDate.includes("mañana") ||
          task.dueDate.includes("tarde") ||
          task.dueDate.includes("hoy"))))
  ) {
    console.warn(
      "No se enviará notificación de fecha para tarea sin fecha válida:",
      task.title
    );
    return;
  }

  try {
    let title = "";
    let message = "";
    let notificationType = "task_update";

    switch (type) {
      case "created":
        title = "Nueva Tarea Creada";
        message = `Has creado la tarea: "${task.title}"`;
        notificationType = "task_created";
        break;
      case "completed":
        title = "¡Tarea Completada!";
        message = `Has completado la tarea: "${task.title}"`;
        notificationType = "task_completed";
        break;
      case "progress":
        title = "Tarea en Progreso";
        message = `Has iniciado la tarea: "${task.title}"`;
        notificationType = "task_progress";
        break;
      case "reopened":
        title = "Tarea Reabierta";
        message = `Has reabierto la tarea: "${task.title}"`;
        notificationType = "task_reopened";
        break;
      case "due_soon":
        title = "¡Tarea Vence Pronto!";
        message = `La tarea "${task.title}" vence en exactamente 1 día`;
        notificationType = "task_due_soon";
        break;
      case "overdue":
        title = "¡Tarea Vencida!";
        message = `La tarea "${task.title}" está vencida`;
        notificationType = "task_overdue";
        break;
      default:
        return;
    }

    // Obtener datos del usuario actual para la notificación
    const currentUserDoc = await getDoc(doc(db, "users", userId));
    const currentUserData = currentUserDoc.data();

    const notificationData = {
      toUserId: userId,
      fromUserId: userId, // El usuario se notifica a sí mismo
      fromUserName: currentUserData?.name || "Usuario",
      fromUserPhoto: currentUserData?.photo || null,
      type: notificationType,
      title,
      message,
      taskId: task.id,
      taskTitle: task.title,
      oldStatus: oldStatus || null,
      newStatus: task.status || "unknown",
      read: false,
      createdAt: serverTimestamp(),
    };

    const notificationRef = await addDoc(
      collection(db, "notifications"),
      notificationData
    );
  } catch (error) {
    console.error("Error enviando notificación:", error);
  }
};

// Estado de la aplicación
const showAddTaskModal = ref(false);
const showAddNoteModal = ref(false);
const editingTask = ref(null);
const editingNote = ref(null);
const filterPriority = ref("");
const draggedTask = ref(null);
const draggedNote = ref(null);

// Formularios
const taskForm = reactive({
  title: "",
  description: "",
  priority: "media",
  dueDate: "",
  category: "",
  progress: 0,
  status: "todo", // nuevo campo para el tablero
});

const noteForm = reactive({
  title: "",
  content: "",
  color: "#fbbf24",
});

// Kanban dinámico desde Firestore
const kanbanColumns = ref([
  { id: "todo", title: "Por Hacer", tasks: [] },
  { id: "progress", title: "En Progreso", tasks: [] },
  { id: "completed", title: "Completadas", tasks: [] },
]);

// Notas rápidas desde Firestore
const notes = ref([]);

// Escuchar tareas en tiempo real
const getUserId = () => auth.currentUser?.uid;

onMounted(() => {
  let lastCheckTime = 0;
  const CHECK_INTERVAL = 60000; // Verificar cada minuto

  onSnapshot(collection(db, "tasks"), (snapshot) => {
    const userId = getUserId();
    if (!userId) return;
    const allTasks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const userTasks = allTasks.filter((t) => t.userId === userId);
    // Limpiar columnas
    kanbanColumns.value.forEach((col) => (col.tasks = []));
    userTasks.forEach((task) => {
      // Asignar a la columna correspondiente
      const col = kanbanColumns.value.find((c) => c.id === task.status);
      if (col) col.tasks.push(task);
    });

    // Verificar tareas que vencen pronto o están vencidas
    // Solo verificar si hay tareas, el usuario está autenticado y ha pasado suficiente tiempo
    const now = Date.now();
    if (
      userTasks.length > 0 &&
      userId &&
      now - lastCheckTime > CHECK_INTERVAL
    ) {
      lastCheckTime = now;
      checkTaskDeadlines(userTasks);
    }
  });

  // Notas en tiempo real (ahora filtradas por usuario)
  onSnapshot(collection(db, "notes"), (snapshot) => {
    const userId = getUserId();
    if (!userId) return;
    notes.value = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((n) => n.userId === userId);
  });
});

// Función para verificar fechas límite de tareas
const checkTaskDeadlines = async (tasks) => {
  if (!tasks || tasks.length === 0) return;

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  // Obtener notificaciones ya enviadas hoy
  const todayKey = today.toDateString();
  const sentNotifications = JSON.parse(
    localStorage.getItem(`taskNotifications_${todayKey}`) || "{}"
  );

  let hasChanges = false;
  let invalidDateCount = 0;

  for (const task of tasks) {
    // Validar que la tarea tenga los campos necesarios
    if (
      !task ||
      !task.id ||
      !task.title ||
      !task.dueDate ||
      task.status === "completed"
    ) {
      continue;
    }

    try {
      // Verificar si la fecha es una cadena de texto descriptiva en lugar de una fecha válida
      if (
        typeof task.dueDate === "string" &&
        (task.dueDate.includes("mañana") ||
          task.dueDate.includes("tarde") ||
          task.dueDate.includes("hoy") ||
          task.dueDate.includes("próximo"))
      ) {
        invalidDateCount++;
        if (invalidDateCount <= 3) {
          // Solo mostrar los primeros 3 errores para no saturar la consola
          console.warn(
            "Fecha descriptiva inválida para tarea:",
            task.id,
            task.dueDate
          );
        }
        continue;
      }

      const dueDate = new Date(task.dueDate);
      if (isNaN(dueDate.getTime())) {
        invalidDateCount++;
        if (invalidDateCount <= 3) {
          console.warn("Fecha inválida para tarea:", task.id, task.dueDate);
        }
        continue;
      }

      dueDate.setHours(0, 0, 0, 0);

      // Verificar si vence exactamente en 1 día
      if (dueDate.getTime() === tomorrow.getTime()) {
        const notificationKey = `due_soon_${task.id}`;
        if (!sentNotifications[notificationKey]) {
          await sendTaskNotification("due_soon", task);
          sentNotifications[notificationKey] = true;
          hasChanges = true;
        }
      }

      // Verificar si está vencida
      if (dueDate.getTime() < today.getTime()) {
        const notificationKey = `overdue_${task.id}`;
        if (!sentNotifications[notificationKey]) {
          await sendTaskNotification("overdue", task);
          sentNotifications[notificationKey] = true;
          hasChanges = true;
        }
      }
    } catch (error) {
      console.error("Error procesando fecha de tarea:", task.id, error);
    }
  }

  // Solo guardar en localStorage si hubo cambios
  if (hasChanges) {
    localStorage.setItem(
      `taskNotifications_${todayKey}`,
      JSON.stringify(sentNotifications)
    );
  }

  // Mostrar resumen de fechas inválidas
  if (invalidDateCount > 0) {
    // Fechas inválidas encontradas
  }
};

const route = useRoute();
const highlightedId = ref(null);

watch(
  () => route.query.highlight,
  async (val) => {
    if (val) {
      highlightedId.value = val;
      await nextTick();
      // Tarea
      let el = document.getElementById("task-" + val);
      if (el) {
        el.classList.add("highlighted-search");
        setTimeout(() => {
          el.classList.remove("highlighted-search");
        }, 2000);
      }
      // Nota
      el = document.getElementById("note-" + val);
      if (el) {
        el.classList.add("highlighted-search");
        setTimeout(() => {
          el.classList.remove("highlighted-search");
        }, 2000);
      }
    }
  },
  { immediate: true }
);

// Guardar tarea (crear o actualizar)
const saveTask = async () => {
  const userId = getUserId();
  if (!userId) return;

  if (editingTask.value) {
    await updateDoc(doc(db, "tasks", editingTask.value.id), {
      ...taskForm,
      userId,
    });
  } else {
    // Crear nueva tarea
    const newTaskRef = await addDoc(collection(db, "tasks"), {
      ...taskForm,
      userId,
    });

    // Enviar notificación de nueva tarea creada
    const newTask = {
      id: newTaskRef.id,
      ...taskForm,
      userId,
    };

    // Validar que la tarea se creó correctamente antes de enviar notificación
    if (newTaskRef.id && newTask.title) {
      await sendTaskNotification("created", newTask);
    }
  }

  showAddTaskModal.value = false;
  editingTask.value = null;
  Object.assign(taskForm, {
    title: "",
    description: "",
    priority: "media",
    dueDate: "",
    category: "",
    progress: 0,
    status: "todo",
  });
};

// Eliminar tarea
const deleteTask = async (id) => {
  const result = await alertQuestion("¿deseas eliminar la tarea?");
  if (!result.isConfirmed) return;
  await deleteDoc(doc(db, "tasks", id));
  alertSuccess("Tarea eliminada exitosamente");
};

// Editar tarea
const editTask = (task) => {
  editingTask.value = task;
  Object.assign(taskForm, task);
  showAddTaskModal.value = true;
};

const noteColors = [
  "#fbbf24",
  "#06d6a0",
  "#6366f1",
  "#64748b",
  "#ef4444",
  "#8b5cf6",
];

// Funciones
const getFilteredTasks = (columnId) => {
  const column = kanbanColumns.value.find((col) => col.id === columnId);
  if (!column) return [];

  if (!filterPriority.value) return column.tasks;

  return column.tasks.filter((task) => task.priority === filterPriority.value);
};

// Calcular progreso automático según el estado
const getTaskProgress = (task) => {
  switch (task.status) {
    case "todo":
      return 0;
    case "progress":
      return 50;
    case "completed":
      return 100;
    default:
      return 0;
  }
};

// Obtener estado en texto
const getTaskStatus = (task) => {
  switch (task.status) {
    case "todo":
      return "Pendiente";
    case "progress":
      return "En Progreso";
    case "completed":
      return "Completada";
    default:
      return "Pendiente";
  }
};

// Obtener clase CSS del estado
const getTaskStatusClass = (task) => {
  switch (task.status) {
    case "todo":
      return "status-pendiente";
    case "progress":
      return "status-progreso";
    case "completed":
      return "status-completada";
    default:
      return "status-pendiente";
  }
};

// Calcular conteos de tareas por estado
const taskCounts = computed(() => {
  const allTasks = kanbanColumns.value.flatMap((col) => col.tasks);
  return {
    total: allTasks.length,
    todo: allTasks.filter((task) => task.status === "todo").length,
    progress: allTasks.filter((task) => task.status === "progress").length,
    completed: allTasks.filter((task) => task.status === "completed").length,
  };
});

const selectTask = (task) => {
  editingTask.value = task;
  Object.assign(taskForm, task);
  showAddTaskModal.value = true;
};

const editNote = (note) => {
  editingNote.value = note;
  Object.assign(noteForm, note);
  showAddNoteModal.value = true;
};

const deleteNote = async (noteId) => {
  const result = await alertQuestion("¿quieres eliminar la nota?");
  if (!result.isConfirmed) return;
  alertSuccess("Nota eliminada exitosamente");
  await deleteDoc(doc(db, "notes", noteId));
};

const saveNote = async () => {
  if (!noteForm.title.trim() || !noteForm.content.trim()) return;
  const userId = getUserId();
  if (!userId) return;
  if (editingNote.value) {
    // Editar nota existente
    await updateDoc(doc(db, "notes", editingNote.value.id), {
      ...noteForm,
      userId,
    });
  } else {
    // Crear nueva nota con posición centrada
    const containerWidth = 400; // Ancho aproximado del contenedor
    const containerHeight = 300; // Alto aproximado del contenedor
    const noteWidth = 200;
    const noteHeight = 150;

    const x = (containerWidth - noteWidth) / 2;
    const y = (containerHeight - noteHeight) / 2;

    await addDoc(collection(db, "notes"), {
      ...noteForm,
      date: new Date().toLocaleDateString(),
      userId,
      position: { x, y },
    });
    alertSuccess("Nota guardada exitosamente");
  }
  resetNoteForm();
  showAddNoteModal.value = false;
};

const resetNoteForm = () => {
  Object.assign(noteForm, {
    title: "",
    content: "",
    color: "#fbbf24",
  });
  editingNote.value = null;
};

const dragStart = (event, task) => {
  draggedTask.value = task;
  event.target.style.opacity = "0.5";
  event.target.style.transform = "rotate(5deg)";
};

const dragEnd = (event) => {
  event.target.style.opacity = "1";
  event.target.style.transform = "rotate(0deg)";
  // No limpiar draggedTask aquí, se limpiará en dropTask
};

const dropTask = async (event, newStatus) => {
  event.preventDefault();

  // Validación adicional para evitar errores
  if (!draggedTask.value || !draggedTask.value.id) {
    console.warn("draggedTask es null o no tiene id:", draggedTask.value);
    return;
  }

  const oldStatus = draggedTask.value.status;
  const taskId = draggedTask.value.id;

  try {
    await updateDoc(doc(db, "tasks", taskId), {
      status: newStatus,
    });

    // Obtener la tarea completa desde Firestore para enviar notificaciones
    const taskDoc = await getDoc(doc(db, "tasks", taskId));
    if (taskDoc.exists()) {
      const taskData = taskDoc.data();
      const task = {
        id: taskId,
        ...taskData,
        status: newStatus,
      };

      if (oldStatus === "completed" && newStatus === "progress") {
        // Tarea reabierta (de completada a en progreso)
        await sendTaskNotification("reopened", task, oldStatus);
      } else if (newStatus === "completed") {
        // Tarea completada
        await sendTaskNotification("completed", task, oldStatus);
      } else if (oldStatus === "todo" && newStatus === "progress") {
        // Tarea iniciada (de pendiente a en progreso)
        await sendTaskNotification("progress", task, oldStatus);
      }
    } else {
      console.warn("No se encontró la tarea para enviar notificación:", taskId);
    }
  } catch (error) {
    console.error("Error al mover la tarea:", error);
  } finally {
    // Limpiar draggedTask al final
    draggedTask.value = null;
  }
};

// Funciones para drag and drop de notas
const dragNoteStart = (event, note) => {
  draggedNote.value = note;
  event.target.style.opacity = "0.6";
  event.target.style.transform = "rotate(3deg) scale(1.05)";
  event.target.style.zIndex = "1000";
};

const dragNoteEnd = (event) => {
  event.target.style.opacity = "1";
  event.target.style.transform = "rotate(0deg) scale(1)";
  event.target.style.zIndex = "auto";
  draggedNote.value = null;
};

const dropNote = async (event) => {
  event.preventDefault();
  if (!draggedNote.value) return;

  // Obtener las dimensiones del contenedor de notas
  const notesContainer = event.currentTarget;
  const rect = notesContainer.getBoundingClientRect();

  // Calcular la posición exacta del mouse relativa al contenedor
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  // Dimensiones de la nota
  const noteWidth = 200;
  const noteHeight = 150;

  // Dimensiones del contenedor
  const containerWidth = rect.width;
  const containerHeight = rect.height;

  // Ajustar la posición para que la nota no se salga del contenedor
  // Centrar la nota en la posición del mouse
  const adjustedX = Math.max(
    0,
    Math.min(mouseX - noteWidth / 2, containerWidth - noteWidth)
  );
  const adjustedY = Math.max(
    0,
    Math.min(mouseY - noteHeight / 2, containerHeight - noteHeight)
  );

  try {
    await updateDoc(doc(db, "notes", draggedNote.value.id), {
      position: { x: adjustedX, y: adjustedY },
    });
  } catch (error) {
    console.error("Error al mover la nota:", error);
  }
};
</script>

<style scoped>
.select-month {
  border-radius: 10px;
  padding: 0em 1em;
  border: 1px solid transparent;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
}

.notes-add {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  font-size: 1rem;
  font-weight: normal;
  color: var(--secondary);
  cursor: pointer;
}

.notes-add:hover {
  color: var(--primary);
}

.tasks-page {
  padding: 2rem 0;
  overflow: scroll;
  height: 95vh;
  background: var(--background-secondary);
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.summary-card {
  text-align: left;
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-4px);
}

.summary-card .title.is-4,
.card-header h3,
.card-content h4,
.card-content h3,
.dashboard-header h1,
.dashboard-header p,
.column-header h3,
.card-header .title {
  padding: 0.5rem 0.75rem;
  font-size: 1.15rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.25rem;
}

.controls-section {
  background: var(--background);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow);
}

.gap-2 {
  gap: 0.5rem;
}
.gap-3 {
  gap: 0.75rem;
}

/* Kanban Boards */
.kanban-boards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.kanban-column {
  background: var(--background);
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow);
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 600px;
}

.kanban-column.drag-over {
  background: var(--background-secondary);
  border: 2px dashed var(--primary);
  transform: scale(1.02);
}

.column-header {
  background: var(--primary);
  color: white;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 0;
  flex-shrink: 0;
}

.task-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.column-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--primary) transparent;
  position: relative;
  flex: 1;
  min-height: 0;
  align-items: stretch;
}

/* Estilos para scrollbar webkit (Chrome, Safari, Edge) */
.column-content::-webkit-scrollbar {
  width: 8px;
}

.column-content::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 10px;
  margin: 4px 0;
}

.column-content::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--primary) 0%, var(--accent) 100%);
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: content-box;
  transition: all 0.3s ease;
}

.column-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, var(--accent) 0%, var(--primary) 100%);
  transform: scale(1.1);
}

.column-content::-webkit-scrollbar-corner {
  background: transparent;
}

/* Estilos para Firefox */
.column-content {
  scrollbar-width: thin;
  scrollbar-color: var(--primary) transparent;
}

/* Mejorar el espaciado interno para el scroll */
.column-content {
  padding-right: 0.5rem;
  margin-right: 0.5rem;
}

/* Task Cards */
.task-card {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1rem;
  cursor: grab;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.task-card:active {
  cursor: grabbing;
}

.task-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.task-card.dragging {
  opacity: 0.6;
  transform: rotate(2deg) scale(1.02);
  z-index: 1000;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.task-card.priority-alta {
  border-left: 3px solid #ef4444;
}

.task-card.priority-media {
  border-left: 3px solid #fbbf24;
}

.task-card.priority-baja {
  border-left: 3px solid #06d6a0;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.task-badges {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.task-priority-badge {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.priority-alta {
  background: #fef2f2;
  color: #dc2626;
}

.priority-media {
  background: #fffbeb;
  color: #d97706;
}

.priority-baja {
  background: #f0fdf4;
  color: #059669;
}

.task-status-badge {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.status-pendiente {
  background: #f3f4f6;
  color: #6b7280;
}

.status-progreso {
  background: #dbeafe;
  color: #2563eb;
}

.status-completada {
  background: #dcfce7;
  color: #16a34a;
}

.task-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.task-card:hover .task-actions {
  opacity: 1;
}

.btn-icon {
  background: none;
  border: none;
  padding: 0.25rem;
  border-radius: 4px;
  cursor: pointer;
  color: var(--secondary);
  transition: all 0.2s ease;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background: var(--background-secondary);
  color: var(--primary);
}

.task-content {
  margin-bottom: 0.75rem;
}

.task-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text);
  font-size: 1rem;
  line-height: 1.3;
}

.task-description {
  font-size: 0.875rem;
  color: var(--secondary);
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.task-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: var(--secondary);
  flex-wrap: wrap;
}

.task-meta span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.task-footer {
  margin-top: 0.75rem;
}

.task-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: var(--background-secondary);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  transition: width 0.3s ease;
  border-radius: 2px;
}

.progress-text {
  font-size: 0.75rem;
  color: var(--secondary);
  min-width: 35px;
  font-weight: 500;
}

/* Notes Section */
.notes-section {
  background: var(--background);
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: 100%;
  border: 1px solid var(--border);
  position: relative;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notes-add {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary);
  letter-spacing: 2px;
  opacity: 0.25;
  text-transform: uppercase;
  transition: opacity 0.3s, color 0.3s;
  text-align: center;
  cursor: pointer;
  user-select: none;
}

.notes-add:hover {
  color: var(--accent);
  opacity: 0.5;
}

.notes-grid {
  display: block;
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 280px;
}

.note-sticker {
  background: var(--warning);
  border-radius: 12px;
  padding: 1rem;
  cursor: grab;
  transition: all 0.3s ease;
  min-height: 150px;
  display: flex;
  flex-direction: column;
  width: 200px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.note-sticker:active {
  cursor: grabbing;
}

.note-sticker:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.note-sticker.dragging {
  opacity: 0.6;
  transform: rotate(3deg) scale(1.05);
  z-index: 1000;
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.note-date {
  font-size: 0.75rem;
  opacity: 0.8;
  font-weight: 500;
}

.note-content {
  flex: 1;
}

.note-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text);
}

.note-text {
  font-size: 0.875rem;
  line-height: 1.4;
  color: var(--text);
}

.add-note {
  background: var(--background-secondary);
  border: 2px dashed var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--secondary);
  transition: all 0.3s ease;
}

.add-note:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.add-note-content {
  text-align: center;
}

.add-note-content p {
  margin-top: 0.5rem;
  font-weight: 500;
}

/* Modal Styles */
.modal-card {
  border-radius: 12px;
  overflow: hidden;
}
.modal-card-head {
  background: var(--primary);
  color: white;
}
.modal-card-title {
  color: white;
}

/* Eliminar estilos locales de placeholder para inputs y textareas en modales en modo dark */
.modal-card input::placeholder,
.modal-card textarea::placeholder {
  color: inherit !important;
  opacity: 1 !important;
}

/* Color Picker */
.color-picker {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.color-option {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.3s ease;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.selected {
  border-color: var(--text);
}

/* Responsive */
@media (max-width: 1024px) {
  .kanban-boards {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .notes-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@media (max-width: 768px) {
  .tasks-page {
    padding: 1rem 0;
  }

  .controls-section {
    padding: 1rem;
  }

  .column-content {
    min-height: 300px;
  }

  .notes-grid {
    grid-template-columns: 1fr;
  }
}

.column-header h3,
.card-header h3,
.card-content h4,
.card-content h3 {
  padding: 0.5rem 0.75rem;
  font-size: 1.15rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.25rem;
}

.column-header {
  min-width: 0;
}

.card-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border);
  background: var(--background);
  min-width: 0;
}

.card-content {
  min-width: 0;
}

@media (max-width: 600px) {
  .column-header h3,
  .card-header h3,
  .card-content h4,
  .card-content h3 {
    font-size: 1rem;
    padding: 0.4rem 0.5rem;
  }
}

.highlighted-search {
  box-shadow: 0 0 0 3px var(--primary);
  background: var(--primary-light);
  transition: box-shadow 0.3s, background 0.3s;
}

.status-pendiente {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #6b7280;
  border: 1px solid rgba(107, 114, 128, 0.2);
}

.status-progreso {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #2563eb;
  border: 1px solid rgba(37, 99, 235, 0.2);
}

.status-completada {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #16a34a;
  border: 1px solid rgba(22, 163, 74, 0.2);
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

/* ===== MODO OSCURO PARA TASK CARDS Y KANBAN ===== */
#theme-dark .kanban-column {
  background: #23262f;
  box-shadow: 0 2px 8px rgba(79, 140, 255, 0.1);
  border: 1.5px solid #26334d;
}
#theme-dark .task-card {
  background: #181a20;
  color: #f1f1f1;
  border: 1.5px solid #4f8cff;
  box-shadow: 0 1px 6px rgba(79, 140, 255, 0.1);
}
#theme-dark .task-card .task-title {
  color: #a3c8ff;
}
#theme-dark .task-card .task-description,
#theme-dark .task-card .task-meta,
#theme-dark .task-card .progress-text {
  color: #85c1e9;
}
#theme-dark .task-header {
  border-bottom: 1px solid #26334d;
}
#theme-dark .task-priority-badge.priority-alta {
  background: #4f1a1a;
  color: #f87171;
}
#theme-dark .task-priority-badge.priority-media {
  background: #4f3f1a;
  color: #facc15;
}
#theme-dark .task-priority-badge.priority-baja {
  background: #1a4f2b;
  color: #4ade80;
}
#theme-dark .task-status-badge.status-pendiente {
  background: #23262f;
  color: #f1f1f1;
  border: 1px solid #26334d;
}
#theme-dark .task-status-badge.status-progreso {
  background: #1a4d99;
  color: #a3c8ff;
  border: 1px solid #4f8cff;
}
#theme-dark .task-status-badge.status-completada {
  background: #1a4f2b;
  color: #4ade80;
  border: 1px solid #4ade80;
}
#theme-dark .progress-bar {
  background: #23262f;
}
#theme-dark .progress-fill {
  background: #4f8cff;
}
#theme-dark .btn-icon {
  color: #a3c8ff;
}
#theme-dark .btn-icon:hover {
  background: #23262f;
  color: #4f8cff;
}
</style>
