const request = require('supertest')
const app = require('../../server')
const pool = require('../../db')
const bcrypt = require('bcrypt')

let cookie
let ids = {}
let coachingId

beforeAll(async () => {
  // buscar um id_user_type válido existente na BD
  const { rows: utRows } = await pool.query('SELECT id_user_type FROM user_types LIMIT 1')
  if (utRows.length === 0) throw new Error('Sem user_types na BD.')
  const userTypeId = utRows[0].id_user_type

  // criar user professor diretamente na BD
  const { rows: [profUser] } = await pool.query(
    `INSERT INTO users (name, email, id_user_type)
     VALUES ('prof', 'prof@test.com', $1) RETURNING *`,
    [userTypeId]
  )

  // criar professor
  const { rows: [prof] } = await pool.query(
    `INSERT INTO professors (id_user) VALUES ($1) RETURNING *`,
    [profUser.id_user]
  )

  // criar modality
  const { rows: [mod] } = await pool.query(
    `INSERT INTO modalities (name) VALUES ('mod') RETURNING *`
  )

  // criar studio
  const { rows: [studio] } = await pool.query(
    `INSERT INTO studios (name) VALUES ('studio') RETURNING *`
  )

  ids = {
    professor: prof.id_professor,
    modality: mod.id_modality,
    studio: studio.id_studio
  }

  // criar utilizador de auth diretamente na BD (evita depender do controller de register)
  await pool.query("DELETE FROM users WHERE email = 'auth@test.com'")
  const password_hash = await bcrypt.hash('123456', 10)
  await pool.query(
    `INSERT INTO users (name, email, password, id_user_type)
     VALUES ('auth', 'auth@test.com', $1, $2)`,
    [password_hash, userTypeId]
  )

  // fazer login para obter o cookie
  const loginRes = await request(app).post('/auth/login').send({
    email: 'auth@test.com',
    password: '123456'
  })

  if (loginRes.status !== 200) {
    throw new Error(`Login falhou no beforeAll: ${loginRes.status} ${JSON.stringify(loginRes.body)}`)
  }

  cookie = loginRes.headers['set-cookie']
})

afterAll(async () => {
  await pool.query(`DELETE FROM coachings WHERE status = 'test'`)
  await pool.query(`DELETE FROM professors WHERE id_user IN (
    SELECT id_user FROM users WHERE email IN ('prof@test.com','auth@test.com')
  )`)
  await pool.query(`DELETE FROM users WHERE email IN ('prof@test.com','auth@test.com')`)
  await pool.end()
})

describe('Coachings CRUD', () => {

  it('POST /coachings', async () => {
    const res = await request(app)
      .post('/coachings')
      .set('Cookie', cookie)
      .send({
        id_professor: ids.professor,
        id_studio: ids.studio,
        id_modality: ids.modality,
        date: '2025-06-01',
        start_time: '10:00',
        duration_minutes: 60,
        status: 'test',
        price: 50
      })

    expect(res.status).toBe(201)
    coachingId = res.body.id_coaching
  })

  it('GET /coachings', async () => {
    const res = await request(app)
      .get('/coachings')
      .set('Cookie', cookie)

    expect(res.status).toBe(200)
    expect(res.body.some(c => c.id_coaching === coachingId)).toBe(true)
  })

  it('GET /coachings/:id', async () => {
    const res = await request(app)
      .get(`/coachings/${coachingId}`)
      .set('Cookie', cookie)

    expect(res.status).toBe(200)
    expect(res.body.id_coaching).toBe(coachingId)
  })

  it('PUT /coachings/:id', async () => {
    const res = await request(app)
      .put(`/coachings/${coachingId}`)
      .set('Cookie', cookie)
      .send({
        id_professor: ids.professor,
        id_studio: ids.studio,
        id_modality: ids.modality,
        date: '2025-06-01',
        start_time: '11:00',
        duration_minutes: 90,
        status: 'test',
        price: 70
      })

    expect(res.status).toBe(200)
    expect(res.body.duration_minutes).toBe(90)
  })

  it('DELETE /coachings/:id', async () => {
    const res = await request(app)
      .delete(`/coachings/${coachingId}`)
      .set('Cookie', cookie)

    expect(res.status).toBe(204)
  })

})
