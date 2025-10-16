import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import "bulma/css/bulma.css";

import "./assets/main.css";
import { useSearchStore } from "@/stores/search";

const app = createApp(App);

app.use(createPinia());
app.use(router);

// Llamar a syncAll al iniciar la app para mantener el buscador funcionando tras recargar
const searchStore = useSearchStore();
searchStore.syncAll();

app.mount("#app");
