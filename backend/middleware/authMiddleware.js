// sem o middleware qualquer rota (GET, POST ETC..) fica completamente aberta
// esta middleware intercepta o pedido antes de chegar ao ocntroller, verifica o JWT no cookie  e só deixa passar se for válido

const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
  // 1. Lê o token do cookie httpOnly
  const token = req.cookies?.token

  if (!token) {
    return res.status(401).json({ error: 'Não autenticado.' })
  }

  // 2. Verifica e descodifica o token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // { id, email, type } — disponível em todos os controllers
    next()             // passa para o controller
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' })
  }
}

module.exports = authMiddleware