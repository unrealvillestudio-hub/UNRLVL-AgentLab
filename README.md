# UNRLVL AgentLab — Unreal>ille Studio

Suite orquestadora de Labs AI del ecosistema Unreal>ille Studio.

**Live AgentLab:** [https://unrlvl-agent-lab.vercel.app](https://unrlvl-agent-lab.vercel.app)
**Contexto completo del ecosistema:** [`CoreProject/CONTEXT.md`](https://github.com/unrealvillestudio-hub/CoreProject/blob/main/CONTEXT.md)

---

## Estructura del repo

Este repo tiene dos capas:

```
AgentLab/
├── src/                    ← App principal: orquestador interno de todos los Labs
├── apps/
│   ├── assistant/          ← Social Media Agent (agente standalone #1)
│   └── [próximos agentes]
└── README.md
```

### Capa 1 — AgentLab (root)
App React/TypeScript interna que orquesta todos los Labs. Acceso restringido al equipo.
Proyecto Vercel: `unrlvl-agent-lab` → URL permanente: `unrlvl-agent-lab.vercel.app`

### Capa 2 — apps/ (agentes standalone)
Cada subdirectorio en `apps/` es un agente independiente con su propio proyecto Vercel.
Un push al repo actualiza todos los proyectos simultáneamente.

**Convención de naming:**
- Directorio: `apps/[nombre-kebab]/`
- Proyecto Vercel: `unrlvl-[nombre]`
- URL permanente: `unrlvl-[nombre].vercel.app`

---

## Agentes en producción

| Agente | Directorio | Proyecto Vercel | URL permanente | Audiencia |
|--------|-----------|-----------------|----------------|-----------|
| Social Media Agent | `apps/assistant/` | `unrlvl-social-agent` | `unrlvl-social-agent.vercel.app` | Equipo + clientes seleccionados |

---

## Cómo crear un nuevo agente

1. Crear directorio: `apps/[nombre]/`
2. Copiar estructura base de `apps/assistant/` (package.json, vite.config.ts, vercel.json, src/, api/)
3. Adaptar `api/chat.js` — cambiar SYSTEM_PROMPT al dominio del nuevo agente
4. Push al repo
5. En Vercel → **Add New Project** → mismo repo → **Root Directory**: `apps/[nombre]` → añadir variables de entorno → Deploy
6. El proyecto queda con URL permanente propia. Documentar en esta tabla.

**Variables de entorno por agente (en cada proyecto Vercel):**

| Variable | Descripción |
|---|---|
| `ANTHROPIC_API_KEY` | API key de Anthropic |
| `ACCESS_TOKENS` | `CODIGO:Nombre:YYYY-MM-DD` separados por coma |

Gestión de accesos: editar `ACCESS_TOKENS` en Vercel Settings → Save. Sin redeploy. Aplica en el siguiente request.

---

## Arquitectura de acceso (todos los agentes)

- Acceso por token con fecha de expiración — sin login, sin registro
- Token validado en cada request en el serverless (API key nunca expuesta al cliente)
- sessionStorage para persistir sesión dentro del tab
- UI: pantalla de acceso → chat conversacional con system prompt del dominio

---

## AgentLab principal — Stack

- React 18 + TypeScript + Vite + Tailwind
- AI: Gemini 2.0 Flash (Gemini API)
- State: Zustand
- Deploy: Vercel

## Agentes standalone — Stack

- React 18 + TypeScript + Vite
- AI: Claude Sonnet (Anthropic API via serverless Vercel)
- Deploy: Vercel (proyecto independiente por agente)

---

## Labs incluidos en AgentLab principal

| Lab | Descripción | Estado |
|-----|-------------|--------|
| WebLab | Generador web HTML/Liquid | ✅ v2.6 |
| BlogLab | Posts educativo/SEO/producto/UGC | ✅ v1.0 |
| CopyLab | Ads, emails, captions | ✅ v1.1 |
| SocialLab | Copy + scheduling redes sociales | ✅ v1.1 |
| VideoLab | Storyboards y guiones | ✅ v1.1 |
| ImageLab | Prompt packs para imagen | 🟡 En desarrollo |
| VoiceLab | Scripts de voz y audio | 🟡 En desarrollo |
| BlueprintLab | Creación y validación de BPs | ✅ v1.2 |
| Orchestrator | Planner de flujos multi-Lab | ✅ v1.1 |

---

## Marcas activas

| ID | Marca | Mercado |
|----|-------|---------|
| `neuroneCosmetics` | Neurone Cosmética | Miami B2C + B2B profesional |
| `patriciaOsorioVizosSalon` | Vizos Salón | Miami / South Dade |
| `vizosCosmetics` | Vizos Cosmetics | Miami |
| `d7Herbal` | D7Herbal | Miami / exportación |
| `forumPhs` | ForumPHs | Panamá — Admin. Propiedad Horizontal |

---

## Desarrollo local

```bash
# AgentLab principal
npm install
cp .env.example .env.local  # añade VITE_GEMINI_API_KEY
npm run dev

# Agente standalone (ej: Social Media Agent)
cd apps/assistant
npm install
cp .env.example .env.local  # añade ANTHROPIC_API_KEY + ACCESS_TOKENS
npm run dev
```

---

## Changelog

| Fecha | Cambio |
|---|---|
| 2026-03-21 | Social Media Agent v1.0 — `apps/assistant/` · arquitectura multi-agente documentada |
| 2026-03-20 | README actualizado · ForumPHs añadido a marcas activas |
| — | Orchestrator v1.1 · Suite completa 9 Labs |
