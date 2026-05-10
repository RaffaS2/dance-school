const { createCoaching, readAllCoachings, readCoachingById, updateCoaching, deleteCoaching } = require('../../controllers/coachingsController')

jest.mock('../../db', () => ({
    query: jest.fn()
}))

const pool = require('../../db')

const makeRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
})

const fakeCoaching = {
    id_coaching: 1,
    id_professor: 1,
    id_studio: 1,
    id_modality: 1,
    date: '2025-01-01',
    start_time: '10:00',
    duration_minutes: 60,
    status: 'scheduled',
    price: 50.00,
    professor_validation: false,
    guardian_validation: false,
    coordination_validation: false
}

beforeEach(() => {
    jest.clearAllMocks()
})

describe('createCoaching', () => {

    test('create a coaching - 201', async () => {
        const req = { body: fakeCoaching }
        const res = makeRes()

        // createCoaching faz 3 queries: conflito professor, conflito estúdio, insert
        pool.query
            .mockResolvedValueOnce({ rows: [] })        // sem conflito de professor
            .mockResolvedValueOnce({ rows: [] })        // sem conflito de estúdio
            .mockResolvedValueOnce({ rows: [fakeCoaching] }) // insert

        await createCoaching(req, res)

        expect(pool.query).toHaveBeenCalledTimes(3)
        expect(res.status).toHaveBeenCalledWith(201)
        expect(res.json).toHaveBeenCalledWith(fakeCoaching)
    })

    test('professor conflict - 409', async () => {
        const req = { body: fakeCoaching }
        const res = makeRes()

        // conflito de professor encontrado
        pool.query.mockResolvedValueOnce({ rows: [{ id_coaching: 99 }] })

        await createCoaching(req, res)

        expect(res.status).toHaveBeenCalledWith(409)
    })

    test('should return 500 if pool.query fails', async () => {
        const req = { body: fakeCoaching }
        const res = makeRes()

        pool.query.mockRejectedValueOnce(new Error('DB error'))

        await createCoaching(req, res)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({ error: 'DB error' })
    })
})

describe('readAllCoachings', () => {

    test('return all coachings', async () => {
        const req = {}
        const res = makeRes()

        pool.query.mockResolvedValueOnce({ rows: [fakeCoaching] })

        await readAllCoachings(req, res)

        expect(pool.query).toHaveBeenCalledTimes(1)
        expect(res.json).toHaveBeenCalledWith([fakeCoaching])
    })

    test('should return 500 if pool.query fails', async () => {
        const req = {}
        const res = makeRes()

        pool.query.mockRejectedValueOnce(new Error('DB error'))

        await readAllCoachings(req, res)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({ error: 'DB error' })
    })
})

describe('readCoachingById', () => {

    test('should return the coaching by id', async () => {
        const req = { params: { id: 1 } }
        const res = makeRes()

        pool.query.mockResolvedValueOnce({ rows: [fakeCoaching] })

        await readCoachingById(req, res)

        // verifica apenas os argumentos posicionais: id correto e query que filtra por id_coaching
        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining('WHERE id_coaching = $1'),
            [1]
        )
        expect(res.json).toHaveBeenCalledWith(fakeCoaching)
    })

    test('should return 500 if pool.query fails', async () => {
        const req = { params: { id: 1 } }
        const res = makeRes()

        pool.query.mockRejectedValueOnce(new Error('DB error'))

        await readCoachingById(req, res)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({ error: 'DB error' })
    })
})

describe('updateCoaching', () => {

    test('should update the coaching and return 200', async () => {
        const req = { params: { id: 1 }, body: fakeCoaching }
        const res = makeRes()

        // updateCoaching faz 3 queries quando status != 'cancelado':
        // conflito professor, conflito estúdio, update
        pool.query
            .mockResolvedValueOnce({ rows: [] })        // sem conflito de professor
            .mockResolvedValueOnce({ rows: [] })        // sem conflito de estúdio
            .mockResolvedValueOnce({ rows: [fakeCoaching] }) // update

        await updateCoaching(req, res)

        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith(fakeCoaching)
    })

    test('should skip conflict checks and update when status is cancelado', async () => {
        const req = { params: { id: 1 }, body: { ...fakeCoaching, status: 'cancelado' } }
        const res = makeRes()

        // status = 'cancelado' → salta as queries de conflito, só faz o update
        pool.query.mockResolvedValueOnce({ rows: [{ ...fakeCoaching, status: 'cancelado' }] })

        await updateCoaching(req, res)

        expect(pool.query).toHaveBeenCalledTimes(1)
        expect(res.status).toHaveBeenCalledWith(200)
    })

    test('should return 500 if pool.query fails', async () => {
        const req = { params: { id: 1 }, body: fakeCoaching }
        const res = makeRes()

        pool.query.mockRejectedValueOnce(new Error('DB error'))

        await updateCoaching(req, res)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({ error: 'DB error' })
    })
})

describe('deleteCoaching', () => {

    test('delete the coaching - 204', async () => {
        const req = { params: { id: 1 } }
        const res = makeRes()

        pool.query.mockResolvedValueOnce({ rows: [fakeCoaching] })

        await deleteCoaching(req, res)

        expect(pool.query).toHaveBeenCalledWith(
            'DELETE FROM coachings WHERE id_coaching = $1 RETURNING *',
            [1]
        )
        expect(res.status).toHaveBeenCalledWith(204)
    })

    test('should return 500 if pool.query fails', async () => {
        const req = { params: { id: 1 } }
        const res = makeRes()

        pool.query.mockRejectedValueOnce(new Error('DB error'))

        await deleteCoaching(req, res)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({ error: 'DB error' })
    })
})
