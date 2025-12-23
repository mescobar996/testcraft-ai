# Política de Seguridad - TestCraft AI

## 🔒 Resumen de Seguridad

TestCraft AI implementa múltiples capas de seguridad para proteger datos de usuarios y prevenir vulnerabilidades comunes.

---

## ✅ Medidas de Seguridad Implementadas

### 1. Autenticación y Autorización
- ✅ Autenticación basada en Supabase Auth (JWT)
- ✅ Middleware de protección de rutas
- ✅ Validación de sesión en cada request de API
- ✅ Tokens de refresh automáticos

### 2. Validación de Datos
- ✅ Esquemas Zod en todas las APIs
- ✅ Sanitización de entradas de usuario
- ✅ Límites de tamaño para texto e imágenes
- ✅ Validación de tipos de archivo

**Ejemplo**:
```typescript
// lib/validations.ts
export const GenerateRequestSchema = z.object({
  requirement: z.string()
    .min(10).max(5000).trim(),
  context: z.string().max(2000).optional()
})
```

### 3. Rate Limiting
- ✅ Limitación por IP para usuarios anónimos (10 req/hora)
- ✅ Limitación por usuario autenticado (100 req/hora)
- ✅ Headers de rate limit en respuestas API
- ✅ Respuestas 429 cuando se excede el límite

### 4. Content Security Policy (CSP)
- ✅ Headers CSP estrictos en next.config.ts
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ Strict-Transport-Security (HSTS)
- ✅ Permissions-Policy restrictivo

### 5. Protección contra XSS
- ✅ Uso de `dangerouslySetInnerHTML` solo para analytics confiables
- ✅ Sanitización de todo contenido generado por IA
- ✅ Escape automático de React
- ✅ CSP para prevenir inyección de scripts

### 6. Protección contra Injection
- ✅ Prepared statements en Supabase
- ✅ Validación estricta de inputs
- ✅ Sin uso de `eval()` o `Function()`
- ✅ Sanitización de parámetros SQL

### 7. Gestión de Secretos
- ✅ Variables de entorno para todas las claves
- ✅ `.env.local` en .gitignore
- ✅ Separación de claves públicas vs privadas
- ✅ Rotación periódica recomendada

**Reglas**:
- `NEXT_PUBLIC_*` → Seguro para cliente
- Sin `NEXT_PUBLIC_` → Solo servidor

### 8. Logging Seguro
- ✅ Sistema de logging estructurado
- ✅ Sin exposición de datos sensibles en logs
- ✅ Mensajes de error genéricos al cliente
- ✅ Stack traces solo en desarrollo

### 9. Validación de Imágenes
- ✅ Límite de tamaño: 10MB
- ✅ Solo formatos permitidos: JPG, PNG, GIF, WebP
- ✅ Validación de MIME type
- ✅ Procesamiento seguro con Buffer

### 10. Caché Seguro
- ✅ Caché solo en servidor (no cliente)
- ✅ Sin almacenamiento de datos sensibles
- ✅ TTL configurado (24 horas)
- ✅ Limpieza automática de entradas expiradas

---

## 🚨 Reporte de Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad, **NO la reportes públicamente**.

### Proceso de Reporte

1. **Enviar email a**: security@testcraft-ai.com (o crear issue privado)
2. **Incluir**:
   - Descripción detallada de la vulnerabilidad
   - Pasos para reproducirla
   - Impacto potencial
   - Sugerencias de corrección (opcional)

3. **Tiempo de respuesta esperado**:
   - Confirmación: 24-48 horas
   - Evaluación inicial: 3-5 días
   - Fix y deploy: 7-14 días (según severidad)

### Severidad de Vulnerabilidades

| Nivel | Descripción | Tiempo de Fix |
|-------|-------------|---------------|
| 🔴 Crítica | Permite acceso no autorizado a datos o sistema | 24-48 horas |
| 🟠 Alta | Potencial exposición de datos sensibles | 3-7 días |
| 🟡 Media | Vulnerabilidad que requiere condiciones específicas | 1-2 semanas |
| 🟢 Baja | Problema menor o edge case | 2-4 semanas |

---

## 🛡️ Guía de Seguridad para Desarrolladores

### Checklist de Seguridad

Antes de hacer merge de nuevo código, verificar:

- [ ] ¿Se validan todas las entradas con Zod?
- [ ] ¿Se usa rate limiting en nuevas APIs?
- [ ] ¿Las credenciales están en variables de entorno?
- [ ] ¿Se usa el logger en lugar de console.log?
- [ ] ¿Los errores no exponen información sensible?
- [ ] ¿Se agregaron tests para el nuevo código?
- [ ] ¿Se actualizó la documentación si es necesario?

### Código Seguro vs Inseguro

**❌ NO HACER**:
```typescript
// Exponer API key en cliente
const ANTHROPIC_KEY = "sk-ant-...";

// Sin validación
const data = await request.json();
callAPI(data.input); // Peligroso!

// Error detallado al cliente
catch (err) {
  return { error: err.stack } // ❌
}
```

**✅ HACER**:
```typescript
// API key del servidor
const key = process.env.ANTHROPIC_API_KEY;

// Con validación Zod
const validated = Schema.parse(data);
callAPI(validated.input); // Seguro

// Error genérico al cliente
catch (err) {
  logError('context', err) // Log interno
  return { error: "Error procesando solicitud" } // ✅
}
```

---

## 🔐 Variables de Entorno Sensibles

### Clasificación

| Tipo | Ejemplos | Exposición |
|------|----------|-----------|
| **Públicas** | `NEXT_PUBLIC_SUPABASE_URL` | Cliente OK |
| **Secretas** | `ANTHROPIC_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Solo servidor |
| **Privadas** | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Solo servidor |

### Rotación de Claves

Rotar cada:
- **3 meses**: API keys (Anthropic, Stripe)
- **6 meses**: Service role keys
- **Inmediatamente**: Si hay sospecha de compromiso

---

## 📝 Historial de Actualizaciones de Seguridad

### 2025-01-23 - Mejoras Mayores
- ✅ Implementado rate limiting en todas las APIs
- ✅ Agregada validación Zod exhaustiva
- ✅ Sistema de logging estructurado
- ✅ CSP headers configurados
- ✅ Sanitización de imágenes
- ✅ Sistema de caché seguro
- ✅ Corrección de variables de entorno hardcodeadas

### Próximas Mejoras Planeadas
- [ ] Migrar rate limiter a Redis (escalabilidad)
- [ ] Implementar 2FA opcional
- [ ] Audit logs de acciones críticas
- [ ] Implementar CAPTCHA en formularios públicos
- [ ] Monitoreo de anomalías con Sentry/LogRocket

---

## 🔗 Referencias y Recursos

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
- [Supabase Security](https://supabase.com/docs/guides/platform/going-into-prod#security)
- [Anthropic Best Practices](https://docs.anthropic.com/en/api/security)

---

## ✅ Certificaciones y Compliance

- ✅ GDPR-ready (manejo de datos de usuarios)
- ✅ HTTPS enforced (Strict-Transport-Security)
- ✅ Rate limiting compliance
- ⏳ SOC 2 (planeado para 2025)

---

**Última actualización**: 2025-01-23
**Responsable de Seguridad**: security@testcraft-ai.com
