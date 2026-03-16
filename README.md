# TestCraft AI 🚀 - Generador de Casos de Prueba con IA

## Introducción
**TestCraft AI** es una solución avanzada impulsada por Inteligencia Artificial diseñada para optimizar el ciclo de vida de las pruebas de software (QA). La aplicación permite transformar requisitos funcionales, historias de usuario e incluso capturas de pantalla en casos de prueba detallados, profesionales y listos para ejecutar.

Utilizando modelos de lenguaje de última generación (como Claude AI), TestCraft AI garantiza una cobertura exhaustiva que incluye escenarios positivos, negativos y casos de borde, reduciendo drásticamente el tiempo de documentación para los equipos de QA.

## Misión 🎯
Nuestra misión es empoderar a los especialistas en Quality Assurance eliminando las tareas repetitivas y tediosas de documentación. Queremos que el QA se centre en lo que realmente importa: la estrategia de pruebas, el análisis crítico y la entrega de software de alta calidad, mientras la IA se encarga de la estructura y el detalle.

## Características Principales ✨
- **Generación Multi-Formato**: Exporta tus casos en formatos de Tabla, Gherkin, JSON, PDF y Excel.
- **IA Vision**: Sube una captura de pantalla de un formulario o pantalla y la IA generará los escenarios de prueba correspondientes.
- **Cobertura Inteligente**: Generación automática de "happy paths", escenarios de error (negativos) y validaciones de límites (edge cases).
- **Integraciones**: Diseñado para exportar directamente a herramientas como Jira, TestRail, Zephyr y más.
- **Historial & Favoritos**: Sistema de persistencia para gestionar tus generaciones anteriores y marcar casos destacados.
- **UI Moderna**: Interfaz dark-mode optimizada para productividad con atajos de teclado y micro-interacciones.

## Instrucciones de Instalación 💻

Sigue estos pasos para ejecutar TestCraft AI en tu entorno local:

### 1. Requisitos Previos
Asegúrate de tener instalado:
- **Node.js** (Versión 18 o superior recomendada)
- **NPM** o **Yarn**
- Una cuenta en **Supabase** (para la gestión de usuarios y base de datos)
- Una API Key de **Anthropic** (para el motor de IA)

### 2. Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd testcraft-ai
```

### 3. Instalar Dependencias
```bash
npm install
# o si usas yarn
yarn install
```

### 4. Configurar Variables de Entorno
Copia el archivo de ejemplo y completa con tus credenciales reales:
```bash
cp .env.example .env.local
```
Deberás configurar al menos:
- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_APP_URL` (usualmente http://localhost:3000)

*Nota: Esta versión tiene las secciones de pago y suscripción deshabilitadas (comentadas) para facilitar su revisión como proyecto integrador.*

### 5. Ejecutar la Aplicación
```bash
npm run dev
```
Abre tu navegador en [http://localhost:3000](http://localhost:3000) para ver el proyecto en funcionamiento.

### 6. Pruebas Automáticas
El proyecto incluye suites de pruebas que puedes ejecutar:
```bash
# Ejecutar pruebas unitarias (Jest)
npm test

# Ejecutar pruebas E2E (Cypress)
npm run cypress:run
```

---
*Este proyecto es parte de mi portafolio profesional y demuestra habilidades en Desarrollo Fullstack (Next.js, Supabase), Inteligencia Artificial y Quality Assurance.*
