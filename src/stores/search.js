import { ref } from "vue";
import { defineStore } from "pinia";
import { db, auth } from "../../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export const useSearchStore = defineStore("search", () => {
  // Datos buscables
  const transactions = ref([]);
  const meals = ref([]);
  const tasks = ref([]);
  const notes = ref([]);
  const events = ref([]);

  // Bandera para evitar múltiples suscripciones
  let isSubscribed = false;

  // Sincronización con Firestore
  function syncAll() {
    if (isSubscribed) return;
    isSubscribed = true;
    onAuthStateChanged(auth, (user) => {
      if (!user) return;
      const userId = user.uid;
      // Wallet
      onSnapshot(collection(db, "transactions"), (snapshot) => {
        transactions.value = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((t) => t.userId === userId);
      });
      // Meals
      onSnapshot(collection(db, "meals"), (snapshot) => {
        meals.value = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((m) => m.userId === userId);
      });
      // Tasks
      onSnapshot(collection(db, "tasks"), (snapshot) => {
        tasks.value = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((t) => t.userId === userId);
      });
      // Notes
      onSnapshot(collection(db, "notes"), (snapshot) => {
        notes.value = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((n) => n.userId === userId);
      });
      // Events
      onSnapshot(collection(db, "events"), (snapshot) => {
        events.value = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((e) => e.userId === userId);
      });
    });
  }

  return {
    transactions,
    meals,
    tasks,
    notes,
    events,
    syncAll,
  };
});
