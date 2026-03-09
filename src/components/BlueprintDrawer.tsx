// ─── Blueprint Drawer ──────────────────────────────────────────────────────────
// Drawer lateral global. Accesible desde cualquier módulo via botón en topbar.
// Permite ver librería, asignar slots y copiar contexto para herramientas externas.

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBlueprintStore } from '../store/blueprintStore';
import { SLOT_META, type BPType, type BlueprintEntry, type SlotId } from '../lib/blueprintDB';

// ─── Tipos ─────────────────────────────────────────────────────────────────────
type Tab = 'library' | 'slots';

// ─── Constantes visuales ───────────────────────────────────────────────────────
const TYPE_COLOR: Record<BPType, { badge: string; dot: string; ring: string }> = {
  BP_PERSON:   { badge: 'bg-blue-500/15 text-blue-300',   dot: 'bg-blue-400',    ring: 'ring-blue-500/40' },
  BP_LOCATION: { badge: 'bg-emerald-500/15 text-emerald-300', dot: 'bg-emerald-400', ring: 'ring-emerald-500/40' },
  BP_PRODUCT:  { badge: 'bg-amber-500/15 text-amber-300', dot: 'bg-amber-400',   ring: 'ring-amber-500/40' },
};

const TYPE_ICON: Record<BPType, string> = {
  BP_PERSON: '👤',
  BP_LOCATION: '📍',
  BP_PRODUCT: '📦',
};

const TYPE_LABEL: Record<BPType, string> = {
  BP_PERSON: 'Persona',
  BP_LOCATION: 'Locación',
  BP_PRODUCT: 'Producto',
};

const SLOT_COLORS: Record<string, { border: string; bg: string; label: string }> = {
  A:  { border: 'border-blue-500/50',    bg: 'bg-blue-500/8',    label: 'text-blue-300' },
  B:  { border: 'border-blue-400/30',    bg: 'bg-blue-400/5',    label: 'text-blue-400/70' },
  C:  { border: 'border-amber-500/50',   bg: 'bg-amber-500/8',   label: 'text-amber-300' },
  D:  { border: 'border-amber-400/30',   bg: 'bg-amber-400/5',   label: 'text-amber-400/70' },
  L:  { border: 'border-emerald-500/50', bg: 'bg-emerald-500/8', label: 'text-emerald-300' },
  R1: { border: 'border-purple-500/30',  bg: 'bg-purple-500/5',  label: 'text-purple-400/70' },
  R2: { border: 'border-purple-500/30',  bg: 'bg-purple-500/5',  label: 'text-purple-400/70' },
  R3: { border: 'border-purple-500/30',  bg: 'bg-purple-500/5',  label: 'text-purple-400/70' },
};

// ─── Componente BPCard mini (dentro del drawer) ────────────────────────────────
function BPCardMini({
  bp,
  activeSlot,
  occupiedSlots,
  onAssign,
}: {
  bp: BlueprintEntry;
  activeSlot: SlotId | null;
  occupiedSlots: Partial<Record<SlotId, string>>; // slotId → bp.id asignado
  onAssign: (slotId: SlotId) => void;
}) {
  const c = TYPE_COLOR[bp.type];
  const [showSlotPicker, setShowSlotPicker] = useState(false);

  // Slots compatibles con el tipo de este BP
  const compatibleSlots = (Object.entries(SLOT_META) as [SlotId, typeof SLOT_META[SlotId]][])
    .filter(([, meta]) => meta.accepts.includes(bp.type))
    .map(([id]) => id);

  const assignedToSlot = (Object.entries(occupiedSlots) as [SlotId, string][])
    .find(([, bpId]) => bpId === bp.id)?.[0];

  return (
    <div className={`relative rounded-xl border border-white/8 bg-[#0d0d14] p-3 transition-all hover:border-white/15 ${assignedToSlot ? 'ring-1 ' + c.ring : ''}`}>
      {/* Header */}
      <div className="flex items-start gap-2 mb-2">
        <span className="text-base flex-shrink-0">{TYPE_ICON[bp.type]}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate leading-tight">{bp.name}</p>
          <p className="text-[10px] text-white/30 truncate">{bp.brandId}</p>
        </div>
        {assignedToSlot && (
          <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-md bg-[#FFAB00]/15 text-[#FFAB00] font-bold">
            {assignedToSlot}
          </span>
        )}
      </div>

      {/* Type badge + version */}
      <div className="flex items-center gap-1.5 mb-3">
        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${c.badge}`}>
          {TYPE_LABEL[bp.type]}
        </span>
        <span className="text-[10px] text-white/25">v{bp.version}</span>
      </div>

      {/* Slot picker */}
      {showSlotPicker ? (
        <div className="space-y-1">
          <p className="text-[10px] text-white/40 mb-1.5">Asignar al slot:</p>
          <div className="flex flex-wrap gap-1">
            {compatibleSlots.map((slotId) => {
              const meta = SLOT_META[slotId];
              const sc = SLOT_COLORS[slotId];
              const occupied = occupiedSlots[slotId];
              return (
                <button
                  key={slotId}
                  onClick={() => { onAssign(slotId); setShowSlotPicker(false); }}
                  className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg border transition-all hover:opacity-100 ${sc.border} ${sc.bg} ${sc.label} ${occupied ? 'opacity-60' : 'opacity-90'}`}
                  title={meta.label}
                >
                  <span className="font-bold">{slotId}</span>
                  <span className="hidden sm:inline opacity-70">{meta.label.split(' ')[0]}</span>
                  {occupied && <span className="opacity-50">↺</span>}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setShowSlotPicker(false)}
            className="w-full text-[10px] text-white/30 hover:text-white/60 py-1 transition-colors"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            if (activeSlot && compatibleSlots.includes(activeSlot)) {
              onAssign(activeSlot);
            } else {
              setShowSlotPicker(true);
            }
          }}
          className="w-full text-[10px] py-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white/80 hover:border-white/20 hover:bg-white/5 transition-all"
        >
          {activeSlot && compatibleSlots.includes(activeSlot)
            ? `→ Asignar a Slot ${activeSlot}`
            : 'Asignar slot'}
        </button>
      )}
    </div>
  );
}

// ─── Slot Row ──────────────────────────────────────────────────────────────────
function SlotRow({
  slotId,
  bp,
  onClear,
  onSetActive,
  isActive,
}: {
  slotId: SlotId;
  bp: BlueprintEntry | undefined;
  onClear: () => void;
  onSetActive: () => void;
  isActive: boolean;
}) {
  const meta = SLOT_META[slotId];
  const sc = SLOT_COLORS[slotId];

  return (
    <div
      onClick={onSetActive}
      className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
        isActive ? `${sc.border} ${sc.bg}` : 'border-white/6 hover:border-white/12 hover:bg-white/3'
      }`}
    >
      {/* Slot badge */}
      <div className={`flex-shrink-0 w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold ${sc.border} ${sc.bg} ${sc.label}`}>
        {slotId}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-white/35 leading-tight">{meta.label}</p>
        {bp ? (
          <p className="text-xs font-medium text-white truncate leading-tight">{bp.name}</p>
        ) : (
          <p className="text-xs text-white/20 leading-tight italic">Vacío</p>
        )}
      </div>

      {/* Type dot */}
      {bp && (
        <div className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${TYPE_COLOR[bp.type].dot}`} />
      )}

      {/* Clear */}
      {bp && (
        <button
          onClick={(e) => { e.stopPropagation(); onClear(); }}
          className="flex-shrink-0 text-white/20 hover:text-red-400 transition-colors text-xs leading-none"
          title="Limpiar slot"
        >
          ✕
        </button>
      )}
    </div>
  );
}

// ─── Blueprint Drawer Principal ────────────────────────────────────────────────
export function BlueprintDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const {
    blueprints, slots, loading,
    hydrate, assignSlot, clearSlot, clearAllSlots, getSlotContext,
  } = useBlueprintStore();

  const [tab, setTab] = useState<Tab>('library');
  const [typeFilter, setTypeFilter] = useState<BPType | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [activeSlot, setActiveSlot] = useState<SlotId | null>(null);
  const [copied, setCopied] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => { hydrate(); }, []);

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Filtrar BPs
  const filtered = blueprints.filter((bp) => {
    if (typeFilter !== 'ALL' && bp.type !== typeFilter) return false;
    if (search && !bp.name.toLowerCase().includes(search.toLowerCase()) &&
        !bp.brandId.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Slots activos para quick-display
  const occupiedSlots = Object.fromEntries(
    Object.entries(slots).map(([k, v]) => [k, v?.id])
  ) as Partial<Record<SlotId, string>>;

  const activeSlotCount = Object.keys(slots).length;

  // Copiar contexto al clipboard
  const handleCopyContext = async () => {
    const ctx = getSlotContext();
    if (!ctx) return;
    await navigator.clipboard.writeText(ctx);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 h-screen z-50 w-[380px] bg-[#08080e] border-l border-white/8 flex flex-col shadow-2xl"
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🗂</span>
                <div>
                  <p className="font-display font-bold text-white text-sm leading-tight">Blueprint Library</p>
                  <p className="text-[10px] text-white/30">
                    {blueprints.length} BPs · {activeSlotCount} slot{activeSlotCount !== 1 ? 's' : ''} activo{activeSlotCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-all"
              >
                ✕
              </button>
            </div>

            {/* ── Tabs ── */}
            <div className="flex border-b border-white/8 flex-shrink-0">
              {(['library', 'slots'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2.5 text-xs font-medium transition-all ${
                    tab === t
                      ? 'text-[#FFAB00] border-b-2 border-[#FFAB00]'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {t === 'library' ? `📚 Librería (${blueprints.length})` : `🎯 Slots activos (${activeSlotCount})`}
                </button>
              ))}
            </div>

            {/* ── Contenido ── */}
            <div className="flex-1 overflow-y-auto">
              {tab === 'library' && (
                <div className="p-4 space-y-3">
                  {/* Search + filtros */}
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nombre o marca..."
                    className="w-full bg-[#0d0d14] border border-white/8 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-[#FFAB00]/30"
                  />

                  <div className="flex gap-1.5 flex-wrap">
                    {(['ALL', 'BP_PERSON', 'BP_PRODUCT', 'BP_LOCATION'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setTypeFilter(f)}
                        className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all ${
                          typeFilter === f
                            ? 'border-[#FFAB00]/50 bg-[#FFAB00]/10 text-[#FFAB00]'
                            : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/70'
                        }`}
                      >
                        {f === 'ALL' ? 'Todos' : TYPE_LABEL[f as BPType]}
                      </button>
                    ))}
                  </div>

                  {/* Hint de slot activo */}
                  {activeSlot && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FFAB00]/8 border border-[#FFAB00]/20">
                      <span className="text-[#FFAB00] text-xs font-bold">{activeSlot}</span>
                      <p className="text-[10px] text-[#FFAB00]/70 flex-1">
                        Slot activo — click en un BP para asignarlo
                      </p>
                      <button onClick={() => setActiveSlot(null)} className="text-[#FFAB00]/40 hover:text-[#FFAB00] text-xs">✕</button>
                    </div>
                  )}

                  {/* Lista BPs */}
                  {loading ? (
                    <div className="text-center py-8 text-white/30 text-xs">Cargando librería...</div>
                  ) : filtered.length === 0 ? (
                    <div className="text-center py-8 text-white/25 text-xs">
                      {blueprints.length === 0 ? 'No hay blueprints importados.' : 'Sin resultados para este filtro.'}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filtered.map((bp) => (
                        <BPCardMini
                          key={bp.id}
                          bp={bp}
                          activeSlot={activeSlot}
                          occupiedSlots={occupiedSlots}
                          onAssign={(slotId) => { assignSlot(slotId, bp.id); setActiveSlot(null); }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === 'slots' && (
                <div className="p-4 space-y-2">
                  <p className="text-[10px] text-white/35 mb-3">
                    Selecciona un slot para activarlo, luego asigna un BP desde la librería.
                  </p>
                  {(Object.entries(SLOT_META) as [SlotId, typeof SLOT_META[SlotId]][]).map(([slotId]) => (
                    <SlotRow
                      key={slotId}
                      slotId={slotId}
                      bp={slots[slotId]}
                      isActive={activeSlot === slotId}
                      onSetActive={() => {
                        setActiveSlot(activeSlot === slotId ? null : slotId);
                        setTab('library');
                      }}
                      onClear={() => clearSlot(slotId)}
                    />
                  ))}

                  {activeSlotCount > 0 && (
                    <button
                      onClick={clearAllSlots}
                      className="w-full mt-2 text-xs py-2 rounded-xl border border-red-500/20 text-red-400/60 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/5 transition-all"
                    >
                      Limpiar todos los slots
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── Footer: Copiar contexto ── */}
            <div className="flex-shrink-0 border-t border-white/8 p-4 space-y-2">
              <button
                onClick={handleCopyContext}
                disabled={activeSlotCount === 0}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                  activeSlotCount > 0
                    ? 'border-[#FFAB00]/30 bg-[#FFAB00]/8 text-[#FFAB00] hover:bg-[#FFAB00]/15'
                    : 'border-white/8 text-white/20 cursor-not-allowed'
                }`}
              >
                {copied ? '✅ Copiado al clipboard' : `📋 Copiar contexto activo ${activeSlotCount > 0 ? `(${activeSlotCount} slots)` : ''}`}
              </button>
              <p className="text-[10px] text-white/20 text-center">
                Para usar en AI Studio, ChatGPT u otras herramientas externas
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Blueprint Trigger Button ──────────────────────────────────────────────────
// Botón compacto para el topbar — muestra count de slots activos
export function BlueprintTriggerButton({ onClick }: { onClick: () => void }) {
  const { slots, blueprints } = useBlueprintStore();
  const activeSlotCount = Object.keys(slots).length;

  return (
    <button
      onClick={onClick}
      className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all hover:bg-white/6 border-white/10 hover:border-[#FFAB00]/40 text-white/50 hover:text-[#FFAB00]"
      title="Blueprint Library"
    >
      <span>🗂</span>
      <span className="hidden sm:inline font-medium">BPs</span>
      {/* Badge slots activos */}
      {activeSlotCount > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FFAB00] text-[#050508] text-[9px] font-bold rounded-full flex items-center justify-center">
          {activeSlotCount}
        </span>
      )}
      {/* Dot si hay BPs pero sin slots */}
      {activeSlotCount === 0 && blueprints.length > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-white/30 rounded-full" />
      )}
    </button>
  );
}
