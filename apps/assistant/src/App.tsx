import { useState, useRef, useEffect, useCallback } from 'react'

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface Message {
  role: 'user' | 'assistant'
  content: string
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function Logotype() {
  return (
    <div style={{
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: '18px',
      letterSpacing: '0.14em',
      display: 'flex',
      alignItems: 'baseline',
      gap: '0',
      userSelect: 'none'
    }}>
      <span style={{ color: 'rgba(242,240,236,0.72)' }}>UNREAL</span>
      <span style={{ color: '#00FFD1' }}>&gt;</span>
      <span style={{ color: 'rgba(242,240,236,0.72)' }}>ILLE</span>
      <span style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '10px',
        letterSpacing: '0.22em',
        color: 'rgba(242,240,236,0.26)',
        marginLeft: '6px'
      }}>STUDIO</span>
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
    // Check sessionStorage for existing valid token
    const saved = sessionStorage.getItem('unrlvl_token')
    const savedClient = sessionStorage.getItem('unrlvl_client')
    if (saved && savedClient) {
      onAccess(saved, savedClient)
    } else {
      inputRef.current?.focus()
    }
  }, [onAccess])

  const handleSubmit = async () => {
    if (!value.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: value.trim(),
          messages: [{ role: 'user', content: 'verificar acceso' }]
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Token inválido')
        setLoading(false)
        return
      }

      sessionStorage.setItem('unrlvl_token', value.trim())
      sessionStorage.setItem('unrlvl_client', data.clientName || '')
      onAccess(value.trim(), data.clientName || '')
    } catch {
      setError('No se pudo verificar el acceso. Intenta de nuevo.')
    }

    setLoading(false)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--void)',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* background grid */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage: 'linear-gradient(var(--chalk12) 1px, transparent 1px), linear-gradient(90deg, var(--chalk12) 1px, transparent 1px)',
        backgroundSize: '40px 40px', pointerEvents: 'none'
      }} />
      {/* top accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: 'var(--cyan)'
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '380px' }}>
        {/* Logo */}
        <div style={{ marginBottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <Logotype />
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '9px',
            letterSpacing: '0.2em',
            color: 'var(--chalk20)',
            textTransform: 'uppercase'
          }}>ASISTENTE · INFRAESTRUCTURA DIGITAL</div>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--carbon)',
          border: '1px solid var(--chalk12)',
          borderTop: '2px solid var(--cyan)',
          padding: '32px 28px',
        }}>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '22px',
            letterSpacing: '0.08em',
            color: 'var(--chalk)',
            marginBottom: '6px'
          }}>
            ACCESO RESTRINGIDO
          </div>
          <div style={{
            fontFamily: "'Libre Baskerville', serif",
            fontStyle: 'italic',
            fontSize: '12px',
            color: 'var(--chalk42)',
            marginBottom: '28px',
            lineHeight: '1.6'
          }}>
            Ingresa el código de acceso proporcionado por Unreal&gt;ille Studio.
          </div>

          <label style={{
            display: 'block',
            fontFamily: "'Space Mono', monospace",
            fontSize: '9px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--chalk20)',
            marginBottom: '8px'
          }}>CÓDIGO DE ACCESO</label>

          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={e => setValue(e.target.value.toUpperCase())}
            onKeyDown={handleKey}
            placeholder="XXXXXXXX"
            disabled={loading}
            style={{
              width: '100%',
              background: 'var(--void)',
              border: `1px solid ${error ? 'var(--danger)' : 'var(--chalk12)'}`,
              borderRadius: '3px',
              padding: '12px 14px',
              fontFamily: "'Space Mono', monospace",
              fontSize: '15px',
              letterSpacing: '0.22em',
              color: 'var(--cyan)',
              outline: 'none',
              marginBottom: '8px',
              transition: 'border-color 0.15s',
              caretColor: 'var(--cyan)'
            }}
            onFocus={e => {
              if (!error) e.target.style.borderColor = 'var(--cyan20)'
            }}
            onBlur={e => {
              if (!error) e.target.style.borderColor = 'var(--chalk12)'
            }}
          />

          {error && (
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '10px',
              color: 'var(--danger)',
              marginBottom: '12px',
              padding: '8px 10px',
              background: 'rgba(255,68,68,0.08)',
              border: '1px solid rgba(255,68,68,0.25)',
              borderRadius: '3px'
            }}>
              ✗ {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !value.trim()}
            style={{
              width: '100%',
              background: loading ? 'var(--g2)' : 'var(--cyan)',
              border: 'none',
              borderRadius: '3px',
              padding: '12px',
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '15px',
              letterSpacing: '0.14em',
              color: loading ? 'var(--chalk42)' : 'var(--void)',
              cursor: loading || !value.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              marginTop: error ? '0' : '4px'
            }}
          >
            {loading ? 'VERIFICANDO...' : 'INGRESAR'}
          </button>
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          fontFamily: "'Space Mono', monospace",
          fontSize: '9px',
          color: 'var(--chalk20)',
          letterSpacing: '0.1em'
        }}>
          ¿No tienes código? Contacta a Unreal&gt;ille Studio.
        </div>
      </div>
    </div>
  )
}

// ─── MESSAGE BUBBLE ───────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'

  // Parse bold (**text**) and code (`text`) in assistant messages
  const renderContent = (text: string) => {
    if (isUser) return text
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\n)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: 'var(--chalk)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return <code key={i} style={{
          background: 'var(--void)',
          border: '1px solid var(--chalk12)',
          borderRadius: '3px',
          padding: '1px 5px',
          fontFamily: "'Space Mono', monospace",
          fontSize: '11px',
          color: 'var(--cyan)'
        }}>{part.slice(1, -1)}</code>
      }
      if (part === '\n') return <br key={i} />
      return part
    })
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '16px',
      gap: '10px',
      alignItems: 'flex-start'
    }}>
      {!isUser && (
        <div style={{
          width: '26px', height: '26px', flexShrink: 0,
          background: 'var(--cyan08)',
          border: '1px solid var(--cyan20)',
          borderRadius: '3px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '10px', color: 'var(--cyan)',
          letterSpacing: '0.05em',
          marginTop: '2px'
        }}>UL</div>
      )}

      <div style={{
        maxWidth: '78%',
        background: isUser ? 'var(--graphite)' : 'var(--carbon)',
        border: isUser ? '1px solid var(--chalk12)' : '1px solid var(--chalk06)',
        borderLeft: isUser ? '1px solid var(--chalk12)' : '2px solid var(--cyan20)',
        borderRadius: '3px',
        padding: '12px 16px',
        fontFamily: "'Space Mono', monospace",
        fontSize: '12px',
        color: isUser ? 'var(--chalk42)' : 'var(--chalk72)',
        lineHeight: '1.85',
        wordBreak: 'break-word'
      }}>
        {renderContent(msg.content)}
      </div>

      {isUser && (
        <div style={{
          width: '26px', height: '26px', flexShrink: 0,
          background: 'var(--graphite)',
          border: '1px solid var(--chalk12)',
          borderRadius: '3px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '10px', color: 'var(--chalk42)',
          letterSpacing: '0.05em',
          marginTop: '2px'
        }}>TÚ</div>
      )}
    </div>
  )
}

// ─── TYPING INDICATOR ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '16px' }}>
      <div style={{
        width: '26px', height: '26px', flexShrink: 0,
        background: 'var(--cyan08)', border: '1px solid var(--cyan20)',
        borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Bebas Neue', sans-serif", fontSize: '10px', color: 'var(--cyan)'
      }}>UL</div>
      <div style={{
        background: 'var(--carbon)', border: '1px solid var(--chalk06)',
        borderLeft: '2px solid var(--cyan20)', borderRadius: '3px',
        padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '5px'
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '5px', height: '5px', borderRadius: '50%',
            background: 'var(--cyan60)',
            animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`
          }} />
        ))}
      </div>
    </div>
  )
}

// ─── SUGGESTED QUESTIONS ──────────────────────────────────────────────────────
const SUGGESTIONS = [
  '¿Qué correos necesito crear para cada red social?',
  '¿Cómo creo el System User para que Unreal>ille acceda a mi BM?',
  '¿Puedo usar Google Voice para verificar WhatsApp Business API?',
  '¿Cómo doy acceso a Unreal>ille sin compartir mi contraseña?',
  '¿Por qué no puedo usar VPN al crear las cuentas?',
  '¿Qué pasa si me suspenden la cuenta publicitaria?',
]

// ─── MAIN CHAT ─────────────────────────────────────────────────────────────────
function Chat({ token, clientName, onLogout }: {
  token: string
  clientName: string
  onLogout: () => void
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || loading) return
    setError('')

    const userMsg: Message = { role: 'user', content: content.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, messages: newMessages })
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 401) {
          sessionStorage.clear()
          onLogout()
          return
        }
        setError(data.error || 'Error al obtener respuesta')
        setLoading(false)
        return
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setError('Error de conexión. Verifica tu internet e intenta de nuevo.')
    }

    setLoading(false)
  }, [messages, loading, token, onLogout])

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
  }

  const isEmpty = messages.length === 0

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--void)',
      position: 'relative'
    }}>
      {/* pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{
        background: 'var(--carbon)',
        borderBottom: '1px solid var(--chalk06)',
        padding: '0 20px',
        height: '54px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'var(--cyan)' }} />
        <Logotype />
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {clientName && (
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '9px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--chalk20)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: 'var(--cyan)', boxShadow: '0 0 6px var(--cyan)'
              }} />
              {clientName}
            </div>
          )}
          <button
            onClick={onLogout}
            style={{
              background: 'none',
              border: '1px solid var(--chalk12)',
              borderRadius: '3px',
              padding: '4px 10px',
              fontFamily: "'Space Mono', monospace",
              fontSize: '9px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--chalk20)',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--chalk42)'
              e.currentTarget.style.borderColor = 'var(--chalk20)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--chalk20)'
              e.currentTarget.style.borderColor = 'var(--chalk12)'
            }}
          >
            SALIR
          </button>
        </div>
      </div>

      {/* ── MESSAGES ── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {isEmpty ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.4s ease-out'
          }}>
            <div style={{
              width: '52px', height: '52px',
              background: 'var(--cyan08)',
              border: '1px solid var(--cyan20)',
              borderRadius: '4px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '20px', color: 'var(--cyan)',
              marginBottom: '20px'
            }}>UL</div>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '22px',
              letterSpacing: '0.08em',
              color: 'var(--chalk)',
              textAlign: 'center',
              marginBottom: '8px'
            }}>¿EN QUÉ TE AYUDO?</div>
            <div style={{
              fontFamily: "'Libre Baskerville', serif",
              fontStyle: 'italic',
              fontSize: '12px',
              color: 'var(--chalk42)',
              textAlign: 'center',
              maxWidth: '320px',
              lineHeight: '1.7',
              marginBottom: '32px'
            }}>
              Pregúntame sobre la creación de cuentas, Business Manager, WhatsApp Business API, TikTok, correos y aliases, o cualquier paso del onboarding digital.
            </div>

            {/* Suggestions */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              maxWidth: '560px',
              justifyContent: 'center'
            }}>
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  style={{
                    background: 'var(--carbon)',
                    border: '1px solid var(--chalk12)',
                    borderRadius: '3px',
                    padding: '7px 12px',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '10px',
                    color: 'var(--chalk42)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    lineHeight: '1.5',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--cyan20)'
                    e.currentTarget.style.color = 'var(--chalk72)'
                    e.currentTarget.style.background = 'var(--cyan04)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--chalk12)'
                    e.currentTarget.style.color = 'var(--chalk42)'
                    e.currentTarget.style.background = 'var(--carbon)'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i} style={{ animation: 'fadeIn 0.25s ease-out' }}>
                <MessageBubble msg={msg} />
              </div>
            ))}
            {loading && <TypingIndicator />}
            {error && (
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '10px',
                color: 'var(--danger)',
                padding: '8px 12px',
                background: 'rgba(255,68,68,0.06)',
                border: '1px solid rgba(255,68,68,0.2)',
                borderRadius: '3px',
                marginBottom: '16px'
              }}>
                ✗ {error}
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── INPUT ── */}
      <div style={{
        flexShrink: 0,
        background: 'var(--carbon)',
        borderTop: '1px solid var(--chalk06)',
        padding: '14px 20px'
      }}>
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-end',
          background: 'var(--void)',
          border: '1px solid var(--chalk12)',
          borderRadius: '4px',
          padding: '10px 12px',
          transition: 'border-color 0.15s'
        }}
          onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--chalk20)'}
          onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--chalk12)'}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKey}
            placeholder="Escribe tu pregunta... (Enter para enviar, Shift+Enter para nueva línea)"
            disabled={loading}
            rows={1}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
              color: 'var(--chalk72)',
              lineHeight: '1.7',
              resize: 'none',
              overflowY: 'hidden',
              caretColor: 'var(--cyan)',
              minHeight: '22px'
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            style={{
              background: loading || !input.trim() ? 'var(--graphite)' : 'var(--cyan)',
              border: 'none',
              borderRadius: '3px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              flexShrink: 0,
              transition: 'background 0.15s',
              color: loading || !input.trim() ? 'var(--chalk20)' : 'var(--void)',
              fontSize: '14px'
            }}
          >
            ↑
          </button>
        </div>
        <div style={{
          textAlign: 'center',
          marginTop: '8px',
          fontFamily: "'Space Mono', monospace",
          fontSize: '9px',
          color: 'var(--chalk12)',
          letterSpacing: '0.08em'
        }}>
          UNREAL&gt;ILLE · USO INTERNO · INFORMACIÓN OPERATIVA CONFIDENCIAL
        </div>
      </div>
    </div>
  )
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState<{ token: string; clientName: string } | null>(null)

  const handleAccess = (token: string, clientName: string) => {
    setSession({ token, clientName })
  }

  const handleLogout = () => {
    sessionStorage.clear()
    setSession(null)
  }

  if (!session) {
    return <TokenGate onAccess={handleAccess} />
  }

  return (
    <Chat
      token={session.token}
      clientName={session.clientName}
      onLogout={handleLogout}
    />
  )
}
