const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const { Pool } = require('pg')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// ─── REGISTER ────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  const { name, email, phone, password, id_user_type } = req.body

  if (!name || !email || !password || !id_user_type) {
    return res.status(400).json({ error: 'Preenche todos os campos obrigatórios.' })
  }

  try {
    const password_hash = await bcrypt.hash(password, 10)

    // ── Professor → registo pendente ─────────────────────────────────────────
    if (parseInt(id_user_type) === 2) {
      const existing = await pool.query(
        'SELECT id FROM pending_teachers WHERE email = $1', [email]
      )
      const existingUser = await pool.query(
        'SELECT id_user FROM users WHERE email = $1', [email]
      )

      if (existing.rows.length > 0 || existingUser.rows.length > 0) {
        return res.status(409).json({ error: 'Este email já está registado ou tem um pedido pendente.' })
      }

      const approval_token = jwt.sign(
        { email, name, phone, password_hash },
        process.env.JWT_SECRET,
        { expiresIn: '48h' }
      )

      await pool.query(
        `INSERT INTO pending_teachers (name, email, phone, password, approval_token)
         VALUES ($1, $2, $3, $4, $5)`,
        [name, email, phone, password_hash, approval_token]
      )

      const approveUrl = `${process.env.FRONTEND_URL}/approvedteacher?token=${approval_token}`

      await transporter.sendMail({
        from: `"EntArtes" <${process.env.EMAIL_USER}>`,
        to: process.env.COORDINATOR_EMAIL,
        subject: 'Novo pedido de conta — Professor',
        html: `
          <h2>Pedido de registo como Professor</h2>
          <p><strong>Nome:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Telefone:</strong> ${phone || 'Não fornecido'}</p>
          <br/>
          <p>Para aprovar esta conta, clica no botão abaixo:</p>
          <a href="${approveUrl}" style="
            display: inline-block;
            padding: 12px 24px;
            background-color: #4F46E5;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
          ">Aprovar Professor</a>
          <br/><br/>
          <p style="color: #888; font-size: 12px;">Este link expira em 48 horas.</p>
        `,
      })

      return res.status(200).json({
        message: 'Pedido enviado. A coordenação irá analisar o teu registo.',
        pending: true,
      })
    }

    // ── Encarregado → registo imediato ───────────────────────────────────────
    const existingUser = await pool.query(
      'SELECT id_user FROM users WHERE email = $1', [email]
    )
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Este email já está registado.' })
    }

    const result = await pool.query(
      `INSERT INTO users (name, email, phone_number, password, id_user_type)
       VALUES ($1, $2, $3, $4, $5) RETURNING id_user`,
      [name, email, phone, password_hash, id_user_type]
    )

    return res.status(201).json({ message: 'Conta criada com sucesso!', userId: result.rows[0].id_user })

  } catch (err) {
    console.error('Erro no register:', err)
    res.status(500).json({ error: 'Erro interno do servidor.' })
  }
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e password são obrigatórios.' })
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas.' })
    }

    const user = result.rows[0]
    const valid = await bcrypt.compare(password, user.password)

    if (!valid) {
      return res.status(401).json({ error: 'Credenciais inválidas.' })
    }

    const token = jwt.sign(
      { id: user.id_user, id_user_type: user.id_user_type },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return res.status(200).json({ message: 'Login com sucesso!', id_user_type: user.id_user_type })

  } catch (err) {
    console.error('Erro no login:', err)
    res.status(500).json({ error: 'Erro interno do servidor.' })
  }
}

// ─── FORGOT PASSWORD ─────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email é obrigatório.' })
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])

    if (result.rows.length === 0) {
      return res.status(200).json({ message: 'Se o email existir, receberás um link de reset.' })
    }

    const user = result.rows[0]
    const token = jwt.sign({ id: user.id_user }, process.env.JWT_SECRET, { expiresIn: '15m' })
    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword?token=${token}`

    await transporter.sendMail({
      from: `"EntArtes" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset de Password — EntArtes',
      html: `
        <h2>Reset de Password</h2>
        <p>Clica no link abaixo para redefinir a tua password. O link expira em 15 minutos.</p>
        <a href="${resetUrl}" style="
          display: inline-block;
          padding: 12px 24px;
          background-color: #4F46E5;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
        ">Redefinir Password</a>
      `,
    })

    return res.status(200).json({ message: 'Se o email existir, receberás um link de reset.' })

  } catch (err) {
    console.error('Erro no forgotPassword:', err)
    res.status(500).json({ error: 'Erro interno do servidor.' })
  }
}

// ─── RESET PASSWORD ──────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body

  if (!token || !password) {
    return res.status(400).json({ error: 'Token e nova password são obrigatórios.' })
  }

  try {
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch {
      return res.status(400).json({ error: 'Link inválido ou expirado.' })
    }

    const password_hash = await bcrypt.hash(password, 10)
    await pool.query('UPDATE users SET password = $1 WHERE id_user = $2', [password_hash, decoded.id])

    return res.status(200).json({ message: 'Password atualizada com sucesso!' })

  } catch (err) {
    console.error('Erro no resetPassword:', err)
    res.status(500).json({ error: 'Erro interno do servidor.' })
  }
}

// ─── LOGOUT ──────────────────────────────────────────────────────────────────
exports.logout = (req, res) => {
  res.clearCookie('token')
  return res.status(200).json({ message: 'Logout com sucesso.' })
}

// ─── APPROVE TEACHER ─────────────────────────────────────────────────────────
exports.approveTeacher = async (req, res) => {
  const { token } = req.query

  if (!token) {
    return res.status(400).json({ error: 'Token em falta.' })
  }

  try {
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch {
      return res.status(400).json({ error: 'Link inválido ou expirado.' })
    }

    const pending = await pool.query(
      'SELECT * FROM pending_teachers WHERE approval_token = $1', [token]
    )

    if (pending.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado ou já aprovado.' })
    }

    const { name, email, phone, password } = pending.rows[0]

    const existingUser = await pool.query(
      'SELECT id_user FROM users WHERE email = $1', [email]
    )
    if (existingUser.rows.length > 0) {
      await pool.query('DELETE FROM pending_teachers WHERE approval_token = $1', [token])
      return res.status(409).json({ error: 'Este utilizador já tem uma conta ativa.' })
    }

    // Criar conta na tabela users como Professor (id_user_type = 2)
    const newUser = await pool.query(
      `INSERT INTO users (name, email, phone_number, password, id_user_type)
       VALUES ($1, $2, $3, $4, 2) RETURNING id_user`,
      [name, email, phone, password]
    )

    // Inserir na tabela professors
    await pool.query(
      `INSERT INTO professors (id_user, active)
       VALUES ($1, true)`,
      [newUser.rows[0].id_user]
    )

    // Remover da tabela de pendentes
    await pool.query('DELETE FROM pending_teachers WHERE approval_token = $1', [token])

    // Email de confirmação ao professor
    await transporter.sendMail({
      from: `"EntArtes" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Conta aprovada — EntArtes',
      html: `
        <h2>Olá, ${name}!</h2>
        <p>A tua conta de <strong>Professor</strong> na EntArtes foi aprovada pela coordenação.</p>
        <p>Já podes fazer login:</p>
        <a href="${process.env.FRONTEND_URL}/login" style="
          display: inline-block;
          padding: 12px 24px;
          background-color: #4F46E5;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
        ">Fazer Login</a>
      `,
    })

    return res.status(200).json({ message: 'Professor aprovado com sucesso!' })

  } catch (err) {
    console.error('Erro no approveTeacher:', err)
    res.status(500).json({ error: 'Erro interno do servidor.' })
  }
}

// ─── ME (sessão atual) ───────────────────────────────────────────────────────
exports.me = async (req, res) => {
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
