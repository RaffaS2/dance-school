const pool = require('./db');

async function run() {
  try {
    const q1 = await pool.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (
          WHERE LOWER(COALESCE(status, '')) LIKE '%pend%'
             OR LOWER(COALESCE(status, '')) LIKE '%aguard%'
             OR professor_validation IS NULL
             OR professor_validation = false
        )::int AS pendentes
      FROM coachings
    `);

    const q2 = await pool.query(`
      SELECT
        p.id_professor,
        p.id_user,
        u.name,
        COUNT(c.*)::int AS total,
        COUNT(c.*) FILTER (
          WHERE LOWER(COALESCE(c.status, '')) LIKE '%pend%'
             OR LOWER(COALESCE(c.status, '')) LIKE '%aguard%'
             OR c.professor_validation IS NULL
             OR c.professor_validation = false
        )::int AS pendentes
      FROM professors p
      JOIN users u ON u.id_user = p.id_user
      LEFT JOIN coachings c ON c.id_professor = p.id_professor
      GROUP BY p.id_professor, p.id_user, u.name
      ORDER BY p.id_professor
    `);

    console.log('Resumo coachings:', q1.rows);
    console.log('Por professor:', q2.rows);
  } catch (error) {
    console.error(error);
  } finally {
    await pool.end();
  }
}

void run();
