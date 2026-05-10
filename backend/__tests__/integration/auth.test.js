const request = require('supertest')
const app = require('../../server')
const pool = require('../../db')

let userTypeId

beforeAll(async () => {
  // buscar um id_user_type válido existente na BD
  const { rows } = await pool.query('SELECT id_user_type FROM user_types LIMIT 1')
  if (rows.length === 0) throw new Error('Sem user_types na BD.')
  userTypeId = rows[0].id_user_type

  await pool.query("DELETE FROM users WHERE email = 'test@test.com'")
})

describe('POST /auth/register', () => {

  test('regist a new user - 201', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        name: 'user test',
        email: 'test@test.com',
        password: '123456',
        phone_number: '910000000',
        id_user_type: userTypeId
      })

    expect(res.status).toBe(201)
    expect(res.body.user).toHaveProperty('email', 'test@test.com')
  })

  test('email already registed - 409', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        name: 'user test',
        email: 'test@test.com',
        password: '123456',
        phone_number: '910000000',
        id_user_type: userTypeId
      })

    expect(res.status).toBe(409)
    expect(res.body.error).toBe('this email is already registered.')
  })

})

describe('POST /auth/login', () => {

  test('valid credentials - 200 + cookie', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@test.com', password: '123456' })

    expect(res.status).toBe(200)
    expect(res.body.user).toHaveProperty('email', 'test@test.com')
    expect(res.headers['set-cookie']).toBeDefined()
  })

  test('wrong password → 401', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'wrongpassword' })

    expect(res.status).toBe(401)
  })

  test('email does not exist - 401', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'inexistent@test.com', password: '123456' })

    expect(res.status).toBe(401)
  })

})

describe('POST /auth/logout', () => {

  test('end session - 200 + cleans cookie', async () => {
    const res = await request(app).post('/auth/logout')

    expect(res.status).toBe(200)
    expect(res.headers['set-cookie'][0]).toMatch(/token=;/)
  })

})

afterAll(async () => {
  await pool.query("DELETE FROM users WHERE email = 'test@test.com'")
  await pool.end()
})
