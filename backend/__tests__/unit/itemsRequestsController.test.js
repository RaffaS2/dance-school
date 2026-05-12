const { createItemRequest, readAllItemRequests, readItemRequestById, updateItemRequest, deleteItemRequest } = require('../../controllers/itemRequestsController')

jest.mock('../../db', () => ({
    query: jest.fn()
}))

const pool = require('../../db')

const makeRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
})

const fakeRequest = {
    id_item_request: 1,
    request_date: '2025-01-01',
    return_date: null,
    id_item: 10,
    id_user: 5,
    delivery_status: 1,
    request_status: 1
}

beforeEach(() => jest.clearAllMocks())


describe('createItemRequest', () => {

    test('create item request - 201', async () => {
        const req = { body: fakeRequest }
        const res = makeRes()

        pool.query
            .mockResolvedValueOnce({ rows: [{ count: '0' }] })          // COUNT activas
            .mockResolvedValueOnce({ rows: [{ id_user: 99 }] })         // item pertence a outro user
            .mockResolvedValueOnce({ rows: [fakeRequest] })             // INSERT

        await createItemRequest(req, res)

        expect(pool.query).toHaveBeenCalledTimes(3)
        expect(res.status).toHaveBeenCalledWith(201)
        expect(res.json).toHaveBeenCalledWith(fakeRequest)
    })

    test('user already has 3 active requests - 409', async () => {
        const req = { body: fakeRequest }
        const res = makeRes()

        pool.query.mockResolvedValueOnce({ rows: [{ count: '3' }] })

        await createItemRequest(req, res)

        expect(pool.query).toHaveBeenCalledTimes(1)
        expect(res.status).toHaveBeenCalledWith(409)
    })

    test('user requesting their own item - 403', async () => {
        const req = { body: fakeRequest }
        const res = makeRes()

        pool.query
            .mockResolvedValueOnce({ rows: [{ count: '0' }] })
            .mockResolvedValueOnce({ rows: [{ id_user: fakeRequest.id_user }] }) // mesmo user

        await createItemRequest(req, res)

        expect(pool.query).toHaveBeenCalledTimes(2)
        expect(res.status).toHaveBeenCalledWith(403)
    })

    test('should return 500 if pool.query fails', async () => {
        const req = { body: fakeRequest }
        const res = makeRes()

        pool.query.mockRejectedValueOnce(new Error('DB error'))

        await createItemRequest(req, res)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({ error: 'DB error' })
    })
})


describe('readAllItemRequests', () => {

    test('return all item requests', async () => {
        const req = {}
        const res = makeRes()

        pool.query.mockResolvedValueOnce({ rows: [fakeRequest] })

        await readAllItemRequests(req, res)

        expect(pool.query).toHaveBeenCalledTimes(1)
        expect(res.json).toHaveBeenCalledWith([fakeRequest])
    })

    test('should return 500 if pool.query fails', async () => {
        const req = {}
        const res = makeRes()

        pool.query.mockRejectedValueOnce(new Error('DB error'))

        await readAllItemRequests(req, res)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({ error: 'DB error' })
    })
})


describe('readItemRequestById', () => {

    test('return item request by id', async () => {
        const req = { params: { id: 1 } }
        const res = makeRes()

        pool.query.mockResolvedValueOnce({ rows: [fakeRequest] })

        await readItemRequestById(req, res)

        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining('WHERE id_item_request = $1'),
            [1]
        )
        expect(res.json).toHaveBeenCalledWith([fakeRequest])
    })

    test('should return 500 if pool.query fails', async () => {
        const req = { params: { id: 1 } }
        const res = makeRes()

        pool.query.mockRejectedValueOnce(new Error('DB error'))

        await readItemRequestById(req, res)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({ error: 'DB error' })
    })
})


describe('updateItemRequest', () => {

    test('update item request - 200', async () => {
        const req = { params: { id: 1 }, body: fakeRequest }
        const res = makeRes()

        pool.query.mockResolvedValueOnce({ rows: [fakeRequest] })

        await updateItemRequest(req, res)

        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith(fakeRequest)
    })

    test('should return 500 if pool.query fails', async () => {
        const req = { params: { id: 1 }, body: fakeRequest }
        const res = makeRes()

        pool.query.mockRejectedValueOnce(new Error('DB error'))

        await updateItemRequest(req, res)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({ error: 'DB error' })
    })
})


describe('deleteItemRequest', () => {

    test('delete item request - 204', async () => {
        const req = { params: { id: '1' } }
        const res = makeRes()

        pool.query.mockResolvedValueOnce({ rows: [fakeRequest] })

        await deleteItemRequest(req, res)

        expect(pool.query).toHaveBeenCalledWith(
            'DELETE FROM item_requests WHERE id_item_request = $1 RETURNING *',
            ['1']
        )
        expect(res.status).toHaveBeenCalledWith(204)
    })

    test('should return 500 if pool.query fails', async () => {
        const req = { params: { id: '1' } }
        const res = makeRes()

        pool.query.mockRejectedValueOnce(new Error('DB error'))

        await deleteItemRequest(req, res)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({ error: 'DB error' })
    })
})