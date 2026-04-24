const jwt = require('jsonwebtoken')

// Tipos de utilizador (correspondem aos IDs na tabela user_types do Neon)
// 1 = Admin (Coordenação)
// 2 = Professor
// 3 = Encarregado de Educação

// Uso nas rotas:
// authorize(1)       → só Admin
// authorize(1, 2)    → Admin e Professor
// authorize(1, 2, 3) → todos os utilizadores autenticados

const authorize = (...allowedTypes) => (req, res, next) => {
  const token = req.cookies.token

  // Verifica se o cookie com o token existe
  if (!token) {
    return res.status(401).json({ error: 'Não autenticado. Faz login para continuar.' })
  }

  try {
    // Descodifica e verifica o token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Verifica se o cargo do utilizador tem permissão para aceder à rota
    if (!allowedTypes.includes(decoded.type)) {
      return res.status(403).json({ error: 'Sem permissão para aceder a este recurso.' })
    }

    // Guarda os dados do utilizador no request para usar nos controllers
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado. Faz login novamente.' })
  }
}

module.exports = authorize
