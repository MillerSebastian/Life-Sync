# LifeSync Frontend

Aplicación web moderna para la gestión integral de vida personal: tareas, calendario, finanzas, comidas y perfil, con autenticación y almacenamiento en la nube usando Firebase.

---

## 🚀 Características principales

- **Autenticación de usuarios** (Firebase Auth)
- **Gestión de tareas** (Kanban, prioridades, progreso)
- **Calendario de eventos** (vista mensual, semanal, diaria)
- **Wallet** (ingresos, gastos, transacciones, presupuestos)
- **Planificación de comidas** (nutrición, recetas, historial)
- **Perfil de usuario** (edición, foto, bio, datos sincronizados)
- **Dashboard** con resumen de actividad y estadísticas
- **UI responsive y moderna** (Bulma, Boxicons, CSS custom)

---

## 🛠️ Tecnologías y librerías principales

- **Vue 3** (Composition API)
- **Vite** (build y hot reload)
- **Pinia** (estado global)
- **Vue Router** (ruteo SPA)
- **Bulma** (framework CSS)
- **Boxicons** (iconos)
- **Chart.js** (gráficas)
- **Firebase** (Auth, Firestore, Storage)
- **Axios** (HTTP requests)
- **xlsx** (importación/exportación de datos)

---

## 📁 Estructura del proyecto

```
Frontend/
├── src/
│   ├── assets/           # Estilos y recursos
│   ├── components/       # Componentes reutilizables (Sidebar, TopNavBar, DashboardSummary, etc.)
│   ├── views/            # Vistas principales (Dashboard, Tasks, Calendar, Meals, Wallet, Profile, Login, Layout)
│   ├── router/           # Definición de rutas
│   ├── stores/           # Estado global (Pinia)
│   └── main.js           # Entrada principal
├── firebase.js           # Configuración e inicialización de Firebase
├── package.json          # Dependencias y scripts
├── vite.config.js        # Configuración de Vite
└── README.md             # Documentación
```

---

## ⚡ Instalación y ejecución

1. **Instala dependencias:**

```bash
npm install
```

2. **Configura Firebase:**

- Edita `firebase.js` con tus credenciales de Firebase (Auth, Firestore, Storage).

3. **Ejecuta en modo desarrollo:**

```bash
npm run dev
```

4. **Compila para producción:**

```bash
npm run build
```

---

## 🔑 Integración con Firebase

- **Autenticación:** Registro e inicio de sesión con email y contraseña.
- **Firestore:** Almacena usuarios, tareas, eventos, notas, transacciones, comidas, etc.
- **Storage:** (opcional) Para fotos de perfil si se implementa subida de archivos.

> La colección `users` almacena los datos de perfil. Otras colecciones: `tasks`, `events`, `notes`, `transactions`, `meals`.

---

## 🌐 Rutas principales

- `/login` — Autenticación
- `/dashboard` — Resumen general
- `/tasks` — Gestión de tareas
- `/calendar` — Calendario de eventos
- `/wallet` — Finanzas personales
- `/meals` — Planificación de comidas
- `/profile` — Perfil de usuario

---

## 🧑‍💻 Buenas prácticas y recomendaciones

- Usa Node.js 18+ y npm 9+
- Mantén tus credenciales de Firebase seguras (no subas `.env` ni claves privadas)
- Sigue la estructura de componentes y vistas para mantener el código organizado
- Personaliza los estilos en `assets/` y aprovecha las utilidades de Bulma
- Si usas Storage para fotos, recuerda configurar reglas de seguridad en Firebase

---

## 📚 Recursos útiles

- [Documentación Vue 3](https://vuejs.org/)
- [Documentación Bulma](https://bulma.io/documentation/)
- [Firebase Web](https://firebase.google.com/docs/web/setup)
- [Chart.js](https://www.chartjs.org/docs/latest/)

---

**LifeSync** — Tu vida, sincronizada y bajo control.
