# UNRLVL AgentLab

Suite de herramientas de producción AI para el ecosistema UNRLVL Studio.
Aplicación React/TypeScript desplegada en Vercel.

**Live:** [https://unrlvl-agent-lab.vercel.app](https://unrlvl-agent-lab.vercel.app)

---

## Labs incluidos

| Lab | Descripción | Estado |
|-----|-------------|--------|
| **WebLab** | Generador de copy web — Markdown / HTML / Liquid | ✅ v2.0 |
| **BlogLab** | Generador de posts (Educativo / SEO / Producto / UGC) | ✅ v1.0 |
| **CopyLab** | Copy para ads, emails, captions | ✅ v1.1 |
| **SocialLab** | Copy + scheduling para redes sociales | ✅ v1.1 |
| **VideoLab** | Storyboards y guiones visuales | ✅ v1.1 |
| **ImageLab** | Generación de prompts para imagen | 🟡 En desarrollo |
| **VoiceLab** | Scripts y audio | 🟡 En desarrollo |
| **BlueprintLab** | PersonBlueprints + LocationBlueprints | ✅ v1.0 |
| **Orchestrator** | Planner de flujos multi-Lab | ✅ v1.1 |

---

## Stack

- **Framework:** React 18 + TypeScript
- **State:** Zustand
- **AI:** Gemini 2.0 Flash (Gemini API)
- **Build:** Vite
- **Deploy:** Vercel
- **Estilos:** Tailwind CSS

---

## Capas transversales

### Humanize Layer (F2.5)
Capa de autenticidad inyectada en todos los engines. Todo output del ecosistema
debe sentirse hecho por humanos para humanos.

- **Fuente:** `src/config/humanizeConfig.ts`
- **Fallback chain:** `BP_PERSON.humanize.[medio]` → `BRAND_HUMANIZE_OVERRIDES[brandId]` → `HUMANIZE_DEFAULTS`
- **DB_VARIABLES:** pestaña HUMANIZE en `DB_VARIABLES_v6_4.xlsx`

### DB_VARIABLES
Fuente de verdad para datos de marca, personas, contextos y CTAs.
Versión actual: **v6.4**

---

## Marcas activas

| ID | Marca | Mercado |
|----|-------|---------|
| `neuroneCosmetics` | Neurone Cosmética | Miami B2C + B2B profesional |
| `patriciaOsorioVizosSalon` | Vizos Salón | Miami / South Dade |
| `diamondDetails` | Diamond Details | Miami auto detailing |
| `d7Herbal` | D7Herbal | Miami / exportación |
| `vizosCosmetics` | Vizos Cosmetics | Miami |
| + 5 más | — | — |

---

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # añade VITE_GEMINI_API_KEY
npm run dev
```

---

## Repositorios del ecosistema

| Repo | Descripción |
|------|-------------|
| [UNRLVL-AgentLab](https://github.com/unrealvillestudio-hub/UNRLVL-AgentLab) | Este repo — app suite |
| [UNRLVL-Shopify](https://github.com/unrealvillestudio-hub/UNRLVL-Shopify) | Custodia de assets web (Liquid / HTML / MD) |

---

*UNRLVL Studio — Miami, FL*
