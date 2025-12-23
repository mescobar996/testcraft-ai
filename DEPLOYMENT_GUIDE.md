# 🚀 Guía de Deployment - TestCraft AI

Esta guía cubre el proceso completo de deployment a producción con todas las mejoras de seguridad implementadas.

---

## 📋 Pre-Deployment Checklist

### ✅ Código
- [x] Build exitoso: `npm run build`
- [x] Tests pasando: `npm test`
- [x] Lint sin errores: `npm run lint`
- [x] Type check correcto: `npx tsc --noEmit`

### ✅ Configuración
- [ ] `.env.local` configurado para producción
- [ ] Todas las variables en Vercel/hosting configuradas
- [ ] Dominios configurados
- [ ] DNS apuntando correctamente

### ✅ Servicios Externos
- [ ] Supabase: Proyecto creado y tablas configuradas
- [ ] Anthropic: API key válida y con créditos
- [ ] Stripe: Webhooks configurados
- [ ] Analytics: IDs configurados (opcional)

---

## 🌐 Deployment en Vercel (Recomendado)

### Paso 1: Preparar Repositorio

```bash
# Asegurar que todos los cambios están commiteados
git status

# Si hay cambios pendientes
git add .
git commit -m "feat: Mejoras de seguridad y performance v1.1.0"
git push origin main
```

### Paso 2: Importar en Vercel

1. Ir a [vercel.com](https://vercel.com) e iniciar sesión
2. Click en "Add New..." → "Project"
3. Importar tu repositorio de GitHub
4. Framework Preset: **Next.js** (auto-detectado)
5. **NO hacer deploy todavía** - primero configurar variables

### Paso 3: Configurar Variables de Entorno

En Vercel Dashboard → Settings → Environment Variables, agregar:

#### 🔴 CRÍTICAS (Requeridas)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-api03-xxx...

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx... # Usar sk_live_ para producción
STRIPE_WEBHOOK_SECRET=whsec_xxx...
STRIPE_PRICE_ID=price_xxx...
STRIPE_PRO_PRICE_ID=price_xxx...
STRIPE_ENTERPRISE_PRICE_ID=price_xxx...

# App
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
```

#### 🟢 OPCIONALES (Analytics)

```bash
# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Microsoft Clarity
NEXT_PUBLIC_CLARITY_ID=xxxxxxxxxx

# Hotjar
NEXT_PUBLIC_HOTJAR_ID=xxxxxxx
```

**IMPORTANTE**:
- Para cada variable, seleccionar: Production, Preview, Development
- Usar valores de **producción** (ej: `sk_live_` no `sk_test_`)

### Paso 4: Deploy

1. Click en "Deploy"
2. Esperar build (~2-3 minutos)
3. Verificar que el deploy fue exitoso

---

## 🔧 Configuración Post-Deployment

### 1. Configurar Webhook de Stripe

1. Ir a [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. URL: `https://tu-dominio.vercel.app/api/stripe/webhook`
4. Seleccionar eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copiar "Signing secret" y actualizar `STRIPE_WEBHOOK_SECRET` en Vercel

### 2. Verificar Supabase

```sql
-- Verificar que las tablas existen
SELECT tablename FROM pg_tables
WHERE schemaname = 'public';

-- Deben existir:
-- users, subscriptions, generations, user_integrations
```

### 3. Configurar Dominio Custom (Opcional)

1. En Vercel → Settings → Domains
2. Agregar tu dominio custom
3. Seguir instrucciones de DNS

### 4. Habilitar HTTPS/SSL

Vercel maneja esto automáticamente con Let's Encrypt.

---

## 🧪 Verificación de Deployment

### Test 1: Health Check

```bash
curl https://tu-dominio.vercel.app/
# Debe retornar 200 OK
```

### Test 2: API Funcionando

```bash
# Test de rate limiting
curl -X POST https://tu-dominio.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{"requirement":"test"}' \
  -v | grep "X-RateLimit"

# Debe retornar headers:
# X-RateLimit-Limit: 10
# X-RateLimit-Remaining: 9
```

### Test 3: Autenticación

1. Ir a `/auth/register`
2. Crear cuenta de prueba
3. Verificar que recibe email de Supabase
4. Login exitoso

### Test 4: Generación de Casos

1. Login en la app
2. Ingresar requisito de prueba
3. Verificar que genera casos correctamente
4. Verificar que aparece en historial

### Test 5: Stripe (Modo Test)

1. Ir a `/billing`
2. Seleccionar plan Pro
3. Usar tarjeta de prueba: `4242 4242 4242 4242`
4. Verificar webhook recibido en Stripe Dashboard

---

## 📊 Monitoreo Post-Deployment

### Vercel Analytics

Automático si está habilitado. Ver en Vercel Dashboard → Analytics

### Logs

```bash
# Ver logs en tiempo real
vercel logs --follow

# Ver logs de producción
vercel logs --prod
```

### Métricas Clave a Monitorear

1. **Performance**
   - Response time de APIs
   - Cache hit rate (buscar "X-Cache: HIT" en logs)
   - Tiempos de carga de página

2. **Errores**
   - Rate limit excedidos (status 429)
   - Errores de validación (status 400)
   - Errores de servidor (status 500)

3. **Uso**
   - Requests por hora
   - Usuarios activos
   - Conversión de trial a pago

---

## 🔐 Seguridad Post-Deployment

### 1. Verificar Headers de Seguridad

```bash
curl -I https://tu-dominio.vercel.app/ | grep -E "Content-Security-Policy|X-Frame-Options|Strict-Transport-Security"

# Debe mostrar:
# Content-Security-Policy: ...
# X-Frame-Options: DENY
# Strict-Transport-Security: max-age=31536000
```

### 2. Scan de Vulnerabilidades

```bash
# Usar herramientas online:
# - https://observatory.mozilla.org/
# - https://securityheaders.com/
```

### 3. Monitorear Rate Limiting

Verificar en logs que los rate limits se aplican correctamente.

---

## 🐛 Troubleshooting

### Problema: Build Falla

**Síntoma**: Error durante `npm run build`

**Solución**:
```bash
# Limpiar caché
rm -rf .next node_modules
npm install
npm run build
```

### Problema: API Retorna 500

**Síntoma**: Errores en llamadas a API

**Solución**:
1. Verificar logs en Vercel
2. Verificar que todas las env vars están configuradas
3. Verificar que Anthropic API key es válida
4. Verificar conexión a Supabase

### Problema: Rate Limit No Funciona

**Síntoma**: Usuarios pueden hacer requests ilimitados

**Solución**:
- Verificar que el código de rate-limiter está correcto
- En producción, considerar migrar a Redis/Vercel KV

### Problema: Stripe Webhook No Funciona

**Síntoma**: Suscripciones no se activan

**Solución**:
1. Verificar webhook URL en Stripe Dashboard
2. Verificar `STRIPE_WEBHOOK_SECRET`
3. Ver logs de Stripe webhook attempts
4. Verificar que endpoint retorna 200 OK

---

## 🔄 Rollback

Si algo sale mal, hacer rollback en Vercel:

1. Ir a Vercel Dashboard → Deployments
2. Encontrar deployment anterior funcional
3. Click en "..." → "Promote to Production"

---

## 📈 Escalabilidad

### Cuando Migrar Rate Limiter a Redis

**Señales**:
- Múltiples instancias de Vercel running
- Rate limits inconsistentes entre requests
- Más de 10K requests/día

**Solución**:
```bash
# Instalar Vercel KV
npm install @vercel/kv

# Actualizar lib/rate-limiter.ts para usar KV
# Ver documentación: https://vercel.com/docs/storage/vercel-kv
```

### Cuando Implementar CDN

**Señales**:
- Usuarios globales
- Assets estáticos pesados
- Tiempos de carga >2s

**Solución**:
- Vercel automáticamente usa CDN
- Para assets adicionales, usar Cloudflare o CloudFront

---

## 📝 Checklist Final

- [ ] Build exitoso en Vercel
- [ ] Todas las env vars configuradas
- [ ] Stripe webhook funcionando
- [ ] Supabase conectado
- [ ] Anthropic API funcionando
- [ ] Tests manuales de flujos críticos
- [ ] Headers de seguridad verificados
- [ ] Rate limiting verificado
- [ ] Monitoreo configurado
- [ ] Dominio custom (si aplica)
- [ ] SSL/HTTPS habilitado
- [ ] Logs verificados
- [ ] Backup plan definido

---

## 🎉 Post-Deployment

1. **Anunciar lanzamiento** (redes sociales, email, etc.)
2. **Monitorear primeras 24 horas** intensivamente
3. **Recopilar feedback** de usuarios
4. **Crear issues** en GitHub para mejoras
5. **Planificar v1.2.0**

---

## 📞 Soporte

Si tienes problemas durante deployment:

1. Revisar logs de Vercel
2. Revisar esta guía
3. Abrir issue en GitHub
4. Email: dev@testcraft-ai.com

---

**Última actualización**: 2025-01-23
**Versión**: 1.1.0
