// Importa o Pool do pacote pg
// O Pool gere múltiplas ligações à base de dados de forma eficiente
const { Pool } = require('pg')

// Cria uma instância do Pool com as configurações de ligação
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // URL de ligação ao Neon (vem do .env)
  ssl: { rejectUnauthorized: false } // O Neon exige ligação SSL segura
})

// Exporta o pool para ser usado noutros ficheiros (ex: server.js)
module.exports = pool