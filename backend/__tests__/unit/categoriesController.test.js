// __tests__/unit/categoriesController.test.js

const {
    createCategory,
    readAllCategories,
    readCategoryById,
    updateCategory,
    deleteCategory
} = require('../../controllers/categoriesController')

jest.mock('../../db', () => ({
    query: jest.fn()
}))

const pool = require('../../db')

const makeRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
})

const fakeCategory = {
    id_category: 1,
    name: 'test category'
}

beforeEach(() => {
    jest.clearAllMocks()
})

describe('createCategory', () => {

    test('create category - 201', async () => {

        const req = { body: { name: 'test category' } }
        const res = makeRes()

        pool.query.mockResolvedValueOnce({ rows: [fakeCategory] })

        await createCategory(req, res)

        expect(pool.query).toHaveBeenCalledTimes(1)
        expect(res.status).toHaveBeenCalledWith(201)
        expect(res.json).toHaveBeenCalledWith(fakeCategory)
    })

    test('should return 500 if pool.query fails', async () => {

        const req = { body: { name: 'test category' } }
        const res = makeRes()

        pool.query.mockRejectedValueOnce(new Error('DB error'))

        await createCategory(req, res)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({ error: 'DB error' })
    })
})

describe('readAllCategories', () => {

    test('return all categories', async () => {

        const req = {}
        const res = makeRes()

        pool.query.mockResolvedValueOnce({ rows: [fakeCategory] })

        await readAllCategories(req, res)

        expect(res.json).toHaveBeenCalledWith([fakeCategory])
    })
})

describe('readCategoryById', () => {

    test('return category by id', async () => {

        const req = { params: { id: 1 } }
        const res = makeRes()

        pool.query.mockResolvedValueOnce({ rows: [fakeCategory] })

        await readCategoryById(req, res)

        expect(pool.query).toHaveBeenCalledWith(
            'SELECT * FROM categories WHERE id_category = $1',
            [1]
        )

        expect(res.json).toHaveBeenCalledWith([fakeCategory])
    })
})

describe('updateCategory', () => {

    test('update category - 200', async () => {

        const req = {
            params: { id: 1 },
            body: { name: 'updated category' }
        }

        const res = makeRes()

        const updated = { id_category: 1, name: 'updated category' }

        pool.query.mockResolvedValueOnce({ rows: [updated] })

        await updateCategory(req, res)

        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith(updated)
    })
})

describe('deleteCategory', () => {

    test('delete category - 204', async () => {

        const req = { params: { id: 1 } }
        const res = makeRes()

        pool.query.mockResolvedValueOnce({ rows: [fakeCategory] })

        await deleteCategory(req, res)

        expect(res.status).toHaveBeenCalledWith(204)
    })
})