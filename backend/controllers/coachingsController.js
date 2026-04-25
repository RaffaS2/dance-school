// CRUD COMPLETO - CREATE, READ, UPDATE E DELETE

const pool = require('../db')

// cria o coaching
const createCoaching = async (req, res) => {
    try {
        const { id_professor, id_studio, id_modality, date, start_time, duration_minutes, status, price } = req.body
        const result = await pool.query(
            'INSERT INTO coachings (id_professor, id_studio, id_modality, date, start_time, duration_minutes, status, price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [id_professor, id_studio, id_modality, date, start_time, duration_minutes, status, price]
        )
        res.status(201).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// lê todos os coachings
const readAllCoachings = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                c.id_coaching,
                u.name AS professor,
                c.date,
                c.start_time,
                c.duration_minutes,
                c.status,
                c.price
            FROM coachings c
            LEFT JOIN professors p ON c.id_professor = p.id_professor
            LEFT JOIN users u ON p.id_user = u.id_user
            ORDER BY c.date, c.start_time
        `)

        res.json(result.rows)
    } catch (error) {
        console.error("ERRO:", error)
        res.status(500).json({ error: error.message })
    }
}

// lê o coaching pelo id
const readCoachingById = async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query('SELECT * FROM coachings WHERE id_coaching = $1', [id])
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// atualiza o coaching pelo id
const updateCoaching = async (req, res) => {
    try {
        const { id } = req.params
        const { id_professor, id_studio, id_modality, date, start_time, duration_minutes, status, price, professor_validation, guardian_validation, coordination_validation } = req.body
        const result = await pool.query(
            'UPDATE coachings SET id_professor = $1, id_studio = $2, id_modality = $3, date = $4, start_time = $5, duration_minutes = $6, status = $7, price = $8, professor_validation = $9, guardian_validation = $10, coordination_validation = $11 WHERE id_coaching = $12 RETURNING *',
            [id_professor, id_studio, id_modality, date, start_time, duration_minutes, status, price, professor_validation, guardian_validation, coordination_validation, id]
        )
        res.status(200).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// elimina o coaching pelo id
const deleteCoaching = async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query(
            'DELETE FROM coachings WHERE id_coaching = $1 RETURNING *',
            [id]
        )
        res.status(204).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { createCoaching, readAllCoachings, readCoachingById, updateCoaching, deleteCoaching }