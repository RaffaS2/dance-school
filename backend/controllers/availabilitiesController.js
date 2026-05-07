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
        const result = await pool.query(`
            SELECT 
                a.id_availability,
                TO_CHAR(a.date, 'YYYY-MM-DD') AS date,
                a.start_time,
                a.end_time,
                p.id_professor,
                p.id_user,
                u.name AS professor
            FROM availabilities a
            LEFT JOIN professors p ON a.id_professor = p.id_professor
            LEFT JOIN users u ON p.id_user = u.id_user
            ORDER BY a.date, a.start_time
        `)
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// lê o availability pelo id 
const readAvailabilityById = async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query(
            `SELECT id_availability, TO_CHAR(date, 'YYYY-MM-DD') AS date, start_time, end_time, recurring, id_professor 
             FROM availabilities WHERE id_availability = $1`,
            [id]
        )
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// lê availabilities pelo id do professor — exclui slots já ocupados por coachings ativos
const readAvailabilitiesByProfessor = async (req, res) => {
    try {
        const { id_professor } = req.params

        // Todas as disponibilidades do professor
        const availsRes = await pool.query(
            `SELECT id_availability, TO_CHAR(date, 'YYYY-MM-DD') AS date, start_time, end_time, recurring, id_professor
             FROM availabilities WHERE id_professor = $1
             ORDER BY date, start_time`,
            [id_professor]
        )

        // Coachings ativos do professor
        const coachingsRes = await pool.query(
            `SELECT TO_CHAR(date, 'YYYY-MM-DD') AS date, start_time, duration_minutes
             FROM coachings
             WHERE id_professor = $1 AND status != 'cancelado'`,
            [id_professor]
        )

        // Filtrar disponibilidades que não se sobrepõem a nenhum coaching ativo
        const disponiveis = availsRes.rows.filter(av => {
            const avStart = av.start_time.slice(0, 5)
            const avEnd   = av.end_time ? av.end_time.slice(0, 5) : '23:59'

            return !coachingsRes.rows.some(c => {
                if (c.date !== av.date) return false

                const cStart = c.start_time.slice(0, 5)
                const [ch, cm] = cStart.split(':').map(Number)
                const cEndMin = ch * 60 + cm + (parseInt(c.duration_minutes) || 60)
                const cEnd = `${String(Math.floor(cEndMin / 60)).padStart(2, '0')}:${String(cEndMin % 60).padStart(2, '0')}`

                return cStart < avEnd && cEnd > avStart
            })
        })

        res.json(disponiveis)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: error.message })
    }
}

// elimina a availability pelo id
const deleteAvailability = async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query(
            'DELETE FROM availabilities WHERE id_availability = $1 RETURNING *',
            [id]
        )
        res.status(204).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { 
    createAvailability, 
    readAllAvailabilities, 
    readAvailabilityById, 
    readAvailabilitiesByProfessor,
    deleteAvailability,
}