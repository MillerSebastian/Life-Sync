<template>
  <div class="graph-status">
    <div class="chart-container">
      <div class="chart-header">
        <h3>{{ title }}</h3>
        <div class="chart-controls">
          <select v-model="selectedPeriod" @change="updateChart">
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
          </select>
        </div>
      </div>

      <div class="chart-content">
        <canvas ref="chartCanvas" width="400" height="200"></canvas>
      </div>

      <div class="chart-stats">
        <div class="stat-item" v-for="stat in stats" :key="stat.label">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-change" :class="stat.trend">
            <i
              :class="
                stat.trend === 'up'
                  ? 'bx bx-up-arrow-alt'
                  : 'bx bx-down-arrow-alt'
              "
            ></i>
            {{ stat.change }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";

const props = defineProps({
  title: {
    type: String,
    default: "Estadísticas",
  },
  type: {
    type: String,
    default: "line", // line, bar, pie
  },
  data: {
    type: Object,
    default: () => ({}),
  },
});

const chartCanvas = ref(null);
const selectedPeriod = ref("7d");
let chart = null;

const stats = ref([
  {
    label: "Total",
    value: "1,247",
    change: "+12%",
    trend: "up",
  },
  {
    label: "Promedio",
    value: "89",
    change: "+5%",
    trend: "up",
  },
  {
    label: "Máximo",
    value: "156",
    change: "-3%",
    trend: "down",
  },
]);

const updateChart = () => {
  if (!chartCanvas.value) return;

  const ctx = chartCanvas.value.getContext("2d");

  // Simular datos basados en el período seleccionado
  const data = generateChartData(selectedPeriod.value);

  // Limpiar canvas
  ctx.clearRect(0, 0, chartCanvas.value.width, chartCanvas.value.height);

  // Dibujar gráfico simple
  drawSimpleChart(ctx, data);
};

const generateChartData = (period) => {
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const data = [];

  for (let i = 0; i < days; i++) {
    data.push({
      label: `Día ${i + 1}`,
      value: Math.floor(Math.random() * 100) + 50,
    });
  }

  return data;
};

const drawSimpleChart = (ctx, data) => {
  const width = chartCanvas.value.width;
  const height = chartCanvas.value.height;
  const padding = 40;

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Encontrar valores máximos y mínimos
  const values = data.map((d) => d.value);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);

  // Dibujar ejes
  ctx.strokeStyle = "#ddd";
  ctx.lineWidth = 1;

  // Eje Y
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.stroke();

  // Eje X
  ctx.beginPath();
  ctx.moveTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  // Dibujar línea del gráfico
  ctx.strokeStyle = "#667eea";
  ctx.lineWidth = 3;
  ctx.beginPath();

  data.forEach((point, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y =
      height -
      padding -
      ((point.value - minValue) / (maxValue - minValue)) * chartHeight;

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();

  // Dibujar puntos
  ctx.fillStyle = "#667eea";
  data.forEach((point, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y =
      height -
      padding -
      ((point.value - minValue) / (maxValue - minValue)) * chartHeight;

    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fill();
  });

  // Dibujar etiquetas
  ctx.fillStyle = "#666";
  ctx.font = "12px Arial";
  ctx.textAlign = "center";

  // Etiquetas del eje X
  const step = Math.floor(data.length / 5);
  for (let i = 0; i < data.length; i += step) {
    const x = padding + (i / (data.length - 1)) * chartWidth;
    ctx.fillText(data[i].label, x, height - padding + 20);
  }

  // Etiquetas del eje Y
  ctx.textAlign = "right";
  for (let i = 0; i <= 5; i++) {
    const value = minValue + (i / 5) * (maxValue - minValue);
    const y = height - padding - (i / 5) * chartHeight;
    ctx.fillText(Math.round(value), padding - 10, y + 4);
  }
};

onMounted(() => {
  updateChart();
});

watch(() => props.data, updateChart, { deep: true });
</script>

<style scoped>
.graph-status {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.chart-controls select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background: white;
  font-size: 14px;
}

.chart-content {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.chart-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.stat-change {
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.stat-change.up {
  color: #28a745;
}

.stat-change.down {
  color: #dc3545;
}

.stat-change i {
  font-size: 14px;
}
</style>
