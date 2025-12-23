# TestCraft AI - Developer Guide

Guía completa para desarrolladores que trabajen en el proyecto TestCraft AI.

## 📋 Tabla de Contenidos

- [Setup Local](#setup-local)
- [Arquitectura](#arquitectura)
- [Variables de Entorno](#variables-de-entorno)
- [Scripts Disponibles](#scripts-disponibles)
- [Testing](#testing)
- [Deployment](#deployment)
- [Mejores Prácticas](#mejores-prácticas)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Setup Local

### Prerequisitos

- Node.js 18+ (recomendado: 20+)
- npm o yarn
- Cuenta de Supabase (gratis)
- API Key de Anthropic Claude
- Cuenta de Stripe (modo test)

### Instalación

1. **Clonar repositorio**
```bash
git clone https://github.com/mescobar996/testcraft-ai.git
cd testcraft-ai-fresh
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales reales. Ver sección [Variables de Entorno](#variables-de-entorno).

4. **Configurar Supabase**

Crea las siguientes tablas en tu proyecto de Supabase:

```sql
-- Tabla de usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  plan TEXT DEFAULT 'free',
  max_usage INTEGER DEFAULT 20,
  current_usage INTEGER DEFAULT 0,
  usage_reset_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de generaciones
CREATE TABLE generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  requirement TEXT NOT NULL,
  context TEXT,
  result JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de suscripciones
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT,
  plan_id TEXT,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de integraciones
CREATE TABLE user_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  integration_type TEXT NOT NULL,
  config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

---

## 🏗️ Arquitectura

### Estructura de Carpetas

```
testcraft-ai-fresh/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes (Backend)
│   │   ├── generate/         # Generación de casos de prueba
│   │   ├── generate-from-image/
│   │   ├── auth/             # Autenticación
│   │   ├── stripe/           # Pagos
│   │   └── integrations/     # Integraciones terceros
│   ├── auth/                 # Páginas de autenticación
│   ├── layout.tsx            # Layout raíz
│   └── page.tsx              # Home principal
├── components/               # Componentes React
│   ├── ui/                   # Componentes base
│   └── [Features]            # Componentes de funcionalidades
├── lib/                      # Utilidades y lógica
│   ├── constants.ts          # Constantes centralizadas
│   ├── validations.ts        # Esquemas Zod
│   ├── logger.ts             # Sistema de logging
│   ├── rate-limiter.ts       # Rate limiting
│   ├── cache.ts              # Sistema de caché
│   ├── auth-context.tsx      # Contexto de autenticación
│   ├── theme-context.tsx     # Contexto de tema
│   └── language-context.tsx  # Contexto i18n
├── cypress/                  # Tests E2E
├── __tests__/                # Tests unitarios
└── public/                   # Archivos estáticos
```

### Flujo de Datos

```
Usuario → Componente UI → API Route → Validación Zod → Rate Limiter → Caché Check → Anthropic AI → Respuesta → Usuario
```

### Tecnologías Clave

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **IA**: Anthropic Claude Sonnet 4
- **Pagos**: Stripe
- **Estilos**: Tailwind CSS
- **Validación**: Zod
- **Testing**: Jest + Cypress
- **UI Components**: Radix UI

---

## 🔑 Variables de Entorno

### Variables Requeridas

| Variable | Descripción | Dónde Obtenerla |
|----------|-------------|-----------------|
| `ANTHROPIC_API_KEY` | API key de Claude | [console.anthropic.com](https://console.anthropic.com/settings/keys) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL de Supabase | Dashboard de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase | Dashboard de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | Dashboard de Supabase (¡SECRET!) |
| `STRIPE_SECRET_KEY` | Stripe secret key | [dashboard.stripe.com](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Dashboard de Stripe |

### Variables Opcionales

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID |
| `NEXT_PUBLIC_CLARITY_ID` | Microsoft Clarity ID |
| `NEXT_PUBLIC_HOTJAR_ID` | Hotjar Site ID |

Ver `.env.example` para la lista completa.

---

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev                # Iniciar servidor de desarrollo
npm run build              # Build para producción
npm start                  # Iniciar servidor de producción

# Code Quality
npm run lint               # Linter ESLint
npm run type-check         # Verificar tipos TypeScript (agregar este script)

# Testing
npm test                   # Ejecutar tests unitarios (Jest)
npm run test:watch         # Tests en modo watch
npm run test:coverage      # Reporte de cobertura
npm run cypress            # Abrir Cypress GUI
npm run cypress:run        # Ejecutar Cypress headless
npm run test:e2e           # Tests E2E completos (con servidor)

# Utilidades
npm run format             # Formatear código con Prettier (agregar)
npm run clean              # Limpiar node_modules y caché
```

---

## 🧪 Testing

### Tests Unitarios (Jest)

Los tests están en `__tests__/`

```bash
# Ejecutar todos los tests
npm test

# Ejecutar test específico
npm test RegisterForm

# Coverage
npm run test:coverage
```

**Objetivo de cobertura**: 80% (configurado en jest.config.js)

### Tests E2E (Cypress)

Los tests están en `cypress/e2e/`

```bash
# Abrir interfaz de Cypress
npm run cypress

# Ejecutar headless
npm run cypress:run

# Test completo con servidor
npm run test:e2e
```

**Tests E2E disponibles**:
- `auth.cy.ts` - Flujos de autenticación
- `test-generation.cy.ts` - Generación de casos
- `billing.cy.ts` - Suscripciones y pagos

### Escribir Nuevos Tests

Ejemplo de test unitario:

```typescript
// __tests__/components/MyComponent.test.tsx
import { render, screen } from '@testing-library/react'
import MyComponent from '@/components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

---

## 🚀 Deployment

### Vercel (Recomendado)

1. **Conectar repositorio a Vercel**
   - Ir a [vercel.com](https://vercel.com)
   - Importar proyecto de GitHub

2. **Configurar variables de entorno**
   - En Vercel Dashboard → Settings → Environment Variables
   - Copiar todas las variables de `.env.example`

3. **Deploy automático**
   - Cada push a `main` despliega automáticamente

### Variables de Entorno en Producción

Asegúrate de configurar en Vercel:
- ✅ Todas las variables `NEXT_PUBLIC_*`
- ✅ `ANTHROPIC_API_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET`

### Webhook de Stripe

1. Crear webhook en Stripe Dashboard
2. URL: `https://tu-dominio.vercel.app/api/stripe/webhook`
3. Eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

---

## ✅ Mejores Prácticas

### Código

1. **Usar constantes centralizadas**
   ```typescript
   import { LIMITS, ERROR_MESSAGES } from '@/lib/constants'
   ```

2. **Validar siempre con Zod**
   ```typescript
   import { GenerateRequestSchema } from '@/lib/validations'
   const validated = GenerateRequestSchema.parse(data)
   ```

3. **Logging apropiado**
   ```typescript
   import { logger, logError } from '@/lib/logger'
   logger.info('context', 'message', { metadata })
   logError('context', error)
   ```

4. **Evitar código duplicado**
   - Extraer lógica compartida a `lib/`
   - Reutilizar componentes UI

### Seguridad

1. ❌ **NUNCA** expongas API keys en cliente
2. ✅ Usa `NEXT_PUBLIC_` solo para variables públicas
3. ✅ Valida todas las entradas con Zod
4. ✅ Implementa rate limiting en todas las APIs
5. ✅ Sanitiza datos antes de enviarlos a la IA

### Performance

1. Usa caché para respuestas de IA
2. Implementa lazy loading de componentes
3. Optimiza imágenes con `next/image`
4. Minimiza re-renders con `useMemo` y `useCallback`

---

## 🐛 Troubleshooting

### Problemas Comunes

**Error: "Missing environment variable"**
```bash
# Solución: Verificar que .env.local existe y tiene todas las variables
cp .env.example .env.local
# Editar .env.local con valores reales
```

**Error: "Supabase connection failed"**
```bash
# Verificar que las credenciales de Supabase son correctas
# Verificar que las tablas están creadas
```

**Tests fallan**
```bash
# Limpiar caché y reinstalar
rm -rf node_modules .next
npm install
npm test
```

**Build falla en Vercel**
```bash
# Verificar que todas las variables de entorno están configuradas
# Revisar logs de Vercel para el error específico
```

### Logs y Debugging

```bash
# Ver logs estructurados
npm run dev
# Los logs aparecen en consola con formato JSON

# En producción, revisar logs en Vercel Dashboard
```

---

## 📚 Recursos Adicionales

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Anthropic Claude Docs](https://docs.anthropic.com/)
- [Stripe Docs](https://stripe.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

## 👥 Contribuir

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

**Estándares de código**:
- TypeScript estricto
- ESLint sin warnings
- Tests para nuevas features
- Coverage >80%

---

## 📄 Licencia

Ver el archivo LICENSE en la raíz del proyecto.

---

**¿Preguntas?** Abre un issue en GitHub o contacta al equipo de desarrollo.
