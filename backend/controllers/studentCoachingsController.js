// CRUD INCOMPLETO - CREATE, READ E DELETE
// Nota: o UPDATE foi ignorado porque, em tabelas de associação, a alteração de um par (estudante/coaching) é feita removendo o antigo e criando um novo.

const pool = require('../db')

// cria o coaching para o estudante
const createStudentCoaching = async (req, res) => {
    try {
        const { id_student, id_coaching } = req.body
        const result = await pool.query(
            'INSERT INTO student_coachings (id_student, id_coaching) VALUES ($1, $2) RETURNING *',
            [id_student, id_coaching]
        )
        res.status(201).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// lê todos os coachings dos estudantes
const readAllStudentCoachings = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM student_coachings')
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// lê os coachings do estudante pelo id do estudante
const readStudentCoachingsByStudent = async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query('SELECT * FROM student_coachings WHERE id_student = $1', [id])
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// elimina o coaching do estudante pelo id do estudante e do coaching
const deleteStudentCoaching = async (req, res) => {
    try {
        const { id_student, id_coaching } = req.params
        const result = await pool.query(
            'DELETE FROM student_coachings WHERE id_student = $1 AND id_coaching = $2 RETURNING *',
            [id_student, id_coaching]
        )
        res.status(204).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { createStudentCoaching, readAllStudentCoachings, readStudentCoachingsByStudent, deleteStudentCoaching }