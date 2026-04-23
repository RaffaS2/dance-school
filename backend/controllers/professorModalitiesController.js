// CRUD INCOMPLETO - CREATE, READ E DELETE
// Nota: o UPDATE foi ignorado pois, em tabelas de associação, a alteração de um par (professor/modalidade) é feita removendo o antigo e criando um novo.

const pool = require('../db')

// cria a modalidade para o professor
const createProfessorModality = async (req, res) => {
    try {
        const { id_professor, id_modality } = req.body
        const result = await pool.query(
            'INSERT INTO professor_modalities (id_professor, id_modality) VALUES ($1, $2) RETURNING *',
            [id_professor, id_modality]
        )
        res.status(201).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// lê todas as modalidedes do professor
const readAllProfessorModalities = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM professor_modalities')
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// lê a modalidade do professor pelo id do professor
const readProfessorModalitiesByProfessor = async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query('SELECT * FROM professor_modalities WHERE id_professor = $1', [id])
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// elimina uma modalidade de um professor pelo id do professor e da modalidade
const deleteProfessorModality = async (req, res) => {
    try {
        const { id_professor, id_modality } = req.params
        const result = await pool.query(
            'DELETE FROM professor_modalities WHERE id_professor = $1 AND id_modality = $2 RETURNING *',
            [id_professor, id_modality]
        )
        res.status(204).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { createProfessorModality, readAllProfessorModalities, readProfessorModalitiesByProfessor, deleteProfessorModality }