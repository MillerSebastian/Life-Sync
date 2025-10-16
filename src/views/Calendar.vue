<template>
  <div class="calendar-page">
    <FloatingIcons viewType="calendar" />
    <div class="container">
      <!-- Header -->
      <div class="page-header">
        <h1 class="title is-2 text-primary">Calendario</h1>
        <p class="subtitle is-6 text-secondary">
          Gestiona tus eventos, reuniones y actividades
        </p>
      </div>

      <!-- Controles del calendario -->
      <div class="calendar-controls mb-4">
        <div
          class="is-flex is-justify-content-space-between is-align-items-center"
        >
          <div class="is-flex is-align-items-center gap-3">
            <button class="btn btn-primary" @click="showAddEventModal = true">
              <i class="bx bx-plus mr-2"></i>Nuevo Evento
            </button>
            <div class="view-toggle">
              <button
                class="btn btn-sm"
                :class="viewMode === 'month' ? 'btn-primary' : 'btn-secondary'"
                @click="setViewMode('month')"
              >
                Mes
              </button>
              <button
                class="btn btn-sm"
                :class="viewMode === 'week' ? 'btn-primary' : 'btn-secondary'"
                @click="setViewMode('week')"
              >
                Semana
              </button>
              <button
                class="btn btn-sm"
                :class="viewMode === 'day' ? 'btn-primary' : 'btn-secondary'"
                @click="setViewMode('day')"
              >
                Día
              </button>
            </div>
          </div>
          <div class="is-flex is-align-items-center gap-2">
            <button class="btn btn-sm btn-secondary" @click="previousPeriod">
              <i class="bx bx-chevron-left"></i>
            </button>
            <span class="current-period">{{ currentPeriodText }}</span>
            <button class="btn btn-sm btn-secondary" @click="nextPeriod">
              <i class="bx bx-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Vista del calendario -->
      <div class="calendar-view">
        <!-- Vista mensual -->
        <div v-if="viewMode === 'month'" class="month-view">
          <div class="calendar-header">
            <div class="weekday" v-for="day in weekDays" :key="day">
              {{ day }}
            </div>
          </div>
          <div class="calendar-grid">
            <div
              v-for="date in calendarDates"
              :key="date.date"
              class="calendar-day"
              :class="{
                'other-month': !date.isCurrentMonth,
                today: date.isToday,
                'has-events': date.events.length > 0,
              }"
              @click="selectDate(date)"
            >
              <div class="day-number">{{ date.dayNumber }}</div>
              <div class="day-events">
                <div
                  v-for="event in date.events.slice(0, 3)"
                  :key="event.id"
                  class="event-dot"
                  :class="'type-' + event.type"
                  :title="event.title"
                ></div>
                <div v-if="date.events.length > 3" class="more-events">
                  +{{ date.events.length - 3 }} más
                </div>
              </div>
              <div class="month-event-list">
                <div
                  v-for="event in date.events.slice(0, 3)"
                  :key="event.id"
                  class="month-event-item"
                >
                  <span class="month-event-time">{{ event.time }}</span>
                  <span class="month-event-title">{{ event.title }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Vista semanal -->
        <div v-if="viewMode === 'week'" class="week-view">
          <div class="week-header">
            <div class="time-column"></div>
            <div v-for="day in weekDays" :key="day" class="day-column">
              <div class="day-header">{{ day }}</div>
              <div class="day-date">{{ getDayDate(day) }}</div>
            </div>
          </div>
          <div class="week-grid">
            <div class="time-slots">
              <div v-for="hour in 24" :key="hour" class="time-slot">
                {{ formatHour(hour) }}
              </div>
            </div>
            <div class="week-events">
              <div v-for="day in weekDays" :key="day" class="day-events-column">
                <div v-for="hour in 24" :key="hour" class="week-hour-slot">
                  <div
                    v-for="event in getDayEvents(day).filter(
                      (e) => parseInt(e.time.split(':')[0]) === hour
                    )"
                    :key="event.id"
                    class="week-event"
                    :class="'type-' + event.type"
                  >
                    <div class="event-time">{{ event.time }}</div>
                    <div class="event-title">{{ event.title }}</div>
                    <button
                      class="delete-event-btn"
                      @click.stop="deleteEvent(event.id)"
                    >
                      <i class="bx bx-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Vista diaria -->
        <div v-if="viewMode === 'day'" class="day-view">
          <div class="day-timeline">
            <div v-for="hour in 24" :key="hour" class="timeline-hour">
              <div class="hour-label">{{ formatHour(hour) }}</div>
              <div class="hour-events">
                <div
                  v-for="event in getHourEvents(hour)"
                  :key="event.id"
                  class="timeline-event"
                  :class="'type-' + event.type"
                >
                  <div class="event-time">{{ event.time }}</div>
                  <div class="event-content">
                    <div class="event-title">{{ event.title }}</div>
                    <div class="event-description">{{ event.description }}</div>
                  </div>
                  <button
                    class="delete-event-btn"
                    @click.stop="deleteEvent(event.id)"
                  >
                    <i class="bx bx-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel lateral de eventos -->
      <div class="events-sidebar">
        <h3 class="title is-5 mb-3">Próximos Eventos</h3>
        <div class="upcoming-events">
          <div
            v-for="event in upcomingEvents"
            :key="event.id"
            class="event-card"
            :class="'type-' + event.type"
            @click="selectEvent(event)"
          >
            <div class="event-time">{{ event.time }}</div>
            <div class="event-info">
              <div class="event-title">{{ event.title }}</div>
              <div class="event-date">{{ event.date }}</div>
            </div>
            <div class="event-type-badge" :class="'type-' + event.type">
              {{ event.type }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para agregar/editar evento -->
    <div class="modal" :class="{ 'is-active': showAddEventModal }">
      <div class="modal-background" @click="showAddEventModal = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            {{ editingEvent ? "Editar Evento" : "Nuevo Evento" }}
          </p>
          <button class="delete" @click="showAddEventModal = false"></button>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <label class="label">Título</label>
            <div class="control">
              <input
                v-model="eventForm.title"
                class="input"
                type="text"
                placeholder="Título del evento"
              />
            </div>
          </div>
          <div class="field">
            <label class="label">Descripción</label>
            <div class="control">
              <textarea
                v-model="eventForm.description"
                class="textarea"
                placeholder="Descripción del evento"
              ></textarea>
            </div>
          </div>
          <div class="columns">
            <div class="column is-6">
              <div class="field">
                <label class="label">Fecha</label>
                <div class="control">
                  <input v-model="eventForm.date" class="input" type="date" />
                </div>
              </div>
            </div>
            <div class="column is-6">
              <div class="field">
                <label class="label">Hora</label>
                <div class="control">
                  <input v-model="eventForm.time" class="input" type="time" />
                </div>
              </div>
            </div>
          </div>
          <div class="columns">
            <div class="column is-6">
              <div class="field">
                <label class="label">Tipo</label>
                <div class="control">
                  <div class="select is-fullwidth">
                    <select v-model="eventForm.type">
                      <option value="trabajo">Trabajo</option>
                      <option value="personal">Personal</option>
                      <option value="salud">Salud</option>
                      <option value="social">Social</option>
                      <option value="ejercicio">Ejercicio</option>
                      <option value="reunion">Reunión</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div class="column is-6">
              <div class="field">
                <label class="label">Duración (minutos)</label>
                <div class="control">
                  <input
                    v-model="eventForm.duration"
                    class="input"
                    type="number"
                    min="15"
                    step="15"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="field">
            <label class="label">Ubicación</label>
            <div class="control">
              <input
                v-model="eventForm.location"
                class="input"
                type="text"
                placeholder="Ubicación (opcional)"
              />
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="btn btn-primary" @click="saveEvent">Guardar</button>
          <button
            class="button is-danger has-text-white-bis"
            @click="showAddEventModal = false"
          >
            Cancelar
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { db, auth } from "../../firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { alertQuestion, alertSuccess } from "@/components/alert";
import FloatingIcons from "../components/FloatingIcons.vue";

// Estado de la aplicación
const showAddEventModal = ref(false);
const editingEvent = ref(null);
const viewMode = ref("month");
const currentDate = ref(new Date());

// Sincronizar la fecha al cambiar de vista
function setViewMode(mode) {
  if (viewMode.value === mode) return;
  if (mode === "month") {
    // Mantener el mes de la fecha actual
    // No es necesario ajustar currentDate
  } else if (mode === "week") {
    // Ajustar currentDate al inicio de la semana
    const startOfWeek = getStartOfWeek(currentDate.value);
    currentDate.value = new Date(startOfWeek);
  } else if (mode === "day") {
    // No es necesario ajustar currentDate
  }
  viewMode.value = mode;
}

// Formulario de evento
const eventForm = reactive({
  title: "",
  description: "",
  date: "",
  time: "",
  type: "personal",
  duration: 60,
  location: "",
});

// Eventos desde Firestore
const events = ref([]);

// Función para enviar notificaciones de eventos
const sendEventNotification = async (type, event) => {
  const userId = getUserId();
  if (!userId) return;

  // Validar que el evento tenga los campos necesarios
  if (!event || !event.id || !event.title || !event.date) {
    return;
  }

  try {
    let title = "";
    let message = "";
    let notificationType = "event_update";

    switch (type) {
      case "two_days_before":
        title = "Evento Próximo";
        message = `El evento "${event.title}" es en 2 días (${event.date})`;
        notificationType = "event_two_days_before";
        break;
      case "day_of":
        title = "¡Evento Hoy!";
        message = `El evento "${event.title}" es hoy (${event.date})`;
        notificationType = "event_day_of";
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
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time || null,
      read: false,
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, "notifications"), notificationData);
  } catch (error) {
    console.error("Error enviando notificación de evento:", error);
  }
};

// Función para verificar eventos próximos
const checkEventDeadlines = async (events) => {
  if (!events || events.length === 0) return;

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  // Obtener notificaciones ya enviadas hoy
  const todayKey = today.toDateString();
  const sentNotifications = JSON.parse(
    localStorage.getItem(`eventNotifications_${todayKey}`) || "{}"
  );

  let hasChanges = false;

  for (const event of events) {
    // Validar que el evento tenga fecha
    if (!event.date) {
      continue;
    }

    try {
      const eventDate = new Date(event.date);
      if (isNaN(eventDate.getTime())) {
        continue;
      }

      eventDate.setHours(0, 0, 0, 0);

      // Verificar si es exactamente en 2 días
      if (eventDate.getTime() === dayAfterTomorrow.getTime()) {
        const notificationKey = `two_days_before_${event.id}`;
        if (!sentNotifications[notificationKey]) {
          await sendEventNotification("two_days_before", event);
          sentNotifications[notificationKey] = true;
          hasChanges = true;
        }
      }

      // Verificar si es hoy
      if (eventDate.getTime() === today.getTime()) {
        const notificationKey = `day_of_${event.id}`;
        if (!sentNotifications[notificationKey]) {
          await sendEventNotification("day_of", event);
          sentNotifications[notificationKey] = true;
          hasChanges = true;
        }
      }
    } catch (error) {
      console.error("Error procesando fecha de evento:", event.id, error);
    }
  }

  // Solo guardar en localStorage si hubo cambios
  if (hasChanges) {
    localStorage.setItem(
      `eventNotifications_${todayKey}`,
      JSON.stringify(sentNotifications)
    );
  }
};

const getUserId = () => auth.currentUser?.uid;

onMounted(() => {
  let lastCheckTime = 0;
  const CHECK_INTERVAL = 300000; // Verificar cada 5 minutos

  onSnapshot(collection(db, "events"), (snapshot) => {
    const userId = getUserId();
    if (!userId) return;
    const allEvents = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const userEvents = allEvents.filter((e) => e.userId === userId);
    events.value = userEvents;

    // Verificar eventos próximos
    const now = Date.now();
    if (
      userEvents.length > 0 &&
      userId &&
      now - lastCheckTime > CHECK_INTERVAL
    ) {
      lastCheckTime = now;
      checkEventDeadlines(userEvents);
    }
  });
});

const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

// Computed properties
const currentPeriodText = computed(() => {
  if (viewMode.value === "month") {
    return currentDate.value.toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric",
    });
  } else if (viewMode.value === "week") {
    const startOfWeek = getStartOfWeek(currentDate.value);
    const endOfWeek = getEndOfWeek(currentDate.value);
    return `${startOfWeek.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    })} - ${endOfWeek.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    })}`;
  } else {
    return currentDate.value.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }
});

const calendarDates = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  const firstDay = new Date(year, month, 1);
  // Ajustar para que el calendario siempre inicie en lunes
  let startDate = new Date(firstDay);
  let dayOfWeek = firstDay.getDay();
  // getDay(): 0=Domingo, 1=Lunes, ..., 6=Sábado
  // Si es domingo, retroceder 6 días; si no, retroceder (dayOfWeek - 1) días
  if (dayOfWeek === 0) {
    startDate.setDate(startDate.getDate() - 6);
  } else {
    startDate.setDate(startDate.getDate() - (dayOfWeek - 1));
  }

  const dates = [];
  const today = new Date();

  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dateISO = date.toISOString().split("T")[0];

    const dayEvents = events.value.filter((event) => {
      const eventDateISO = new Date(event.date + "T00:00:00")
        .toISOString()
        .split("T")[0];
      return eventDateISO === dateISO;
    });

    dates.push({
      date: dateISO,
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: date.toDateString() === today.toDateString(),
      events: dayEvents,
    });
  }

  return dates;
});

const upcomingEvents = computed(() => {
  const today = new Date();
  return events.value
    .filter((event) => new Date(event.date) >= today)
    .sort(
      (a, b) =>
        new Date(a.date + " " + a.time) - new Date(b.date + " " + b.time)
    )
    .slice(0, 5);
});

// Funciones
const previousPeriod = () => {
  // Crear una nueva instancia para forzar el refresco y evitar mutaciones directas
  const newDate = new Date(currentDate.value);
  if (viewMode.value === "month") {
    newDate.setMonth(newDate.getMonth() - 1);
  } else if (viewMode.value === "week") {
    newDate.setDate(newDate.getDate() - 7);
  } else {
    newDate.setDate(newDate.getDate() - 1);
  }
  currentDate.value = newDate;
};

const nextPeriod = () => {
  // Crear una nueva instancia para forzar el refresco y evitar mutaciones directas
  const newDate = new Date(currentDate.value);
  if (viewMode.value === "month") {
    newDate.setMonth(newDate.getMonth() + 1);
  } else if (viewMode.value === "week") {
    newDate.setDate(newDate.getDate() + 7);
  } else {
    newDate.setDate(newDate.getDate() + 1);
  }
  currentDate.value = newDate;
};

// Corregir selectDate para mostrar el día anterior
const selectDate = (date) => {
  if (date.isCurrentMonth) {
    viewMode.value = "day";
    // Forzar la fecha seleccionada a la zona local para evitar desfases
    currentDate.value = new Date(date.date + "T00:00:00");
  }
};

const selectEvent = (event) => {
  editingEvent.value = event;
  Object.assign(eventForm, event);
  showAddEventModal.value = true;
};

const saveEvent = async () => {
  const userId = getUserId();
  if (!userId) return;
  if (!eventForm.title.trim() || !eventForm.date || !eventForm.time) return;
  if (editingEvent.value) {
    await updateDoc(doc(db, "events", editingEvent.value.id), {
      ...eventForm,
      userId,
    });
  } else {
    await addDoc(collection(db, "events"), { ...eventForm, userId });
  }
  showAddEventModal.value = false;
  editingEvent.value = null;
  Object.assign(eventForm, {
    title: "",
    description: "",
    date: "",
    time: "",
    type: "personal",
    duration: 60,
    location: "",
  });
  alertSuccess("creado exitosamente");
};

const deleteEvent = async (id) => {
  const result = await alertQuestion("¿deseas eliminar el evento?");
  if (!result.isConfirmed) return;
  alertSuccess("eliminado exitosamente");
  await deleteDoc(doc(db, "events", id));
};

const editEvent = (event) => {
  editingEvent.value = event;
  Object.assign(eventForm, event);
  showAddEventModal.value = true;
};

const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const getEndOfWeek = (date) => {
  const start = getStartOfWeek(date);
  start.setDate(start.getDate() + 6);
  return start;
};

// Corregir getDayDate para usar la semana de currentDate
const getDayDate = (day) => {
  const dayIndex = weekDays.indexOf(day);
  const startOfWeek = getStartOfWeek(currentDate.value);
  startOfWeek.setDate(startOfWeek.getDate() + dayIndex);
  return startOfWeek.getDate();
};

const getDayEvents = (day) => {
  const dayIndex = weekDays.indexOf(day);
  const startOfWeek = getStartOfWeek(currentDate.value);
  startOfWeek.setDate(startOfWeek.getDate() + dayIndex);
  const dayDate = startOfWeek.toISOString().split("T")[0];

  return events.value.filter((event) => {
    const eventDateISO = new Date(event.date + "T00:00:00")
      .toISOString()
      .split("T")[0];
    return eventDateISO === dayDate;
  });
};

const getHourEvents = (hour) => {
  // Asegurar coincidencia exacta de fecha (zona local)
  const dayDate = currentDate.value.toISOString().split("T")[0];
  return events.value.filter((event) => {
    // Comparar usando la fecha local del evento
    const eventDateISO = new Date(event.date + "T00:00:00")
      .toISOString()
      .split("T")[0];
    if (eventDateISO !== dayDate) return false;
    const eventHour = parseInt(event.time.split(":")[0]);
    return eventHour === hour;
  });
};

const formatHour = (hour) => {
  return `${hour.toString().padStart(2, "0")}:00`;
};

const getEventStyle = (event) => {
  const startHour = parseInt(event.time.split(":")[0]);
  const startMinute = parseInt(event.time.split(":")[1]);
  const top = (startHour * 60 + startMinute) * 2; // 2px por minuto
  const height = event.duration * 2;

  return {
    top: `${top}px`,
    height: `${height}px`,
  };
};

onMounted(() => {
  // Establecer fecha actual en el formulario
  const today = new Date();
  eventForm.date = today.toISOString().split("T")[0];
});
</script>

<style scoped>
.modal-card-foot {
  gap: 1em;
}

.calendar-page {
  padding: 2rem 0;
  overflow: scroll;
  height: 95vh;
  background: var(--background-secondary);
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.calendar-controls {
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

.view-toggle {
  display: flex;
  gap: 0.25rem;
}

.current-period {
  font-weight: 600;
  color: var(--primary);
  min-width: 150px;
  text-align: center;
}

/* Vista mensual */
.month-view {
  background: var(--background);
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow);
  overflow: hidden;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: var(--primary);
  color: white;
}

.weekday {
  padding: 1rem;
  text-align: center;
  font-weight: 600;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-day {
  min-height: 100px;
  padding: 0.5rem;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.calendar-day:hover {
  background: var(--background-secondary);
}

.calendar-day.other-month {
  background: #f8f9fa;
  color: var(--secondary);
}

.calendar-day.today {
  background: var(--primary);
  color: white;
}

.calendar-day.has-events {
  background: rgba(99, 102, 241, 0.05);
}

.day-number {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.day-events {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.event-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary);
}

.event-dot.type-trabajo {
  background: #6366f1;
}
.event-dot.type-personal {
  background: #06d6a0;
}
.event-dot.type-salud {
  background: #ef4444;
}
.event-dot.type-social {
  background: #fbbf24;
}
.event-dot.type-ejercicio {
  background: #8b5cf6;
}
.event-dot.type-reunion {
  background: #64748b;
}

.more-events {
  font-size: 0.75rem;
  color: var(--secondary);
  font-weight: 600;
}

/* Vista semanal mejorada */
.week-view {
  background: var(--background);
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow);
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 1rem;
}

.week-header {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  background: var(--primary);
  color: white;
  border-bottom: 2px solid var(--border);
}

.day-column {
  padding: 1rem 0.5rem;
  text-align: center;
  border-right: 2px solid var(--border);
}
.day-column:last-child {
  border-right: none;
}

.week-grid {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  height: 720px;
  min-height: 720px;
  max-height: 720px;
  overflow-y: visible;
  position: relative;
}

.time-slots {
  border-right: 2px solid var(--border);
  background: #f8f9fa;
  position: absolute;
  left: 0;
  top: 0;
  width: 80px;
  height: 100%;
  z-index: 3;
}

.time-slot {
  height: 30px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  color: var(--secondary);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
}

.week-events {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  position: absolute;
  left: 80px;
  top: 0;
  right: 0;
  bottom: 0;
  min-height: 720px;
  max-height: 720px;
  overflow-y: visible;
  z-index: 2;
}

.day-events-column {
  border-right: 2px solid var(--border);
  position: relative;
  min-height: 720px;
}
.day-events-column:last-child {
  border-right: none;
}

.week-hour-slot {
  min-height: 30px;
  border-bottom: 1px solid var(--border);
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  /* Mantener el fondo y el borde aunque haya eventos */
  background: transparent;
  z-index: 1;
}

.week-event {
  position: relative;
  margin: 2px 0;
  left: 0;
  right: 0;
  background: var(--primary);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.08);
  border-left: 4px solid #6366f1;
  transition: box-shadow 0.2s;
  z-index: 2;
  /* Asegura que el evento no sobrescriba el borde de la celda */
  width: 98%;
  max-width: 100%;
  min-width: 0;
  align-self: flex-start;
}
.week-event:hover {
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.18);
}

.event-time {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.event-title {
  font-size: 0.7rem;
  line-height: 1.2;
}

/* Vista diaria mejorada */
.day-view {
  background: var(--background);
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow);
  overflow: hidden;
  padding-bottom: 1rem;
}

.day-timeline {
  height: 720px;
  min-height: 720px;
  max-height: 720px;
  overflow-y: auto;
  background: #f8f9fa;
}

.timeline-hour {
  display: grid;
  grid-template-columns: 80px 1fr;
  min-height: 30px;
  border-bottom: 1px solid var(--border);
  align-items: flex-start;
  background: white;
}

.hour-label {
  padding: 0.25rem 0.5rem;
  font-size: 0.85rem;
  color: var(--secondary);
  font-weight: 600;
  border-right: 2px solid var(--border);
  display: flex;
  align-items: flex-start;
  background: #f8f9fa;
}

.hour-label.current {
  background: #e0e7ff;
  color: #4338ca;
  border-left: 4px solid #6366f1;
}

.hour-events {
  padding: 0.25rem 0.5rem;
  position: relative;
}

.timeline-event {
  background: var(--primary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid #6366f1;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.08);
  font-size: 0.95rem;
}
.timeline-event:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

.event-content {
  margin-top: 0.25rem;
}

.event-description {
  font-size: 0.85rem;
  opacity: 0.9;
  margin-top: 0.15rem;
}

/* Panel lateral */
.events-sidebar {
  position: fixed;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  background: var(--background);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 16px var(--shadow-hover);
  width: 300px;
  max-height: 80vh;
  overflow-y: auto;
}

.upcoming-events {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid var(--primary);
}

.event-card:hover {
  transform: translateX(-4px);
  box-shadow: 0 2px 8px var(--shadow);
}

.event-card.type-trabajo {
  border-left-color: #6366f1;
}
.event-card.type-personal {
  border-left-color: #06d6a0;
}
.event-card.type-salud {
  border-left-color: #ef4444;
}
.event-card.type-social {
  border-left-color: #fbbf24;
}
.event-card.type-ejercicio {
  border-left-color: #8b5cf6;
}
.event-card.type-reunion {
  border-left-color: #64748b;
}

.event-time {
  font-weight: 600;
  color: var(--primary);
  min-width: 50px;
}

.event-info {
  flex: 1;
}

.event-title {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.event-date {
  font-size: 0.75rem;
  color: var(--secondary);
}

.event-type-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: 600;
}

.type-trabajo {
  background: #eff6ff;
  color: #1d4ed8;
}
.type-personal {
  background: #f0fdf4;
  color: #059669;
}
.type-salud {
  background: #fef2f2;
  color: #dc2626;
}
.type-social {
  background: #fffbeb;
  color: #d97706;
}
.type-ejercicio {
  background: #f3e8ff;
  color: #7c3aed;
}
.type-reunion {
  background: #f1f5f9;
  color: #475569;
}

/* Responsive */
@media (max-width: 1024px) {
  .events-sidebar {
    position: static;
    transform: none;
    width: 100%;
    margin-top: 2rem;
  }

  .week-grid {
    height: 400px;
  }

  .day-timeline {
    height: 400px;
  }
}

@media (max-width: 768px) {
  .calendar-page {
    padding: 1rem 0;
  }

  .calendar-controls {
    padding: 1rem;
  }

  .view-toggle {
    flex-direction: column;
  }

  .calendar-day {
    min-height: 80px;
  }

  .week-grid {
    grid-template-columns: 60px repeat(7, 1fr);
  }

  .time-slots {
    grid-column: 1;
  }

  .time-slot {
    height: 40px;
    font-size: 0.7rem;
  }
}

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
  .card-header h3,
  .card-content h4,
  .card-content h3 {
    font-size: 1rem;
    padding: 0.4rem 0.5rem;
  }
}

/* ===== MODO OSCURO PARA CALENDARIO ===== */
#theme-dark .calendar-page,
#theme-dark .month-view,
#theme-dark .week-view,
#theme-dark .day-view {
  background: var(--background);
  color: var(--text);
}

#theme-dark .calendar-header,
#theme-dark .week-header {
  background: var(--primary-dark);
  color: #f1f1f1;
}

#theme-dark .calendar-day {
  background: #23262f !important;
  color: var(--text);
  border: 1px solid #26334d;
  transition: background 0.2s;
}

#theme-dark .calendar-day.other-month {
  background: #23262f !important;
  color: #6c7383;
  opacity: 0.7;
}

#theme-dark .calendar-day.today {
  background: #4f8cff !important;
  color: #fff !important;
}

#theme-dark .calendar-day.selected {
  background: #3b4a6b !important;
  color: #fff !important;
}

#theme-dark .calendar-day.has-events {
  box-shadow: 0 0 0 2px #4f8cff33;
}

#theme-dark .calendar-day:hover {
  background: #2c3140 !important;
}

#theme-dark .more-events {
  color: var(--primary);
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

.week-hour-slot {
  min-height: 30px;
  border-bottom: 1px solid var(--border);
  position: relative;
}
.delete-event-btn {
  background: transparent;
  border: none;
  color: #ef4444;
  font-size: 1.1em;
  cursor: pointer;
  margin-left: 0.5em;
  transition: color 0.2s;
}
.delete-event-btn:hover {
  color: #b91c1c;
}

/* --- CSS para la lista de eventos en la vista mensual --- */
.month-event-list {
  margin-top: 0.25em;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.month-event-item {
  font-size: 0.75em;
  color: var(--primary);
  background: #f3f4f6;
  border-radius: 3px;
  padding: 1px 4px;
  margin-bottom: 1px;
  display: flex;
  align-items: center;
  gap: 0.5em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.month-event-time {
  font-weight: 600;
  color: #6366f1;
}
.month-event-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
