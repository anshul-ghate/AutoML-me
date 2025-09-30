import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "automl_platform": "AutoML Platform",
      "welcome_user": "Welcome, {{username}}",
      "data_upload": "Data Upload",
      "ai_assistant": "AI Assistant", 
      "pipeline_builder": "Pipeline Builder",
      "upload_your_data": "Upload Your Data",
      "upload_dataset_description": "Upload your dataset and select the appropriate modality for analysis",
      "ai_chat_assistant": "AI Chat Assistant",
      "chat_description": "Chat with our AI assistant to get help with your AutoML workflows",
      "pipeline_builder_title": "Pipeline Builder",
      "pipeline_description": "Design and build your machine learning pipeline visually",
      "logout": "Logout",
      "login": "Login",
      "register": "Register",
      "username": "Username",
      "password": "Password",
      "email": "Email",
      "modality": "Modality",
      "structured": "Structured",
      "text": "Text",
      "image": "Image",
      "audio": "Audio",
      "upload_file": "Upload File",
      "drag_drop_file": "Drag & drop your file here, or click to select",
      "supports_files": "Supports CSV, JSON, TXT, Images, Audio files",
      "uploading": "Uploading...",
      "upload_successful": "uploaded successfully!",
      "upload_failed": "Upload failed",
      "click_to_change": "Click to change file"
    }
  },
  es: {
    translation: {
      "automl_platform": "Plataforma AutoML",
      "welcome_user": "Bienvenido, {{username}}",
      "data_upload": "Subir Datos",
      "ai_assistant": "Asistente IA",
      "pipeline_builder": "Constructor de Pipeline",
      "upload_your_data": "Sube tus Datos",
      "upload_dataset_description": "Sube tu conjunto de datos y selecciona la modalidad apropiada para análisis",
      "ai_chat_assistant": "Asistente de Chat IA", 
      "chat_description": "Chatea con nuestro asistente IA para obtener ayuda con tus flujos AutoML",
      "pipeline_builder_title": "Constructor de Pipeline",
      "pipeline_description": "Diseña y construye tu pipeline de machine learning visualmente",
      "logout": "Cerrar Sesión",
      "login": "Iniciar Sesión",
      "register": "Registrarse",
      "username": "Usuario",
      "password": "Contraseña",
      "email": "Correo",
      "modality": "Modalidad",
      "structured": "Estructurado",
      "text": "Texto",
      "image": "Imagen",
      "audio": "Audio",
      "upload_file": "Subir Archivo",
      "drag_drop_file": "Arrastra y suelta tu archivo aquí, o haz clic para seleccionar",
      "supports_files": "Soporta archivos CSV, JSON, TXT, Imágenes, Audio",
      "uploading": "Subiendo...",
      "upload_successful": "subido exitosamente!",
      "upload_failed": "Error al subir",
      "click_to_change": "Haz clic para cambiar archivo"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
