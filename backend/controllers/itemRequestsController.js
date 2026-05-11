// CRUD COMPLETO - CREATE, READ, UPDATE E DELETE

const pool = require('../db')

function hojeISO() {
    return new Date().toISOString().split('T')[0]
}

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
        const { action, request_date, return_date, id_item, id_user, delivery_status, request_status } = req.body

        const current = await pool.query(
            'SELECT id_item_request, id_item, id_user, return_date, request_status FROM item_requests WHERE id_item_request = $1',
            [id]
        )

        if (current.rows.length === 0) {
            return res.status(404).json({ error: 'Requisição não encontrada.' })
        }

        const request = current.rows[0]
        const userType = Number(req.user?.id_user_type)
        const userId = Number(req.user?.id)

        if (action === 'request_return') {
            if (request.return_date) {
                return res.status(409).json({ error: 'Esta devolução já foi concluída.' })
            }

            if (userType !== 1 && request.id_user !== userId) {
                return res.status(403).json({ error: 'Sem permissão para pedir a devolução desta requisição.' })
            }

            if (request.request_status === 2) {
                return res.status(409).json({ error: 'Esta devolução já está pendente de aprovação.' })
            }

            const result = await pool.query(
                'UPDATE item_requests SET request_status = 2 WHERE id_item_request = $1 RETURNING *',
                [id]
            )
            return res.status(200).json(result.rows[0])
        }

        if (action === 'approve_return') {
            if (userType !== 1) {
                return res.status(403).json({ error: 'Apenas administradores podem aprovar devoluções.' })
            }

            if (request.return_date) {
                return res.status(409).json({ error: 'Esta requisição já foi concluída.' })
            }

            if (request.request_status !== 2) {
                return res.status(409).json({ error: 'Não existe um pedido de devolução pendente.' })
            }

            const result = await pool.query(
                'UPDATE item_requests SET return_date = $1, request_status = 3 WHERE id_item_request = $2 RETURNING *',
                [return_date || hojeISO(), id]
            )
            return res.status(200).json(result.rows[0])
        }

        if (action === 'reject_return') {
            if (userType !== 1) {
                return res.status(403).json({ error: 'Apenas administradores podem rejeitar devoluções.' })
            }

            if (request.return_date) {
                return res.status(409).json({ error: 'Esta requisição já foi concluída.' })
            }

            if (request.request_status !== 2) {
                return res.status(409).json({ error: 'Não existe um pedido de devolução pendente.' })
            }

            const result = await pool.query(
                'UPDATE item_requests SET request_status = 1 WHERE id_item_request = $1 RETURNING *',
                [id]
            )
            return res.status(200).json(result.rows[0])
        }

        const result = await pool.query(
            'UPDATE item_requests SET request_date = $1, return_date = $2, id_item = $3, id_user = $4, delivery_status = $5, request_status = $6 WHERE id_item_request = $7 RETURNING *',
            [request_date, return_date, id_item, id_user, delivery_status, request_status, id]
        )
        return res.status(200).json(result.rows[0])
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