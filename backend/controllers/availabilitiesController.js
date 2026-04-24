// CRUD COMPLETO - CREATE, READ, UPDATE E DELETE
const pool = require('../db')

// cria a availability
const createAvailability = async (req, res) => {
  try {
    const { date, start_time, end_time, recurring, id_professor } = req.body

    const result = await pool.query(    
      `INSERT INTO availabilities (date, start_time, end_time, recurring, id_professor) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [date, start_time, end_time, recurring, id_professor]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// lê todos os availabilities
const readAllAvailabilities = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM availabilities')
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// lê o professor pelo id 
const readAvailabilityById = async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query('SELECT * FROM availabilities WHERE id_availability = $1', [id])
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// lê availabilities pelo id do professor
const readAvailabilitiesByProfessor = async (req, res) => {
    try {
        const { id_professor } = req.params  // comes from /professors/:id_professor/availabilities
        const result = await pool.query(
            'SELECT * FROM availabilities WHERE id_professor = $1', 
            [id_professor]
        )
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { createAvailability, readAllAvailabilities, readAvailabilityById, readAvailabilitiesByProfessor}
