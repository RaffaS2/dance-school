const request = require('supertest')
const app = require('../../server')
const pool = require('../../db')

// Antes de todos os testes, limpa os dados de teste que possam existir
beforeAll(async () => {
  await pool.query("DELETE FROM users WHERE email = 'test@test.com'")
})

describe('POST /api/auth/register', () => {

  test('regist a new user - 201', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'user test',
        email: 'test@test.com',
        password: '123456',
        phone_number: '910000000'
      })

    expect(res.status).toBe(201)
    expect(res.body.user).toHaveProperty('email', 'test@test.com')
  })

  test('email already registed - 409', async () => {
    // O utilizador já foi criado no teste anterior
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'user test',
        email: 'test@test.com',
        password: '123456',
        phone_number: '910000000'
      })

    expect(res.status).toBe(409)
    expect(res.body.error).toBe('this email is already registered.')
  })

})

describe('POST /api/auth/login', () => {

  test('invalid credentials - 200 + cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: '123456' })

    expect(res.status).toBe(200)
    expect(res.body.user).toHaveProperty('email', 'test@test.com')
    expect(res.headers['set-cookie']).toBeDefined()
  })

  test('wrong password → 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'wrongpassword' })

    expect(res.status).toBe(401)
  })

  test('email does not exist - 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'inexistent@test.com', password: '123456' })

    expect(res.status).toBe(401)
  })

})

describe('POST /api/auth/logout', () => {

  test('end session - 200 + cleans cookie', async () => {
    const res = await request(app).post('/api/auth/logout')

    expect(res.status).toBe(200)
    expect(res.headers['set-cookie'][0]).toMatch(/token=;/)
  })

})

// Depois de todos os testes, limpa e fecha a ligação
afterAll(async () => {
  await pool.query("DELETE FROM users WHERE email = 'test@test.com'")
  await pool.end()
})
