import { useState, useRef, useEffect, useCallback } from 'react'

interface Message { role: 'user' | 'assistant'; content: string }

function Logotype() {
  return (
    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '16px', letterSpacing: '0.14em', display: 'flex', alignItems: 'baseline', userSelect: 'none' as const }}>
      <span style={{ color: 'rgba(242,240,236,0.72)' }}>UNREAL</span>
      <span style={{ color: '#00FFD1' }}>&gt;</span>
      <span style={{ color: 'rgba(242,240,236,0.72)' }}>ILLE</span>
      <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '9px', letterSpacing: '0.22em', color: 'rgba(242,240,236,0.26)', marginLeft: '6px' }}>STUDIO</span>
    </div>
  )
}

// ─── TOKEN GATE ───────────────────────────────────────────────────────────────
function TokenGate({ onAccess }: { onAccess: (token: string, clientName: string) => void }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = sessionStorage.getItem('unrlvl_token')
    const savedClient = sessionStorage.getItem('unrlvl_client')
    if (saved && savedClient) { onAccess(saved, savedClient); return }
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [onAccess])

  const handleSubmit = async () => {
    if (!value.trim()) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: value.trim(), messages: [{ role: 'user', content: 'verificar acceso' }] })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Token inválido'); setLoading(false); return }
      sessionStorage.setItem('unrlvl_token', value.trim())
      sessionStorage.setItem('unrlvl_client', data.clientName || '')
      onAccess(value.trim(), data.clientName || '')
    } catch { setError('No se pudo verificar el acceso. Intenta de nuevo.') }
    setLoading(false)
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', background: 'var(--void)', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.025, backgroundImage: 'linear-gradient(var(--chalk12) 1px,transparent 1px),linear-gradient(90deg,var(--chalk12) 1px,transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' as const }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'var(--cyan)' }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '400px' }}>
        <div style={{ marginBottom: '36px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '10px' }}>
          <Logotype />
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '10px', letterSpacing: '0.18em', color: 'var(--cyan)', textTransform: 'uppercase' as const, display: 'flex', alignItems: 'center', gap: '7px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--cyan)', boxShadow: '0 0 8px var(--cyan)' }} />
            Social Media Agent
          </div>
        </div>
        <div style={{ background: 'var(--carbon)', border: '1px solid var(--chalk12)', borderTop: '2px solid var(--cyan)', padding: '32px 28px' }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '26px', letterSpacing: '0.08em', color: 'var(--chalk)', marginBottom: '6px' }}>ACCESO RESTRINGIDO</div>
          <div style={{ fontFamily: "'Libre Baskerville',serif", fontStyle: 'italic', fontSize: '13px', color: 'var(--chalk42)', marginBottom: '28px', lineHeight: '1.6' }}>
            Ingresa el código de acceso proporcionado por Unreal&gt;ille Studio.
          </div>
          <label style={{ display: 'block', fontFamily: "'Space Mono',monospace", fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: 'var(--chalk20)', marginBottom: '8px' }}>CÓDIGO DE ACCESO</label>
          <input ref={inputRef} type="text" value={value}
            onChange={e => { setValue(e.target.value.toUpperCase()); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="XXXXXXXX" disabled={loading}
            style={{ width: '100%', background: 'var(--void)', border: `1px solid ${error ? 'var(--danger)' : 'var(--chalk12)'}`, borderRadius: '3px', padding: '13px 14px', fontFamily: "'Space Mono',monospace", fontSize: '16px', letterSpacing: '0.22em', color: 'var(--cyan)', outline: 'none', marginBottom: error ? '8px' : '16px', caretColor: 'var(--cyan)', transition: 'border-color 0.15s' }}
          />
          {error && <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '10px', color: 'var(--danger)', marginBottom: '12px', padding: '8px 10px', background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.25)', borderRadius: '3px' }}>✗ {error}</div>}
          <button onClick={handleSubmit} disabled={loading || !value.trim()} style={{ width: '100%', background: loading || !value.trim() ? 'var(--g2)' : 'var(--cyan)', border: 'none', borderRadius: '3px', padding: '13px', fontFamily: "'Bebas Neue',sans-serif", fontSize: '16px', letterSpacing: '0.14em', color: loading || !value.trim() ? 'var(--chalk42)' : 'var(--void)', cursor: loading || !value.trim() ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}>
            {loading ? 'VERIFICANDO...' : 'INGRESAR'}
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: '20px', fontFamily: "'Space Mono',monospace", fontSize: '9px', color: 'var(--chalk20)', letterSpacing: '0.1em' }}>
          ¿No tienes código? Contacta a Unreal&gt;ille Studio.
        </div>
      </div>
    </div>
  )
}

// ─── MESSAGE BUBBLE ───────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  const renderContent = (text: string) => {
    if (isUser) return <span>{text}</span>
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\n)/g)
    return <>{parts.map((p, i) => {
      if (p.startsWith('**') && p.endsWith('**')) return <strong key={i} style={{ color: 'var(--chalk)', fontWeight: 700 }}>{p.slice(2,-2)}</strong>
      if (p.startsWith('`') && p.endsWith('`') && p.length > 2) return <code key={i} style={{ background: 'rgba(0,255,209,0.08)', border: '1px solid var(--cyan20)', borderRadius: '3px', padding: '1px 6px', fontFamily: "'Space Mono',monospace", fontSize: '12px', color: 'var(--cyan)' }}>{p.slice(1,-1)}</code>
      if (p === '\n') return <br key={i} />
      return <span key={i}>{p}</span>
    })}</>
  }
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: '16px', gap: '12px', alignItems: 'flex-start' }}>
      {!isUser && (
        <div style={{ flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%', background: 'var(--cyan08)', border: '1px solid var(--cyan20)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '3px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--cyan)', boxShadow: '0 0 6px var(--cyan)' }} />
        </div>
      )}
      <div style={{
        maxWidth: '78%',
        background: isUser ? 'var(--graphite)' : 'transparent',
        border: isUser ? '1px solid var(--chalk12)' : 'none',
        borderRadius: '12px',
        padding: isUser ? '12px 16px' : '4px 0',
        fontFamily: "'Space Mono',monospace",
        fontSize: '14px',
        color: isUser ? 'var(--chalk72)' : 'var(--chalk)',
        lineHeight: '1.9',
        wordBreak: 'break-word' as const
      }}>
        {renderContent(msg.content)}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
      <div style={{ flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%', background: 'var(--cyan08)', border: '1px solid var(--cyan20)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--cyan)', boxShadow: '0 0 6px var(--cyan)' }} />
      </div>
      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
        {[0,1,2].map(i => <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--cyan60)', animation: `pulse 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
      </div>
    </div>
  )
}

const HINTS = [
  '¿Qué correos necesito por red social?',
  '¿Cómo creo el System User?',
  '¿Google Voice funciona para WABA?',
  '¿Por qué no usar VPN al crear cuentas?',
]

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ clientName }: { clientName: string }) {
  const greeting = clientName ? `Hola, ${clientName}` : 'Hola'
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.5s ease-out', paddingBottom: '60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--cyan08)', border: '1px solid var(--cyan20)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: 'var(--cyan)', boxShadow: '0 0 10px var(--cyan)' }} />
        </div>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '11px', letterSpacing: '0.14em', color: 'var(--cyan)', textTransform: 'uppercase' as const }}>Social Media Agent</div>
      </div>
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '42px', letterSpacing: '0.04em', color: 'var(--chalk)', lineHeight: 1.1, textAlign: 'center' as const }}>
        {greeting}
      </div>
      <div style={{ fontFamily: "'Libre Baskerville',serif", fontStyle: 'italic', fontSize: '15px', color: 'var(--chalk42)', marginTop: '10px', maxWidth: '420px', lineHeight: '1.7', textAlign: 'center' as const }}>
        Tu guía para crear correctamente la infraestructura digital de tu negocio.
      </div>
    </div>
  )
}

// ─── CHAT ─────────────────────────────────────────────────────────────────────
function Chat({ token, clientName, onLogout }: { token: string; clientName: string; onLogout: () => void }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isEmpty = messages.length === 0

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || loading) return
    setError('')
    const userMsg: Message = { role: 'user', content: content.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    if (textareaRef.current) { textareaRef.current.style.height = 'auto' }
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, messages: newMessages })
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) { sessionStorage.clear(); onLogout(); return }
        setError(data.error || 'Error'); setLoading(false); return
      }
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch { setError('Error de conexión.') }
    setLoading(false)
  }, [messages, loading, token, onLogout])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' as const, background: 'var(--void)' }}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1.15)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        textarea::placeholder{color:rgba(242,240,236,0.28);}
        textarea:focus{outline:none;}
        .hint-pill:hover{border-color:rgba(0,255,209,0.3) !important;color:rgba(0,255,209,0.7) !important;}
      `}</style>

      {/* HEADER */}
      <div style={{ background: 'var(--carbon)', borderBottom: '1px solid var(--chalk06)', padding: '0 28px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, position: 'relative' as const }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'var(--cyan)' }} />
        <Logotype />
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {clientName && (
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'var(--chalk20)', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--cyan)', boxShadow: '0 0 5px var(--cyan)' }} />
              {clientName}
            </div>
          )}
          <button onClick={onLogout} style={{ background: 'none', border: '1px solid var(--chalk12)', borderRadius: '3px', padding: '5px 12px', fontFamily: "'Space Mono',monospace", fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'var(--chalk20)', cursor: 'pointer' }}>SALIR</button>
        </div>
      </div>

      {/* MESSAGES or EMPTY */}
      <div style={{ flex: 1, overflowY: 'auto' as const, display: 'flex', flexDirection: 'column' as const }}>
        {isEmpty ? (
          <EmptyState clientName={clientName} />
        ) : (
          <div style={{ maxWidth: '760px', width: '100%', margin: '0 auto', padding: '32px 28px 8px' }}>
            {messages.map((msg, i) => <div key={i} style={{ animation: 'fadeIn 0.2s ease-out' }}><MessageBubble msg={msg} /></div>)}
            {loading && <TypingIndicator />}
            {error && <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '11px', color: 'var(--danger)', padding: '8px 12px', background: 'rgba(255,68,68,0.06)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: '6px', marginBottom: '12px' }}>✗ {error}</div>}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* INPUT ZONE — centrado, cápsula */}
      <div style={{ flexShrink: 0, padding: '16px 28px 20px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '680px' }}>
          {/* TEXTAREA PILL */}
          <div style={{
            background: 'var(--carbon)',
            border: '1px solid rgba(242,240,236,0.16)',
            borderRadius: '16px',
            padding: '14px 16px 14px 20px',
            display: 'flex', alignItems: 'flex-end', gap: '10px',
            boxShadow: '0 0 0 1px rgba(0,255,209,0.05), 0 4px 24px rgba(0,0,0,0.4)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
            onFocusCapture={e => { e.currentTarget.style.borderColor = 'rgba(0,255,209,0.3)'; e.currentTarget.style.boxShadow = '0 0 0 1px rgba(0,255,209,0.1), 0 4px 24px rgba(0,0,0,0.4)' }}
            onBlurCapture={e => { e.currentTarget.style.borderColor = 'rgba(242,240,236,0.16)'; e.currentTarget.style.boxShadow = '0 0 0 1px rgba(0,255,209,0.05), 0 4px 24px rgba(0,0,0,0.4)' }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => { setInput(e.target.value); e.target.style.height='auto'; e.target.style.height=Math.min(e.target.scrollHeight,180)+'px' }}
              onKeyDown={e => { if (e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage(input)} }}
              placeholder="Escribe tu pregunta aquí…"
              disabled={loading}
              rows={1}
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontFamily: "'Space Mono',monospace", fontSize: '14px', color: 'var(--chalk72)', lineHeight: '1.7', resize: 'none' as const, overflowY: 'hidden' as const, caretColor: 'var(--cyan)', minHeight: '24px', padding: '2px 0' }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              style={{
                background: !input.trim() || loading ? 'rgba(242,240,236,0.06)' : 'var(--cyan)',
                border: 'none', borderRadius: '10px',
                width: '38px', height: '38px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                color: !input.trim() || loading ? 'rgba(242,240,236,0.2)' : '#080808',
                fontSize: '17px', fontWeight: 800,
              }}
            >↑</button>
          </div>

          {/* HINT PILLS — solo estado vacío */}
          {isEmpty && (
            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' as const, justifyContent: 'center' }}>
              {HINTS.map((h, i) => (
                <button key={i} className="hint-pill" onClick={() => sendMessage(h)} style={{
                  background: 'none', border: '1px solid rgba(242,240,236,0.10)',
                  borderRadius: '20px', padding: '5px 14px',
                  fontFamily: "'Space Mono',monospace", fontSize: '11px',
                  color: 'rgba(242,240,236,0.28)', cursor: 'pointer',
                  transition: 'all 0.15s', whiteSpace: 'nowrap' as const
                }}>{h}</button>
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '10px', fontFamily: "'Space Mono',monospace", fontSize: '9px', color: 'rgba(242,240,236,0.10)', letterSpacing: '0.08em' }}>
            UNREAL&gt;ILLE · USO INTERNO · INFORMACIÓN OPERATIVA CONFIDENCIAL
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState<{token:string;clientName:string}|null>(null)
  return session
    ? <Chat token={session.token} clientName={session.clientName} onLogout={() => { sessionStorage.clear(); setSession(null) }} />
    : <TokenGate onAccess={(t, c) => setSession({token:t,clientName:c})} />
}
