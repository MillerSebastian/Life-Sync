<template>
  <div class="wallet-page">
    <FloatingIcons viewType="wallet" />
    <div class="container">
      <!-- Header -->
      <div class="page-header">
        <h1 class="title is-2 text-primary">Wallet</h1>
        <p class="subtitle is-6 text-secondary">
          Gestiona tus ingresos y gastos mensuales
        </p>
      </div>

      <!-- Resumen financiero -->
      <div class="financial-summary mb-4">
        <div class="columns">
          <div class="column is-4">
            <div class="balance-card">
              <div class="balance-icon">
                <i class="bx bx-wallet"></i>
              </div>
              <div class="balance-info">
                <div class="balance-label">Balance Actual</div>
                <div class="balance-amount">${{ walletData.balance }}</div>
                <div
                  class="balance-change"
                  :class="
                    walletData.balanceChange >= 0 ? 'positive' : 'negative'
                  "
                >
                  {{ walletData.balanceChange >= 0 ? "+" : "" }}${{
                    walletData.balanceChange
                  }}
                  este mes
                </div>
              </div>
            </div>
          </div>
          <div class="column is-4">
            <div class="income-card">
              <div class="income-icon">
                <i class="bx bx-trending-up"></i>
              </div>
              <div class="income-info">
                <div class="income-label">Ingresos</div>
                <div class="income-amount">${{ walletData.income }}</div>
                <div class="income-period">Este mes</div>
              </div>
            </div>
          </div>
          <div class="column is-4">
            <div class="expense-card">
              <div class="expense-icon">
                <i class="bx bx-trending-down"></i>
              </div>
              <div class="expense-info">
                <div class="expense-label">Gastos</div>
                <div class="expense-amount">${{ walletData.expenses }}</div>
                <div class="expense-period">Este mes</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Controles principales -->
      <div class="wallet-controls mb-4">
        <div
          class="is-flex is-justify-content-space-between is-align-items-center"
        >
          <div class="is-flex is-align-items-center gap-3">
            <button
              class="btn btn-accent"
              @click="showAddTransactionModal = true"
            >
              <i class="bx bx-plus mr-2"></i>Nueva Transacción
            </button>
            <button class="btn btn-primary" @click="showBudgetModal = true">
              <i class="bx bx-target-lock mr-2"></i>Configurar Presupuesto
            </button>
          </div>
          <div class="is-flex is-align-items-center gap-2">
            <select v-model="selectedMonth" class="select select-month">
              <option value="current">Mes Actual</option>
              <option value="previous">Mes Anterior</option>
              <option value="next">Próximo Mes</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="columns">
        <!-- Transacciones recientes -->
        <div class="column is-8">
          <div class="card">
            <div class="card-header">
              <h3 class="title is-5 mb-0">
                Transacciones - {{ getMonthDisplayName() }}
              </h3>
            </div>
            <div class="card-content">
              <div class="transactions-list">
                <div
                  v-for="transaction in transactions"
                  :key="transaction.id"
                  :id="'transaction-' + transaction.id"
                  class="transaction-item"
                  :class="transaction.type"
                >
                  <div class="transaction-icon">
                    <i :class="getTransactionIcon(transaction.category)"></i>
                  </div>
                  <div class="transaction-info">
                    <div class="transaction-title">{{ transaction.title }}</div>
                    <div class="transaction-category">
                      {{ transaction.category }}
                    </div>
                    <div class="transaction-date">{{ transaction.date }}</div>
                  </div>
                  <div class="transaction-amount">
                    <span
                      :class="
                        transaction.type === 'income'
                          ? 'text-accent'
                          : 'text-warning'
                      "
                    >
                      {{ transaction.type === "income" ? "+" : "-" }}${{
                        transaction.amount
                      }}
                    </span>
                  </div>
                  <div class="transaction-actions">
                    <button
                      class="btn-icon"
                      @click="editTransaction(transaction)"
                    >
                      <i class="bx bx-edit"></i>
                    </button>
                    <button
                      class="btn-icon"
                      @click="deleteTransaction(transaction.id)"
                    >
                      <i class="bx bx-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel lateral -->
        <div class="column is-4">
          <!-- Presupuesto -->
          <div class="card mb-4">
            <div class="card-header">
              <h3 class="title is-5 mb-0">
                Presupuesto - {{ getMonthDisplayName() }}
              </h3>
            </div>
            <div class="card-content">
              <div class="budget-categories">
                <div
                  v-for="category in budgetCategories"
                  :key="category.name"
                  class="budget-category"
                >
                  <div class="category-header">
                    <span class="category-name">{{ category.name }}</span>
                    <span class="category-amount"
                      >${{ category.spent }} / ${{ category.limit }}</span
                    >
                  </div>
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      :class="getProgressClass(category.spent, category.limit)"
                      :style="{
                        width:
                          getProgressPercentage(
                            category.spent,
                            category.limit
                          ) + '%',
                      }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Gráfico de gastos -->
          <div class="card">
            <div class="card-header">
              <h3 class="title is-5 mb-0">Distribución de Gastos</h3>
            </div>
            <div class="card-content chart-content">
              <div class="expense-chart">
                <canvas ref="expenseChart" width="300" height="200"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para nueva transacción -->
    <div class="modal" :class="{ 'is-active': showAddTransactionModal }">
      <div
        class="modal-background"
        @click="showAddTransactionModal = false"
      ></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            {{
              editingTransaction ? "Editar Transacción" : "Nueva Transacción"
            }}
          </p>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <label class="label">Tipo</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="transactionForm.type">
                  <option value="income">Ingreso</option>
                  <option value="expense">Gasto</option>
                </select>
              </div>
            </div>
          </div>
          <div class="field">
            <label class="label">Título</label>
            <div class="control">
              <input
                v-model="transactionForm.title"
                class="input"
                type="text"
                placeholder="Descripción de la transacción"
              />
            </div>
          </div>
          <div class="field">
            <label class="label">Categoría</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="transactionForm.category">
                  <option
                    v-if="transactionForm.type === 'income'"
                    value="salary"
                  >
                    Salario
                  </option>
                  <option
                    v-if="transactionForm.type === 'income'"
                    value="freelance"
                  >
                    Freelance
                  </option>
                  <option
                    v-if="transactionForm.type === 'income'"
                    value="investment"
                  >
                    Inversión
                  </option>
                  <option
                    v-if="transactionForm.type === 'expense'"
                    value="food"
                  >
                    Comida
                  </option>
                  <option
                    v-if="transactionForm.type === 'expense'"
                    value="transport"
                  >
                    Transporte
                  </option>
                  <option
                    v-if="transactionForm.type === 'expense'"
                    value="entertainment"
                  >
                    Entretenimiento
                  </option>
                  <option
                    v-if="transactionForm.type === 'expense'"
                    value="health"
                  >
                    Salud
                  </option>
                  <option
                    v-if="transactionForm.type === 'expense'"
                    value="shopping"
                  >
                    Compras
                  </option>
                  <option
                    v-if="transactionForm.type === 'expense'"
                    value="bills"
                  >
                    Facturas
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div class="field">
            <label class="label">Monto</label>
            <div class="control">
              <input
                v-model="transactionForm.amount"
                class="input"
                type="number"
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>
          <div class="field">
            <label class="label">Fecha</label>
            <div class="control">
              <input v-model="transactionForm.date" class="input" type="date" />
            </div>
          </div>
          <div class="field">
            <label class="label">Notas (opcional)</label>
            <div class="control">
              <textarea
                v-model="transactionForm.notes"
                class="textarea"
                placeholder="Notas adicionales"
              ></textarea>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot buttons">
          <button class="btn btn-primary" @click="saveTransaction">
            Guardar
          </button>
          <button
            class="btn button is-danger has-text-white-bis"
            @click="showAddTransactionModal = false"
          >
            Cancelar
          </button>
        </footer>
      </div>
    </div>

    <!-- Modal para presupuesto -->
    <div class="modal" :class="{ 'is-active': showBudgetModal }">
      <div class="modal-background" @click="showBudgetModal = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Configurar Presupuesto</p>
          <button class="delete" @click="showBudgetModal = false"></button>
        </header>
        <section class="modal-card-body">
          <div
            v-for="category in budgetCategories"
            :key="category.name"
            class="field"
          >
            <label class="label">{{ category.name }}</label>
            <div class="control">
              <input
                v-model="category.limit"
                class="input"
                type="number"
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>
        </section>
        <footer class="modal-card-foot buttons">
          <button class="btn btn-primary" @click="saveBudget">Guardar</button>
          <button
            class="btn button is-danger has-text-white-bis"
            @click="showBudgetModal = false"
          >
            Cancelar
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, watch } from "vue";
import { db, auth } from "../../firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  getDocs,
} from "firebase/firestore";
import Chart from "chart.js/auto";
import { useRoute } from "vue-router";
import { alertQuestion, alertSuccess } from "@/components/alert";
import FloatingIcons from "../components/FloatingIcons.vue";

// Estado de la aplicación
const showAddTransactionModal = ref(false);
const showBudgetModal = ref(false);
const editingTransaction = ref(null);
const selectedMonth = ref("current");
const expenseChart = ref(null);

// Datos del wallet (se calculan)
const walletData = reactive({
  balance: 0,
  balanceChange: 0,
  income: 0,
  expenses: 0,
});

// Formulario de transacción
const transactionForm = reactive({
  type: "expense",
  title: "",
  category: "",
  amount: "",
  date: "",
  notes: "",
});

// Transacciones desde Firestore
const transactions = ref([]);
const getUserId = () => auth.currentUser?.uid;

// Watcher para el filtro de meses
watch(selectedMonth, () => {
  calcularWalletData();
  nextTick(() => renderExpenseChart());
});

onMounted(() => {
  onSnapshot(collection(db, "transactions"), (snapshot) => {
    const userId = getUserId();
    if (!userId) return;
    const allTransactions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const userTransactions = allTransactions.filter((t) => t.userId === userId);
    transactions.value = userTransactions;
    calcularWalletData();
    nextTick(() => renderExpenseChart());
  });
});

// Presupuesto desde Firestore
const budgetCategories = ref([
  { name: "Comida", limit: 0, spent: 0 },
  { name: "Transporte", limit: 0, spent: 0 },
  { name: "Entretenimiento", limit: 0, spent: 0 },
  { name: "Salud", limit: 0, spent: 0 },
  { name: "Compras", limit: 0, spent: 0 },
  { name: "Facturas", limit: 0, spent: 0 },
]);

onMounted(async () => {
  // Leer presupuesto
  const userId = getUserId();
  if (!userId) return;

  const snapshot = await getDocs(collection(db, "budgets"));
  if (!snapshot.empty) {
    const userBudget = snapshot.docs.find(
      (doc) => doc.data().userId === userId
    );
    if (userBudget) {
      const data = userBudget.data();
      budgetCategories.value.forEach((cat) => {
        if (data[cat.name]) cat.limit = data[cat.name];
      });
    }
  }
  calcularWalletData();
  nextTick(() => renderExpenseChart());
});

// Guardar presupuesto
const saveBudget = async () => {
  const userId = getUserId();
  if (!userId) return;

  const data = {};
  budgetCategories.value.forEach((cat) => (data[cat.name] = Number(cat.limit)));

  try {
    const snapshot = await getDocs(collection(db, "budgets"));
    const userBudget = snapshot.docs.find(
      (doc) => doc.data().userId === userId
    );

    if (userBudget) {
      // Actualizar presupuesto existente
      await updateDoc(doc(db, "budgets", userBudget.id), { ...data, userId });
    } else {
      // Crear nuevo presupuesto
      await addDoc(collection(db, "budgets"), { ...data, userId });
    }

    showBudgetModal.value = false;
    alertSuccess("Presupuesto guardado exitosamente");
  } catch (error) {
    console.error("Error al guardar presupuesto:", error);
    alertError("Error al guardar el presupuesto");
  }
};

// Guardar transacción (crear o actualizar)
const saveTransaction = async () => {
  const userId = getUserId();
  if (!userId) return;
  if (
    !transactionForm.title.trim() ||
    !transactionForm.amount ||
    !transactionForm.date
  )
    return;
  if (editingTransaction.value) {
    await updateDoc(doc(db, "transactions", editingTransaction.value.id), {
      ...transactionForm,
      amount: Number(transactionForm.amount),
      userId,
    });
    alertSuccess("editado exitosamente");
  } else {
    await addDoc(collection(db, "transactions"), {
      ...transactionForm,
      amount: Number(transactionForm.amount),
      userId,
    });
    alertSuccess("guardado exitosamente");
  }

  // Recalcular datos inmediatamente
  setTimeout(() => {
    calcularWalletData();
    nextTick(() => renderExpenseChart());
  }, 100);

  resetTransactionForm();
  showAddTransactionModal.value = false;
};

const deleteTransaction = async (id) => {
  const result = await alertQuestion("¿deseas eliminar la transaccion?");
  if (!result.isConfirmed) return;
  await deleteDoc(doc(db, "transactions", id));
  alertSuccess("eliminado exitosamente");
};

const editTransaction = (transaction) => {
  editingTransaction.value = transaction;
  Object.assign(transactionForm, transaction);
  showAddTransactionModal.value = true;
};

const resetTransactionForm = () => {
  Object.assign(transactionForm, {
    type: "expense",
    title: "",
    category: "",
    amount: "",
    date: "",
    notes: "",
  });
  editingTransaction.value = null;
};

// Calcular resumen financiero y gastos por categoría
function calcularWalletData() {
  const currentDate = new Date();
  let targetMonth, targetYear;

  // Determinar el mes y año objetivo según el filtro
  switch (selectedMonth.value) {
    case "current":
      targetMonth = currentDate.getMonth();
      targetYear = currentDate.getFullYear();
      break;
    case "previous":
      targetMonth = currentDate.getMonth() - 1;
      targetYear = currentDate.getFullYear();
      // Ajustar año si es enero del año anterior
      if (targetMonth < 0) {
        targetMonth = 11;
        targetYear--;
      }
      break;
    case "next":
      targetMonth = currentDate.getMonth() + 1;
      targetYear = currentDate.getFullYear();
      // Ajustar año si es diciembre del año siguiente
      if (targetMonth > 11) {
        targetMonth = 0;
        targetYear++;
      }
      break;
    default:
      targetMonth = currentDate.getMonth();
      targetYear = currentDate.getFullYear();
  }

  let income = 0,
    expenses = 0;
  budgetCategories.value.forEach((cat) => (cat.spent = 0));

  transactions.value.forEach((t) => {
    const tDate = new Date(t.date);
    if (
      tDate.getMonth() === targetMonth &&
      tDate.getFullYear() === targetYear
    ) {
      if (t.type === "income") income += Number(t.amount);
      if (t.type === "expense") {
        expenses += Number(t.amount);
        // Sumar a la categoría
        const categoryName = getCategoryName(t.category);

        const cat = budgetCategories.value.find((c) => c.name === categoryName);
        if (cat) {
          cat.spent += Number(t.amount);
        } else {
        }
      }
    }
  });

  walletData.income = income;
  walletData.expenses = expenses;
  walletData.balance = income - expenses;

  // Balance change: diferencia con el mes anterior del mes seleccionado
  let prevIncome = 0,
    prevExpenses = 0;
  const prevMonth = targetMonth - 1;
  const prevYear = targetMonth === 0 ? targetYear - 1 : targetYear;

  transactions.value.forEach((t) => {
    const tDate = new Date(t.date);
    const tMonth = targetMonth === 0 ? 11 : targetMonth - 1;
    const tYear = targetMonth === 0 ? targetYear - 1 : targetYear;

    if (tDate.getMonth() === tMonth && tDate.getFullYear() === tYear) {
      if (t.type === "income") prevIncome += Number(t.amount);
      if (t.type === "expense") prevExpenses += Number(t.amount);
    }
  });
  walletData.balanceChange = income - expenses - (prevIncome - prevExpenses);
}

function getCategoryName(category) {
  // Mapea el valor de category a los nombres de budgetCategories
  switch (category) {
    case "food":
      return "Comida";
    case "transport":
      return "Transporte";
    case "entertainment":
      return "Entretenimiento";
    case "health":
      return "Salud";
    case "shopping":
      return "Compras";
    case "bills":
      return "Facturas";
    default:
      return category.toLowerCase();
  }
}

function getMonthDisplayName() {
  const currentDate = new Date();
  let targetMonth, targetYear;

  switch (selectedMonth.value) {
    case "current":
      targetMonth = currentDate.getMonth();
      targetYear = currentDate.getFullYear();
      break;
    case "previous":
      targetMonth = currentDate.getMonth() - 1;
      targetYear = currentDate.getFullYear();
      if (targetMonth < 0) {
        targetMonth = 11;
        targetYear--;
      }
      break;
    case "next":
      targetMonth = currentDate.getMonth() + 1;
      targetYear = currentDate.getFullYear();
      if (targetMonth > 11) {
        targetMonth = 0;
        targetYear++;
      }
      break;
    default:
      targetMonth = currentDate.getMonth();
      targetYear = currentDate.getFullYear();
  }

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  return `${monthNames[targetMonth]} ${targetYear}`;
}

// Gráfico de gastos
let chartInstance = null;
function renderExpenseChart() {
  if (!expenseChart.value) return;
  if (chartInstance) chartInstance.destroy();
  const data = budgetCategories.value.map((cat) => cat.spent);
  const labels = budgetCategories.value.map((cat) => cat.name);

  const ctx = expenseChart.value.getContext("2d");
  chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data,
          backgroundColor: [
            "#6366f1",
            "#06d6a0",
            "#fbbf24",
            "#ef4444",
            "#8b5cf6",
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
          },
        },
      },
      cutout: "60%",
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

// Funciones
const getTransactionIcon = (category) => {
  const icons = {
    salary: "bx-money",
    freelance: "bx-briefcase",
    investment: "bx-trending-up",
    food: "bx-restaurant",
    transport: "bx-car",
    entertainment: "bx-movie",
    health: "bx-plus-medical",
    shopping: "bx-shopping-bag",
    bills: "bx-receipt",
  };
  return `bx ${icons[category] || "bx-dollar"}`;
};

const getProgressClass = (spent, limit) => {
  const percentage = (spent / limit) * 100;
  if (percentage >= 90) return "danger";
  if (percentage >= 75) return "warning";
  return "success";
};

const getProgressPercentage = (spent, limit) => {
  return Math.min((spent / limit) * 100, 100);
};

const route = useRoute();
const highlightedId = ref(null);

watch(
  () => route.query.highlight,
  async (val) => {
    if (val) {
      highlightedId.value = val;
      await nextTick();
      const el = document.getElementById("transaction-" + val);
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
</script>

<style scoped>
.modal-card-body {
  width: 40em;
}

.select-month {
  border-radius: 10px;
  padding: 0em 1em;
  border: 1px solid transparent;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
}

.select-month > option {
  border-radius: 10px;
}

.wallet-page {
  padding: 2rem 0;
  overflow: scroll;
  height: 95vh;
  background: var(--background-secondary);
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.gap-2 {
  gap: 0.5rem;
}
.gap-3 {
  gap: 0.75rem;
}

/* Tarjetas de resumen */
.financial-summary {
  margin-bottom: 2rem;
}

.balance-card,
.income-card,
.expense-card {
  background: var(--background);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.balance-card:hover,
.income-card:hover,
.expense-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px var(--shadow-hover);
}

.balance-card {
  background: linear-gradient(
    135deg,
    var(--primary) 0%,
    var(--primary-dark) 100%
  );
  color: white;
}

.income-card {
  background: linear-gradient(
    135deg,
    var(--accent) 0%,
    var(--accent-light) 100%
  );
  color: white;
}

.expense-card {
  background: linear-gradient(
    135deg,
    var(--warning) 0%,
    var(--warning-light) 100%
  );
  color: var(--text);
}

.balance-icon,
.income-icon,
.expense-icon {
  font-size: 2rem;
  opacity: 0.9;
}

.balance-info,
.income-info,
.expense-info {
  flex: 1;
}

.balance-label,
.income-label,
.expense-label {
  padding: 0.5rem 0.75rem;
  font-size: 1.15rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.25rem;
}

.balance-amount,
.income-amount,
.expense-amount {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.balance-change {
  font-size: 0.875rem;
  font-weight: 600;
}

.balance-change.positive {
  color: var(--accent);
}

.balance-change.negative {
  color: var(--warning);
}

.income-period,
.expense-period {
  font-size: 0.875rem;
  opacity: 0.8;
}

/* Controles */
.wallet-controls {
  background: var(--background);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow);
}

/* Transacciones */
.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 875px;
  overflow-y: auto;
  padding-right: 8px;
}

/* Estilizar scrollbar */
.transactions-list::-webkit-scrollbar {
  width: 6px;
}

.transactions-list::-webkit-scrollbar-track {
  background: var(--background);
  border-radius: 3px;
}

.transactions-list::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

.transactions-list::-webkit-scrollbar-thumb:hover {
  background: var(--secondary);
}

/* Estilos para modo oscuro del scrollbar */
#theme-dark .transactions-list::-webkit-scrollbar-track {
  background: rgba(79, 140, 255, 0.1);
}

#theme-dark .transactions-list::-webkit-scrollbar-thumb {
  background: rgba(79, 140, 255, 0.3);
}

#theme-dark .transactions-list::-webkit-scrollbar-thumb:hover {
  background: rgba(79, 140, 255, 0.5);
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--background-secondary);
  border-radius: 8px;
  transition: all 0.3s ease;
  border-left: 4px solid var(--primary);
}

.transaction-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px var(--shadow);
}

.transaction-item.income {
  border-left-color: var(--accent);
}

.transaction-item.expense {
  border-left-color: var(--warning);
}

.transaction-icon {
  font-size: 1.5rem;
  color: var(--primary);
  min-width: 40px;
  text-align: center;
}

.transaction-item.income .transaction-icon {
  color: var(--accent);
}

.transaction-item.expense .transaction-icon {
  color: var(--warning);
}

.transaction-info {
  flex: 1;
}

.transaction-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.transaction-category {
  font-size: 0.875rem;
  color: var(--secondary);
  text-transform: capitalize;
  margin-bottom: 0.25rem;
}

.transaction-date {
  font-size: 0.75rem;
  color: var(--secondary);
}

.transaction-amount {
  font-weight: 700;
  font-size: 1.125rem;
  min-width: 100px;
  text-align: right;
}

.transaction-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: none;
  border: none;
  color: var(--secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.btn-icon:hover {
  background: var(--background-secondary);
  color: var(--primary);
}

/* Presupuesto */
.budget-categories {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.budget-category {
  background: var(--background-secondary);
  padding: 1rem;
  border-radius: 8px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.category-name {
  font-weight: 600;
}

.category-amount {
  font-size: 0.875rem;
  color: var(--secondary);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--border);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.progress-fill.success {
  background: var(--accent);
}

.progress-fill.warning {
  background: var(--warning);
}

.progress-fill.danger {
  background: #ef4444;
}

/* Gráfico */
.expense-chart {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 1rem;
}

.chart-content {
  padding: 1.5rem;
  padding-bottom: 2rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .financial-summary .columns {
    flex-direction: column;
  }

  .financial-summary .column {
    margin-bottom: 1rem;
  }
}

@media (max-width: 768px) {
  .wallet-page {
    padding: 1rem 0;
  }

  .wallet-controls {
    padding: 1rem;
  }

  .transaction-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .transaction-amount {
    text-align: left;
    min-width: auto;
  }

  .transaction-actions {
    align-self: flex-end;
  }
}

@media (max-width: 600px) {
  .card-header h3,
  .card-content h4,
  .card-content h3,
  .balance-label,
  .expense-label,
  .income-label {
    font-size: 1rem;
    padding: 0.4rem 0.5rem;
  }
}

.card-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border);
  background: var(--background);
  min-width: 0;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}
.card-header h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.highlighted-search {
  box-shadow: 0 0 0 3px var(--primary);
  background: var(--primary-light);
  transition: box-shadow 0.3s, background 0.3s;
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
