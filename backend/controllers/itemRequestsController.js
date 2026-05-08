// CRUD COMPLETO - CREATE, READ, UPDATE E DELETE

const pool = require('../db')

// cria um pedido de item
const createItemRequest = async (req, res) => {
    try {
        const { request_date, return_date, id_item, id_user, delivery_status, request_status } = req.body

        // ── Limite de 3 requisições ativas por utilizador ─────────────────────
        const activeCount = await pool.query(
            'SELECT COUNT(*) FROM item_requests WHERE id_user = $1 AND return_date IS NULL',
            [id_user]
        )
        if (parseInt(activeCount.rows[0].count) >= 3) {
            return res.status(409).json({
                error: 'Atingiste o limite de 3 requisições ativas. Devolve um item antes de requisitar outro.'
            })
        }

        // ── Impedir requisição do próprio item ────────────────────────────────
        const item = await pool.query(
            'SELECT id_user FROM items WHERE id_item = $1',
            [id_item]
        )
        if (item.rows.length > 0 && item.rows[0].id_user === id_user) {
            return res.status(403).json({
                error: 'Não podes requisitar um item que tu próprio adicionaste.'
            })
        }

        // ── Criar a requisição ────────────────────────────────────────────────
        const result = await pool.query(
            'INSERT INTO item_requests (request_date, return_date, id_item, id_user, delivery_status, request_status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [request_date, return_date, id_item, id_user, delivery_status, request_status]
        )
        res.status(201).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// lê todos os pedidos de itens
const readAllItemRequests = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM item_requests')
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// lê o pedidos de item pelo id
const readItemRequestById = async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query('SELECT * FROM item_requests WHERE id_item_request = $1', [id])
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// atualiza o pedido do item pelo id
const updateItemRequest = async (req, res) => {
    try {
        const { id } = req.params
        const { request_date, return_date, id_item, id_user, delivery_status, request_status } = req.body
        const result = await pool.query(
            'UPDATE item_requests SET request_date = $1, return_date = $2, id_item = $3, id_user = $4, delivery_status = $5, request_status = $6 WHERE id_item_request = $7 RETURNING *',
            [request_date, return_date, id_item, id_user, delivery_status, request_status, id]
        )
        res.status(200).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// elimina o pedido do item pelo id
const deleteItemRequest = async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query(
            'DELETE FROM item_requests WHERE id_item_request = $1 RETURNING *',
            [id]
        )
        res.status(204).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { createItemRequest, readAllItemRequests, readItemRequestById, updateItemRequest, deleteItemRequest }