type TranslationKeys = {
  [key: string]: string | TranslationKeys;
};

type Translations = {
  [locale: string]: TranslationKeys;
};

const translations: Translations = {
  en: {
    // App Navigation
    automl_platform: "AutoML Platform",
    welcome_user: "Welcome, {{username}}",
    logout: "Logout",
    
    // Tabs
    data_upload: "Data Upload",
    ai_assistant: "AI Assistant",
    pipeline_builder: "Pipeline Builder",
    
    // File Upload
    upload_your_data: "Upload Your Data",
    upload_dataset_description: "Upload your dataset and select the appropriate modality for analysis",
    modality: "Modality",
    structured: "Structured",
    text: "Text",
    image: "Image",
    audio: "Audio",
    drag_drop_file: "Drag & drop your file here",
    click_to_browse: "or click to browse your computer",
    supported_formats: "Supports CSV, JSON, TXT, Images, Audio files",
    upload_file: "Upload File",
    uploading: "Uploading...",
    upload_successful: "{{filename}} uploaded successfully!",
    upload_failed: "Upload failed: {{error}}",
    click_to_change: "Click to change file",
    
    // Chat
    ai_chat_assistant: "AI Chat Assistant",
    chat_description: "Chat with our AI assistant to get help with your AutoML workflows",
    online: "Online",
    ai_thinking: "AI is thinking...",
    type_message: "Type your message...",
    send: "Send",
    hello_greeting: "Hello! I'm your AI assistant. How can I help you with your AutoML tasks today?",
    
    // Pipeline Builder
    pipeline_builder_title: "Pipeline Builder",
    pipeline_description: "Design and build your machine learning pipeline visually",
    pipeline_components: "Pipeline Components",
    data_preprocessing: "Data Preprocessing",
    feature_engineering: "Feature Engineering",
    model_training: "Model Training",
    model_evaluation: "Model Evaluation",
    explainability: "Explainability",
    save_pipeline: "Save Pipeline",
    load_pipeline: "Load Pipeline",
    clear_all: "Clear All",
    pipeline_saved: "Pipeline saved successfully!",
    pipeline_loaded: "Pipeline loaded successfully!",
    no_saved_pipeline: "No saved pipeline found",
    
    // Accessibility
    file_input: "File input",
    message_input: "Message input",
    send_message: "Send message",
    switch_to_dark: "Switch to dark mode",
    switch_to_light: "Switch to light mode"
  },
  es: {
    automl_platform: "Plataforma AutoML",
    welcome_user: "Bienvenido, {{username}}",
    logout: "Cerrar Sesión",
    data_upload: "Subida de Datos",
    ai_assistant: "Asistente IA",
    pipeline_builder: "Constructor de Pipeline",
    upload_your_data: "Sube tus Datos",
    upload_dataset_description: "Sube tu conjunto de datos y selecciona la modalidad apropiada para el análisis",
    modality: "Modalidad",
    structured: "Estructurado",
    text: "Texto",
    image: "Imagen",
    audio: "Audio",
    drag_drop_file: "Arrastra y suelta tu archivo aquí",
    click_to_browse: "o haz clic para explorar tu computadora",
    supported_formats: "Compatible con archivos CSV, JSON, TXT, Imágenes, Audio",
    upload_file: "Subir Archivo",
    uploading: "Subiendo...",
    upload_successful: "¡{{filename}} subido exitosamente!",
    upload_failed: "Error en la subida: {{error}}",
    click_to_change: "Haz clic para cambiar archivo",
    ai_chat_assistant: "Asistente de Chat IA",
    chat_description: "Chatea con nuestro asistente IA para obtener ayuda con tus flujos de trabajo AutoML",
    online: "En línea",
    ai_thinking: "IA está pensando...",
    type_message: "Escribe tu mensaje...",
    send: "Enviar",
    hello_greeting: "¡Hola! Soy tu asistente IA. ¿Cómo puedo ayudarte con tus tareas de AutoML hoy?",
    pipeline_builder_title: "Constructor de Pipeline",
    pipeline_description: "Diseña y construye tu pipeline de machine learning visualmente",
    pipeline_components: "Componentes del Pipeline",
    data_preprocessing: "Preprocesamiento de Datos",
    feature_engineering: "Ingeniería de Características",
    model_training: "Entrenamiento del Modelo",
    model_evaluation: "Evaluación del Modelo",
    explainability: "Explicabilidad",
    save_pipeline: "Guardar Pipeline",
    load_pipeline: "Cargar Pipeline",
    clear_all: "Limpiar Todo",
    pipeline_saved: "¡Pipeline guardado exitosamente!",
    pipeline_loaded: "¡Pipeline cargado exitosamente!",
    no_saved_pipeline: "No se encontró pipeline guardado",
    file_input: "Entrada de archivo",
    message_input: "Entrada de mensaje",
    send_message: "Enviar mensaje",
    switch_to_dark: "Cambiar a modo oscuro",
    switch_to_light: "Cambiar a modo claro"
  }
};

class SimpleI18n {
  private currentLocale: string = 'en';
  private listeners: (() => void)[] = [];

  constructor() {
    // Detect browser language
    const browserLang = navigator.language.split('-')[0];
    this.currentLocale = Object.keys(translations).includes(browserLang) ? browserLang : 'en';
    
    // Load from localStorage if available
    const saved = localStorage.getItem('i18n_language');
    if (saved && Object.keys(translations).includes(saved)) {
      this.currentLocale = saved;
    }
  }

  t = (key: string, interpolation?: { [key: string]: string }): string => {
    const keys = key.split('.');
    let value: any = translations[this.currentLocale];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if not found
          }
        }
        break;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Handle interpolation like {{username}}
    if (interpolation) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return interpolation[key] || match;
      });
    }

    return value;
  };

  changeLanguage = (locale: string) => {
    if (Object.keys(translations).includes(locale)) {
      this.currentLocale = locale;
      localStorage.setItem('i18n_language', locale);
      this.notifyListeners();
    }
  };

  subscribe = (callback: () => void) => {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  };

  private notifyListeners = () => {
    this.listeners.forEach(callback => callback());
  };

  get language() {
    return this.currentLocale;
  }

  get languages() {
    return Object.keys(translations);
  }
}

export const i18n = new SimpleI18n();

// Custom hook to replace react-i18next's useTranslation
export const useTranslation = () => {
  const [, forceUpdate] = React.useState({});
  
  React.useEffect(() => {
    const unsubscribe = i18n.subscribe(() => {
      forceUpdate({});
    });
    return unsubscribe;
  }, []);

  return { 
    t: i18n.t, 
    i18n: {
      language: i18n.language,
      changeLanguage: i18n.changeLanguage
    }
  };
};

// Add React import for the hook
import React from 'react';
