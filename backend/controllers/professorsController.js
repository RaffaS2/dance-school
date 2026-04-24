// CRUD COMPLETO - CREATE, READ, UPDATE E DELETE

const pool = require('../db')

// cria um professor
const createProfessor = async (req, res) => {
    try {
      const { specialty, id_user } = req.body
      const result = await pool.query(
        'INSERT INTO professors (specialty, id_user) VALUES ($1, $2) RETURNING *',
        [specialty, id_user]
      )
      res.status(201).json(result.rows[0])
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
// lê todos os professors
const readAllProfessors = async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM professors')
      res.json(result.rows)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
  
  // lê um professor pelo id
  const readProfessorById = async (req, res) => {
    try {
      const { id } = req.params
      const result = await pool.query('SELECT * FROM professors WHERE id_professor = $1', [id])
      res.json(result.rows)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
  
  // atualiza um professor pelo id
  const updateProfessor = async (req, res) => {
      try{
        const { id } = req.params
        const { specialty, active, id_user } = req.body
        const result = await pool.query(
          'UPDATE professors SET specialty = $1, active = $2, id_user = $3 WHERE id_professor = $4 RETURNING *',
          [specialty, active, id_user, id]
        )
        res.status(200).json(result.rows[0])
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    }
  
  // elimina o professor pelo id
  const deleteProfessor = async (req, res) => {
      try {
          const { id } = req.params
          const result = await pool.query(
              'DELETE FROM professors WHERE id_professor = $1 RETURNING *',
              [id]
          )
          res.status(204).json(result.rows[0])
      } catch (error) {
          res.status(500).json({ error: error.message })
      }
  }
  
  module.exports = { createProfessor, readAllProfessors, readProfessorById, updateProfessor, deleteProfessor }