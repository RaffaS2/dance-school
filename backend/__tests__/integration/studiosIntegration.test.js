const request = require('supertest')
const app = require('../../server')
const pool = require('../../db')

// Corre uma vez depois de TODOS os testes deste ficheiro
afterAll(async () => {
  await pool.end()
})

describe('GET /studios', () => {
  test('deve retornar status 200 e um array', async () => {
    const res = await request(app).get('/studios')

    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })
})