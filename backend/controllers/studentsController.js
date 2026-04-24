// CRUD COMPLETO - CREATE, READ, UPDATE E DELETE
const pool = require('../db')

// cria o estudante
const createStudent = async (req, res) => {
    try {
        const { name, birth_date, id_user } = req.body
        const result = await pool.query(
            'INSERT INTO students (name, birth_date, id_user) VALUES ($1, $2, $3) RETURNING *',
            [name, birth_date, id_user]
        )
        res.status(201).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// lê todos os estudantes
const readAllStudents = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM students')
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// lê o estudante pelo id
const readStudentById = async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query('SELECT * FROM students WHERE id_student = $1', [id])
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// atualiza o estudante pelo id
const updateStudent = async (req, res) => {
    try {
        const { id } = req.params
        const { name, birth_date, id_user } = req.body
        const result = await pool.query(
            'UPDATE students SET name = $1, birth_date = $2, id_user = $3 WHERE id_student = $4 RETURNING *',
            [name, birth_date, id_user, id]
        )
        res.status(200).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// elimina o estudante pelo id
const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query(
            'DELETE FROM students WHERE id_student = $1 RETURNING *',
            [id]
        )
        res.status(204).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { createStudent, readAllStudents, readStudentById, updateStudent, deleteStudent }