// CRUD INCOMPLETO - CREATE, READ E DELETE
// Nota: o UPDATE foi ignorado pois, em tabelas de associação, a alteração de um par (estudio/modalidade) é feita removendo o antigo e criando um novo.

const pool = require('../db')

// cria a modalidade para o estúdio
const createStudioModality = async (req, res) => {
    try {
        const { id_studio, id_modality } = req.body
        const result = await pool.query(
            'INSERT INTO studio_modalities (id_studio, id_modality) VALUES ($1, $2) RETURNING *',
            [id_studio, id_modality]
        )
        res.status(201).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// lê todas as modalidedes do estúdio
const readAllStudioModalities = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM studio_modalities')
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// lê as modalidades do estúdio pelo id do estúdio
const readStudioModalitiesByStudio = async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query('SELECT * FROM studio_modalities WHERE id_studio = $1', [id])
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// elimina a modalidade do estúdio pelo id do estúdio e da modalidade
const deleteStudioModality = async (req, res) => {
    try {
        const { id_studio, id_modality } = req.params
        const result = await pool.query(
            'DELETE FROM studio_modalities WHERE id_studio = $1 AND id_modality = $2 RETURNING *',
            [id_studio, id_modality]
        )
        res.status(204).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { createStudioModality, readAllStudioModalities, readStudioModalitiesByStudio, deleteStudioModality }