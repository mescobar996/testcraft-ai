"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "es" | "en";

interface Translations {
  // Header
  appName: string;
  appSubtitle: string;
  
  // Hero
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  
  // Form
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
  
  // Templates
  templatesTitle: string;
  templatesAvailable: string;
  templatesAll: string;
  templatesTip: string;
  
  // Compare
  compareTitle: string;
  compareSubtitle: string;
  compareV1: string;
  compareV2: string;
  compareButton: string;
  comparingButton: string;
  
  // Output
  noTestCases: string;
  noTestCasesDesc: string;
  noTestCasesTip: string;
  generating: string;
  generatingDesc: string;
  errorTitle: string;
  summary: string;
  
  // Actions
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
  
  // Test case fields
  preconditions: string;
  steps: string;
  expectedResult: string;
  
  // Stats
  total: string;
  highPriority: string;
  
  // Features
  feature1Title: string;
  feature1Desc: string;
  feature2Title: string;
  feature2Desc: string;
  feature3Title: string;
  feature3Desc: string;
  
  // Footer
  copyright: string;
  
  // Misc
  results: string;
  orderedBy: string;
  casesFound: string;
  noResults: string;
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
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("es");

  useEffect(() => {
    const saved = localStorage.getItem("language") as Language;
    if (saved) {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}
