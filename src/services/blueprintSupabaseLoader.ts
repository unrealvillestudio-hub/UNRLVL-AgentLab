/**
 * blueprintSupabaseLoader.ts — AgentLab Builder
 *
 * Reemplaza el IndexedDB de la BlueprintLibrary del Builder con lecturas
 * directas a Supabase. Los blueprints (personas, locaciones, productos)
 * ahora vienen de las tablas de producción del ecosistema.
 *
 * Coloca este archivo en: src/services/blueprintSupabaseLoader.ts
 *
 * CÓMO INTEGRAR EN EL BUILDER:
 *
 * Busca el componente BlueprintLibrary (o similar) y reemplaza las llamadas
 * a IndexedDB con los hooks exportados aquí.
 *
 * Antes (IndexedDB):
 *   const blueprints = await db.getAll('blueprints');
 *
 * Después (Supabase):
 *   const { persons, locations, products } = await loadAllBlueprints(brandId);
 *
 * PATTERN: mismo fetch nativo usado en agentLabLoader.ts (sin SDK).
 */

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL  ?? '';
const SUPABASE_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY ?? '';

const SB_HEADERS = {
  'apikey':        SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type':  'application/json',
};

// ── TYPES (aligned with Supabase schema) ─────────────────────────────────────

export interface PersonBlueprint {
  id:                   string;
  brand_id:             string;
  blueprint_id:         string | null;
  schema_version:       string;
  display_name:         string;
  role_default:         string | null;
  status:               string;
  imagelab_description: string | null;
  imagelab_style:       string | null;
  imagelab_realism:     string | null;
  imagelab_film_look:   string | null;
  imagelab_lens:        string | null;
  imagelab_dof:         string | null;
  speaking_style:       string | null;
  expertise:            string | null;
  compliance_notes:     string | null;
  compatible_archetypes: string[] | null;
  has_reference_photos: boolean;
  reference_photos:     any | null;
  active:               boolean;
}

export interface LocationBlueprint {
  id:                   string;
  brand_id:             string;
  blueprint_id:         string | null;
  schema_version:       string;
  display_name:         string;
  location_type:        string | null;
  city:                 string | null;
  country:              string | null;
  status:               string;
  visual_description:   string | null;
  lighting:             string | null;
  imagelab_realism:     string | null;
  imagelab_film_look:   string | null;
  imagelab_lens:        string | null;
  imagelab_prompt:      string | null;
  videolab_prompt:      string | null;
  compatible_archetypes: any | null;
  has_reference_photos: boolean;
  active:               boolean;
}

export interface ProductBlueprint {
  id:                string;
  brand_id:          string;
  schema_version:    string;
  sku:               string | null;
  name:              string;
  category:          string | null;
  subcategory:       string | null;
  tagline:           string | null;
  description_short: string | null;
  description_long:  string | null;
  lifestyle_context: string | null;
  has_reference_photos: boolean;
  reference_photos:  any | null;
  active:            boolean;
  is_variant:        boolean;
}

export interface AllBlueprints {
  persons:   PersonBlueprint[];
  locations: LocationBlueprint[];
  products:  ProductBlueprint[];
  error:     string | null;
}

// ── LOADERS ───────────────────────────────────────────────────────────────────

async function sbFetch<T>(path: string): Promise<T[]> {
  if (!SUPABASE_URL) return [];
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: SB_HEADERS });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

/**
 * Carga todos los blueprints del ecosystem (sin filtrar por marca).
 * Útil para el Blueprint Picker del Agent Builder.
 */
export async function loadAllBlueprints(): Promise<AllBlueprints> {
  const [persons, locations, products] = await Promise.all([
    sbFetch<PersonBlueprint>(
      'person_blueprints?active=eq.true&order=brand_id.asc,display_name.asc' +
      '&select=id,brand_id,blueprint_id,schema_version,display_name,role_default,' +
      'status,imagelab_description,imagelab_style,imagelab_realism,speaking_style,' +
      'expertise,compliance_notes,compatible_archetypes,has_reference_photos,active'
    ),
    sbFetch<LocationBlueprint>(
      'location_blueprints?active=eq.true&order=brand_id.asc,display_name.asc' +
      '&select=id,brand_id,blueprint_id,schema_version,display_name,location_type,' +
      'city,country,status,visual_description,lighting,imagelab_realism,' +
      'imagelab_film_look,imagelab_prompt,videolab_prompt,compatible_archetypes,' +
      'has_reference_photos,active'
    ),
    sbFetch<ProductBlueprint>(
      'product_blueprints?active=eq.true&is_variant=eq.false&order=brand_id.asc,name.asc' +
      '&select=id,brand_id,schema_version,sku,name,category,subcategory,tagline,' +
      'description_short,description_long,lifestyle_context,has_reference_photos,active,is_variant'
    ),
  ]);

  return { persons, locations, products, error: null };
}

/**
 * Carga blueprints filtrados por marca.
 * Útil cuando el Builder está en contexto de una marca específica.
 */
export async function loadBlueprintsByBrand(brandId: string): Promise<AllBlueprints> {
  if (!brandId) return { persons: [], locations: [], products: [], error: 'brandId requerido' };

  const enc = encodeURIComponent(brandId);
  const [persons, locations, products] = await Promise.all([
    sbFetch<PersonBlueprint>(
      `person_blueprints?brand_id=eq.${enc}&active=eq.true&order=display_name.asc` +
      `&select=id,brand_id,blueprint_id,schema_version,display_name,role_default,` +
      `status,imagelab_description,speaking_style,expertise,compatible_archetypes,` +
      `has_reference_photos,active`
    ),
    sbFetch<LocationBlueprint>(
      `location_blueprints?brand_id=eq.${enc}&active=eq.true&order=display_name.asc` +
      `&select=id,brand_id,blueprint_id,schema_version,display_name,location_type,` +
      `city,country,visual_description,imagelab_prompt,videolab_prompt,compatible_archetypes,active`
    ),
    sbFetch<ProductBlueprint>(
      `product_blueprints?brand_id=eq.${enc}&active=eq.true&is_variant=eq.false&order=name.asc` +
      `&select=id,brand_id,schema_version,sku,name,category,tagline,description_short,` +
      `lifestyle_context,active`
    ),
  ]);

  return { persons, locations, products, error: null };
}

// ── REACT HOOK ────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';

/**
 * useBlueprintLibrary hook
 * Reemplaza el hook que usaba IndexedDB.
 * 
 * Uso:
 *   const { blueprints, loading, refresh } = useBlueprintLibrary();
 *   // o filtrado por marca:
 *   const { blueprints, loading } = useBlueprintLibrary('NeuroneSCF');
 */
export function useBlueprintLibrary(brandId?: string) {
  const [blueprints, setBlueprints] = useState<AllBlueprints>({
    persons: [], locations: [], products: [], error: null
  });
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0); // for refresh

  useEffect(() => {
    setLoading(true);
    const loader = brandId ? loadBlueprintsByBrand(brandId) : loadAllBlueprints();
    loader.then(data => {
      setBlueprints(data);
      setLoading(false);
    });
  }, [brandId, version]);

  return {
    blueprints,
    loading,
    /** Re-fetch from Supabase */
    refresh: () => setVersion(v => v + 1),
    /** Summary counts */
    counts: {
      persons:   blueprints.persons.length,
      locations: blueprints.locations.length,
      products:  blueprints.products.length,
      total:     blueprints.persons.length + blueprints.locations.length + blueprints.products.length,
    }
  };
}

// ── INDEXEDDB MIGRATION HELPER ────────────────────────────────────────────────

/**
 * Si el Builder tenía datos en IndexedDB que se deben preservar,
 * este helper los migra a Supabase una sola vez.
 *
 * NOTA: Sólo es necesario si hay agentes configurados localmente.
 * Los blueprints de producción ya están en Supabase desde el sprint anterior.
 * Los agentes ya migraron a agentLabLoader.ts.
 * IndexedDB se puede deprecar sin migración de datos en este caso.
 *
 * Si hay datos locales de prueba en IndexedDB del builder,
 * el equipo puede exportarlos manualmente desde DevTools → Application → IndexedDB.
 */
export const INDEXEDDB_DEPRECATION_NOTE = `
IndexedDB deprecado en AgentLab Builder v2.0.
La BlueprintLibrary ahora lee directamente desde Supabase.
Los datos de agentes se guardan en la tabla 'agents' (agentLabLoader.ts).
Los blueprints (personas, locaciones, productos) vienen de las tablas de producción.
No hay datos de usuario en IndexedDB que necesiten migración — los blueprints
de producción ya están en Supabase desde la sesión 2026-04-04.
`;
