<template>
  <div class="login-page">
    <FloatingIcons viewType="login" />
    <div class="container" ref="container">
      <div class="form-box login">
        <form @submit.prevent="handleLogin">
          <h1>Login</h1>
          <div class="input-box">
            <input
              type="text"
              placeholder="Username"
              required
              v-model="loginForm.username"
            />
            <i class="bx bxs-user"></i>
          </div>
          <div class="input-box">
            <input
              type="password"
              placeholder="Password"
              required
              v-model="loginForm.password"
            />
            <i class="bx bxs-lock-alt"></i>
          </div>
          <div class="forgot-link">
            <a href="#" @click.prevent="openForgotModal">Forgot Password?</a>
          </div>
          <button type="submit" class="btn">Login</button>
          <p>or login with social platforms</p>
          <div class="social-icons">
            <a @click.prevent="loginWithGoogle"
              ><i class="bx bxl-google"></i
            ></a>
            <a @click.prevent="loginWithGitHub"
              ><i class="bx bxl-github"></i
            ></a>
          </div>
        </form>
      </div>
      <div v-if="modalContent" v-html="modalContent"></div>

      <div class="form-box register">
        <form @submit.prevent="handleRegister">
          <h1>Registration</h1>
          <div class="input-box">
            <input
              type="text"
              placeholder="Username"
              required
              v-model="registerForm.username"
            />
            <i class="bx bxs-user"></i>
          </div>
          <div class="input-box">
            <input
              type="email"
              placeholder="Email"
              required
              v-model="registerForm.email"
            />
            <i class="bx bxs-envelope"></i>
          </div>
          <div class="input-box">
            <input
              type="password"
              placeholder="Password"
              required
              v-model="registerForm.password"
            />
            <i class="bx bxs-lock-alt"></i>
          </div>
          <button type="submit" class="btn">Register</button>
          <p>or register with social platforms</p>
          <div class="social-icons">
            <a @click.prevent="loginWithGoogle"
              ><i class="bx bxl-google"></i
            ></a>
            <a @click.prevent="loginWithGitHub"
              ><i class="bx bxl-github"></i
            ></a>
          </div>
        </form>
      </div>

      <div class="toggle-box">
        <div class="toggle-panel toggle-left">
          <h1>Hello, Welcome to</h1>
          <h1>LifeSync!</h1>
          <p>Don't have an account?</p>
          <button class="btn register-btn" @click="showRegister">
            Register
          </button>
        </div>

        <div class="toggle-panel toggle-right">
          <h1>Welcome Back!</h1>
          <p>Already have an account?</p>
          <button class="btn login-btn" @click="showLogin">Login</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { auth } from "../../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  signInWithCredential,
} from "firebase/auth";
import { db } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { alertError, alertSuccess } from "@/components/alert";
import FloatingIcons from "../components/FloatingIcons.vue";

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const githubProvider = new GithubAuthProvider();

// Función auxiliar para manejar errores de cuentas existentes con diferentes credenciales
const handleAccountExistsWithDifferentCredential = async (error, provider) => {

  const email = error.customData?.email;
  if (!email) {
    alertError("No se pudo obtener el correo electrónico del error");
    return;
  }

  try {
    // Buscar los métodos de inicio de sesión disponibles para ese email
    const methods = await fetchSignInMethodsForEmail(auth, email);

    let message = "";
    let action = "";

    if (methods.includes("password")) {
      message = `El correo ${email} ya está registrado con email y contraseña.`;
      action =
        "Por favor, inicia sesión usando tu correo y contraseña en la sección de Login.";
    } else if (methods.includes("google.com")) {
      message = `El correo ${email} ya está registrado con Google.`;
      action = "Por favor, inicia sesión usando el botón de Google.";
    } else if (methods.includes("github.com")) {
      message = `El correo ${email} ya está registrado con GitHub.`;
      action = "Por favor, inicia sesión usando el botón de GitHub.";
    } else if (methods.includes("facebook.com")) {
      message = `El correo ${email} ya está registrado con Facebook.`;
      action = "Por favor, inicia sesión usando el botón de Facebook.";
    } else {
      message = `El correo ${email} ya está registrado con otro método.`;
      action =
        "Por favor, inicia sesión usando el método original con el que te registraste.";
    }

    // Mostrar mensaje más detallado
    alertError(`${message}\n\n${action}`);

    // Si el usuario intentó registrarse con GitHub pero ya tiene cuenta con Google,
    // sugerir que use Google
    if (provider === "GitHub" && methods.includes("google.com")) {
    }
  } catch (linkError) {
    console.error("Error al verificar métodos de inicio de sesión:", linkError);
    alertError(
      "Error al verificar los métodos de inicio de sesión disponibles"
    );
  }
};

const resetEmail = ref("");
const modalContent = ref("");

// Hacerlo accesible al template
defineExpose({ modalContent });

const sendResetEmail = async () => {
  if (!resetEmail.value) {
    alertError("Por favor, ingresa tu correo.");
    return;
  }
  try {
    await sendPasswordResetEmail(auth, resetEmail.value);
    alertSuccess("Correo de recuperación enviado.");
    showModal.value = false;
    resetEmail.value = "";
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    alertError("Hubo un error. Verifica el correo o intenta más tarde.");
  }
};

const openForgotModal = () => {
  modalContent.value = `
    <div style="z-index:9999999; background:rgba(0,0,0,0.8); position:fixed; top:0; left:0; right:0; bottom:0; display:flex; align-items:center; justify-content:center;">
      <div style="background:#fff; border:5px solid #f00; color:#000; z-index:10000001; padding:2rem; border-radius:10px; width:90%; max-width:400px; box-shadow:0 2px 10px rgba(0,0,0,0.3); text-align:center;">
        <h3>Recuperar contraseña</h3>
        <div style='color:red; font-weight:bold;'></div>
        <div style='margin-top:1rem; margin-bottom:0.5rem;'>
          <input id='resetEmailInput' type='email' placeholder='Correo electrónico' autocomplete='email' style='border: 4px solid green; background: #fff200; color: #222; font-size:22px; padding:20px; width:100%;' />
        </div>
        <div style='margin-top:1rem; display:flex; justify-content:space-around;'>
          <button id='enviarBtn' style='background:#00c853; color:#fff; font-size:20px; border:3px solid #222; padding:8px 16px;'>Enviar</button>
          <button id='cancelarBtn' style='background:#d50000; color:#fff; font-size:20px; border:3px solid #222; padding:8px 16px;'>Cancelar</button>
        </div>
      </div>
    </div>
  `;
  setTimeout(() => {
    document.getElementById("cancelarBtn").onclick = () => {
      modalContent.value = "";
    };
    document.getElementById("enviarBtn").onclick = () => {
      const email = document.getElementById("resetEmailInput").value;
      sendResetEmailDirect(email);
    };
  }, 0);
};

const sendResetEmailDirect = async (email) => {
  if (!email) {
    alertError("Por favor, ingresa tu correo.");
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    alertSuccess("Correo de recuperación enviado.");
    modalContent.value = "";
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    alertError("Hubo un error. Verifica el correo o intenta más tarde.");
  }
};

const router = useRouter();
const container = ref(null);

const loginForm = ref({
  username: "",
  password: "",
});

const registerForm = ref({
  username: "",
  email: "",
  password: "",
});

const showRegister = () => {
  container.value.classList.add("active");
};

const showLogin = () => {
  container.value.classList.remove("active");
};

const handleLogin = async () => {
  try {
    const email = loginForm.value.username;
    const password = loginForm.value.password;
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("uid", userCredential.user.uid);

    let nombre = email;

    const userDocRef = doc(db, "users", userCredential.user.uid);

    const userDocSnap = await import("firebase/firestore").then(({ getDoc }) =>
      getDoc(userDocRef)
    );
    if (userDocSnap && userDocSnap.exists()) {
      const data = userDocSnap.data();
      if (data.name) nombre = data.name;
    }
    alertSuccess(`Bienvenido ${nombre}`);
    router.push("/dashboard");
  } catch (error) {
    alertError("Error al iniciar sesión: ");
  }
};

const handleRegister = async () => {
  try {
    const email = registerForm.value.email;
    const password = registerForm.value.password;
    const name = registerForm.value.username;
    // Registrar usuario en Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    // Crear documento en Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      name,
      email,
      username: "",
      bio: "",
      photo: "",
    });
    // Guardar sesión en localStorage
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("uid", userCredential.user.uid);
    router.push("/dashboard");
    alertSuccess(`bienvenido ${name}`);
  } catch (error) {
    alertError("Error al registrarse");
  }
};

function logout() {}
const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    await registerUserIfNotExists(user);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("uid", result.user.uid);
    localStorage.setItem("displayName", user.displayName || "");
    localStorage.setItem("email", user.email || "");
    localStorage.setItem("photoURL", user.photoURL || "");
    alertSuccess(`Bienvenido ${result.user.displayName || "Usuario"}`);
    router.push("/dashboard");
  } catch (error) {
    console.error("Error con Google:", error);

    // Manejar el error específico de cuenta existente con diferente credencial
    if (error.code === "auth/account-exists-with-different-credential") {
      await handleAccountExistsWithDifferentCredential(error, "Google");
    } else {
      alertError("Error al iniciar sesión con Google");
    }
  }
};

const loginWithFacebook = async () => {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    const user = result.user;
    await registerUserIfNotExists(user);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("uid", result.user.uid);
    localStorage.setItem("displayName", user.displayName || "");
    localStorage.setItem("email", user.email || "");
    localStorage.setItem("photoURL", user.photoURL || "");
    alertSuccess(`Bienvenido ${result.user.displayName || "Usuario"}`);
    router.push("/dashboard");
  } catch (error) {
    console.error("Error con Facebook:", error);

    // Manejar el error específico de cuenta existente con diferente credencial
    if (error.code === "auth/account-exists-with-different-credential") {
      await handleAccountExistsWithDifferentCredential(error, "Facebook");
    } else {
      alertError("Error al iniciar sesión con Facebook");
    }
  }
};

const loginWithGitHub = async () => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    const user = result.user;
    await registerUserIfNotExists(user);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("uid", result.user.uid);
    localStorage.setItem("displayName", user.displayName || "");
    localStorage.setItem("email", user.email || "");
    localStorage.setItem("photoURL", user.photoURL || "");
    alertSuccess(`Bienvenido ${result.user.displayName || "Usuario"}`);
    router.push("/dashboard");
  } catch (error) {
    console.error("Error con GitHub:", error);

    // Manejar el error específico de cuenta existente con diferente credencial
    if (error.code === "auth/account-exists-with-different-credential") {
      await handleAccountExistsWithDifferentCredential(error, "GitHub");
    } else {
      alertError("Error al iniciar sesión con GitHub");
    }
  }
};
async function registerUserIfNotExists(user) {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      name: user.displayName || "Sin nombre",
      email: user.email || "Sin correo",
      bio: "",
      photo: user.photoURL || "",
      provider: user.providerData[0]?.providerId || "manual",
      createdAt: new Date(),
    });
  } else {
    const oldData = snap.data();
    if (
      oldData.name === "Sin nombre" &&
      user.displayName &&
      user.displayName !== "Sin nombre"
    ) {
      await setDoc(
        userRef,
        { ...oldData, name: user.displayName },
        { merge: true }
      );
    }
  }
}
</script>
<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap");
@import url("https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css");

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Poppins", sans-serif;
  text-decoration: none;
  list-style: none;
}

.login-page {
  min-height: 100vh;
  height: 100vh;
  width: 100vw;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
}

.container {
  position: relative;
  width: 850px;
  height: 550px;
  background: #fff;
  border-radius: 30px;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.container h1 {
  font-size: 36px;
  margin: -10px 0;
}

.container p {
  font-size: 14.5px;
  margin: 15px 0;
}

form {
  width: 100%;
}

.form-box {
  position: absolute;
  right: 0;
  width: 50%;
  height: 100%;
  background: #fff;
  display: flex;
  align-items: center;
  color: #333;
  text-align: center;
  padding: 40px;
  z-index: 1;
  transition: 0.6s ease-in-out 1.2s, visibility 0s 1s;
}

.container.active .form-box {
  right: 50%;
}

.form-box.register {
  visibility: hidden;
}
.container.active .form-box.register {
  visibility: visible;
}

.input-box {
  position: relative;
  margin: 30px 0;
}

.input-box input {
  width: 100%;
  padding: 13px 50px 13px 20px;
  background: #eee;
  border-radius: 8px;
  border: none;
  outline: none;
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.input-box input::placeholder {
  color: #888;
  font-weight: 400;
}

.input-box i {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
}

.forgot-link {
  margin: -15px 0 15px;
}
.forgot-link a {
  font-size: 14.5px;
  color: #333;
}

.btn {
  width: 100%;
  height: 48px;
  background: #7494ec;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #fff;
  font-weight: 600;
}

.social-icons {
  display: flex;
  justify-content: center;
}

.social-icons a {
  display: inline-flex;
  padding: 10px;
  border: 2px solid #ccc;
  border-radius: 8px;
  font-size: 24px;
  color: #333;
  margin: 0 8px;
}

.toggle-box {
  position: absolute;
  width: 100%;
  height: 100%;
}

.toggle-box::before {
  content: "";
  position: absolute;
  left: -250%;
  width: 300%;
  height: 100%;
  background: #7494ec;
  border-radius: 150px;
  z-index: 2;
  transition: 1.8s ease-in-out;
}

.container.active .toggle-box::before {
  left: 50%;
}

.toggle-panel {
  position: absolute;
  width: 50%;
  height: 100%;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 2;
  transition: 0.6s ease-in-out;
}

.toggle-panel.toggle-left {
  left: 0;
  transition-delay: 1.2s;
}
.container.active .toggle-panel.toggle-left {
  left: -50%;
  transition-delay: 0.6s;
}

.toggle-panel.toggle-right {
  right: -50%;
  transition-delay: 0.6s;
}
.container.active .toggle-panel.toggle-right {
  right: 0;
  transition-delay: 1.2s;
}

.toggle-panel p {
  margin-bottom: 20px;
}

.toggle-panel .btn {
  width: 160px;
  height: 46px;
  background: transparent;
  border: 2px solid #fff;
  box-shadow: none;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999 !important;
}

.modal-backdrop {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100000 !important;
}

.modal {
  background-color: yellow !important;
  color: #222 !important;
  padding: 2rem;
  border-radius: 10px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  text-align: center;
  z-index: 100001 !important;
  border: 4px solid red !important;
}

.modal input {
  width: 100%;
  padding: 10px;
  margin-top: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  background: #fff !important;
  color: #222 !important;
  font-size: 16px;
}

.modal-input-box {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.modal-buttons {
  margin-top: 1rem;
  display: flex;
  justify-content: space-around;
}

.modal-buttons .btn {
  padding: 8px 16px;
  background: #7494ec !important;
  color: #fff !important;
  border: none;
  font-size: 15px;
}

@media screen and (max-width: 650px) {
  .container {
    height: 100vh;
    min-height: 100vh;
    max-height: 100vh;
  }

  .form-box {
    bottom: 0;
    width: 100%;
    height: 70%;
  }

  .container.active .form-box {
    right: 0;
    bottom: 30%;
  }

  .toggle-box::before {
    left: 0;
    top: -270%;
    width: 100%;
    height: 300%;
    border-radius: 20vw;
  }

  .container.active .toggle-box::before {
    left: 0;
    top: 70%;
  }

  .container.active .toggle-panel.toggle-left {
    left: 0;
    top: -30%;
  }

  .toggle-panel {
    width: 100%;
    height: 30%;
  }
  .toggle-panel.toggle-left {
    top: 0;
  }
  .toggle-panel.toggle-right {
    right: 0;
    bottom: -30%;
  }

  .container.active .toggle-panel.toggle-right {
    bottom: 0;
  }
}

@media screen and (max-width: 400px) {
  .form-box {
    padding: 20px;
  }

  .toggle-panel h1 {
    font-size: 30px;
  }
}
</style>
