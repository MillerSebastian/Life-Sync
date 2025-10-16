// Configuración de APIs
export const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
export const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

// Configuración del modelo
export const DEEPSEEK_MODEL = "deepseek-chat";
export const DEEPSEEK_MAX_TOKENS = import.meta.env.VITE_DEEPSEEK_MAX_TOKENS;
export const DEEPSEEK_TEMPERATURE = 0.7;
