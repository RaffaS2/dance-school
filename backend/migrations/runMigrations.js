const pool = require('../db');

const migrations = [
	{
		name: '001_add_image_url_to_items',
		query: 'ALTER TABLE items ADD COLUMN image_url VARCHAR(500) NULL;'
	}
];

async function runMigrations() {
	const client = await pool.connect();
	try {
		console.log('Iniciando migrações do banco de dados...\n');

		for (const migration of migrations) {
			try {
				console.log(`Executando: ${migration.name}...`);
				await client.query(migration.query);
				console.log(`✅ ${migration.name} concluída com sucesso\n`);
			} catch (error) {
				// Se a coluna já existe, não é erro crítico
				if (error.message.includes('already exists')) {
					console.log(`⚠️  ${migration.name}: Coluna já existe\n`);
				} else {
					console.error(`❌ Erro em ${migration.name}:`, error.message, '\n');
					throw error;
				}
			}
		}

		console.log('✅ Todas as migrações foram executadas com sucesso!');
	} catch (error) {
		console.error('❌ Falha nas migrações:', error);
		process.exit(1);
	} finally {
		client.release();
		await pool.end();
	}
}

// Executar se for chamado diretamente
if (require.main === module) {
	runMigrations().catch(console.error);
}

module.exports = runMigrations;
