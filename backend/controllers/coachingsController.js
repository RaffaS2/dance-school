// CRUD COMPLETO - CREATE, READ, UPDATE E DELETE

const pool = require('../db')

// cria o coaching — verifica conflitos de professor e estúdio
const createCoaching = async (req, res) => {
    try {
        const { id_professor, id_studio, id_modality, date, start_time, duration_minutes, status, price } = req.body

        // Conflito de professor
        const professorConflict = await pool.query(`
            SELECT id_coaching FROM coachings
            WHERE id_professor = $1
              AND date = $2
              AND status != 'cancelado'
              AND start_time < ($3::time + ($4 || ' minutes')::interval)
              AND (start_time + (duration_minutes || ' minutes')::interval) > $3::time
        `, [id_professor, date, start_time, duration_minutes])

        if (professorConflict.rows.length > 0) {
            return res.status(409).json({ error: 'Este professor já tem uma aula marcada neste horário.' })
        }

        // Conflito de estúdio
        const studioConflict = await pool.query(`
            SELECT id_coaching FROM coachings
            WHERE id_studio = $1
              AND date = $2
              AND status != 'cancelado'
              AND start_time < ($3::time + ($4 || ' minutes')::interval)
              AND (start_time + (duration_minutes || ' minutes')::interval) > $3::time
        `, [id_studio, date, start_time, duration_minutes])

        if (studioConflict.rows.length > 0) {
            return res.status(409).json({ error: 'Este estúdio já está ocupado neste horário.' })
        }

        // Sem conflitos — inserir
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
    c.id_professor,
    u.name AS professor,
    m.name AS modalidade,
    s.name AS estudio,
    TO_CHAR(c.date, 'YYYY-MM-DD') AS date,
    c.start_time,
    c.duration_minutes,
    c.status,
    c.price
    FROM coachings c
    LEFT JOIN professors p ON c.id_professor = p.id_professor
    LEFT JOIN users u ON p.id_user = u.id_user
    LEFT JOIN modalities m ON c.id_modality = m.id_modality
    LEFT JOIN studios s ON c.id_studio = s.id_studio
    ORDER BY c.date, c.start_time
        `)
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// lê o coaching pelo id
const readCoachingById = async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query(
            `SELECT id_coaching, id_professor, id_studio, id_modality, TO_CHAR(date, 'YYYY-MM-DD') AS date, start_time, duration_minutes, status, price, professor_validation, guardian_validation, coordination_validation 
             FROM coachings WHERE id_coaching = $1`,
            [id]
        )
        res.json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// atualiza o coaching pelo id — verifica conflitos excluindo o próprio registo
const updateCoaching = async (req, res) => {
    try {
        const { id } = req.params
        const { id_professor, id_studio, id_modality, date, start_time, duration_minutes, status, price, professor_validation, guardian_validation, coordination_validation } = req.body

        if (status !== 'cancelado') {
            const professorConflict = await pool.query(`
                SELECT id_coaching FROM coachings
                WHERE id_professor = $1
                  AND date = $2
                  AND status != 'cancelado'
                  AND id_coaching != $5
                  AND start_time < ($3::time + ($4 || ' minutes')::interval)
                  AND (start_time + (duration_minutes || ' minutes')::interval) > $3::time
            `, [id_professor, date, start_time, duration_minutes, id])

            if (professorConflict.rows.length > 0) {
                return res.status(409).json({ error: 'Este professor já tem uma aula marcada neste horário.' })
            }

            const studioConflict = await pool.query(`
                SELECT id_coaching FROM coachings
                WHERE id_studio = $1
                  AND date = $2
                  AND status != 'cancelado'
                  AND id_coaching != $5
                  AND start_time < ($3::time + ($4 || ' minutes')::interval)
                  AND (start_time + (duration_minutes || ' minutes')::interval) > $3::time
            `, [id_studio, date, start_time, duration_minutes, id])

            if (studioConflict.rows.length > 0) {
                return res.status(409).json({ error: 'Este estúdio já está ocupado neste horário.' })
            }
        }

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

const readCoachingsByProfessor = async (req, res) => {
    try {
        const { id_professor } = req.params
        const result = await pool.query(`
            SELECT 
                c.id_coaching,
                u.name AS professor,
                m.name AS modalidade,
                s.name AS estudio,
                TO_CHAR(c.date, 'YYYY-MM-DD') AS date,
                c.start_time,
                c.duration_minutes,
                c.status,
                c.price
            FROM coachings c
            LEFT JOIN professors p ON c.id_professor = p.id_professor
            LEFT JOIN users u ON p.id_user = u.id_user
            LEFT JOIN modalities m ON c.id_modality = m.id_modality
            LEFT JOIN studios s ON c.id_studio = s.id_studio
            WHERE c.id_professor = $1
            ORDER BY c.date, c.start_time
        `, [id_professor])
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const readCoachingsByGuardian = async (req, res) => {
    try {
        const { id_user } = req.params
        const result = await pool.query(`
            SELECT 
                c.id_coaching,
                u.name AS professor,
                m.name AS modalidade,
                s.name AS estudio,
                st.name AS aluno,
                TO_CHAR(c.date, 'YYYY-MM-DD') AS date,
                c.start_time,
                c.duration_minutes,
                c.status,
                c.price
            FROM coachings c
            LEFT JOIN professors p ON c.id_professor = p.id_professor
            LEFT JOIN users u ON p.id_user = u.id_user
            LEFT JOIN modalities m ON c.id_modality = m.id_modality
            LEFT JOIN studios s ON c.id_studio = s.id_studio
            LEFT JOIN student_coachings sc ON c.id_coaching = sc.id_coaching
            LEFT JOIN students st ON sc.id_student = st.id_student
            WHERE st.id_user = $1
            ORDER BY c.date, c.start_time
        `, [id_user])
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = {
    createCoaching,
    readAllCoachings,
    readCoachingById,
    readCoachingsByProfessor,
    readCoachingsByGuardian,
    updateCoaching,
    deleteCoaching,
}