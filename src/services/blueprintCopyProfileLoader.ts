/**
 * blueprintCopyProfileLoader.ts — BlueprintLab v1.4
 *
 * Conecta BlueprintLab con brand_copy_profiles en Supabase.
 * Permite que el BP_COPY_1.0 que se crea en BlueprintLab se guarde
 * y sincronice con la tabla brand_copy_profiles que CopyLab consume.
 *
 * Coloca este archivo en: src/services/blueprintCopyProfileLoader.ts
 *
 * FLUJO:
 *   BlueprintLab crea/edita BP_COPY_1.0
 *   → Se guarda en brand_copy_profiles via upsert
 *   → CopyLab lo lee en la siguiente generación (SMPC Layer 13)
 *   → El ciclo está completo: Blueprint → Copy engine → Output
 *
 * Este archivo cierra el "flujo roto C" del ecosystem_filemap.md:
 *   BlueprintLab crea BP_COPY_1.0 → (antes: export manual) → CopyLab no lo lee
 *   (ahora: upsert automático a Supabase → CopyLab lo lee en Layer 13)
 */

const SUPABASE_URL = (window as any).__SB_URL__  || '';
const SUPABASE_KEY = (window as any).__SB_KEY__ || '';

// BlueprintLab runs in Google AI Studio — uses window globals for env vars
// Alternatively, hardcode temporarily for testing if needed.

const SB_HEADERS = {
  'apikey':        SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type':  'application/json',
  'Prefer':        'return=representation',
};

// ── TYPES ─────────────────────────────────────────────────────────────────────

export interface BP_COPY_1_0 {
  brand_id:                    string;
  display_name:                string;
  schema_version?:             string;
  status?:                     string;
  // Voice
  voice_tone_primary:          string;
  voice_tone_secondary?:       string;
  voice_writing_style:         string;
  voice_pov?:                  string;
  // Language
  language_primary:            string;
  language_geo_default?:       string;
  // Channels
  channels_primary?:           string[];
  channels_secondary?:         string[];
  channels_excluded?:          string[];
  // Style
  style_sentence_length?:      string;
  style_emoji_usage?:          string;
  style_hashtag_style?:        string;
  style_cta_style?:            string;
  style_hooks?:                string[];
  style_signature_phrases?:    string[];
  style_avoid_phrases?:        string[];
  // Compliance
  compliance_rules?:           string;
  compliance_prohibited_words?: string[];
  compliance_required_disclaimers?: string[];
  // Meta
  active?:                     boolean;
}

// ── UPSERT (save BP_COPY to Supabase) ────────────────────────────────────────

/**
 * Guarda o actualiza un BP_COPY_1.0 en brand_copy_profiles.
 * Usa brand_id como PK lógica — un perfil activo por marca.
 * Si ya existe, lo actualiza; si no, lo crea.
 */
export async function saveCopyProfile(profile: BP_COPY_1_0): Promise<{
  success: boolean;
  id?: string;
  error?: string;
}> {
  if (!SUPABASE_URL) {
    return { success: false, error: 'SUPABASE_URL no configurado. Añade window.__SB_URL__ en index.html.' };
  }

  const payload = {
    ...profile,
    id:             `BP_COPY_${profile.brand_id}`,
    schema_version: profile.schema_version ?? 'BP_COPY_1.0',
    status:         profile.status ?? 'active',
    active:         profile.active ?? true,
    updated_at:     new Date().toISOString(),
  };

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/brand_copy_profiles?id=eq.${encodeURIComponent(payload.id)}`,
      {
        method:  'PATCH',
        headers: SB_HEADERS,
        body:    JSON.stringify(payload),
      }
    );

    // If no rows updated (404 / empty), do an INSERT
    if (res.status === 404 || res.status === 200) {
      const updated = await res.json();
      if (!Array.isArray(updated) || updated.length === 0) {
        // Insert new
        const insertRes = await fetch(
          `${SUPABASE_URL}/rest/v1/brand_copy_profiles`,
          {
            method:  'POST',
            headers: SB_HEADERS,
            body:    JSON.stringify(payload),
          }
        );
        if (!insertRes.ok) {
          const err = await insertRes.text();
          return { success: false, error: `Insert failed: ${err}` };
        }
        const inserted = await insertRes.json();
        return { success: true, id: Array.isArray(inserted) ? inserted[0]?.id : inserted?.id };
      }
      return { success: true, id: Array.isArray(updated) ? updated[0]?.id : payload.id };
    }

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `Upsert failed: ${err}` };
    }

    return { success: true, id: payload.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Carga el copy profile activo de una marca.
 * Útil para previsualizar en BlueprintLab antes de exportar.
 */
export async function loadCopyProfile(brandId: string): Promise<BP_COPY_1_0 | null> {
  if (!SUPABASE_URL || !brandId) return null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/brand_copy_profiles?brand_id=eq.${encodeURIComponent(brandId)}&active=eq.true&limit=1`,
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch {
    return null;
  }
}

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * INTEGRATION NOTE FOR BLUEPRINTLAB App.tsx / builder components:
 *
 * 1. Añade en index.html (o en el init del artifact):
 *    window.__SB_URL__ = 'https://amlvyycfepwhiindxgzw.supabase.co';
 *    window.__SB_KEY__ = 'YOUR_ANON_KEY';
 *
 * 2. En el Export handler del BP_COPY_1.0 builder:
 *    import { saveCopyProfile } from './blueprintCopyProfileLoader';
 *    const result = await saveCopyProfile(formData);
 *    if (result.success) {
 *      showToast('BP_COPY guardado en Supabase — CopyLab lo usará en Layer 13');
 *    }
 *
 * 3. Al cargar el editor para editar un perfil existente:
 *    const existing = await loadCopyProfile(selectedBrandId);
 *    if (existing) setFormData(existing);
 * ─────────────────────────────────────────────────────────────────────────────
 */
