# Changelog

Todos los cambios notables en el proyecto TestCraft AI serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [1.1.0] - 2025-01-23

### 🔒 Seguridad

#### Agregado
- **Rate Limiting** en todas las APIs
  - 10 requests/hora para usuarios anónimos
  - 100 requests/hora para usuarios autenticados
  - Headers X-RateLimit-* en respuestas
  - Sistema de rate limiter en memoria (lib/rate-limiter.ts)

- **Validación exhaustiva con Zod**
  - Esquemas de validación centralizados (lib/validations.ts)
  - Validación en servidor de todos los inputs
  - Límites estrictos de tamaño de texto (10-5000 chars)
  - Validación de formatos de imagen

- **Content Security Policy (CSP)**
  - Headers de seguridad completos en next.config.ts
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Strict-Transport-Security (HSTS)
  - Permissions-Policy restrictivo

- **Sanitización de imágenes**
  - Límite de tamaño: 10MB
  - Validación de MIME types
  - Solo formatos permitidos: JPG, PNG, GIF, WebP

- **Sistema de logging estructurado**
  - Logger centralizado (lib/logger.ts)
  - Logs en formato JSON
  - Sin exposición de datos sensibles
  - Diferentes niveles: info, warn, error, debug

#### Corregido
- Variables de entorno hardcodeadas en layout.tsx
  - Analytics solo se cargan si están configurados
  - Uso correcto de NEXT_PUBLIC_* variables

- Manejo de errores mejorado
  - Mensajes genéricos al cliente
  - Detalles técnicos solo en logs del servidor
  - Códigos de estado HTTP apropiados

### ⚡ Rendimiento

#### Agregado
- **Sistema de caché en memoria**
  - Caché de respuestas de Anthropic (lib/cache.ts)
  - TTL configurable (24 horas por defecto)
  - Headers X-Cache: HIT/MISS
  - Limpieza automática de entradas expiradas

- **Optimización de imágenes**
  - Configuración de next/image en next.config.ts
  - Formatos AVIF y WebP
  - Múltiples tamaños de dispositivo

#### Mejorado
- Reducción de llamadas duplicadas a Anthropic
- Respuestas más rápidas con caché hit

### 📦 Infraestructura

#### Agregado
- **Constantes centralizadas** (lib/constants.ts)
  - LIMITS: Límites de uso por plan
  - VALIDATION: Reglas de validación
  - ERROR_MESSAGES: Mensajes de error
  - ANTHROPIC: Configuración de IA
  - RATE_LIMITING: Configuración de rate limiting
  - CACHE: Configuración de caché

- **Documentación completa**
  - README.dev.md: Guía para desarrolladores
  - SECURITY.md: Política de seguridad
  - .env.example actualizado con todas las variables
  - Comentarios inline en código crítico

- **Tests adicionales**
  - __tests__/api/generate.test.ts: Tests de API
  - __tests__/lib/constants.test.ts: Tests de constantes
  - Mayor cobertura de validación con Zod

#### Mejorado
- Estructura de archivos más organizada
- Separación clara de concerns
- Mejor mantenibilidad del código

### 🐛 Fixes

#### Corregido
- Validación de entrada faltante en APIs
- Posible DoS por requests grandes
- Exposición de stack traces en producción
- Falta de rate limiting permitía abuso
- Variables de entorno incorrectas en analytics

### 📝 Documentación

#### Agregado
- README.dev.md: Setup, arquitectura, deployment
- SECURITY.md: Política de seguridad completa
- CHANGELOG.md: Este archivo
- Comentarios JSDoc en funciones críticas

#### Mejorado
- .env.example con explicaciones detalladas
- Documentación inline de configuraciones

---

## [1.0.0] - 2024-12-XX

### 🎉 Release Inicial

#### Agregado
- Generación de casos de prueba con Claude AI
- Análisis de imágenes para generar tests
- Autenticación con Supabase
- Planes de suscripción con Stripe
- Exportación a múltiples formatos (Excel, PDF, Gherkin)
- Integraciones con Jira, GitHub, Slack, etc.
- UI/UX con Tailwind CSS y Radix UI
- i18n (Español/Inglés)
- Tema claro/oscuro
- Historial de generaciones
- Sistema de favoritos
- Tests E2E con Cypress
- Deploy en Vercel

---

## Tipos de cambios

- `Agregado` para nuevas funcionalidades
- `Cambiado` para cambios en funcionalidades existentes
- `Deprecado` para funcionalidades que serán removidas
- `Removido` para funcionalidades removidas
- `Corregido` para corrección de bugs
- `Seguridad` para vulnerabilidades corregidas

---

## Roadmap

### [1.2.0] - Planeado Q1 2025

#### Planeado
- [ ] Migrar rate limiter a Redis para escalabilidad
- [ ] Implementar 2FA opcional
- [ ] Audit logs de acciones críticas
- [ ] CAPTCHA en formularios públicos
- [ ] Integración con Sentry para error tracking
- [ ] Actualizar dependencias críticas (Next.js 16+)
- [ ] WebSockets para generación en tiempo real
- [ ] API pública para integraciones

### [1.3.0] - Planeado Q2 2025

#### Planeado
- [ ] CLI para TestCraft AI
- [ ] Plugin para VSCode
- [ ] Exportación a más formatos (TestRail, Zephyr)
- [ ] Colaboración en tiempo real
- [ ] Templates de casos de prueba
- [ ] IA mejorada con fine-tuning

---

**Formato**: [Unreleased/Version] - YYYY-MM-DD
