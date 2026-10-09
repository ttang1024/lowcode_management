/**
 * `npm run db:migrate`: applies pending schema migrations (see ./migrations),
 * then exits. Connects with DB_URL, DB_USER and DB_PASSWORD, e.g.
 * DB_URL=mysql://db.internal:3306/lowcode.
 */
import { applyDatabaseConfig } from './config';
import SequelizeDbInitializer from './models';
import { migrate } from './migrations';

async function main() {
  if (!process.env.DB_URL) throw new Error('Set DB_URL (e.g. mysql://host:3306/lowcode), DB_USER and DB_PASSWORD');
  applyDatabaseConfig({ url: process.env.DB_URL, username: process.env.DB_USER, password: process.env.DB_PASSWORD });
  const db = new SequelizeDbInitializer();
  await db.initialize();
  try {
    const applied = await migrate(db.connection);
    console.log(applied.length ? `Applied: ${applied.join(', ')}` : 'Database schema is up to date');
  } finally {
    await db.connection.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
