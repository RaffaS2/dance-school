// backend/controllers/authController.js

const pool = require('../db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// ─── REGISTER ────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, phone_number } = req.body // NOVO: phone_number

    // Verifica se o email já existe
    const existing = await pool.query(
      'SELECT id_user FROM users WHERE email = $1',
      [email]
    )
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Este email já está registado.' })
    }

    // Encripta a password com bcrypt (10 rounds)
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insere o novo utilizador com phone_number (id_user_type = 1 → utilizador normal por defeito)
    const result = await pool.query(
      'INSERT INTO users (name, email, password, phone_number, id_user_type) VALUES ($1, $2, $3, $4, $5) RETURNING id_user, name, email, phone_number',
      [name, email, hashedPassword, phone_number, 1]
    )

    res.status(201).json({ user: result.rows[0] })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Procura o utilizador pelo email
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    )
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou palavra-passe incorretos.' })
    }

    const user = result.rows[0]

    // Compara a password introduzida com o hash guardado na base de dados
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Email ou palavra-passe incorretos.' })
    }

    // Gera o JWT com os dados do utilizador (expira em 7 dias)
    const token = jwt.sign(
      { id: user.id_user, email: user.email, type: user.id_user_type },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Envia o token num cookie httpOnly (mais seguro que localStorage)
    res.cookie('token', token, {
      httpOnly: true,   // não acessível via JavaScript no browser
      secure: process.env.NODE_ENV === 'production', // só HTTPS em produção
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias em milissegundos
    })

    res.status(200).json({
      user: { id: user.id_user, name: user.name, email: user.email }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    // Verifica se o email existe na base de dados
    const result = await pool.query(
      'SELECT id_user FROM users WHERE email = $1',
      [email]
    )

    // Responde sempre com sucesso para não revelar se o email existe ou não
    // (boa prática de segurança)
    if (result.rows.length === 0) {
      return res.status(200).json({ message: 'Se este email existir, receberás um link em breve.' })
    }

    const userId = result.rows[0].id_user

    // Gera um token temporário de reset (expira em 15 minutos)
    const resetToken = jwt.sign(
      { id: userId },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    )

    // TODO: envia o email com o link de reset
    // O link deve ser algo como: https://o-teu-site.com/reset-password?token=<resetToken>
    // Para enviar emails podes usar o Resend (resend.com) ou o Nodemailer
    console.log(`Link de reset para ${email}: ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`)

    res.status(200).json({ message: 'Se este email existir, receberás um link em breve.' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
const logout = async (req, res) => {
  // Limpa o cookie do token
  res.clearCookie('token')
  res.status(200).json({ message: 'Sessão terminada com sucesso.' })
}

module.exports = { register, login, forgotPassword, logout }
