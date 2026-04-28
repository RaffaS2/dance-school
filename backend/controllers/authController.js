const pool = require('../db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')

// ─── TRANSPORTER (Nodemailer + Gmail) ────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App Password, não a tua password normal
  },
})

// ─── REGISTER ────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, phone_number } = req.body

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
      'SELECT id_user, name FROM users WHERE email = $1',
      [email]
    )

    // Responde sempre com sucesso para não revelar se o email existe ou não
    // (boa prática de segurança)
    if (result.rows.length === 0) {
      return res.status(200).json({ message: 'Se este email existir, receberás um link em breve.' })
    }

    const userId = result.rows[0].id_user
    const userName = result.rows[0].name

    // Gera um token temporário de reset (expira em 15 minutos)
    const resetToken = jwt.sign(
      { id: userId },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    )

    // Constrói o link de reset que será enviado no email
    const resetLink = `${process.env.FRONTEND_URL}/resetpassword?token=${resetToken}`

    // Envia o email com Nodemailer
    await transporter.sendMail({
      from: `"EntArtes" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Recuperação de palavra-passe — EntArtes',
      html: `
        <div style="background-color: #f4f1f8; padding: 40px 20px; min-height: 100vh;">
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 40px 32px; box-shadow: 0 4px 24px rgba(74,58,99,0.10);">

            <div style="text-align: center; margin-bottom: 24px;">
              <span style="font-family: Georgia, serif; font-size: 22px; font-weight: 400; color: #4a3a63; letter-spacing: 0.08em;">
                EntArtes
              </span>
              <p style="color: #9a9a9a; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; margin: 4px 0 0;">
                Escola de Dança
              </p>
            </div>

            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 0 0 28px 0;" />

            <h2 style="font-family: Georgia, serif; font-weight: 400; color: #1a1a1a; text-align: center; margin: 0 0 8px;">
              Recuperar palavra-passe
            </h2>
            <p style="color: #7a7a7a; font-size: 14px; text-align: center; margin: 0 0 32px;">
              Olá, ${userName}! Recebemos um pedido para repor a tua palavra-passe.
            </p>

            <div style="text-align: center; margin-bottom: 32px;">
              <a href="${resetLink}"
                 style="display: inline-block; padding: 14px 32px;
                        background-color: #D4537E;
                        color: #ffffff; text-decoration: none; border-radius: 6px;
                        font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;">
                Repor palavra-passe
              </a>
            </div>

            <p style="color: #9a9a9a; font-size: 12px; text-align: center; margin: 0 0 24px;">
              Este link expira em <strong>15 minutos</strong>.<br/>
              Se não pediste a recuperação, podes ignorar este email.
            </p>

            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 0;" />
          </div>
        </div>
      `
    })

    res.status(200).json({ message: 'Se este email existir, receberás um link em breve.' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body

    // Verifica e descodifica o token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      return res.status(400).json({ error: 'Link inválido ou expirado.' })
    }

    // Encripta a nova password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Atualiza na base de dados
    await pool.query(
      'UPDATE users SET password = $1 WHERE id_user = $2',
      [hashedPassword, decoded.id]
    )

    res.status(200).json({ message: 'Palavra-passe atualizada com sucesso.' })
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

// ─── ME (sessão atual) ───────────────────────────────────────────────────────
const me = async (req, res) => {
  try {
    const token = req.cookies?.token

    if (!token) {
      return res.status(401).json({ error: 'Não autenticado.' })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      return res.status(401).json({ error: 'Sessão inválida ou expirada.' })
    }

    const result = await pool.query(
      'SELECT id_user, name, email, id_user_type FROM users WHERE id_user = $1',
      [decoded.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilizador não encontrado.' })
    }

    res.status(200).json({ user: result.rows[0] })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = { register, login, forgotPassword, resetPassword, logout, me }
