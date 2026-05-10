const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// mock do módulo de BD — tem de vir ANTES do require do controller
jest.mock('../../db', () => ({
  query: jest.fn()
}))

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue(true)
  })
}))

const pool = require('../../db')
const { register, login, forgotPassword, resetPassword, logout } = require('../../controllers/authController')

// Cria objetos falsos que imitam o req e res do Express
function createReqRes(body = {}) {
  const req = { body }

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn()
  }

  return { req, res }
}

// Limpa os mocks antes de cada teste
beforeEach(() => {
  process.env.JWT_SECRET = 'test-secret'
  jest.clearAllMocks()
})

describe('register', () => {

  test('email already exists - 409', async () => {
    // simula que a BD encontrou um utilizador com este email
    pool.query.mockResolvedValueOnce({ rows: [{ id_user: 1 }] })

    const { req, res } = createReqRes({
      name: 'test',
      email: 'test@test.com',
      password: '123456',
      phone_number: '910000000'
    })

    await register(req, res)

    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith({ error: 'this email is already registered.' })
  })

  test('valid data - creates user and returns 201', async () => {
    // 1º query: select - email não existe
    // 2º query: insert - devolve o utilizador criado
    pool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id_user: 1, name: 'test', email: 'test@test.com' }] })

    const { req, res } = createReqRes({
      name: 'test',
      email: 'test@test.com',
      password: '123456',
      phone_number: '910000000'
    })

    await register(req, res)

    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({
      user: { id_user: 1, name: 'test', email: 'test@test.com' }
    })
  })

})

describe('login', () => {

  test('email does not exist - 401', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] })

    const { req, res } = createReqRes({
      email: 'noone@test.com',
      password: '123'
    })

    await login(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'invalid email or password.' })
  })

  test('wrong password - 401', async () => {
    const hashedPassword = await bcrypt.hash('correctpassword', 10)

    pool.query.mockResolvedValueOnce({
      rows: [{ id_user: 1, email: 'test@test.com', password: hashedPassword, id_user_type: 1 }]
    })

    const { req, res } = createReqRes({
      email: 'test@test.com',
      password: 'wrongpassword'
    })

    await login(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'invalid email or password.' })
  })

  test('valid credentials - returns 200 + sets cookie', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10)

    pool.query.mockResolvedValueOnce({
      rows: [{ id_user: 1, name: 'test', email: 'test@test.com', password: hashedPassword, id_user_type: 1 }]
    })

    const { req, res } = createReqRes({
      email: 'test@test.com',
      password: 'password123'
    })

    await login(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.cookie).toHaveBeenCalledWith('token', expect.any(String), expect.any(Object))
    expect(res.json).toHaveBeenCalledWith({
      user: { id: 1, name: 'test', email: 'test@test.com' }
    })
  })

})

describe('forgotPassword', () => {

  test('email does not exist - returns 200 without revealing it', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] })

    const { req, res } = createReqRes({ email: 'noone@test.com' })

    await forgotPassword(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      message: 'if this email exists, you will receive a link shortly.'
    })
  })

  test('email exists - sends email and returns 200', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id_user: 1, name: 'test' }] })

    const { req, res } = createReqRes({ email: 'test@test.com' })

    await forgotPassword(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      message: 'if this email exists, you will receive a link shortly.'
    })
  })

})

describe('resetPassword', () => {

  test('invalid token - returns 400', async () => {
    const { req, res } = createReqRes({
      token: 'invalid.token.here',
      password: 'newpassword123'
    })

    await resetPassword(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'invalid or expired link.' })
  })

  test('valid token - updates password and returns 200', async () => {
    const token = jwt.sign({ id: 1 }, 'test-secret', { expiresIn: '15m' })

    pool.query.mockResolvedValueOnce({ rows: [] })

    const { req, res } = createReqRes({
      token,
      password: 'newpassword123'
    })

    await resetPassword(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      message: 'password updated successfully.'
    })
  })

})

describe('logout', () => {

  test('clears cookie and returns 200', async () => {
    const { req, res } = createReqRes()

    await logout(req, res)

    expect(res.clearCookie).toHaveBeenCalledWith('token')
    expect(res.status).toHaveBeenCalledWith(200)
  })

})
