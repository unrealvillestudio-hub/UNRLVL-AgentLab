const { kv } = require('@vercel/kv')

// ─── TOKEN VALIDATION (duplicada de chat.js — misma lógica) ───────────────────
function validateToken(token) {
  const raw = process.env.ACCESS_TOKENS || ''
  if (!raw) return { valid: false }
  for (const entry of raw.split(',').map(e => e.trim()).filter(Boolean)) {
    const parts = entry.split(':')
    if (parts.length < 3) continue
    const [code, clientName, expiresAt] = parts
    if (code.trim().toUpperCase() !== token.toUpperCase()) continue
    const expiry = new Date(expiresAt.trim())
    if (isNaN(expiry.getTime()) || new Date() > expiry) return { valid: false }
    return { valid: true, clientName: clientName.trim() }
  }
  return { valid: false }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { token } = req.body || {}
  if (!token) return res.status(400).json({ error: 'token requerido' })

  const validation = validateToken(token)
  if (!validation.valid) return res.status(401).json({ error: 'Token inválido' })

  try {
    const stored = await kv.get(`chat:${token.toUpperCase()}`)
    const history = stored ? JSON.parse(stored) : []
    return res.status(200).json({ history, clientName: validation.clientName })
  } catch (e) {
    console.error('History fetch error:', e)
    // Si KV falla, devolver historial vacío — no bloquear el acceso
    return res.status(200).json({ history: [], clientName: validation.clientName })
  }
}
