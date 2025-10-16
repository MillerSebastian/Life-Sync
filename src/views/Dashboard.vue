<template>
  <div class="dashboard-page">
    <FloatingIcons viewType="dashboard" />
    <DashboardSummary />
  </div>
</template>

<script setup>
import DashboardSummary from "../components/DashboardSummary.vue";
import FloatingIcons from "../components/FloatingIcons.vue";
</script>

<style scoped>
.dashboard-page {
  padding: 0;
  width: 100%;
}

.dashboard {
  padding: 20px;
  width: 100%;
}

.dashboard h1 {
  color: #333;
  margin-bottom: 30px;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 15px;
  text-align: center;
}

.welcome-card h2 {
  margin: 0 0 10px 0;
  font-size: 28px;
}

.welcome-card p {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-card h3 {
  margin: 0 0 15px 0;
  color: #666;
  font-size: 16px;
}

.stat-number {
  font-size: 36px;
  font-weight: bold;
  color: #667eea;
  margin: 0;
}
</style>
