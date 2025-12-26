"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "es" | "en";

interface Translations {
  appName: string;
  appSubtitle: string;
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  requirement: string;
  requirementPlaceholder: string;
  context: string;
  contextPlaceholder: string;
  outputFormat: string;
  formatBoth: string;
  formatTable: string;
  formatGherkin: string;
  loadExample: string;
  generateButton: string;
  generatingButton: string;
  tipCtrlEnter: string;
  infoTip: string;
  templatesTitle: string;
  templatesAvailable: string;
  templatesAll: string;
  templatesTip: string;
  predefinedTemplates: string;
  advancedOptions: string;
  compareTitle: string;
  compareSubtitle: string;
  compareV1: string;
  compareV2: string;
  compareButton: string;
  comparingButton: string;
  noTestCases: string;
  noTestCasesDesc: string;
  noTestCasesTip: string;
  generating: string;
  generatingDesc: string;
  errorTitle: string;
  summary: string;
  export: string;
  copyGherkin: string;
  copyAll: string;
  expand: string;
  collapse: string;
  sort: string;
  sortPriority: string;
  sortType: string;
  sortId: string;
  searchPlaceholder: string;
  filter: string;
  all: string;
  positive: string;
  negative: string;
  edge: string;
  copy: string;
  copied: string;
  favorite: string;
  saved: string;
  edit: string;
  save: string;
  cancel: string;
  regenerate: string;
  preconditions: string;
  steps: string;
  expectedResult: string;
  total: string;
  highPriority: string;
  feature1Title: string;
  feature1Desc: string;
  feature2Title: string;
  feature2Desc: string;
  feature3Title: string;
  feature3Desc: string;
  copyright: string;
  results: string;
  orderedBy: string;
  casesFound: string;
  noResults: string;
  // Landing page
  aboutTitle: string;
  aboutDesc: string;
  statsGenerated: string;
  statsUsers: string;
  statsAvailability: string;
  featuresTitle: string;
  featuresAI: string;
  featuresFormats: string;
  featuresIntegrations: string;
  featuresIntegrationsSoon: string;
  featuresPerformance: string;
  useCasesTitle: string;
  useCaseEcommerce: string;
  useCaseEcommerceDesc: string;
  useCaseAPI: string;
  useCaseAPIDesc: string;
  useCaseUI: string;
  useCaseUIDesc: string;
  useCaseRegression: string;
  useCaseRegressionDesc: string;
  demoTitle: string;
  demoSubtitle: string;
  // Tags
  tagClaudeAI: string;
  tagPositive: string;
  tagNegative: string;
  tagEdge: string;
  tagFromImage: string;
  tagGherkin: string;
  tagTable: string;
  tagJSON: string;
  tagPDF: string;
  tagJira: string;
  tagAzure: string;
  tagGitHub: string;
  tagTestRail: string;
  tagFast: string;
  tagCloud: string;
  tagHistory: string;
  // ImageUploader
  generateFromImage: string;
  generateFromImageTitle: string;
  generateFromImageSubtitle: string;
  dragImageHere: string;
  orClickToSelect: string;
  selectImage: string;
  maxFileSize: string;
  additionalContext: string;
  additionalContextPlaceholder: string;
  imageUploaderTips: string;
  analyzingImage: string;
  imageGenerated: string;
  selectValidImage: string;
  imageTooLarge: string;
  // page.tsx errors and messages
  limitReached: string;
  errorGeneratingCases: string;
  generatedFromImage: string;
  noTitle: string;
  // TestCaseOutput
  casesCopied: string;
  typeLabel: string;
  priorityLabel: string;
  preconditionsLabel: string;
  stepsLabel: string;
  expectedResultLabel: string;
  // ExportMenu
  exportButton: string;
  basicFormats: string;
  testingTools: string;
  excelFormat: string;
  pdfFormat: string;
  jsonFormat: string;
  jiraCSV: string;
  testRailCSV: string;
  zephyrCSV: string;
  qTestExcel: string;
  jiraReady: string;
  testRailReady: string;
  zephyrReady: string;
  qTestReady: string;
  // UsageBanner
  upgradeToPro: string;
  loginForMore: string;
  generationsLeft: string;
  upgradeToProButton: string;
  signInForMore: string;
  limitReachedTitle: string;
  upgradeToProPrice: string;
  signInWithGoogle: string;
  // LoginForm
  welcomeBack: string;
  signInToAccount: string;
  continueWithGoogle: string;
  orContinueWithEmail: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  showPassword: string;
  hidePassword: string;
  forgotPassword: string;
  signInButton: string;
  signingIn: string;
  noAccount: string;
  signUp: string;
  recoverPassword: string;
  recoverPasswordDesc: string;
  sendRecoveryLink: string;
  sending: string;
  emailRequired: string;
  invalidEmail: string;
  passwordRequired: string;
  invalidCredentials: string;
  connectionError: string;
  enterValidEmail: string;
  resetError: string;
  // RegisterForm
  createAccount: string;
  startFreeToday: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  confirmPasswordLabel: string;
  confirmPasswordPlaceholder: string;
  agreeToTerms: string;
  termsOfService: string;
  and: string;
  privacyPolicy: string;
  createAccountButton: string;
  creatingAccount: string;
  alreadyHaveAccount: string;
  nameRequired: string;
  passwordTooShort: string;
  passwordsDoNotMatch: string;
  mustAcceptTerms: string;
  emailInUse: string;
  // UpgradeModal
  upgradeToPROTitle: string;
  unlimitedPower: string;
  currentPlan: string;
  freePlan: string;
  proPlan: string;
  upgradeNow: string;
  unlimitedGenerations: string;
  unlimitedGenerationsDesc: string;
  prioritySupport: string;
  prioritySupportDesc: string;
  cloudHistory: string;
  cloudHistoryDesc: string;
  advancedExports: string;
  advancedExportsDesc: string;
  APIAccess: string;
  APIAccessDesc: string;
  earlyFeatures: string;
  earlyFeaturesDesc: string;
  perMonth: string;
  cancelAnytime: string;
  processing: string;
  // IntegrationsModal
  integrationsTitle: string;
  integrationsSubtitle: string;
  exportDirectly: string;
  directIntegrations: string;
  comingSoon: string;
  configureAPI: string;
  saveIntegration: string;
  testConnection: string;
  connected: string;
  notConfigured: string;
  jiraDescription: string;
  azureDescription: string;
  testRailDescription: string;
  notionDescription: string;
  slackDescription: string;
  githubDescription: string;
  trelloDescription: string;
  APIKey: string;
  enterAPIKey: string;
  projectKey: string;
  enterProjectKey: string;
  organization: string;
  enterOrganization: string;
  workspace: string;
  enterWorkspace: string;
  webhookURL: string;
  enterWebhookURL: string;
  accessToken: string;
  enterAccessToken: string;
  repository: string;
  enterRepository: string;
  boardID: string;
  enterBoardID: string;
  // UserMenu
  myAccount: string;
  viewProfile: string;
  currentPlanLabel: string;
  freeLabel: string;
  proLabel: string;
  generationsToday: string;
  unlimited: string;
  manageSubscription: string;
  accountSettings: string;
  billingHistory: string;
  integrations: string;
  documentation: string;
  support: string;
  signOut: string;
}

const translations: Record<Language, Translations> = {
  es: {
    appName: "TestCraft AI",
    appSubtitle: "Generador de Casos de Prueba",
    heroTitle: "Generá casos de prueba",
    heroHighlight: "en segundos",
    heroSubtitle: "Pegá tus requisitos o historias de usuario y obtené casos de prueba profesionales con cobertura completa, incluyendo casos de borde y negativos.",
    requirement: "Descripción del requisito",
    requirementPlaceholder: "Pegá aquí tu historia de usuario, requisito funcional o descripción de la funcionalidad a probar...",
    context: "Contexto adicional",
    contextPlaceholder: "Información adicional: tecnologías usadas, restricciones, reglas de negocio...",
    outputFormat: "Formato de salida",
    formatBoth: "Tabla + Gherkin (Recomendado)",
    formatTable: "Solo Tabla",
    formatGherkin: "Solo Gherkin",
    loadExample: "Cargar ejemplo",
    generateButton: "Generar Casos de Prueba",
    generatingButton: "Generando casos de prueba...",
    tipCtrlEnter: "Tip: Presioná Ctrl + Enter para generar",
    infoTip: "Mientras más detallado sea el requisito, mejores serán los casos de prueba generados. Incluí criterios de aceptación, validaciones y reglas de negocio si las tenés.",
    templatesTitle: "Templates Predefinidos",
    templatesAvailable: "disponibles",
    templatesAll: "Todos",
    templatesTip: "Hacé click en un template para cargar el requisito automáticamente",
    predefinedTemplates: "Plantillas Predefinidas",
    advancedOptions: "Opciones Avanzadas",
    compareTitle: "Modo Comparación",
    compareSubtitle: "Comparar 2 versiones",
    compareV1: "Requisito Original",
    compareV2: "Requisito Nuevo",
    compareButton: "Comparar Versiones",
    comparingButton: "Comparando versiones...",
    noTestCases: "Sin casos de prueba",
    noTestCasesDesc: "Ingresá un requisito o historia de usuario y hacé clic en \"Generar\" para crear casos de prueba automáticamente.",
    noTestCasesTip: "Tip: Usá \"Cargar ejemplo\" para probar",
    generating: "Generando casos de prueba...",
    generatingDesc: "Analizando requisitos con IA",
    errorTitle: "Error al generar",
    summary: "Resumen",
    export: "Exportar",
    copyGherkin: "Copiar Gherkin",
    copyAll: "Copiar Todos",
    expand: "Expandir",
    collapse: "Colapsar",
    sort: "Ordenar",
    sortPriority: "Prioridad",
    sortType: "Tipo",
    sortId: "ID",
    searchPlaceholder: "Buscar en casos de prueba...",
    filter: "Filtrar:",
    all: "Todos",
    positive: "Positivos",
    negative: "Negativos",
    edge: "Borde",
    copy: "Copiar",
    copied: "Copiado",
    favorite: "Favorito",
    saved: "Guardado",
    edit: "Editar",
    save: "Guardar",
    cancel: "Cancelar",
    regenerate: "Regenerar",
    preconditions: "Precondiciones",
    steps: "Pasos",
    expectedResult: "Resultado Esperado",
    total: "Total",
    highPriority: "Alta Prioridad",
    feature1Title: "Generación Instantánea",
    feature1Desc: "Casos de prueba completos en segundos, no en horas.",
    feature2Title: "Cobertura Exhaustiva",
    feature2Desc: "Casos positivos, negativos y de borde automáticamente.",
    feature3Title: "Múltiples Formatos",
    feature3Desc: "Exportá a Excel, PDF, Gherkin o copiá directo a tu herramienta.",
    copyright: "© 2025 TestCraft AI. Todos los derechos reservados.",
    results: "resultados",
    orderedBy: "Ordenado por",
    casesFound: "casos encontrados",
    noResults: "No se encontraron casos",
    // Landing page
    aboutTitle: "Sobre TestCraft AI",
    aboutDesc: "TestCraft AI es la herramienta definitiva para QA Engineers y desarrolladores que buscan automatizar la creación de casos de prueba profesionales. Utilizamos inteligencia artificial avanzada para generar casos completos, incluyendo escenarios positivos, negativos y de borde.",
    statsGenerated: "Casos Generados",
    statsUsers: "Usuarios Activos",
    statsAvailability: "Disponibilidad",
    featuresTitle: "Características & Tecnologías",
    featuresAI: "Generación IA",
    featuresFormats: "Formatos",
    featuresIntegrations: "Integraciones",
    featuresIntegrationsSoon: "Integraciones (próximamente)",
    featuresPerformance: "Performance",
    useCasesTitle: "Casos de Uso Destacados",
    useCaseEcommerce: "Testing E-Commerce",
    useCaseEcommerceDesc: "Genera casos completos para flujos de compra, carritos, checkout y pagos.",
    useCaseAPI: "APIs REST",
    useCaseAPIDesc: "Casos de prueba para endpoints, autenticación, validaciones y errores.",
    useCaseUI: "Testing UI/UX",
    useCaseUIDesc: "Desde screenshots, genera casos para formularios, navegación y responsive.",
    useCaseRegression: "Regresión Automática",
    useCaseRegressionDesc: "Mantén tu suite de casos actualizada con cada nueva feature.",
    demoTitle: "Mira cómo funciona",
    demoSubtitle: "Observa en tiempo real cómo TestCraft AI transforma tus requisitos en casos de prueba profesionales",
    // Tags
    tagClaudeAI: "Claude AI",
    tagPositive: "Casos Positivos",
    tagNegative: "Casos Negativos",
    tagEdge: "Casos Borde",
    tagFromImage: "Desde Imagen",
    tagGherkin: "Gherkin",
    tagTable: "Tabla",
    tagJSON: "JSON",
    tagPDF: "PDF Export",
    tagJira: "Jira",
    tagAzure: "Azure DevOps",
    tagGitHub: "GitHub",
    tagTestRail: "TestRail",
    tagFast: "Generación Rápida",
    tagCloud: "Cloud Storage",
    tagHistory: "Historial",
    // ImageUploader
    generateFromImage: "Generar desde Imagen",
    generateFromImageTitle: "Generar desde Imagen",
    generateFromImageSubtitle: "Subí un screenshot y generamos los casos",
    dragImageHere: "Arrastrá una imagen aquí",
    orClickToSelect: "o hacé click para seleccionar",
    selectImage: "Seleccionar imagen",
    maxFileSize: "PNG, JPG, GIF o WebP • Máximo 10MB",
    additionalContext: "Contexto adicional (opcional)",
    additionalContextPlaceholder: "Ej: Es un formulario de login para una app bancaria, debe validar email y contraseña segura...",
    imageUploaderTips: "💡 Tips: Subí screenshots de formularios, pantallas de login, dashboards, o cualquier UI. La IA detectará los elementos y generará casos de prueba automáticamente.",
    analyzingImage: "Analizando imagen...",
    imageGenerated: "Casos generados desde imagen",
    selectValidImage: "Por favor selecciona una imagen válida",
    imageTooLarge: "La imagen debe ser menor a 10MB",
    // page.tsx errors and messages
    limitReached: "Has alcanzado el límite diario de generaciones. Iniciá sesión o actualizá a Pro para obtener más.",
    errorGeneratingCases: "Error al generar casos de prueba",
    generatedFromImage: "Generado desde imagen",
    noTitle: "Sin título",
    // TestCaseOutput
    casesCopied: "casos copiados",
    typeLabel: "Tipo:",
    priorityLabel: "Prioridad:",
    preconditionsLabel: "Precondiciones:",
    stepsLabel: "Pasos:",
    expectedResultLabel: "Resultado Esperado:",
    // ExportMenu
    exportButton: "Exportar",
    basicFormats: "Formatos Básicos",
    testingTools: "Herramientas de Testing",
    excelFormat: "Excel (.xlsx)",
    pdfFormat: "PDF",
    jsonFormat: "JSON",
    jiraCSV: "Jira (CSV)",
    testRailCSV: "TestRail (CSV)",
    zephyrCSV: "Zephyr Scale (CSV)",
    qTestExcel: "qTest (Excel)",
    jiraReady: "CSV listo para importar en Jira",
    testRailReady: "CSV listo para TestRail",
    zephyrReady: "CSV listo para Zephyr Scale",
    qTestReady: "Excel listo para qTest",
    // UsageBanner
    upgradeToPro: "Actualizá a Pro para generaciones ilimitadas.",
    loginForMore: "Iniciá sesión para obtener más generaciones diarias.",
    generationsLeft: "Te quedan",
    upgradeToProButton: "Actualizar a Pro",
    signInForMore: "Iniciar sesión para más",
    limitReachedTitle: "Límite diario alcanzado",
    upgradeToProPrice: "Actualizar a Pro - $5/mes",
    signInWithGoogle: "Iniciar sesión con Google",
    // LoginForm
    welcomeBack: "Bienvenido de vuelta",
    signInToAccount: "Inicia sesión en tu cuenta de TestCraft AI",
    continueWithGoogle: "Continuar con Google",
    orContinueWithEmail: "o continúa con email",
    emailLabel: "Email",
    emailPlaceholder: "tu@email.com",
    passwordLabel: "Contraseña",
    passwordPlaceholder: "Tu contraseña",
    showPassword: "Mostrar contraseña",
    hidePassword: "Ocultar contraseña",
    forgotPassword: "¿Olvidaste tu contraseña?",
    signInButton: "Iniciar sesión",
    signingIn: "Iniciando sesión...",
    noAccount: "¿No tienes una cuenta?",
    signUp: "Regístrate",
    recoverPassword: "Recuperar contraseña",
    recoverPasswordDesc: "Te enviaremos un enlace para restablecer tu contraseña",
    sendRecoveryLink: "Enviar enlace de recuperación",
    sending: "Enviando...",
    emailRequired: "El email es requerido",
    invalidEmail: "Email inválido",
    passwordRequired: "La contraseña es requerida",
    invalidCredentials: "Email o contraseña incorrectos",
    connectionError: "Error de conexión. Por favor, intenta de nuevo.",
    enterValidEmail: "Por favor, ingresa un email válido",
    resetError: "Error al enviar el email",
    // RegisterForm
    createAccount: "Crear cuenta",
    startFreeToday: "Comienza gratis hoy",
    fullNameLabel: "Nombre completo",
    fullNamePlaceholder: "Tu nombre completo",
    confirmPasswordLabel: "Confirmar contraseña",
    confirmPasswordPlaceholder: "Confirma tu contraseña",
    agreeToTerms: "Acepto los",
    termsOfService: "Términos de Servicio",
    and: "y la",
    privacyPolicy: "Política de Privacidad",
    createAccountButton: "Crear cuenta",
    creatingAccount: "Creando cuenta...",
    alreadyHaveAccount: "¿Ya tienes una cuenta?",
    nameRequired: "El nombre es requerido",
    passwordTooShort: "La contraseña debe tener al menos 6 caracteres",
    passwordsDoNotMatch: "Las contraseñas no coinciden",
    mustAcceptTerms: "Debes aceptar los términos y condiciones",
    emailInUse: "Este email ya está registrado",
    // UpgradeModal
    upgradeToPROTitle: "Actualizar a PRO",
    unlimitedPower: "Poder ilimitado para tu testing",
    currentPlan: "Plan actual",
    freePlan: "Free",
    proPlan: "PRO",
    upgradeNow: "Actualizar ahora",
    unlimitedGenerations: "Generaciones ilimitadas",
    unlimitedGenerationsDesc: "Sin límites diarios. Genera todos los casos que necesites.",
    prioritySupport: "Soporte prioritario",
    prioritySupportDesc: "Respuesta rápida por email y chat.",
    cloudHistory: "Historial en la nube",
    cloudHistoryDesc: "Accede a todos tus casos desde cualquier dispositivo.",
    advancedExports: "Exportación avanzada",
    advancedExportsDesc: "Exporta a Jira, TestRail, Azure DevOps y más.",
    APIAccess: "Acceso a API",
    APIAccessDesc: "Integra TestCraft AI en tus flujos de trabajo.",
    earlyFeatures: "Funciones anticipadas",
    earlyFeaturesDesc: "Acceso temprano a nuevas características.",
    perMonth: "/mes",
    cancelAnytime: "Cancela cuando quieras",
    processing: "Procesando...",
    // IntegrationsModal
    integrationsTitle: "Integraciones",
    integrationsSubtitle: "Conecta TestCraft AI con tus herramientas favoritas",
    exportDirectly: "Exporta casos de prueba directamente a tus herramientas de testing",
    directIntegrations: "Integraciones Directas",
    comingSoon: "Próximamente",
    configureAPI: "Configurar API",
    saveIntegration: "Guardar Integración",
    testConnection: "Probar Conexión",
    connected: "Conectado",
    notConfigured: "No configurado",
    jiraDescription: "Exporta casos de prueba directamente a Jira",
    azureDescription: "Integración con Azure DevOps Test Plans",
    testRailDescription: "Sincroniza casos con TestRail",
    notionDescription: "Exporta documentación a Notion",
    slackDescription: "Notificaciones de casos generados",
    githubDescription: "Crea issues desde casos de prueba",
    trelloDescription: "Exporta a tarjetas de Trello",
    APIKey: "API Key",
    enterAPIKey: "Ingresa tu API Key",
    projectKey: "Project Key",
    enterProjectKey: "Ingresa el Project Key",
    organization: "Organización",
    enterOrganization: "Ingresa tu organización",
    workspace: "Workspace",
    enterWorkspace: "Ingresa tu workspace",
    webhookURL: "Webhook URL",
    enterWebhookURL: "Ingresa la URL del webhook",
    accessToken: "Access Token",
    enterAccessToken: "Ingresa tu token de acceso",
    repository: "Repositorio",
    enterRepository: "Ingresa el repositorio (owner/repo)",
    boardID: "Board ID",
    enterBoardID: "Ingresa el ID del board",
    // UserMenu
    myAccount: "Mi Cuenta",
    viewProfile: "Ver perfil",
    currentPlanLabel: "Plan actual:",
    freeLabel: "Free",
    proLabel: "PRO",
    generationsToday: "Generaciones hoy:",
    unlimited: "Ilimitadas",
    manageSubscription: "Administrar suscripción",
    accountSettings: "Configuración de cuenta",
    billingHistory: "Historial de facturación",
    integrations: "Integraciones",
    documentation: "Documentación",
    support: "Soporte",
    signOut: "Cerrar sesión",
  },
  en: {
    appName: "TestCraft AI",
    appSubtitle: "Test Case Generator",
    heroTitle: "Generate test cases",
    heroHighlight: "in seconds",
    heroSubtitle: "Paste your requirements or user stories and get professional test cases with complete coverage, including edge and negative cases.",
    requirement: "Requirement description",
    requirementPlaceholder: "Paste your user story, functional requirement or feature description here...",
    context: "Additional context",
    contextPlaceholder: "Additional info: technologies used, constraints, business rules...",
    outputFormat: "Output format",
    formatBoth: "Table + Gherkin (Recommended)",
    formatTable: "Table Only",
    formatGherkin: "Gherkin Only",
    loadExample: "Load example",
    generateButton: "Generate Test Cases",
    generatingButton: "Generating test cases...",
    tipCtrlEnter: "Tip: Press Ctrl + Enter to generate",
    infoTip: "The more detailed the requirement, the better the generated test cases will be. Include acceptance criteria, validations and business rules if you have them.",
    templatesTitle: "Predefined Templates",
    templatesAvailable: "available",
    templatesAll: "All",
    templatesTip: "Click a template to load the requirement automatically",
    predefinedTemplates: "Predefined Templates",
    advancedOptions: "Advanced Options",
    compareTitle: "Compare Mode",
    compareSubtitle: "Compare 2 versions",
    compareV1: "Original Requirement",
    compareV2: "New Requirement",
    compareButton: "Compare Versions",
    comparingButton: "Comparing versions...",
    noTestCases: "No test cases",
    noTestCasesDesc: "Enter a requirement or user story and click \"Generate\" to create test cases automatically.",
    noTestCasesTip: "Tip: Use \"Load example\" to try it out",
    generating: "Generating test cases...",
    generatingDesc: "Analyzing requirements with AI",
    errorTitle: "Generation error",
    summary: "Summary",
    export: "Export",
    copyGherkin: "Copy Gherkin",
    copyAll: "Copy All",
    expand: "Expand",
    collapse: "Collapse",
    sort: "Sort",
    sortPriority: "Priority",
    sortType: "Type",
    sortId: "ID",
    searchPlaceholder: "Search in test cases...",
    filter: "Filter:",
    all: "All",
    positive: "Positive",
    negative: "Negative",
    edge: "Edge",
    copy: "Copy",
    copied: "Copied",
    favorite: "Favorite",
    saved: "Saved",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    regenerate: "Regenerate",
    preconditions: "Preconditions",
    steps: "Steps",
    expectedResult: "Expected Result",
    total: "Total",
    highPriority: "High Priority",
    feature1Title: "Instant Generation",
    feature1Desc: "Complete test cases in seconds, not hours.",
    feature2Title: "Exhaustive Coverage",
    feature2Desc: "Positive, negative and edge cases automatically.",
    feature3Title: "Multiple Formats",
    feature3Desc: "Export to Excel, PDF, Gherkin or copy directly to your tool.",
    copyright: "© 2025 TestCraft AI. All rights reserved.",
    results: "results",
    orderedBy: "Ordered by",
    casesFound: "cases found",
    noResults: "No cases found",
    // Landing page
    aboutTitle: "About TestCraft AI",
    aboutDesc: "TestCraft AI is the ultimate tool for QA Engineers and developers looking to automate the creation of professional test cases. We use advanced artificial intelligence to generate complete cases, including positive, negative and edge scenarios.",
    statsGenerated: "Generated Cases",
    statsUsers: "Active Users",
    statsAvailability: "Availability",
    featuresTitle: "Features & Technologies",
    featuresAI: "AI Generation",
    featuresFormats: "Formats",
    featuresIntegrations: "Integrations",
    featuresIntegrationsSoon: "Integrations (coming soon)",
    featuresPerformance: "Performance",
    useCasesTitle: "Featured Use Cases",
    useCaseEcommerce: "E-Commerce Testing",
    useCaseEcommerceDesc: "Generate complete cases for purchase flows, carts, checkout and payments.",
    useCaseAPI: "REST APIs",
    useCaseAPIDesc: "Test cases for endpoints, authentication, validations and errors.",
    useCaseUI: "UI/UX Testing",
    useCaseUIDesc: "From screenshots, generate cases for forms, navigation and responsive design.",
    useCaseRegression: "Automated Regression",
    useCaseRegressionDesc: "Keep your test suite updated with each new feature.",
    demoTitle: "See how it works",
    demoSubtitle: "Watch in real-time how TestCraft AI transforms your requirements into professional test cases",
    // Tags
    tagClaudeAI: "Claude AI",
    tagPositive: "Positive Cases",
    tagNegative: "Negative Cases",
    tagEdge: "Edge Cases",
    tagFromImage: "From Image",
    tagGherkin: "Gherkin",
    tagTable: "Table",
    tagJSON: "JSON",
    tagPDF: "PDF Export",
    tagJira: "Jira",
    tagAzure: "Azure DevOps",
    tagGitHub: "GitHub",
    tagTestRail: "TestRail",
    tagFast: "Fast Generation",
    tagCloud: "Cloud Storage",
    tagHistory: "History",
    // ImageUploader
    generateFromImage: "Generate from Image",
    generateFromImageTitle: "Generate from Image",
    generateFromImageSubtitle: "Upload a screenshot and we'll generate the cases",
    dragImageHere: "Drag an image here",
    orClickToSelect: "or click to select",
    selectImage: "Select image",
    maxFileSize: "PNG, JPG, GIF or WebP • Max 10MB",
    additionalContext: "Additional context (optional)",
    additionalContextPlaceholder: "E.g.: It's a login form for a banking app, must validate email and secure password...",
    imageUploaderTips: "💡 Tips: Upload screenshots of forms, login screens, dashboards, or any UI. The AI will detect the elements and generate test cases automatically.",
    analyzingImage: "Analyzing image...",
    imageGenerated: "Cases generated from image",
    selectValidImage: "Please select a valid image",
    imageTooLarge: "Image must be less than 10MB",
    // page.tsx errors and messages
    limitReached: "You've reached the daily generation limit. Sign in or upgrade to Pro for more.",
    errorGeneratingCases: "Error generating test cases",
    generatedFromImage: "Generated from image",
    noTitle: "Untitled",
    // TestCaseOutput
    casesCopied: "cases copied",
    typeLabel: "Type:",
    priorityLabel: "Priority:",
    preconditionsLabel: "Preconditions:",
    stepsLabel: "Steps:",
    expectedResultLabel: "Expected Result:",
    // ExportMenu
    exportButton: "Export",
    basicFormats: "Basic Formats",
    testingTools: "Testing Tools",
    excelFormat: "Excel (.xlsx)",
    pdfFormat: "PDF",
    jsonFormat: "JSON",
    jiraCSV: "Jira (CSV)",
    testRailCSV: "TestRail (CSV)",
    zephyrCSV: "Zephyr Scale (CSV)",
    qTestExcel: "qTest (Excel)",
    jiraReady: "CSV ready to import in Jira",
    testRailReady: "CSV ready for TestRail",
    zephyrReady: "CSV ready for Zephyr Scale",
    qTestReady: "Excel ready for qTest",
    // UsageBanner
    upgradeToPro: "Upgrade to Pro for unlimited generations.",
    loginForMore: "Sign in to get more daily generations.",
    generationsLeft: "You have",
    upgradeToProButton: "Upgrade to Pro",
    signInForMore: "Sign in for more",
    limitReachedTitle: "Daily limit reached",
    upgradeToProPrice: "Upgrade to Pro - $5/mo",
    signInWithGoogle: "Sign in with Google",
    // LoginForm
    welcomeBack: "Welcome back",
    signInToAccount: "Sign in to your TestCraft AI account",
    continueWithGoogle: "Continue with Google",
    orContinueWithEmail: "or continue with email",
    emailLabel: "Email",
    emailPlaceholder: "your@email.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Your password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    forgotPassword: "Forgot your password?",
    signInButton: "Sign in",
    signingIn: "Signing in...",
    noAccount: "Don't have an account?",
    signUp: "Sign up",
    recoverPassword: "Recover password",
    recoverPasswordDesc: "We'll send you a link to reset your password",
    sendRecoveryLink: "Send recovery link",
    sending: "Sending...",
    emailRequired: "Email is required",
    invalidEmail: "Invalid email",
    passwordRequired: "Password is required",
    invalidCredentials: "Invalid email or password",
    connectionError: "Connection error. Please try again.",
    enterValidEmail: "Please enter a valid email",
    resetError: "Error sending email",
    // RegisterForm
    createAccount: "Create account",
    startFreeToday: "Start free today",
    fullNameLabel: "Full name",
    fullNamePlaceholder: "Your full name",
    confirmPasswordLabel: "Confirm password",
    confirmPasswordPlaceholder: "Confirm your password",
    agreeToTerms: "I agree to the",
    termsOfService: "Terms of Service",
    and: "and",
    privacyPolicy: "Privacy Policy",
    createAccountButton: "Create account",
    creatingAccount: "Creating account...",
    alreadyHaveAccount: "Already have an account?",
    nameRequired: "Name is required",
    passwordTooShort: "Password must be at least 6 characters",
    passwordsDoNotMatch: "Passwords do not match",
    mustAcceptTerms: "You must accept the terms and conditions",
    emailInUse: "This email is already registered",
    // UpgradeModal
    upgradeToPROTitle: "Upgrade to PRO",
    unlimitedPower: "Unlimited power for your testing",
    currentPlan: "Current plan",
    freePlan: "Free",
    proPlan: "PRO",
    upgradeNow: "Upgrade now",
    unlimitedGenerations: "Unlimited generations",
    unlimitedGenerationsDesc: "No daily limits. Generate all the cases you need.",
    prioritySupport: "Priority support",
    prioritySupportDesc: "Fast response via email and chat.",
    cloudHistory: "Cloud history",
    cloudHistoryDesc: "Access all your cases from any device.",
    advancedExports: "Advanced exports",
    advancedExportsDesc: "Export to Jira, TestRail, Azure DevOps and more.",
    APIAccess: "API Access",
    APIAccessDesc: "Integrate TestCraft AI into your workflows.",
    earlyFeatures: "Early features",
    earlyFeaturesDesc: "Early access to new features.",
    perMonth: "/mo",
    cancelAnytime: "Cancel anytime",
    processing: "Processing...",
    // IntegrationsModal
    integrationsTitle: "Integrations",
    integrationsSubtitle: "Connect TestCraft AI with your favorite tools",
    exportDirectly: "Export test cases directly to your testing tools",
    directIntegrations: "Direct Integrations",
    comingSoon: "Coming Soon",
    configureAPI: "Configure API",
    saveIntegration: "Save Integration",
    testConnection: "Test Connection",
    connected: "Connected",
    notConfigured: "Not configured",
    jiraDescription: "Export test cases directly to Jira",
    azureDescription: "Integration with Azure DevOps Test Plans",
    testRailDescription: "Sync cases with TestRail",
    notionDescription: "Export documentation to Notion",
    slackDescription: "Notifications for generated cases",
    githubDescription: "Create issues from test cases",
    trelloDescription: "Export to Trello cards",
    APIKey: "API Key",
    enterAPIKey: "Enter your API Key",
    projectKey: "Project Key",
    enterProjectKey: "Enter the Project Key",
    organization: "Organization",
    enterOrganization: "Enter your organization",
    workspace: "Workspace",
    enterWorkspace: "Enter your workspace",
    webhookURL: "Webhook URL",
    enterWebhookURL: "Enter the webhook URL",
    accessToken: "Access Token",
    enterAccessToken: "Enter your access token",
    repository: "Repository",
    enterRepository: "Enter repository (owner/repo)",
    boardID: "Board ID",
    enterBoardID: "Enter the board ID",
    // UserMenu
    myAccount: "My Account",
    viewProfile: "View profile",
    currentPlanLabel: "Current plan:",
    freeLabel: "Free",
    proLabel: "PRO",
    generationsToday: "Generations today:",
    unlimited: "Unlimited",
    manageSubscription: "Manage subscription",
    accountSettings: "Account settings",
    billingHistory: "Billing history",
    integrations: "Integrations",
    documentation: "Documentation",
    support: "Support",
    signOut: "Sign out",
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("es");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("testcraft-language") as Language | null;
    if (saved && (saved === "es" || saved === "en")) {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    if (mounted) {
      localStorage.setItem("testcraft-language", lang);
    }
  };

  const value = {
    language,
    setLanguage: handleSetLanguage,
    t: translations[language]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
