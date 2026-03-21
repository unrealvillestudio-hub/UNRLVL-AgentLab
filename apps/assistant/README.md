# UNRLVL Assistant

Asistente conversacional de Unreal>ille Studio para onboarding e infraestructura digital de clientes.

**Stack:** React 18 + TypeScript + Vite + Vercel Serverless Functions  
**Deploy:** Vercel (URL genérica primero → subdominio `asistente.unrealvillestudio.com` cuando se valide)

---

## Configuración en Vercel

### Variables de entorno (requeridas)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `ANTHROPIC_API_KEY` | API key de Anthropic | `sk-ant-...` |
| `ACCESS_TOKENS` | Tokens de acceso con expiración | ver abajo |

### Formato de ACCESS_TOKENS

```
CODIGO1:NombreCliente:YYYY-MM-DD,CODIGO2:OtroCliente:YYYY-MM-DD
```

Ejemplo:
```
ALPHA7K:Patricia Osorio:2026-04-04,BETA9X:Laura Rodriguez:2026-04-21
```

- Los códigos son case-insensitive
- Para revocar: eliminar la entrada
- Para extender: cambiar la fecha
- Sin base de datos — gestión 100% por variable de entorno

---

## Deploy

```bash
# Instalar dependencias
npm install

# Desarrollo local
npm run dev

# Build
npm run build

# Deploy a Vercel
vercel --prod
```

---

## Arquitectura

```
/api/chat.ts          ← Serverless function: valida token + llama Anthropic API
/src/App.tsx          ← React app: TokenGate + Chat UI
```

- API key nunca expuesta al cliente
- Token validado en cada request (serverless, sin estado)
- Sistema de prompt completo embebido en el serverless function
- sessionStorage para persistir sesión dentro del tab

---

## Scope del asistente

El asistente cubre únicamente:
- Onboarding a redes sociales (Meta, Instagram, TikTok, WhatsApp Business API)
- Creación correcta de cuentas, Business Manager, System Users
- Gestión de correos y aliases por plataforma
- Acceso de agencia sin comprometer credenciales del cliente
- Compliance de contenido por categoría
- Gestión de incidencias y suspensiones
- Operación desde otro país sin riesgo
