// __tests__/integration/categories.test.js

const request = require('supertest')
const app = require('../../server')
const pool = require('../../db')

let authCookie
let categoryId

beforeAll(async () => {

    // limpa dados antigos
    await pool.query("DELETE FROM categories WHERE name = 'test category'")
    await pool.query("DELETE FROM users WHERE email = 'auth@test.com'")

    // cria user (IMPORTANTE para não dar 401/undefined cookie)
    await request(app)
        .post('/api/auth/register')
        .send({
            name: 'auth test',
            email: 'auth@test.com',
            password: '123456',
            phone_number: '910000000'
        })

    // login para obter cookie
    const res = await request(app)
        .post('/api/auth/login')
        .send({
            email: 'auth@test.com',
            password: '123456'
        })

    authCookie = res.headers['set-cookie']
})

afterAll(async () => {
    await pool.query("DELETE FROM categories WHERE name = 'test category'")
    await pool.query("DELETE FROM users WHERE email = 'auth@test.com'")
    await pool.end()
})

describe('POST /categories', () => {

    test('create category - 201', async () => {

        const res = await request(app)
            .post('/categories')
            .set('Cookie', authCookie)
            .send({ name: 'test category' })

        expect(res.status).toBe(201)
        expect(res.body.name).toBe('test category')

        categoryId = res.body.id_category
    })
})

describe('GET /categories', () => {

    test('list categories - 200', async () => {

        const res = await request(app)
            .get('/categories')
            .set('Cookie', authCookie)

        expect(res.status).toBe(200)
        expect(Array.isArray(res.body)).toBe(true)
    })
})

describe('GET /categories/:id', () => {

    test('get category by id - 200', async () => {

        const res = await request(app)
            .get(`/categories/${categoryId}`)
            .set('Cookie', authCookie)

        expect(res.status).toBe(200)
        expect(res.body[0].id_category).toBe(categoryId)
    })
})

describe('PUT /categories/:id', () => {

    test('update category - 200', async () => {

        const res = await request(app)
            .put(`/categories/${categoryId}`)
            .set('Cookie', authCookie)
            .send({ name: 'updated category' })

        expect(res.status).toBe(200)
        expect(res.body.name).toBe('updated category')
    })
})

describe('DELETE /categories/:id', () => {

    test('delete category - 204', async () => {

        const res = await request(app)
            .delete(`/categories/${categoryId}`)
            .set('Cookie', authCookie)

        expect(res.status).toBe(204)
    })
})