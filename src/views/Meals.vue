<template>
  <div class="meals-page">
    <FloatingIcons viewType="meals" />
    <div class="container">
      <!-- Header -->
      <div class="page-header">
        <h1 class="title is-2 text-primary">Planificación de Comidas</h1>
        <p class="subtitle is-6 text-secondary">
          Gestiona tu alimentación y nutrición diaria
        </p>
        <button class="btn btn-accent mt-3" @click="openNutritionGoalsModal">
          <i class="bx bx-cog mr-2"></i>Editar Metas Nutricionales
        </button>
      </div>

      <!-- Resumen nutricional -->
      <div class="nutrition-summary mb-4">
        <div class="columns">
          <div
            class="column is-3"
            v-for="nutrient in nutritionData"
            :key="nutrient.name"
          >
            <div class="nutrition-card">
              <div class="nutrition-icon">
                <i :class="nutrient.icon"></i>
              </div>
              <div class="nutrition-info">
                <div class="nutrition-value">{{ nutrient.value }}</div>
                <div class="nutrition-label">{{ nutrient.name }}</div>
                <div class="nutrition-target">Meta: {{ nutrient.target }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Controles principales -->
      <div class="meals-controls mb-4">
        <div
          class="is-flex is-justify-content-space-between is-align-items-center"
        >
          <div class="is-flex is-align-items-center gap-3">
            <button class="btn btn-accent" @click="showAddMealModal = true">
              <i class="bx bx-plus mr-2"></i>Agregar Comida
            </button>
            <button class="btn btn-primary" @click="showMealPlanModal = true">
              <i class="bx bx-calendar-check mr-2"></i>Planificar Semana
            </button>
          </div>
          <div class="is-flex is-align-items-center gap-2">
            <select v-model="selectedDate" class="select select-month">
              <option value="today">Hoy</option>
              <option value="tomorrow">Mañana</option>
              <option value="week">Esta Semana</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Plan de comidas -->
      <div class="columns">
        <div class="column is-8">
          <div class="card">
            <div class="card-header">
              <h3 class="title is-5 mb-0">
                Plan de Comidas - {{ currentDateText }}
              </h3>
            </div>
            <div class="card-content">
              <div v-if="selectedDate === 'week'">
                <div v-for="day in weekMealsList" :key="day.date" class="mb-4">
                  <h4 class="title is-6 mb-2">
                    {{
                      new Date(day.date).toLocaleDateString("es-ES", {
                        weekday: "long",
                        day: "numeric",
                        month: "short",
                      })
                    }}
                  </h4>
                  <div class="meals-timeline">
                    <div
                      v-for="meal in day.meals"
                      :key="meal.id"
                      :id="'meal-' + meal.id"
                      class="meal-item"
                      :class="[meal.type, { 'meal-completed': meal.completed }]"
                    >
                      <div class="meal-time">{{ meal.time }}</div>
                      <div class="meal-content">
                        <div class="meal-header">
                          <h4 class="meal-title">{{ meal.name }}</h4>
                          <div class="meal-calories">
                            {{ meal.calories }} cal
                          </div>
                        </div>
                        <div v-if="meal.image" class="meal-image">
                          <img
                            :src="meal.image"
                            :alt="meal.name"
                            @error="handleImageError"
                          />
                        </div>
                        <div class="meal-description">
                          {{ meal.description }}
                        </div>
                        <div class="meal-ingredients">
                          <span
                            v-for="ingredient in meal.ingredients"
                            :key="ingredient"
                            class="ingredient-tag"
                          >
                            {{ ingredient }}
                          </span>
                        </div>
                        <div class="meal-nutrition">
                          <span class="nutrition-tag protein"
                            >{{ meal.nutrition.protein }}g proteína</span
                          >
                          <span class="nutrition-tag carbs"
                            >{{ meal.nutrition.carbs }}g carbohidratos</span
                          >
                          <span class="nutrition-tag fat"
                            >{{ meal.nutrition.fat }}g grasa</span
                          >
                        </div>
                      </div>
                      <div class="meal-actions">
                        <button
                          class="btn-icon completed-checkbox"
                          :class="{ 'is-completed': meal.completed }"
                          @click="toggleMealCompletion(meal)"
                          :title="
                            meal.completed
                              ? 'Desmarcar como completada'
                              : 'Marcar como completada'
                          "
                        >
                          <i
                            :class="
                              meal.completed
                                ? 'bx bx-check-circle'
                                : 'bx bx-circle'
                            "
                          ></i>
                        </button>
                        <button class="btn-icon" @click="editMeal(meal)">
                          <i class="bx bx-edit"></i>
                        </button>
                        <button class="btn-icon" @click="deleteMeal(meal.id)">
                          <i class="bx bx-trash"></i>
                        </button>
                        <button class="btn-icon" @click="toggleFavorite(meal)">
                          <i
                            :class="
                              favoriteRecipes.find((r) => r.name === meal.name)
                                ? 'bx bxs-star'
                                : 'bx bx-star'
                            "
                            style="color: #fbbf24"
                          ></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else>
                <div class="meals-timeline">
                  <div
                    v-for="meal in dailyMeals"
                    :key="meal.id"
                    :id="'meal-' + meal.id"
                    class="meal-item"
                    :class="[meal.type, { 'meal-completed': meal.completed }]"
                  >
                    <div class="meal-time">{{ meal.time }}</div>
                    <div class="meal-content">
                      <div class="meal-header">
                        <h4 class="meal-title">{{ meal.name }}</h4>
                        <div class="meal-calories">{{ meal.calories }} cal</div>
                      </div>
                      <div v-if="meal.image" class="meal-image">
                        <img
                          :src="meal.image"
                          :alt="meal.name"
                          @error="handleImageError"
                        />
                      </div>
                      <div class="meal-description">{{ meal.description }}</div>
                      <div class="meal-ingredients">
                        <span
                          v-for="ingredient in meal.ingredients"
                          :key="ingredient"
                          class="ingredient-tag"
                        >
                          {{ ingredient }}
                        </span>
                      </div>
                      <div class="meal-nutrition">
                        <span class="nutrition-tag protein"
                          >{{ meal.nutrition.protein }}g proteína</span
                        >
                        <span class="nutrition-tag carbs"
                          >{{ meal.nutrition.carbs }}g carbohidratos</span
                        >
                        <span class="nutrition-tag fat"
                          >{{ meal.nutrition.fat }}g grasa</span
                        >
                      </div>
                    </div>
                    <div class="meal-actions">
                      <button
                        class="btn-icon completed-checkbox"
                        :class="{ 'is-completed': meal.completed }"
                        @click="toggleMealCompletion(meal)"
                        :title="
                          meal.completed
                            ? 'Desmarcar como completada'
                            : 'Marcar como completada'
                        "
                      >
                        <i
                          :class="
                            meal.completed
                              ? 'bx bx-check-circle'
                              : 'bx bx-circle'
                          "
                        ></i>
                      </button>
                      <button class="btn-icon" @click="editMeal(meal)">
                        <i class="bx bx-edit"></i>
                      </button>
                      <button class="btn-icon" @click="deleteMeal(meal.id)">
                        <i class="bx bx-trash"></i>
                      </button>
                      <button class="btn-icon" @click="toggleFavorite(meal)">
                        <i
                          :class="
                            favoriteRecipes.find((r) => r.name === meal.name)
                              ? 'bx bxs-star'
                              : 'bx bx-star'
                          "
                          style="color: #fbbf24"
                        ></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel lateral -->
        <div class="column is-4">
          <!-- Resumen diario -->
          <div class="card mb-4">
            <div class="card-header">
              <h3 class="title is-5 mb-0">Resumen Nutricional</h3>
            </div>
            <div class="card-content">
              <div class="daily-summary">
                <!-- Calorías -->
                <div class="summary-item">
                  <div class="summary-header">
                    <div class="summary-label">
                      <i class="bx bx-fire mr-2"></i>Calorías
                    </div>
                    <div class="summary-value">
                      {{ dailyCalories }} / {{ dailyTarget }} cal
                    </div>
                  </div>
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      :class="getCalorieProgressClass()"
                      :style="{ width: getCalorieProgress() + '%' }"
                    ></div>
                  </div>
                  <div class="summary-percentage">
                    {{ Math.round(getCalorieProgress()) }}% de la meta
                  </div>
                </div>

                <!-- Proteínas -->
                <div class="summary-item">
                  <div class="summary-header">
                    <div class="summary-label">
                      <i class="bx bx-dumbbell mr-2"></i>Proteínas
                    </div>
                    <div class="summary-value">
                      {{ dailyProtein }} / {{ nutritionGoals.protein }}g
                    </div>
                  </div>
                  <div class="progress-bar">
                    <div
                      class="progress-fill protein-progress"
                      :style="{ width: getProteinProgress() + '%' }"
                    ></div>
                  </div>
                  <div class="summary-percentage">
                    {{ Math.round(getProteinProgress()) }}% de la meta
                  </div>
                </div>

                <!-- Carbohidratos -->
                <div class="summary-item">
                  <div class="summary-header">
                    <div class="summary-label">
                      <i class="bx bx-bread mr-2"></i>Carbohidratos
                    </div>
                    <div class="summary-value">
                      {{ dailyCarbs }} / {{ nutritionGoals.carbs }}g
                    </div>
                  </div>
                  <div class="progress-bar">
                    <div
                      class="progress-fill carbs-progress"
                      :style="{ width: getCarbsProgress() + '%' }"
                    ></div>
                  </div>
                  <div class="summary-percentage">
                    {{ Math.round(getCarbsProgress()) }}% de la meta
                  </div>
                </div>

                <!-- Grasas -->
                <div class="summary-item">
                  <div class="summary-header">
                    <div class="summary-label">
                      <i class="bx bx-droplet mr-2"></i>Grasas
                    </div>
                    <div class="summary-value">
                      {{ dailyFat }} / {{ nutritionGoals.fat }}g
                    </div>
                  </div>
                  <div class="progress-bar">
                    <div
                      class="progress-fill fat-progress"
                      :style="{ width: getFatProgress() + '%' }"
                    ></div>
                  </div>
                  <div class="summary-percentage">
                    {{ Math.round(getFatProgress()) }}% de la meta
                  </div>
                </div>

                <!-- Agua -->
                <div class="summary-item">
                  <div class="summary-header">
                    <div class="summary-label">
                      <i class="bx bx-water mr-2"></i>Agua
                    </div>
                    <div class="summary-value">
                      <div class="water-input-container">
                        <input
                          v-model="manualWaterIntake"
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          class="water-input"
                          placeholder="0.0"
                          @blur="saveWaterIntake"
                          @keyup.enter="saveWaterIntake"
                        />
                        <span class="water-unit">L</span>
                      </div>
                      / {{ nutritionGoals.water }}L
                    </div>
                  </div>
                  <div class="progress-bar">
                    <div
                      class="progress-fill water-progress"
                      :style="{
                        width:
                          (totalWaterIntake / nutritionGoals.water) * 100 + '%',
                      }"
                    ></div>
                  </div>
                  <div class="summary-percentage">
                    {{
                      Math.round(
                        (totalWaterIntake / nutritionGoals.water) * 100
                      )
                    }}% de la meta
                  </div>
                </div>

                <!-- Comidas completadas -->
                <div class="summary-item">
                  <div class="summary-header">
                    <div class="summary-label">
                      <i class="bx bx-check-circle mr-2"></i>Comidas Completadas
                    </div>
                    <div class="summary-value">
                      {{ realCompletedMeals }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recetas favoritas -->
          <div class="card">
            <div class="card-header">
              <h3 class="title is-5 mb-0">Recetas Favoritas</h3>
            </div>
            <div class="card-content">
              <div class="favorite-recipes">
                <div
                  v-for="recipe in favoriteRecipes"
                  :key="recipe.id"
                  class="recipe-item"
                  @click="addRecipeToMeal(recipe)"
                >
                  <div class="recipe-image">
                    <img :src="recipe.image" :alt="recipe.name" />
                  </div>
                  <div class="recipe-info">
                    <div class="recipe-name">{{ recipe.name }}</div>
                    <div class="recipe-calories">{{ recipe.calories }} cal</div>
                  </div>
                  <button class="btn-icon" @click.stop="toggleFavorite(recipe)">
                    <i :class="'bx bxs-star'" style="color: #fbbf24"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para agregar/editar comida -->
    <div class="modal" :class="{ 'is-active': showAddMealModal }">
      <div class="modal-background" @click="showAddMealModal = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            {{ editingMeal ? "Editar Comida" : "Agregar Comida" }}
          </p>
          <button class="delete" @click="showAddMealModal = false"></button>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <label class="label">Tipo de Comida</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="mealForm.type">
                  <option value="breakfast">Desayuno</option>
                  <option value="lunch">Almuerzo</option>
                  <option value="dinner">Cena</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
            </div>
          </div>
          <div class="field">
            <label class="label">Nombre</label>
            <div class="control">
              <input
                v-model="mealForm.name"
                class="input"
                type="text"
                placeholder="Nombre de la comida"
              />
            </div>
          </div>
          <div class="field">
            <label class="label">Descripción</label>
            <div class="control">
              <textarea
                v-model="mealForm.description"
                class="textarea"
                placeholder="Descripción de la comida"
              ></textarea>
            </div>
          </div>
          <div class="field">
            <label class="label">Imagen (URL)</label>
            <div class="control">
              <input
                v-model="mealForm.image"
                class="input"
                type="url"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              <div v-if="mealForm.image" class="mt-2">
                <img
                  :src="mealForm.image"
                  alt="Imagen comida"
                  style="
                    max-width: 120px;
                    max-height: 120px;
                    object-fit: cover;
                    border-radius: 8px;
                  "
                  @error="handleImageError"
                />
              </div>
            </div>
          </div>
          <div class="columns">
            <div class="column is-6">
              <div class="field">
                <label class="label">Hora</label>
                <div class="control">
                  <input v-model="mealForm.time" class="input" type="time" />
                </div>
              </div>
            </div>
            <div class="column is-6">
              <div class="field">
                <label class="label">Calorías</label>
                <div class="control">
                  <input
                    v-model="mealForm.calories"
                    class="input"
                    type="number"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="field">
            <label class="label">Ingredientes (separados por comas)</label>
            <div class="control">
              <input
                v-model="mealForm.ingredientsText"
                class="input"
                type="text"
                placeholder="Ingrediente 1, Ingrediente 2, ..."
              />
            </div>
          </div>
          <div class="columns">
            <div class="column is-4">
              <div class="field">
                <label class="label">Proteína (g)</label>
                <div class="control">
                  <input
                    v-model="mealForm.protein"
                    class="input"
                    type="number"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            <div class="column is-4">
              <div class="field">
                <label class="label">Carbohidratos (g)</label>
                <div class="control">
                  <input
                    v-model="mealForm.carbs"
                    class="input"
                    type="number"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            <div class="column is-4">
              <div class="field">
                <label class="label">Grasa (g)</label>
                <div class="control">
                  <input
                    v-model="mealForm.fat"
                    class="input"
                    type="number"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot buttons">
          <button class="btn btn-primary" @click="saveMeal">Guardar</button>
          <button
            class="btn button is-danger has-text-white-bis"
            @click="showAddMealModal = false"
          >
            Cancelar
          </button>
        </footer>
      </div>
    </div>

    <!-- Modal para planificar semana -->
    <div class="modal" :class="{ 'is-active': showMealPlanModal }">
      <div class="modal-background" @click="showMealPlanModal = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Planificar Semana</p>
          <button class="delete" @click="showMealPlanModal = false"></button>
        </header>
        <section class="modal-card-body">
          <div v-for="(day, idx) in weekDays" :key="day" class="mb-4">
            <h4 class="title is-6 mb-2">{{ day }}</h4>
            <div class="columns is-multiline">
              <div class="column is-4" v-for="type in mealTypes" :key="type">
                <label class="label">{{ typeLabels[type] }}</label>
                <input
                  v-model="weekPlan[day][type]"
                  class="input"
                  type="text"
                  placeholder="Nombre de la comida"
                />
              </div>
            </div>
          </div>
        </section>
        <footer
          class="modal-card-foot buttons"
          style="flex-wrap: wrap; gap: 0.5rem"
        >
          <button
            class="btn btn-primary is-small mr-2 mb-2"
            :disabled="weekPlanLoading"
            @click="saveWeekPlan"
          >
            <span v-if="weekPlanLoading">Guardando...</span>
            <span v-else>Guardar Semana</span>
          </button>
          <button
            class="btn button is-danger button-cancel has-text-white-bis"
            @click="showMealPlanModal = false"
          >
            Cancelar
          </button>
          <button
            class="btn btn-warning is-small mr-2 mb-2"
            @click="clearWeekPlan"
            type="button"
          >
            Limpiar Semana
          </button>
          <button
            class="btn btn-accent is-small mb-2"
            @click="copyLastWeek"
            type="button"
          >
            Copiar Semana Anterior
          </button>
        </footer>
      </div>
      <div v-if="weekPlanSuccess" class="notification is-success mt-2">
        ¡Semana guardada con éxito!
      </div>
      <div v-if="weekPlanError" class="notification is-danger mt-2">
        {{ weekPlanError }}
      </div>
    </div>

    <!-- Modal para editar metas nutricionales -->
    <div class="modal" :class="{ 'is-active': showNutritionGoalsModal }">
      <div
        class="modal-background"
        @click="showNutritionGoalsModal = false"
      ></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Editar Metas Nutricionales</p>
          <button
            class="delete"
            @click="showNutritionGoalsModal = false"
          ></button>
        </header>
        <section class="modal-card-body">
          <div class="columns">
            <div class="column is-6">
              <div class="field">
                <label class="label">Calorías Diarias</label>
                <div class="control">
                  <input
                    v-model.number="nutritionGoalsForm.calories"
                    class="input"
                    type="number"
                    min="1000"
                    max="5000"
                    step="50"
                    placeholder="2000"
                  />
                </div>
                <p class="help">Rango recomendado: 1000 - 5000 cal</p>
              </div>
            </div>
            <div class="column is-6">
              <div class="field">
                <label class="label">Agua Diaria (L)</label>
                <div class="control">
                  <input
                    v-model.number="nutritionGoalsForm.water"
                    class="input"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    placeholder="2.5"
                  />
                </div>
                <p class="help">Rango recomendado: 1 - 5 L</p>
              </div>
            </div>
          </div>
          <div class="columns">
            <div class="column is-4">
              <div class="field">
                <label class="label">Proteína (g)</label>
                <div class="control">
                  <input
                    v-model.number="nutritionGoalsForm.protein"
                    class="input"
                    type="number"
                    min="50"
                    max="300"
                    step="5"
                    placeholder="120"
                  />
                </div>
                <p class="help">Rango recomendado: 50 - 300g</p>
              </div>
            </div>
            <div class="column is-4">
              <div class="field">
                <label class="label">Carbohidratos (g)</label>
                <div class="control">
                  <input
                    v-model.number="nutritionGoalsForm.carbs"
                    class="input"
                    type="number"
                    min="100"
                    max="500"
                    step="10"
                    placeholder="250"
                  />
                </div>
                <p class="help">Rango recomendado: 100 - 500g</p>
              </div>
            </div>
            <div class="column is-4">
              <div class="field">
                <label class="label">Grasa (g)</label>
                <div class="control">
                  <input
                    v-model.number="nutritionGoalsForm.fat"
                    class="input"
                    type="number"
                    min="30"
                    max="150"
                    step="5"
                    placeholder="70"
                  />
                </div>
                <p class="help">Rango recomendado: 30 - 150g</p>
              </div>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot buttons">
          <button class="btn btn-primary" @click="saveNutritionGoals">
            Guardar Metas
          </button>
          <button
            class="btn button is-danger has-text-white-bis"
            @click="showNutritionGoalsModal = false"
          >
            Cancelar
          </button>
          <button class="btn btn-warning" @click="resetToDefaults">
            Restablecer Valores por Defecto
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { db, auth } from "../../firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useRoute } from "vue-router";
import { nextTick } from "vue";
import { alertQuestion, alertSuccess, alertError } from "@/components/alert";
import FloatingIcons from "../components/FloatingIcons.vue";

// Estado de la aplicación
const showAddMealModal = ref(false);
const showMealPlanModal = ref(false);
const showNutritionGoalsModal = ref(false);
const editingMeal = ref(null);
const selectedDate = ref("today");

// Metas nutricionales del usuario
const nutritionGoals = ref({
  calories: 2000,
  protein: 120,
  carbs: 250,
  fat: 70,
  water: 2.5,
});

// Formulario de metas nutricionales
const nutritionGoalsForm = reactive({
  calories: 2000,
  protein: 120,
  carbs: 250,
  fat: 70,
  water: 2.5,
});

// Formulario de comida
const mealForm = reactive({
  type: "breakfast",
  name: "",
  description: "",
  time: "",
  calories: "",
  ingredientsText: "",
  protein: "",
  carbs: "",
  fat: "",
  image: "",
});

// Agua consumida manualmente
const manualWaterIntake = ref(0);
const dailyWaterData = ref({});

// Datos nutricionales (calculados en tiempo real)
const nutritionData = computed(() => {
  const totalCalories = dailyMeals.value
    .filter((meal) => meal.completed)
    .reduce((total, meal) => total + (meal.calories || 0), 0);
  const totalProtein = dailyMeals.value
    .filter((meal) => meal.completed)
    .reduce((total, meal) => total + (meal.nutrition?.protein || 0), 0);
  const totalCarbs = dailyMeals.value
    .filter((meal) => meal.completed)
    .reduce((total, meal) => total + (meal.nutrition?.carbs || 0), 0);
  const totalFat = dailyMeals.value
    .filter((meal) => meal.completed)
    .reduce((total, meal) => total + (meal.nutrition?.fat || 0), 0);

  return [
    {
      name: "Calorías",
      value: totalCalories.toLocaleString(),
      target: nutritionGoals.value.calories.toLocaleString(),
      icon: "bx bx-fire",
    },
    {
      name: "Proteína",
      value: totalProtein + "g",
      target: nutritionGoals.value.protein + "g",
      icon: "bx bx-dumbbell",
    },
    {
      name: "Carbohidratos",
      value: totalCarbs + "g",
      target: nutritionGoals.value.carbs + "g",
      icon: "bx bx-bread",
    },
    {
      name: "Grasa",
      value: totalFat + "g",
      target: nutritionGoals.value.fat + "g",
      icon: "bx bx-droplet",
    },
  ];
});

// Comidas desde Firestore
const dailyMeals = ref([]);
const weekMeals = ref({});

const getUserId = () => auth.currentUser?.uid;

onMounted(() => {
  onSnapshot(collection(db, "meals"), (snapshot) => {
    const userId = getUserId();
    if (!userId) return;
    const allMeals = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const userMeals = allMeals.filter((m) => m.userId === userId);
    // Filtrar por día o semana según selectedDate
    const today = new Date();
    let filterDate = today.toISOString().split("T")[0];
    let tomorrowDate = (() => {
      const t = new Date(today);
      t.setDate(today.getDate() + 1);
      return t.toISOString().split("T")[0];
    })();
    if (selectedDate.value === "today") {
      dailyMeals.value = userMeals.filter((m) => m.date === filterDate);
    } else if (selectedDate.value === "tomorrow") {
      dailyMeals.value = userMeals.filter((m) => m.date === tomorrowDate);
    } else if (selectedDate.value === "week") {
      // Obtener fechas de la semana actual (lunes a domingo)
      const weekDates = [];
      const first = today.getDate() - today.getDay() + 1; // lunes
      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(first + i);
        weekDates.push(d.toISOString().split("T")[0]);
      }
      dailyMeals.value = userMeals
        .filter((m) => weekDates.includes(m.date))
        .sort(
          (a, b) => a.date.localeCompare(b.date) || a.type.localeCompare(b.type)
        );
    }
    // Plan semanal
    weekMeals.value = {};
    userMeals.forEach((m) => {
      if (!weekMeals.value[m.date]) weekMeals.value[m.date] = [];
      weekMeals.value[m.date].push(m);
    });
  });

  // Cargar metas nutricionales del usuario
  const userId = getUserId();
  if (userId) {
    onSnapshot(doc(db, "users", userId), (doc) => {
      if (doc.exists() && doc.data().nutritionGoals) {
        const userGoals = doc.data().nutritionGoals;
        nutritionGoals.value = {
          calories: userGoals.calories || 2000,
          protein: userGoals.protein || 120,
          carbs: userGoals.carbs || 250,
          fat: userGoals.fat || 70,
          water: userGoals.water || 2.5,
        };
        // Actualizar el formulario también
        Object.assign(nutritionGoalsForm, nutritionGoals.value);
      }
    });
  }

  // Cargar agua consumida manualmente
  loadWaterIntake();
});

// Recetas favoritas desde Firestore
const favoriteRecipes = ref([]);
onMounted(() => {
  onSnapshot(collection(db, "favoriteRecipes"), (snapshot) => {
    const userId = getUserId();
    if (!userId) return;
    favoriteRecipes.value = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((recipe) => recipe.userId === userId);
  });

  // Cargar agua consumida del día
  loadWaterIntake();
});

// Computed properties
const currentDateText = computed(() => {
  const today = new Date();
  return today.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const dailyCalories = computed(() => {
  return dailyMeals.value
    .filter((meal) => meal.completed)
    .reduce((total, meal) => total + meal.calories, 0);
});

const dailyProtein = computed(() => {
  return dailyMeals.value
    .filter((meal) => meal.completed)
    .reduce((total, meal) => total + (meal.nutrition?.protein || 0), 0);
});

const dailyCarbs = computed(() => {
  return dailyMeals.value
    .filter((meal) => meal.completed)
    .reduce((total, meal) => total + (meal.nutrition?.carbs || 0), 0);
});

const dailyFat = computed(() => {
  return dailyMeals.value
    .filter((meal) => meal.completed)
    .reduce((total, meal) => total + (meal.nutrition?.fat || 0), 0);
});

const dailyTarget = computed(() => nutritionGoals.value.calories);

const completedMeals = computed(() => {
  return dailyMeals.value.length;
});

const totalMeals = 4;

const waterIntake = computed(() => nutritionGoals.value.water);

// Computed para comidas de la semana agrupadas por día
const weekMealsList = computed(() => {
  if (selectedDate.value !== "week") return [];
  // Obtener fechas de la semana actual (lunes a domingo)
  const today = new Date();
  const weekDates = [];
  const first = today.getDate() - today.getDay() + 1; // lunes
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(first + i);
    weekDates.push(d.toISOString().split("T")[0]);
  }
  // Agrupar por fecha
  return weekDates.map((date) => ({
    date,
    meals: dailyMeals.value.filter((m) => m.date === date),
  }));
});

// Agua consumida real (sumar campo waterIntake si existe en las comidas de ese día, si no, dejar 0)
const realWaterIntake = computed(() => {
  if (selectedDate.value === "week") {
    // Sumar toda el agua de la semana (solo comidas completadas)
    return dailyMeals.value
      .filter((meal) => meal.completed)
      .reduce((sum, m) => sum + (m.waterIntake || 0), 0);
  } else {
    return dailyMeals.value
      .filter((meal) => meal.completed)
      .reduce((sum, m) => sum + (m.waterIntake || 0), 0);
  }
});

// Total de agua (manual + de comidas)
const totalWaterIntake = computed(() => {
  return realWaterIntake.value + (parseFloat(manualWaterIntake.value) || 0);
});

// Comidas completadas reales (cantidad de comidas marcadas como completadas)
const realCompletedMeals = computed(() => {
  if (selectedDate.value === "week") {
    return dailyMeals.value.filter((m) => m.completed).length;
  } else {
    return dailyMeals.value.filter((m) => m.completed).length;
  }
});

// Funciones
const editMeal = (meal) => {
  editingMeal.value = meal;
  Object.assign(mealForm, {
    ...meal,
    ingredientsText: meal.ingredients ? meal.ingredients.join(", ") : "",
    image: meal.image || "",
    date: meal.date || new Date().toISOString().split("T")[0],
  });
  showAddMealModal.value = true;
};

const deleteMeal = async (id) => {
  const result = await alertQuestion("¿estas seguro de eliminarlo?");
  if (!result.isConfirmed) return;
  await deleteDoc(doc(db, "meals", id));
  alertSuccess("eliminado exitosamente");
};

const saveMeal = async () => {
  const userId = getUserId();
  if (!userId) return;
  if (!mealForm.name.trim() || !mealForm.time || !mealForm.calories) return;

  const mealData = {
    ...mealForm,
    ingredients: mealForm.ingredientsText
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i),
    nutrition: {
      protein: parseInt(mealForm.protein) || 0,
      carbs: parseInt(mealForm.carbs) || 0,
      fat: parseInt(mealForm.fat) || 0,
    },
    image: mealForm.image || "",
    date: mealForm.date || new Date().toISOString().split("T")[0],
    userId,
  };

  if (editingMeal.value) {
    // Preservar el estado completed de la comida existente
    mealData.completed = editingMeal.value.completed;
    await updateDoc(doc(db, "meals", editingMeal.value.id), mealData);

    // Actualizar receta favorita si existe
    const oldName = editingMeal.value.name;
    const newName = mealForm.name;
    if (oldName !== newName) {
      const existingFavorite = favoriteRecipes.value.find(
        (r) => r.name === oldName
      );
      if (existingFavorite) {
        await updateDoc(doc(db, "favoriteRecipes", existingFavorite.id), {
          name: newName,
          calories: mealForm.calories,
          image: mealForm.image || "",
        });
      }
    }

    alertSuccess("Comida editada exitosamente");
  } else {
    // Solo establecer completed: false para nuevas comidas
    mealData.completed = false;
    await addDoc(collection(db, "meals"), mealData);
    alertSuccess("Comida agregada exitosamente");
  }

  resetMealForm();
  showAddMealModal.value = false;
};

const resetMealForm = () => {
  Object.assign(mealForm, {
    type: "breakfast",
    name: "",
    description: "",
    time: "",
    calories: "",
    ingredientsText: "",
    protein: "",
    carbs: "",
    fat: "",
    image: "",
  });
  editingMeal.value = null;
};

const addRecipeToMeal = (recipe) => {
  // Aquí implementarías la lógica para agregar la receta como comida
};

const getCalorieProgress = () => {
  if (dailyTarget.value === 0) return 0;
  return Math.min((dailyCalories.value / dailyTarget.value) * 100, 100);
};

const getProteinProgress = () => {
  if (nutritionGoals.value.protein === 0) return 0;
  return Math.min(
    (dailyProtein.value / nutritionGoals.value.protein) * 100,
    100
  );
};

const getCarbsProgress = () => {
  if (nutritionGoals.value.carbs === 0) return 0;
  return Math.min((dailyCarbs.value / nutritionGoals.value.carbs) * 100, 100);
};

const getFatProgress = () => {
  if (nutritionGoals.value.fat === 0) return 0;
  return Math.min((dailyFat.value / nutritionGoals.value.fat) * 100, 100);
};

const getCalorieProgressClass = () => {
  const progress = getCalorieProgress();
  if (progress >= 90) return "danger";
  if (progress >= 75) return "warning";
  return "success";
};

// Favoritos
const toggleFavorite = async (meal) => {
  const userId = getUserId();
  if (!userId) return;

  // Buscar si ya existe como favorito (por nombre)
  const exists = favoriteRecipes.value.find((r) => r.name === meal.name);

  if (exists) {
    // Remover de favoritos
    await deleteDoc(doc(db, "favoriteRecipes", exists.id));
  } else {
    // Agregar a favoritos
    await addDoc(collection(db, "favoriteRecipes"), {
      name: meal.name,
      calories: meal.calories,
      image: meal.image || "",
      userId,
    });
  }
};

// Subida de imagen
const handleImageError = (event) => {
  event.target.src = "https://via.placeholder.com/150"; // Fallback to a placeholder image
};

// Funciones para manejar agua manual
const saveWaterIntake = async () => {
  const userId = getUserId();
  if (!userId) return;

  const waterValue = parseFloat(manualWaterIntake.value) || 0;
  const currentDate =
    selectedDate.value === "today"
      ? new Date().toISOString().split("T")[0]
      : selectedDate.value;

  try {
    const waterRef = doc(db, "dailyWater", `${userId}_${currentDate}`);
    await setDoc(waterRef, {
      userId,
      date: currentDate,
      waterIntake: waterValue,
      updatedAt: serverTimestamp(),
    });
    alertSuccess("Agua consumida guardada");
  } catch (error) {
    console.error("Error al guardar agua:", error);
    alertError("Error al guardar el agua consumida");
  }
};

const loadWaterIntake = () => {
  const userId = getUserId();
  if (!userId) return;

  const currentDate =
    selectedDate.value === "today"
      ? new Date().toISOString().split("T")[0]
      : selectedDate.value;

  const waterRef = doc(db, "dailyWater", `${userId}_${currentDate}`);
  getDoc(waterRef).then((doc) => {
    if (doc.exists()) {
      manualWaterIntake.value = doc.data().waterIntake || 0;
    } else {
      manualWaterIntake.value = 0;
    }
  });
};

const weekDays = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];
const mealTypes = ["breakfast", "lunch", "dinner"];
const typeLabels = { breakfast: "Desayuno", lunch: "Almuerzo", dinner: "Cena" };
const weekPlan = ref({});
weekDays.forEach((day) => {
  weekPlan.value[day] = { breakfast: "", lunch: "", dinner: "" };
});

// Mejoras para planificación semanal
const weekPlanLoading = ref(false);
const weekPlanSuccess = ref(false);
const weekPlanError = ref("");

// Precargar comidas planificadas al abrir el modal
watch(showMealPlanModal, (val) => {
  if (val) {
    // Limpiar feedback
    weekPlanSuccess.value = false;
    weekPlanError.value = "";
    // Precargar comidas de la semana
    const userId = getUserId();
    if (!userId) return;
    const today = new Date();
    for (let i = 0; i < weekDays.length; i++) {
      const day = weekDays[i];
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      const mealsForDay = weekMeals.value[dateStr] || [];
      for (const type of mealTypes) {
        const meal = mealsForDay.find((m) => m.type === type);
        weekPlan.value[day][type] = meal ? meal.name : "";
      }
    }
  }
});

const saveWeekPlan = async () => {
  weekPlanLoading.value = true;
  weekPlanSuccess.value = false;
  weekPlanError.value = "";
  const userId = getUserId();
  if (!userId) return;
  const today = new Date();
  let anyChange = false;
  try {
    for (let i = 0; i < weekDays.length; i++) {
      const day = weekDays[i];
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      const mealsForDay = weekMeals.value[dateStr] || [];
      for (const type of mealTypes) {
        const name = weekPlan.value[day][type];
        const existing = mealsForDay.find((m) => m.type === type);
        if (name.trim()) {
          if (existing) {
            // Editar
            if (existing.name !== name) {
              await updateDoc(doc(db, "meals", existing.id), {
                ...existing,
                name,
              });
              anyChange = true;
            }
          } else {
            // Crear

            await addDoc(collection(db, "meals"), {
              name,
              type,
              date: dateStr,
              userId,
              calories: 0,
              description: "",
              ingredients: [],
              nutrition: { protein: 0, carbs: 0, fat: 0 },
            });
            anyChange = true;
          }
        } else if (existing) {
          // Eliminar si el campo está vacío
          await deleteDoc(doc(db, "meals", existing.id));
          anyChange = true;
        }
      }
    }
    if (anyChange) {
      weekPlanSuccess.value = true;
    } else {
      weekPlanError.value = "No hay cambios para guardar.";
    }
  } catch (e) {
    weekPlanError.value = "Error al guardar la semana.";
  }
  weekPlanLoading.value = false;
  setTimeout(() => {
    weekPlanSuccess.value = false;
    weekPlanError.value = "";
  }, 2000);
};

const clearWeekPlan = () => {
  weekDays.forEach((day) => {
    weekPlan.value[day] = { breakfast: "", lunch: "", dinner: "" };
  });
};

const copyLastWeek = () => {
  const userId = getUserId();
  if (!userId) return;
  const today = new Date();
  for (let i = 0; i < weekDays.length; i++) {
    const day = weekDays[i];
    const date = new Date(today);
    date.setDate(today.getDate() - 7 + i);
    const dateStr = date.toISOString().split("T")[0];
    const mealsForDay = weekMeals.value[dateStr] || [];
    for (const type of mealTypes) {
      const meal = mealsForDay.find((m) => m.type === type);
      weekPlan.value[day][type] = meal ? meal.name : "";
    }
  }
};

watch(selectedDate, () => {
  const userId = getUserId();
  if (!userId) return;
  const today = new Date();
  let filterDate = today.toISOString().split("T")[0];
  let tomorrowDate = (() => {
    const t = new Date(today);
    t.setDate(today.getDate() + 1);
    return t.toISOString().split("T")[0];
  })();
  if (selectedDate.value === "today") {
    dailyMeals.value = weekMeals.value[filterDate] || [];
  } else if (selectedDate.value === "tomorrow") {
    dailyMeals.value = weekMeals.value[tomorrowDate] || [];
  } else if (selectedDate.value === "week") {
    // Obtener fechas de la semana actual (lunes a domingo)
    const weekDates = [];
    const first = today.getDate() - today.getDay() + 1; // lunes
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(first + i);
      weekDates.push(d.toISOString().split("T")[0]);
    }
    dailyMeals.value = Object.values(weekMeals.value)
      .flat()
      .filter((m) => weekDates.includes(m.date))
      .sort(
        (a, b) => a.date.localeCompare(b.date) || a.type.localeCompare(b.type)
      );
  }
  // Recargar el agua consumida manualmente cuando cambia la fecha
  loadWaterIntake();
});

const route = useRoute();
const highlightedId = ref(null);

watch(
  () => route.query.highlight,
  async (val) => {
    if (val) {
      highlightedId.value = val;
      await nextTick();
      const el = document.getElementById("meal-" + val);
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

// Funciones para metas nutricionales
const openNutritionGoalsModal = () => {
  // Cargar los valores actuales en el formulario
  Object.assign(nutritionGoalsForm, nutritionGoals.value);
  showNutritionGoalsModal.value = true;
};

const saveNutritionGoals = async () => {
  const userId = getUserId();
  if (!userId) return;
  const updatedNutritionGoals = {
    ...nutritionGoals.value,
    ...nutritionGoalsForm,
  };
  await updateDoc(doc(db, "users", userId), {
    nutritionGoals: updatedNutritionGoals,
  });
  alertSuccess("Metas nutricionales guardadas con éxito!");
  showNutritionGoalsModal.value = false;
};

const resetToDefaults = () => {
  Object.assign(nutritionGoalsForm, {
    calories: 2000,
    protein: 120,
    carbs: 250,
    fat: 70,
    water: 2.5,
  });
};

const toggleMealCompletion = async (meal) => {
  const userId = getUserId();
  if (!userId) return;
  const mealRef = doc(db, "meals", meal.id);
  const updatedMeal = {
    ...meal,
    completed: !meal.completed,
  };
  await updateDoc(mealRef, updatedMeal);
};
</script>

<style scoped>
.button-cancel {
  position: relative;
  bottom: 4px;
  right: 4px;
}

.modal-card-foot {
  display: flex;
  flex-direction: row;
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

.meals-page {
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

/* Resumen nutricional */
.nutrition-summary {
  margin-bottom: 2rem;
}

.nutrition-card {
  background: var(--background);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  border-left: 4px solid var(--accent);
}

.nutrition-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px var(--shadow-hover);
}

.nutrition-icon {
  font-size: 2rem;
  color: var(--accent);
}

.nutrition-info {
  flex: 1;
}

.nutrition-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 0.25rem;
}

.nutrition-label {
  font-size: 0.875rem;
  color: var(--secondary);
  margin-bottom: 0.25rem;
}

.nutrition-target {
  font-size: 0.75rem;
  color: var(--accent);
  font-weight: 600;
}

/* Controles */
.meals-controls {
  background: var(--background);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow);
}

/* Comidas */
.meals-timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.meal-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--background-secondary);
  border-radius: 12px;
  border-left: 4px solid var(--primary);
  transition: all 0.3s ease;
}

.meal-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 16px var(--shadow-hover);
}

.meal-item.breakfast {
  border-left-color: #fbbf24;
}
.meal-item.lunch {
  border-left-color: #06d6a0;
}
.meal-item.dinner {
  border-left-color: #6366f1;
}
.meal-item.snack {
  border-left-color: #8b5cf6;
}

.meal-item.meal-completed {
  opacity: 0.7;
  background: var(--background);
  border-left-color: var(--accent);
  position: relative;
  overflow: hidden;
}

.meal-item.meal-completed::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(6, 214, 160, 0.1) 50%,
    transparent 70%
  );
  pointer-events: none;
  animation: shimmer 2s infinite;
  border-radius: 12px;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.meal-time {
  font-weight: 600;
  color: var(--primary);
  min-width: 60px;
  text-align: center;
  padding: 0.5rem;
  background: var(--background);
  border-radius: 6px;
}

.meal-content {
  flex: 1;
}

.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.meal-title {
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.meal-calories {
  font-weight: 600;
  color: var(--accent);
  background: rgba(6, 214, 160, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.meal-description {
  color: var(--secondary);
  margin-bottom: 0.75rem;
  line-height: 1.5;
}

.meal-image {
  margin-bottom: 0.75rem;
}

.meal-image img {
  width: 100%;
  max-width: 200px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--shadow);
}

.meal-ingredients {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.ingredient-tag {
  background: var(--background);
  color: var(--text);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  border: 1px solid var(--border);
}

.meal-nutrition {
  display: flex;
  gap: 0.5rem;
}

.nutrition-tag {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
}

.nutrition-tag.protein {
  background: #eff6ff;
  color: #1d4ed8;
}

.nutrition-tag.carbs {
  background: #f0fdf4;
  color: #059669;
}

.nutrition-tag.fat {
  background: #fffbeb;
  color: #d97706;
}

.meal-actions {
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

.completed-checkbox {
  color: var(--secondary);
  transition: all 0.3s ease;
}

.completed-checkbox.is-completed {
  color: var(--accent);
  transform: scale(1.1);
}

.completed-checkbox:hover {
  color: var(--accent);
  transform: scale(1.05);
}

.completed-checkbox.is-completed:hover {
  color: var(--success);
  transform: scale(1.15);
}

/* Resumen diario */
.daily-summary {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.summary-item {
  background: var(--background-secondary);
  padding: 1rem;
  border-radius: 8px;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.summary-label {
  font-size: 0.875rem;
  color: var(--secondary);
  display: flex;
  align-items: center;
  font-weight: 500;
}

.summary-value {
  font-weight: 600;
  color: var(--text);
  font-size: 0.875rem;
}

.summary-percentage {
  font-size: 0.75rem;
  color: var(--accent);
  margin-top: 0.5rem;
  text-align: right;
  font-weight: 500;
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

.progress-fill.water-progress {
  background: #3b82f6;
}

.progress-fill.protein-progress {
  background: #1d4ed8;
}

.progress-fill.carbs-progress {
  background: #059669;
}

.progress-fill.fat-progress {
  background: #d97706;
}

/* Recetas favoritas */
.favorite-recipes {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recipe-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--background-secondary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.recipe-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px var(--shadow);
}

.recipe-image {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
}

.recipe-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recipe-info {
  flex: 1;
}

.recipe-name {
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.25rem;
}

.recipe-calories {
  font-size: 0.875rem;
  color: var(--accent);
  font-weight: 600;
}

/* Responsive */
@media (max-width: 1024px) {
  .nutrition-summary .columns {
    flex-direction: column;
  }

  .nutrition-summary .column {
    margin-bottom: 1rem;
  }
}

@media (max-width: 768px) {
  .meals-page {
    padding: 1rem 0;
  }

  .meals-controls {
    padding: 1rem;
  }

  .meal-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .meal-actions {
    align-self: flex-end;
  }
}

.card-header h3,
.card-content h4,
.card-content h3,
.nutrition-label,
.summary-label {
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
  .card-content h3,
  .nutrition-label,
  .summary-label {
    font-size: 1rem;
    padding: 0.4rem 0.5rem;
  }
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

#theme-dark .meal-image img {
  box-shadow: 0 2px 8px rgba(79, 140, 255, 0.1);
  border: 1px solid rgba(79, 140, 255, 0.2);
}

/* Estilos para el modal de metas nutricionales */
.modal-card-body .help {
  font-size: 0.75rem;
  color: var(--secondary);
  margin-top: 0.25rem;
}

.modal-card-body .field {
  margin-bottom: 1.5rem;
}

.modal-card-body .label {
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.5rem;
}

.modal-card-body .input {
  border-radius: 8px;
  border: 2px solid var(--border);
  transition: border-color 0.3s ease;
}

.modal-card-body .input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 140, 255, 0.1);
}

/* Estilos para modo oscuro del modal de metas */
#theme-dark .modal-card-body .label {
  color: #f1f1f1;
}

#theme-dark .modal-card-body .help {
  color: #85c1e9;
}

#theme-dark .modal-card-body .input {
  background: rgba(79, 140, 255, 0.08);
  border-color: #26334d;
  color: #f1f1f1;
}

#theme-dark .modal-card-body .input:focus {
  border-color: #4f8cff;
  box-shadow: 0 0 0 3px rgba(79, 140, 255, 0.2);
}

/* Estilos para modo oscuro del resumen nutricional */
#theme-dark .summary-item {
  background: rgba(79, 140, 255, 0.05);
  border: 1px solid rgba(79, 140, 255, 0.1);
}

#theme-dark .summary-label {
  color: #a3c8ff;
}

#theme-dark .summary-value {
  color: #f1f1f1;
}

#theme-dark .summary-percentage {
  color: #4f8cff;
}

#theme-dark .progress-bar {
  background: rgba(79, 140, 255, 0.1);
}

#theme-dark .progress-fill.protein-progress {
  background: #4f8cff;
}

#theme-dark .progress-fill.carbs-progress {
  background: #06d6a0;
}

#theme-dark .progress-fill.fat-progress {
  background: #fbbf24;
}

#theme-dark .progress-fill.water-progress {
  background: #60a5fa;
}

/* Estilos para modo oscuro del checkbox de completado */
#theme-dark .completed-checkbox {
  color: #6b7280;
}

#theme-dark .completed-checkbox.is-completed {
  color: #06d6a0;
}

#theme-dark .completed-checkbox:hover {
  color: #4f8cff;
}

#theme-dark .completed-checkbox.is-completed:hover {
  color: #4ade80;
}

/* Estilos para modo oscuro de comidas completadas */
#theme-dark .meal-item.meal-completed {
  background: rgba(6, 214, 160, 0.05);
  border-left-color: #06d6a0;
  overflow: hidden;
}

#theme-dark .meal-item.meal-completed::after {
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(6, 214, 160, 0.2) 50%,
    transparent 70%
  );
}

/* Estilos para modo oscuro de las tarjetas de nutrición */
#theme-dark .nutrition-card {
  background: rgba(79, 140, 255, 0.05);
  border-left-color: #4f8cff;
}

#theme-dark .nutrition-icon {
  color: #4f8cff;
}

#theme-dark .nutrition-value {
  color: #f1f1f1;
}

#theme-dark .nutrition-label {
  color: #85c1e9;
}

#theme-dark .nutrition-target {
  color: #4f8cff;
}

/* Estilos para el input de agua manual */
.water-input-container {
  display: flex;
  align-items: center;
  gap: 4px;
}

.water-input {
  width: 60px;
  padding: 4px 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--background);
  color: var(--text);
  font-size: 14px;
  text-align: center;
  transition: all 0.3s ease;
}

.water-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(79, 140, 255, 0.1);
}

.water-unit {
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
}

/* Estilos para modo oscuro del input de agua */
#theme-dark .water-input {
  background: rgba(79, 140, 255, 0.08);
  border-color: #26334d;
  color: #f1f1f1;
}

#theme-dark .water-input:focus {
  border-color: #4f8cff;
  box-shadow: 0 0 0 2px rgba(79, 140, 255, 0.2);
}

#theme-dark .water-unit {
  color: #85c1e9;
}
</style>
