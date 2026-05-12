const request = require('supertest')
const app = require('../../server')
const pool = require('../../db')
const bcrypt = require('bcrypt')

let cookie
let ids = {}
let itemRequestId

beforeAll(async () => {
    // buscar user_type existente
    const { rows: utRows } = await pool.query('SELECT id_user_type FROM user_types LIMIT 1')
    if (utRows.length === 0) throw new Error('Sem user_types na BD.')
    const userTypeId = utRows[0].id_user_type

    // criar user dono do item (não pode requisitar o seu próprio item)
    await pool.query("DELETE FROM users WHERE email = 'owner@test.com'")
    const { rows: [ownerUser] } = await pool.query(
        `INSERT INTO users (name, email, id_user_type) VALUES ('owner', 'owner@test.com', $1) RETURNING *`,
        [userTypeId]
    )

    // criar categoria e item pertencente ao owner
    const { rows: [cat] } = await pool.query(
        `INSERT INTO categories (name) VALUES ('cat-test') RETURNING *`
    )
    const { rows: [item] } = await pool.query(
        `INSERT INTO items (name, id_category, id_user) VALUES ('item-test', $1, $2) RETURNING *`,
        [cat.id_category, ownerUser.id_user]
    )

    ids = {
        item: item.id_item,
        category: cat.id_category,
        ownerUser: ownerUser.id_user
    }

    // criar utilizador de auth
    await pool.query("DELETE FROM users WHERE email = 'auth@test.com'")
    const password_hash = await bcrypt.hash('123456', 10)
    const { rows: [authUser] } = await pool.query(
        `INSERT INTO users (name, email, password, id_user_type) VALUES ('auth', 'auth@test.com', $1, $2) RETURNING *`,
        [password_hash, userTypeId]
    )
    ids.authUser = authUser.id_user

    // login para obter o cookie
    const loginRes = await request(app).post('/auth/login').send({
        email: 'auth@test.com',
        password: '123456'
    })
    if (loginRes.status !== 200) throw new Error(`Login falhou: ${JSON.stringify(loginRes.body)}`)
    cookie = loginRes.headers['set-cookie']
})

afterAll(async () => {
    await pool.query('DELETE FROM item_requests WHERE id_user = $1', [ids.authUser])
    await pool.query('DELETE FROM items WHERE id_item = $1', [ids.item])
    await pool.query('DELETE FROM categories WHERE id_category = $1', [ids.category])
    await pool.query("DELETE FROM users WHERE email IN ('owner@test.com', 'auth@test.com')")
    await pool.end()
})


describe('Item Requests CRUD', () => {

    it('POST /item-requests - 201', async () => {
        const res = await request(app)
            .post('/item-requests')
            .set('Cookie', cookie)
            .send({
                request_date: '2025-06-01',
                return_date: null,
                id_item: ids.item,
                id_user: ids.authUser, // user diferente do owner do item
                delivery_status: 1,
                request_status: 1
            })

        expect(res.status).toBe(201)
        itemRequestId = res.body.id_item_request
    })

    it('GET /item-requests - 200', async () => {
        const res = await request(app)
            .get('/item-requests')
            .set('Cookie', cookie)

        expect(res.status).toBe(200)
        expect(res.body.some(r => r.id_item_request === itemRequestId)).toBe(true)
    })

    it('GET /item-requests/:id - 200', async () => {
        const res = await request(app)
            .get(`/item-requests/${itemRequestId}`)
            .set('Cookie', cookie)

        expect(res.status).toBe(200)
        expect(res.body[0].id_item_request).toBe(itemRequestId)
    })

    it('PUT /item-requests/:id - 200', async () => {
        const res = await request(app)
            .put(`/item-requests/${itemRequestId}`)
            .set('Cookie', cookie)
            .send({
                request_date: '2025-06-01',
                return_date: '2025-06-10',
                id_item: ids.item,
                id_user: ids.authUser,
                delivery_status: 2,
                request_status: 2
            })

        expect(res.status).toBe(200)
        expect(res.body.delivery_status).toBe(2)
    })

    it('DELETE /item-requests/:id - 204', async () => {
        const res = await request(app)
            .delete(`/item-requests/${itemRequestId}`)
            .set('Cookie', cookie)

        expect(res.status).toBe(204)
    })

    it('POST /item-requests - 409 quando user já tem 3 activas', async () => {
        // criar 3 requisições sem return_date (activas)
        for (let i = 0; i < 3; i++) {
            await pool.query(
                `INSERT INTO item_requests (request_date, id_item, id_user, delivery_status, request_status)
                 VALUES ('2025-01-01', $1, $2, 1, 1)`,
                [ids.item, ids.authUser]
            )
        }

        const res = await request(app)
            .post('/item-requests')
            .set('Cookie', cookie)
            .send({
                request_date: '2025-06-01',
                return_date: null,
                id_item: ids.item,
                id_user: ids.authUser,
                delivery_status: 1,
                request_status: 1
            })

        expect(res.status).toBe(409)

        // limpar as 3 activas
        await pool.query('DELETE FROM item_requests WHERE id_user = $1', [ids.authUser])
    })

    it('POST /item-requests - 403 quando user requisita o próprio item', async () => {
        const res = await request(app)
            .post('/item-requests')
            .set('Cookie', cookie)
            .send({
                request_date: '2025-06-01',
                return_date: null,
                id_item: ids.item,
                id_user: ids.ownerUser, // owner a tentar requisitar o seu próprio item
                delivery_status: 1,
                request_status: 1
            })

        expect(res.status).toBe(403)
    })
})