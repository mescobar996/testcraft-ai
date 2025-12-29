# 🔵 Guía de Configuración: Mercado Pago

Esta guía te ayudará a configurar Mercado Pago para aceptar pagos en Latinoamérica.

---

## 📋 Índice

1. [Crear cuenta Mercado Pago](#1-crear-cuenta-mercado-pago)
2. [Obtener credenciales (Access Token y Public Key)](#2-obtener-credenciales)
3. [Configurar variables de entorno](#3-configurar-variables-de-entorno)
4. [Configurar en Vercel](#4-configurar-en-vercel)
5. [Probar en modo Test](#5-probar-en-modo-test)
6. [Activar modo Producción](#6-activar-modo-producción)

---

## 1. Crear cuenta Mercado Pago

### Países soportados:
- 🇦🇷 Argentina
- 🇧🇷 Brasil
- 🇲🇽 México
- 🇨🇱 Chile
- 🇨🇴 Colombia
- 🇵🇪 Perú
- 🇺🇾 Uruguay

### Pasos:

1. Ve a: https://www.mercadopago.com/
2. Haz clic en **"Crear cuenta"**
3. Selecciona tu país
4. Completa el formulario de registro:
   - Email
   - Contraseña
   - Datos personales
5. Verifica tu email
6. **Importante**: Selecciona cuenta tipo **"Vendedor"** o **"Empresa"**

---

## 2. Obtener credenciales

### A. Ir al Panel de Desarrolladores

1. Inicia sesión en tu cuenta Mercado Pago
2. Ve a: https://www.mercadopago.com/developers/panel/app
3. Si es tu primera vez, verás un botón **"Crear aplicación"**

### B. Crear una aplicación

1. Haz clic en **"Crear aplicación"**
2. Llena el formulario:
   ```
   Nombre: TestCraft AI
   Descripción: Generador de casos de prueba con IA
   Categoría: Servicios de Software/SaaS
   Modelo de negocio: Suscripciones
   ```
3. Haz clic en **"Crear aplicación"**

### C. Obtener credenciales de TEST

Una vez creada la aplicación, verás dos pestañas: **Producción** y **Pruebas**.

1. **Click en la pestaña "Pruebas"** (Testing credentials)
2. Verás dos credenciales:

#### Access Token (Secreto)
```
APP_USR-1234567890123456-123456-1234567890abcdef1234567890abcdef-1234567890
```
Este es tu `MERCADOPAGO_ACCESS_TOKEN`

#### Public Key (Público)
```
APP_USR-12345678-1234-1234-1234-123456789012
```
Este es tu `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`

### ⚠️ NUNCA compartas tu Access Token

---

## 3. Configurar variables de entorno

### A. En tu proyecto local (.env.local)

Crea o edita `.env.local` en la raíz de tu proyecto:

```bash
# Mercado Pago - CREDENCIALES DE TEST
MERCADOPAGO_ACCESS_TOKEN=APP_USR-1234567890123456-123456-1234567890abcdef1234567890abcdef-1234567890
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-12345678-1234-1234-1234-123456789012
```

Reemplaza con tus credenciales reales.

---

## 4. Configurar en Vercel

### Opción A: Desde el Dashboard de Vercel

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Click en tu proyecto **testcraft-ai**
3. Ve a **Settings** → **Environment Variables**
4. Agrega estas variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `MERCADOPAGO_ACCESS_TOKEN` | `APP_USR-...` (tu access token) | Production + Preview + Development |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | `APP_USR-...` (tu public key) | Production + Preview + Development |

5. Click en **Save**

### Opción B: Desde el CLI de Vercel

Si prefieres usar la terminal:

```bash
# Instalar Vercel CLI (si no lo tienes)
npm install -g vercel

# Login
vercel login

# Agregar variables de entorno
vercel env add MERCADOPAGO_ACCESS_TOKEN
# Pega tu access token cuando te lo pida

vercel env add NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
# Pega tu public key cuando te lo pida
```

### ⚠️ Importante: Redeploy

Después de agregar las variables de entorno:

```bash
# Hacer un redeploy para que las variables se apliquen
vercel --prod
```

O simplemente haz un `git push` y Vercel redesplegará automáticamente.

---

## 5. Probar en modo Test

### Tarjetas de prueba de Mercado Pago

Mercado Pago provee tarjetas de prueba que puedes usar:

#### ✅ Pago Aprobado
```
Número: 5031 4332 1540 6351
CVV: 123
Fecha de vencimiento: Cualquier fecha futura (ej: 11/25)
Nombre: APRO
```

#### ❌ Pago Rechazado
```
Número: 5031 4332 1540 6351
CVV: 123
Fecha de vencimiento: Cualquier fecha futura
Nombre: OTHE
```

#### 📝 Más tarjetas de prueba
- https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards
- https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/test-cards
- https://www.mercadopago.com.mx/developers/es/docs/checkout-pro/additional-content/test-cards

### Probar el flujo:

1. Ve a tu app local: `http://localhost:3000/billing`
2. Selecciona un plan (Pro o Enterprise)
3. Click en **"Pagar con Mercado Pago"** (cuando esté implementado)
4. Usa una de las tarjetas de prueba de arriba
5. Verifica que el pago se procese correctamente

---

## 6. Activar modo Producción

⚠️ **SOLO cuando estés listo para aceptar pagos reales**

### A. Verificar tu cuenta

Antes de poder usar credenciales de producción:

1. Ve a: https://www.mercadopago.com/mlm/account/credentials (cambia `mlm` por tu código de país)
2. Completa la verificación de identidad:
   - Sube documento de identidad (INE, DNI, RUT, etc.)
   - Proporciona información fiscal
   - Agrega datos bancarios para recibir pagos

### B. Obtener credenciales de PRODUCCIÓN

1. Ve nuevamente al panel: https://www.mercadopago.com/developers/panel/app
2. Selecciona tu aplicación
3. **Click en la pestaña "Producción"** (Production credentials)
4. Copia las credenciales de producción:
   - `Access Token` (Production)
   - `Public Key` (Production)

### C. Reemplazar credenciales

**En .env.local:**
```bash
# Reemplazar con credenciales de PRODUCCIÓN
MERCADOPAGO_ACCESS_TOKEN=APP_USR-XXXX-PROD-XXXX
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-XXXX-PROD-XXXX
```

**En Vercel:**
1. Settings → Environment Variables
2. Edita `MERCADOPAGO_ACCESS_TOKEN` y pega el token de producción
3. Edita `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` y pega la public key de producción
4. **Redeploy** tu app

---

## 📊 Monitorear pagos

### Dashboard de Mercado Pago

- **Ventas**: https://www.mercadopago.com/activities
- **Reportes**: https://www.mercadopago.com/balance/reports
- **Devoluciones**: Puedes hacer refunds desde el panel

### Webhooks (Próximamente)

Los webhooks de Mercado Pago te notificarán cuando:
- Un pago se complete ✅
- Un pago falle ❌
- Una suscripción se cancele 🔴
- Un reembolso se procese 💰

Configurarás la URL del webhook en:
```
https://tu-dominio.vercel.app/api/mercadopago/webhook
```

---

## 🔐 Seguridad

### ✅ DO:
- Usa HTTPS en producción (Vercel lo hace por defecto)
- Guarda el Access Token como secreto en Vercel
- Valida los webhooks con firma HMAC
- Usa credenciales de TEST durante desarrollo

### ❌ DON'T:
- **NUNCA** commits `.env.local` a GitHub
- **NUNCA** expongas el Access Token en el cliente
- **NUNCA** uses credenciales de producción en local

---

## 🆘 Soporte

### Documentación oficial:
- https://www.mercadopago.com/developers/es/docs
- https://www.mercadopago.com/developers/es/reference

### FAQ:
- **¿Cuánto tarda la aprobación de cuenta?** Generalmente 24-48 horas
- **¿Cuáles son las comisiones?** Varían por país (aprox 4-6%)
- **¿Puedo recibir pagos internacionales?** Sí, pero el comprador debe tener cuenta en el mismo país

---

## ✅ Checklist de verificación

Antes de ir a producción:

- [ ] Cuenta Mercado Pago creada y verificada
- [ ] Credenciales de TEST funcionando en local
- [ ] Credenciales de TEST configuradas en Vercel Preview
- [ ] Flujo de pago probado con tarjetas de prueba
- [ ] Webhooks implementados y probados
- [ ] Cuenta verificada con documentos
- [ ] Credenciales de PRODUCCIÓN obtenidas
- [ ] Variables de entorno de producción actualizadas en Vercel
- [ ] Primer pago de prueba real exitoso

---

**¿Listo para continuar?**

Una vez que hayas completado este setup, el siguiente paso será implementar las rutas API:
- `/api/mercadopago/checkout/route.ts`
- `/api/mercadopago/webhook/route.ts`

¡Avísame cuando tengas las credenciales listas! 🚀
