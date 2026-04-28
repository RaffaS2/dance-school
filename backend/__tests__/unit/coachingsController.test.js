// Importa as funções do controller que vamos testar
const { createCoaching, readAllCoachings, readCoachingById, updateCoaching, deleteCoaching } = require('../../controllers/coachingsController')

// Substitui o módulo real da base de dados por um mock —
// assim os testes nunca tocam numa BD real
jest.mock('../../db', () => ({
    query: jest.fn() // query é uma função espiã que podemos controlar em cada teste
}))

// Importa o pool já mockado para poder configurar o seu comportamento
const pool = require('../../db')

// Factory que cria um objeto res falso do Express.
// mockReturnThis() permite encadear chamadas: res.status(201).json({})
const makeRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
})

// Objeto de coaching reutilizável em todos os testes
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

// Limpa o histórico de chamadas de todos os mocks antes de cada teste,
// para que um teste não interfira com o seguinte
beforeEach(() => {
    jest.clearAllMocks()
})

describe('createCoaching', () => {

    // Caso feliz: a BD aceita o insert e o controller devolve 201
    test('create a coaching - 201', async () => {
        const req = { body: fakeCoaching } // simula o corpo do pedido HTTP
        const res = makeRes()

        // Configura o mock para simular uma resposta bem-sucedida da BD
        pool.query.mockResolvedValueOnce({ rows: [fakeCoaching] })

        await createCoaching(req, res)

        // Verifica que a BD foi consultada exatamente uma vez
        expect(pool.query).toHaveBeenCalledTimes(1)
        // Verifica que o controller respondeu com 201 Created
        expect(res.status).toHaveBeenCalledWith(201)
        // Verifica que o corpo da resposta é o coaching criado
        expect(res.json).toHaveBeenCalledWith(fakeCoaching)
    })

    // Caso de erro: a BD falha e o controller deve devolver 500
    test('should return 500 if pool.query fails', async () => {
        const req = { body: fakeCoaching }
        const res = makeRes()

        // Simula uma falha da BD (ex: ligação perdida, constraint violada)
        pool.query.mockRejectedValueOnce(new Error('DB error'))

        await createCoaching(req, res)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({ error: 'DB error' })
    })
})

describe('readAllCoachings', () => {

    // Caso feliz: a BD devolve uma lista de coachings
    test('return all coachings', async () => {
        const req = {} // não precisa de params nem body
        const res = makeRes()

        pool.query.mockResolvedValueOnce({ rows: [fakeCoaching] })

        await readAllCoachings(req, res)

        expect(pool.query).toHaveBeenCalledTimes(1)
        // Verifica que o controller devolveu o array de coachings diretamente
        expect(res.json).toHaveBeenCalledWith([fakeCoaching])
    })

    // Caso de erro: falha da BD
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

    // Caso feliz: a BD encontra o coaching pelo id
    test('should return the coaching by id', async () => {
        const req = { params: { id: 1 } } // simula /coachings/1
        const res = makeRes()

        pool.query.mockResolvedValueOnce({ rows: [fakeCoaching] })

        await readCoachingById(req, res)

        // Verifica que o controller usou o id correto no WHERE
        expect(pool.query).toHaveBeenCalledWith(
            'SELECT * FROM coachings WHERE id_coaching = $1',
            [1]
        )
        // O teste documenta o comportamento ATUAL — array em vez de objeto
        expect(res.json).toHaveBeenCalledWith(fakeCoaching)
    })

    // Caso de erro: falha da BD
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

    // Caso feliz: a BD atualiza o coaching e o controller devolve 200
    test('should update the coaching and return 200', async () => {
        const req = { params: { id: 1 }, body: fakeCoaching } // id na URL + dados no body
        const res = makeRes()

        pool.query.mockResolvedValueOnce({ rows: [fakeCoaching] })

        await updateCoaching(req, res)

        expect(res.status).toHaveBeenCalledWith(200)
        // Verifica que o controller devolve o coaching já atualizado
        expect(res.json).toHaveBeenCalledWith(fakeCoaching)
    })

    // Caso de erro: falha da BD
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

    // Caso feliz: a BD elimina o coaching e o controller devolve 204 No Content
    test('delete the coaching - 204', async () => {
        const req = { params: { id: 1 } }
        const res = makeRes()

        pool.query.mockResolvedValueOnce({ rows: [fakeCoaching] })

        await deleteCoaching(req, res)

        // Verifica que o DELETE usou o RETURNING * e o id correto
        expect(pool.query).toHaveBeenCalledWith(
            'DELETE FROM coachings WHERE id_coaching = $1 RETURNING *',
            [1]
        )
        // 204 No Content — sucesso sem corpo na resposta
        expect(res.status).toHaveBeenCalledWith(204)
    })

    // Caso de erro: falha da BD
    test('should return 500 if pool.query fails', async () => {
        const req = { params: { id: 1 } }
        const res = makeRes()

        pool.query.mockRejectedValueOnce(new Error('DB error'))

        await deleteCoaching(req, res)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({ error: 'DB error' })
    })
})