// __tests__/unit/coachingsController.test.js

const {createCoaching, readAllCoachings, readCoachingById, updateCoaching, deleteCoaching} = require('../../controllers/coachingsController')

// Mock do pool — mesmo padrão do authController
jest.mock('../../db', () => ({
    query: jest.fn()
}))
const pool = require('../../db')

// Factory para req/res — evita repetição em cada teste
const makeRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
})

// Dados reutilizáveis
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

// Limpa os mocks entre testes
beforeEach(() => {
    jest.clearAllMocks()
})

describe('createCoaching', () => {
    it('deve criar um coaching e retornar 201', async () => {
        const req = { body: fakeCoaching }
        const res = makeRes()

        pool.query.mockResolvedValueOnce({ rows: [fakeCoaching] })

        await createCoaching(req, res)

        expect(pool.query).toHaveBeenCalledTimes(1)
        expect(res.status).toHaveBeenCalledWith(201)
        expect(res.json).toHaveBeenCalledWith(fakeCoaching)
    })

    it('deve retornar 500 se o pool.query falhar', async () => {
        const req = { body: fakeCoaching }
        const res = makeRes()

        pool.query.mockRejectedValueOnce(new Error('DB error'))

        await createCoaching(req, res)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({ error: 'DB error' })
    })
})


describe('readAllCoachings', () => {
    it('deve retornar todos os coachings', async () => {
        const req = {}
        const res = makeRes()

        pool.query.mockResolvedValueOnce({ rows: [fakeCoaching] })

        await readAllCoachings(req, res)

        expect(pool.query).toHaveBeenCalledTimes(1)
        expect(res.json).toHaveBeenCalledWith([fakeCoaching])
    })

    it('deve retornar 500 se o pool.query falhar', async () => {
        const req = {}
        const res = makeRes()

        pool.query.mockRejectedValueOnce(new Error('DB error'))

        await readAllCoachings(req, res)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({ error: 'DB error' })
    })
})

describe('readCoachingById', () => {
    it('deve retornar o coaching pelo id', async () => {
        const req = { params: { id: 1 } }
        const res = makeRes()

        pool.query.mockResolvedValueOnce({ rows: [fakeCoaching] })

        await readCoachingById(req, res)

        expect(pool.query).toHaveBeenCalledWith(
            'SELECT * FROM coachings WHERE id_coaching = $1',
            [1]
        )
        // Bug: o controller faz res.json(result.rows) em vez de result.rows[0]
        // O teste documenta o comportamento ATUAL — array em vez de objeto
        expect(res.json).toHaveBeenCalledWith([fakeCoaching])
    })

    it('deve retornar 500 se o pool.query falhar', async () => {
        const req = { params: { id: 1 } }
        const res = makeRes()

        pool.query.mockRejectedValueOnce(new Error('DB error'))

        await readCoachingById(req, res)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({ error: 'DB error' })
    })
})

describe('updateCoaching', () => {
    it('deve atualizar o coaching e retornar 200', async () => {
        const req = { params: { id: 1 }, body: fakeCoaching }
        const res = makeRes()

        pool.query.mockResolvedValueOnce({ rows: [fakeCoaching] })

        await updateCoaching(req, res)

        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith(fakeCoaching)
    })

    it('deve retornar 500 se o pool.query falhar', async () => {
        const req = { params: { id: 1 }, body: fakeCoaching }
        const res = makeRes()

        pool.query.mockRejectedValueOnce(new Error('DB error'))

        await updateCoaching(req, res)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({ error: 'DB error' })
    })
})

describe('deleteCoaching', () => {
    it('deve eliminar o coaching e retornar 204', async () => {
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

    it('deve retornar 500 se o pool.query falhar', async () => {
        const req = { params: { id: 1 } }
        const res = makeRes()

        pool.query.mockRejectedValueOnce(new Error('DB error'))

        await deleteCoaching(req, res)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({ error: 'DB error' })
    })
})