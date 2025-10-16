<template>
  <section class="section dashboard-summary-section">
    <div class="container">
      <!-- Header del Dashboard -->
      <div class="dashboard-header mb-4">
        <h1 class="title is-size-2 text-primary">LifeSync Dashboard</h1>
        <p class="subtitle is-6 text-secondary">
          Gestiona tu tiempo, dinero y bienestar
        </p>
      </div>

      <!-- Cards de resumen principales -->
      <div class="columns is-multiline mb-4">
        <div class="column" v-for="card in summaryCards" :key="card.title">
          <div class="card summary-card">
            <div class="card-content py-4 px-3">
              <div
                class="is-flex is-align-items-center is-justify-content-space-between"
              >
                <div>
                  <p class="title is-4 mb-1">{{ card.value }}</p>
                  <p class="subtitle is-6 text-secondary">{{ card.title }}</p>
                </div>
                <span class="icon is-large">
                  <i
                    :class="[
                      'bx',
                      card.icon,
                      'text-' + card.color,
                      'is-size-2',
                    ]"
                  ></i>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gráficos de Actividad -->
      <div class="columns mb-4">
        <div class="column is-6">
          <div class="card">
            <div class="card-content py-3 px-3">
              <h3 class="title is-6 mb-3">Actividad Semanal</h3>
              <div class="dashboard-canvas-wrapper">
                <canvas
                  ref="lineChart"
                  id="lineChart"
                  style="width: 100%; height: 260px"
                ></canvas>
              </div>
            </div>
          </div>
        </div>
        <div class="column is-6">
          <div class="card">
            <div class="card-content py-3 px-3">
              <h3 class="title is-6 mb-3">Distribución de Gastos</h3>
              <div class="dashboard-canvas-wrapper">
                <canvas
                  ref="pieChart"
                  id="pieChart"
                  style="width: 100%; height: 260px"
                ></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección de Tareas y Calendario -->
      <div class="columns mb-4">
        <div class="column is-8">
          <div class="card">
            <div class="card-header">
              <h3 class="title is-5 mb-0">Gestión de Tareas</h3>
            </div>
            <div class="card-content">
              <div class="task-boards">
                <div
                  class="task-column"
                  @dragover.prevent
                  @drop="dropTask($event, 'todo')"
                >
                  <h4 class="title is-6 mb-3">Por Hacer</h4>
                  <div class="task-list">
                    <div
                      v-for="task in todoTasks"
                      :key="task.id"
                      class="task-item"
                      draggable="true"
                      @dragstart="dragStart($event, task)"
                      @dragend="dragEnd"
                    >
                      <div class="task-content">
                        <span class="task-title">{{ task.title }}</span>
                        <span
                          class="task-priority"
                          :class="'priority-' + task.priority"
                          >{{ task.priority }}</span
                        >
                      </div>
                      <button
                        class="btn btn-accent btn-sm"
                        @click="moveTask(task.id, 'progress')"
                      >
                        <i class="bx bx-right-arrow-alt"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div
                  class="task-column"
                  @dragover.prevent
                  @drop="dropTask($event, 'progress')"
                >
                  <h4 class="title is-6 mb-3">En Progreso</h4>
                  <div class="task-list">
                    <div
                      v-for="task in progressTasks"
                      :key="task.id"
                      class="task-item"
                      draggable="true"
                      @dragstart="dragStart($event, task)"
                      @dragend="dragEnd"
                    >
                      <div class="task-content">
                        <span class="task-title">{{ task.title }}</span>
                        <span
                          class="task-priority"
                          :class="'priority-' + task.priority"
                          >{{ task.priority }}</span
                        >
                      </div>
                      <button
                        class="btn btn-accent btn-sm"
                        @click="moveTask(task.id, 'completed')"
                      >
                        <i class="bx bx-check"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div
                  class="task-column"
                  @dragover.prevent
                  @drop="dropTask($event, 'completed')"
                >
                  <h4 class="title is-6 mb-3">Completadas</h4>
                  <div class="task-list">
                    <div
                      v-for="task in completedTasks"
                      :key="task.id"
                      class="task-item completed"
                      draggable="true"
                      @dragstart="dragStart($event, task)"
                      @dragend="dragEnd"
                    >
                      <div class="task-content">
                        <span class="task-title">{{ task.title }}</span>
                        <span class="task-date">{{ task.completedDate }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="column is-4">
          <div class="card">
            <div class="card-header">
              <h3 class="title is-5 mb-0">Calendario</h3>
            </div>
            <div class="card-content">
              <div class="calendar-events">
                <div
                  v-for="event in calendarEvents"
                  :key="event.id"
                  class="event-item"
                >
                  <div class="event-time">{{ event.time }}</div>
                  <div class="event-content">
                    <div class="event-title">{{ event.title }}</div>
                    <div class="event-type" :class="'type-' + event.type">
                      {{ event.type }}
                    </div>
                  </div>
                </div>
              </div>
              <button
                class="btn btn-primary btn-sm mt-3 w-100"
                @click="router.push('/calendar')"
              >
                <i class="bx bx-plus mr-2"></i>Agregar Evento
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección de Wallet y Comidas -->
      <div class="columns mb-4">
        <div class="column is-6">
          <div class="card">
            <div class="card-header">
              <h3 class="title is-5 mb-0">Wallet - Finanzas</h3>
            </div>
            <div class="card-content">
              <div class="wallet-summary">
                <div class="balance-card bg-primary">
                  <div class="balance-amount">${{ walletData.balance }}</div>
                  <div class="balance-label">Balance Actual</div>
                </div>
                <div class="wallet-stats">
                  <div class="stat-item">
                    <div class="stat-value text-accent">
                      +${{ walletData.income }}
                    </div>
                    <div class="stat-label">Ingresos</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value text-warning">
                      -${{ walletData.expenses }}
                    </div>
                    <div class="stat-label">Gastos</div>
                  </div>
                </div>
              </div>
              <div class="recent-transactions">
                <h4 class="title is-6 mb-3">Transacciones Recientes</h4>
                <div
                  v-for="transaction in walletData.recentTransactions"
                  :key="transaction.id"
                  class="transaction-item"
                >
                  <div class="transaction-info">
                    <div class="transaction-title">{{ transaction.title }}</div>
                    <div class="transaction-date">{{ transaction.date }}</div>
                  </div>
                  <div
                    class="transaction-amount"
                    :class="
                      transaction.type === 'income'
                        ? 'text-accent'
                        : 'text-warning'
                    "
                  >
                    {{ transaction.type === "income" ? "+" : "-" }}${{
                      transaction.amount
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="column is-6">
          <div class="card">
            <div class="card-header">
              <h3 class="title is-5 mb-0">Planificación de Comidas</h3>
            </div>
            <div class="card-content">
              <div class="meal-planning">
                <div class="meal-day" v-for="day in mealData" :key="day.day">
                  <h4 class="title is-6 mb-2">{{ day.day }}</h4>
                  <div class="meal-items">
                    <div
                      v-for="meal in day.meals"
                      :key="meal.type"
                      class="meal-item"
                    >
                      <div class="meal-type">{{ meal.type }}</div>
                      <div class="meal-name">{{ meal.name }}</div>
                      <div class="meal-calories">{{ meal.calories }} cal</div>
                    </div>
                  </div>
                </div>
              </div>
              <button
                class="btn btn-accent btn-sm mt-3 w-100"
                @click="router.push('/meals')"
              >
                <i class="bx bx-plus mr-2"></i>Planificar Comida
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Gráfico Mensual de Tareas y Nutrientes (al final) -->
      <div class="columns mb-4">
        <div class="column is-12">
          <div class="card">
            <div class="card-content py-3 px-3">
              <h3 class="title is-6 mb-3">
                Resumen Mensual: Tareas y Nutrientes
              </h3>
              <div class="dashboard-canvas-wrapper">
                <canvas
                  ref="monthlyChart"
                  id="monthlyChart"
                  style="width: 100%; height: 320px"
                ></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
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
  getDocs,
} from "firebase/firestore";
import { useRouter } from "vue-router";
import Chart from "chart.js/auto";

// Estado de la aplicación
const router = useRouter();
const draggedTask = ref(null);

// Referencias para los gráficos
const pieChart = ref(null);
const lineChart = ref(null);
const monthlyChart = ref(null);

// Datos del dashboard (calculados en tiempo real)
const summaryCards = computed(() => {
  const pendingTasks = todoTasks.value.length + progressTasks.value.length;
  const todayEvents = calendarEvents.value.length;
  const balance = walletData.value.balance;
  const plannedMeals = Object.values(mealData.value).reduce(
    (total, day) => total + day.meals.length,
    0
  );

  return [
    {
      title: "Tareas Pendientes",
      value: pendingTasks,
      icon: "bx-task",
      color: "warning",
    },
    {
      title: "Eventos Hoy",
      value: todayEvents,
      icon: "bx-calendar",
      color: "primary",
    },
    {
      title: "Balance Mensual",
      value: "$" + balance,
      icon: "bx-wallet",
      color: "accent",
    },
    {
      title: "Comidas Planificadas",
      value: plannedMeals,
      icon: "bx-restaurant",
      color: "secondary",
    },
  ];
});

// Tareas desde Firestore
const todoTasks = ref([]);
const progressTasks = ref([]);
const completedTasks = ref([]);

const getUserId = () => auth.currentUser?.uid;

onMounted(() => {
  onSnapshot(collection(db, "tasks"), (snapshot) => {
    const userId = getUserId();
    if (!userId) return;
    const allTasks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const userTasks = allTasks.filter((t) => t.userId === userId);
    todoTasks.value = userTasks.filter((t) => t.status === "todo");
    progressTasks.value = userTasks.filter((t) => t.status === "progress");
    completedTasks.value = userTasks.filter((t) => t.status === "completed");
  });
});

// Eventos del calendario desde Firestore
const calendarEvents = ref([]);
onMounted(() => {
  onSnapshot(collection(db, "events"), (snapshot) => {
    const userId = getUserId();
    if (!userId) return;
    const allEvents = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const today = new Date().toISOString().split("T")[0];
    calendarEvents.value = allEvents.filter(
      (e) => e.date === today && e.userId === userId
    );
  });
});

// Datos del wallet desde Firestore
const walletData = ref({
  balance: 0,
  income: 0,
  expenses: 0,
  recentTransactions: [],
});

onMounted(() => {
  onSnapshot(collection(db, "transactions"), (snapshot) => {
    const userId = getUserId();
    if (!userId) return;
    const allTransactions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const month = new Date().getMonth();
    const year = new Date().getFullYear();

    let income = 0,
      expenses = 0;
    const monthTransactions = allTransactions.filter((t) => {
      const tDate = new Date(t.date);
      return (
        tDate.getMonth() === month &&
        tDate.getFullYear() === year &&
        t.userId === userId
      );
    });

    monthTransactions.forEach((t) => {
      if (t.type === "income") income += Number(t.amount);
      if (t.type === "expense") expenses += Number(t.amount);
    });

    walletData.value = {
      balance: income - expenses,
      income,
      expenses,
      recentTransactions: allTransactions
        .slice(0, 3)
        .filter((t) => t.userId === userId),
    };
  });
});

// Datos de comidas desde Firestore
const mealData = ref({});
onMounted(() => {
  onSnapshot(collection(db, "meals"), (snapshot) => {
    const userId = getUserId();
    if (!userId) return;
    const allMeals = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const weekDays = [
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
      "Domingo",
    ];

    weekDays.forEach((day, index) => {
      const dayDate = new Date();
      dayDate.setDate(dayDate.getDate() + index);
      const dateStr = dayDate.toISOString().split("T")[0];
      const dayMeals = allMeals.filter(
        (m) => m.date === dateStr && m.userId === userId
      );

      mealData.value[day] = {
        day,
        meals: dayMeals.map((m) => ({
          type: m.type,
          name: m.name,
          calories: m.calories,
        })),
      };
    });
  });
});

// Funciones
const dragStart = (event, task) => {
  draggedTask.value = task;
  event.target.style.opacity = "0.5";
};

const dragEnd = (event) => {
  event.target.style.opacity = "1";
  draggedTask.value = null;
};

const dropTask = async (event, newStatus) => {
  event.preventDefault();
  if (!draggedTask.value) return;

  try {
    const userId = getUserId();
    if (!userId) return;
    await updateDoc(doc(db, "tasks", draggedTask.value.id), {
      status: newStatus,
      completedDate:
        newStatus === "completed" ? new Date().toLocaleDateString() : null,
      userId,
    });
  } catch (error) {
    console.error("Error al mover la tarea:", error);
  }
};

const moveTask = async (taskId, destination) => {
  try {
    const userId = getUserId();
    if (!userId) return;
    await updateDoc(doc(db, "tasks", taskId), {
      status: destination,
      completedDate:
        destination === "completed" ? new Date().toLocaleDateString() : null,
      userId,
    });
  } catch (error) {
    console.error("Error al mover la tarea:", error);
  }
};

// Guardar instancias de los gráficos para poder destruirlos
let lineChartInstance = null;
let pieChartInstance = null;
let monthlyChartInstance = null;

function getTextColor() {
  // Lógica correcta: blanco en modo dark, negro en modo light
  const isDark = document.body.id === "theme-dark";
  return isDark ? "#F1F1F1" : "#0f172a";
}

async function renderCharts() {
  // Destruir instancias previas si existen
  if (lineChartInstance) lineChartInstance.destroy();
  if (pieChartInstance) pieChartInstance.destroy();
  if (monthlyChartInstance) monthlyChartInstance.destroy();

  // Función para mejorar la nitidez en pantallas retina
  function fixCanvasDPI(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  // Ajustar DPI de los canvas
  if (lineChart.value) fixCanvasDPI(lineChart.value);
  if (pieChart.value) fixCanvasDPI(pieChart.value);
  if (monthlyChart.value) fixCanvasDPI(monthlyChart.value);

  if (!lineChart.value || !pieChart.value || !monthlyChart.value) {
    console.error("Algunos elementos canvas no se encontraron");
    return;
  }

  if (typeof Chart === "undefined") {
    console.error("Chart.js no está disponible");
    return;
  }

  // Calcular datos reales para la semana
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);

  // Arrays para almacenar datos por día
  const weekData = [0, 0, 0, 0, 0, 0, 0]; // Tareas completadas por día
  const expenseData = [0, 0, 0, 0, 0, 0, 0]; // Gastos por día
  const eventData = [0, 0, 0, 0, 0, 0, 0]; // Eventos agregados por día
  const calorieData = [0, 0, 0, 0, 0, 0, 0]; // Calorías consumidas por día

  // Calcular datos de tareas completadas
  completedTasks.value.forEach((task) => {
    if (task.completedDate) {
      const taskDate = new Date(task.completedDate);
      const dayIndex = taskDate.getDay();
      if (dayIndex >= 0 && dayIndex < 7) {
        weekData[dayIndex]++;
      }
    }
  });

  // Calcular datos de gastos
  const allTransactions = await getDocs(collection(db, "transactions"));
  allTransactions.docs.forEach((doc) => {
    const transaction = doc.data();
    const transactionDate = new Date(transaction.date);
    const dayIndex = transactionDate.getDay();
    if (
      dayIndex >= 0 &&
      dayIndex < 7 &&
      transaction.type === "expense" &&
      transaction.userId === getUserId()
    ) {
      expenseData[dayIndex] += Number(transaction.amount) || 0;
    }
  });

  // Calcular datos de eventos
  const allEvents = await getDocs(collection(db, "events"));
  allEvents.docs.forEach((doc) => {
    const event = doc.data();
    const eventDate = new Date(event.date);
    const dayIndex = eventDate.getDay();
    if (dayIndex >= 0 && dayIndex < 7 && event.userId === getUserId()) {
      eventData[dayIndex]++;
    }
  });

  // Calcular datos de calorías
  const allMealsWeekly = await getDocs(collection(db, "meals"));
  allMealsWeekly.docs.forEach((doc) => {
    const meal = doc.data();
    const mealDate = new Date(meal.date);
    const dayIndex = mealDate.getDay();
    if (dayIndex >= 0 && dayIndex < 7 && meal.userId === getUserId()) {
      calorieData[dayIndex] += Number(meal.calories) || 0;
    }
  });

  // Obtener color de texto actualizado
  const textColor = getTextColor();

  // Gráfico de actividad semanal con datos reales
  const balanceMensual = [1200, 1500, 1100, 1700, 1600, 1800, 1400];
  lineChartInstance = new Chart(lineChart.value, {
    type: "line",
    data: {
      labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
      datasets: [
        {
          label: "Balance Mensual",
          data: balanceMensual,
          fill: true,
          backgroundColor: "rgba(99, 102, 241, 0.1)",
          borderColor: "#6366f1",
          pointBackgroundColor: "#6366f1",
          tension: 0.4,
          yAxisID: "y",
        },
        {
          label: "Gastos ($)",
          data: expenseData,
          fill: false,
          borderColor: "#06d6a0",
          pointBackgroundColor: "#06d6a0",
          tension: 0.4,
          yAxisID: "y1",
        },
        {
          label: "Eventos Agregados",
          data: eventData,
          fill: false,
          borderColor: "#fbbf24",
          pointBackgroundColor: "#fbbf24",
          tension: 0.4,
          yAxisID: "y",
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: true,
          labels: {
            usePointStyle: true,
            padding: 20,
            font: { size: 16 },
            color: textColor,
          },
        },
      },
      scales: {
        y: {
          type: "linear",
          display: true,
          position: "left",
          title: {
            display: true,
            text: "Balance Mensual y Eventos",
            color: textColor,
            font: { size: 16 },
          },
          ticks: {
            color: textColor,
            font: { size: 14 },
          },
        },
        y1: {
          type: "linear",
          display: true,
          position: "right",
          title: {
            display: true,
            text: "Gastos ($)",
            color: textColor,
            font: { size: 16 },
          },
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            color: textColor,
            font: { size: 14 },
          },
        },
        x: {
          ticks: {
            color: textColor,
            font: { size: 14 },
          },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
    },
  });

  // Gráfico de distribución de gastos con datos reales
  const expenseCategories = {};
  allTransactions.docs.forEach((doc) => {
    const transaction = doc.data();
    if (
      transaction.type === "expense" &&
      transaction.category &&
      transaction.userId === getUserId()
    ) {
      if (!expenseCategories[transaction.category]) {
        expenseCategories[transaction.category] = 0;
      }
      expenseCategories[transaction.category] +=
        Number(transaction.amount) || 0;
    }
  });

  const categoryLabels = Object.keys(expenseCategories);
  const categoryData = Object.values(expenseCategories);

  pieChartInstance = new Chart(pieChart.value, {
    type: "doughnut",
    data: {
      labels: categoryLabels.length > 0 ? categoryLabels : ["Sin datos"],
      datasets: [
        {
          data: categoryData.length > 0 ? categoryData : [1],
          backgroundColor: [
            "#6366f1",
            "#06d6a0",
            "#fbbf24",
            "#ef4444",
            "#8b5cf6",
            "#64748b",
            "#10b981",
          ],
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            padding: 20,
            font: { size: 16 },
            color: textColor,
          },
        },
      },
      cutout: "60%",
      responsive: true,
      maintainAspectRatio: false,
    },
  });

  // Gráfico mensual con datos reales
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul"];
  const completedByMonth = [12, 8, 15, 10, 7, 14, 9];
  const nutrients = {
    calories: [2200, 2100, 2500, 2300, 2000, 2400, 2250],
    protein: [90, 85, 100, 95, 80, 110, 88],
    fat: [70, 65, 80, 75, 60, 85, 68],
    carbs: [300, 280, 320, 310, 270, 330, 295],
  };

  monthlyChartInstance = new Chart(monthlyChart.value, {
    type: "bar",
    data: {
      labels: months,
      datasets: [
        {
          label: "Tareas Completadas",
          data: completedByMonth,
          borderColor: "#6366f1",
          backgroundColor: "rgba(99, 102, 241, 0.5)",
          stack: "combined",
          type: "bar",
        },
        {
          label: "Calorías",
          data: nutrients.calories,
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.3)",
          type: "line",
          yAxisID: "y1",
          fill: false,
        },
        {
          label: "Proteínas",
          data: nutrients.protein,
          borderColor: "#06d6a0",
          backgroundColor: "rgba(6, 214, 160, 0.3)",
          type: "line",
          yAxisID: "y1",
          fill: false,
        },
        {
          label: "Grasas",
          data: nutrients.fat,
          borderColor: "#fbbf24",
          backgroundColor: "rgba(251, 191, 36, 0.3)",
          type: "line",
          yAxisID: "y1",
          fill: false,
        },
        {
          label: "Carbohidratos",
          data: nutrients.carbs,
          borderColor: "#8b5cf6",
          backgroundColor: "rgba(139, 92, 246, 0.3)",
          type: "line",
          yAxisID: "y1",
          fill: false,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: true,
          labels: {
            usePointStyle: true,
            padding: 20,
            font: { size: 16 },
            color: textColor,
          },
        },
      },
      scales: {
        y: {
          type: "linear",
          display: true,
          position: "left",
          title: {
            display: true,
            text: "Tareas Completadas",
            color: textColor,
            font: { size: 16 },
          },
          ticks: {
            color: textColor,
            font: { size: 14 },
          },
        },
        y1: {
          type: "linear",
          display: true,
          position: "right",
          title: {
            display: true,
            text: "Nutrientes",
            color: textColor,
            font: { size: 16 },
          },
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            color: textColor,
            font: { size: 14 },
          },
        },
        x: {
          ticks: {
            color: textColor,
            font: { size: 14 },
          },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

// Renderizar gráficos al montar
onMounted(async () => {
  await nextTick();
  // Función para mejorar la nitidez en pantallas retina
  function fixCanvasDPI(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  // Ajustar DPI de los canvas
  if (lineChart.value) fixCanvasDPI(lineChart.value);
  if (pieChart.value) fixCanvasDPI(pieChart.value);
  if (monthlyChart.value) fixCanvasDPI(monthlyChart.value);

  // Verificar que Chart.js esté disponible

  // Verificar si los elementos canvas existen

  if (!lineChart.value || !pieChart.value || !monthlyChart.value) {
    console.error("Algunos elementos canvas no se encontraron");
    return;
  }

  if (typeof Chart === "undefined") {
    console.error("Chart.js no está disponible");
    return;
  }

  await renderCharts();

  // Observer para detectar cambio de modo
  const observer = new MutationObserver(() => {
    renderCharts();
  });
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["id"],
  });
});
</script>

<style scoped>
.dashboard-summary-section {
  overflow: scroll;
  padding: 2rem 0;
  height: 95vh;
  background: var(--background-secondary);
}

.dashboard-header {
  text-align: center;
  margin-bottom: 2rem;
  height: 8em;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.summary-card {
  text-align: left;
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-4px);
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

/* Estilos para tareas */
.task-boards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.task-column {
  background: var(--background-secondary);
  padding: 1rem;
  border-radius: 8px;
  min-height: 300px;
  transition: all 0.3s ease;
}

.task-column.drag-over {
  background: var(--background);
  border: 2px dashed var(--primary);
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.task-item {
  background: var(--background);
  padding: 0.75rem;
  border-radius: 6px;
  border-left: 4px solid var(--primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  cursor: grab;
}

.task-item:active {
  cursor: grabbing;
}

.task-item:hover {
  box-shadow: 0 2px 8px var(--shadow);
  transform: translateY(-2px);
}

.task-item.dragging {
  opacity: 0.5;
  transform: rotate(5deg);
}

.task-item.completed {
  border-left-color: var(--accent);
  opacity: 0.7;
}

.task-content {
  flex: 1;
}

.task-title {
  display: block;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.task-priority {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: 600;
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

.task-date {
  font-size: 0.75rem;
  color: var(--secondary);
}

.btn-sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}

.w-100 {
  width: 100%;
}

/* Estilos para calendario */
.calendar-events {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--background-secondary);
  border-radius: 6px;
}

.event-time {
  font-weight: 600;
  color: var(--primary);
  min-width: 50px;
}

.event-content {
  flex: 1;
}

.event-title {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.event-type {
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
.type-social {
  background: #f0fdf4;
  color: #059669;
}
.type-salud {
  background: #fef2f2;
  color: #dc2626;
}
.type-ejercicio {
  background: #fffbeb;
  color: #d97706;
}

/* Estilos para wallet */
.wallet-summary {
  margin-bottom: 1.5rem;
}

.balance-card {
  background: linear-gradient(
    135deg,
    var(--primary) 0%,
    var(--primary-dark) 100%
  );
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 1rem;
}

.balance-amount {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.balance-label {
  opacity: 0.9;
  font-size: 0.875rem;
}

.wallet-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: var(--background-secondary);
  border-radius: 8px;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--secondary);
}

.recent-transactions {
  margin-top: 1.5rem;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border);
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-title {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.transaction-date {
  font-size: 0.75rem;
  color: var(--secondary);
}

.transaction-amount {
  font-weight: 600;
}

/* Estilos para comidas */
.meal-planning {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.meal-day {
  background: var(--background-secondary);
  padding: 1rem;
  border-radius: 8px;
}

.meal-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.meal-item {
  background: var(--background);
  padding: 0.75rem;
  border-radius: 6px;
  border-left: 3px solid var(--accent);
}

.meal-type {
  font-size: 0.75rem;
  color: var(--secondary);
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.meal-name {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.meal-calories {
  font-size: 0.75rem;
  color: var(--accent);
  font-weight: 600;
}

.dashboard-canvas-wrapper {
  width: 100%;
  height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Responsive */
@media (max-width: 1024px) {
  .task-boards {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .meal-planning {
    grid-template-columns: 1fr;
  }

  .wallet-stats {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-summary-section {
    padding: 1rem 0;
  }

  .task-column {
    min-height: 200px;
  }

  .dashboard-canvas-wrapper {
    height: 200px;
  }
}

@media (max-width: 600px) {
  .summary-card .title.is-4,
  .card-header h3,
  .card-content h4,
  .card-content h3,
  .dashboard-header h1,
  .dashboard-header p,
  .column-header h3,
  .card-header .title {
    font-size: 1rem;
    padding: 0.4rem 0.5rem;
  }
}
</style>
