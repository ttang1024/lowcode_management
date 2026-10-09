/**
 * @module migrations
 * @description
 *   Schema changes, applied in order and recorded in the `schema_migrations`
 *   table so each runs once per database. Run them with `npm run db:migrate`
 *   (deploys), or at startup when the pushed config sets SYNC_SOURCE (local
 *   development and mock mode).
 *
 *   Adding one: append `{ name: '0002-what-it-does', up }` to MIGRATIONS and
 *   never edit or reorder applied ones. A fresh database gets the baseline
 *   from the *current* models, so later migrations must be idempotent: use
 *   the helpers below (e.g. `addColumnIfMissing`) rather than raw calls.
 */
import { DataTypes, type QueryInterface, type Sequelize } from 'sequelize';
import { Logger } from '../framework';

const logger = new Logger();
const TABLE = 'schema_migrations';

export interface MigrationContext {
  sequelize: Sequelize
  queryInterface: QueryInterface
  /** Adds the column unless the table already has it. */
  addColumnIfMissing(table: string, column: string, definition: Parameters<QueryInterface['addColumn']>[2]): Promise<void>
}

export interface Migration {
  name: string
  up(context: MigrationContext): Promise<void>
}

const MIGRATIONS: Migration[] = [
  {
    // Creates any table that does not exist yet from the models; existing
    // tables (and their data) are left untouched.
    name: '0001-baseline',
    up: async({ sequelize }) => {
      await sequelize.sync();
    },
  },
];

function contextFor(sequelize: Sequelize): MigrationContext {
  const queryInterface = sequelize.getQueryInterface();
  return {
    sequelize,
    queryInterface,
    async addColumnIfMissing(table, column, definition) {
      const columns = await queryInterface.describeTable(table);
      if (!(column in columns)) await queryInterface.addColumn(table, column, definition);
    },
  };
}

/** Applies every migration not yet recorded in this database, in order. Returns the names applied. */
export async function migrate(sequelize: Sequelize, migrations = MIGRATIONS) {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.createTable(TABLE, {
    name: { type: DataTypes.STRING(100), primaryKey: true },
    appliedAt: { type: DataTypes.DATE, allowNull: false },
  });
  const rows = await queryInterface.select(null, TABLE, {}) as { name: string }[];
  const applied = new Set(rows.map((row) => row.name));
  const context = contextFor(sequelize);
  const ran: string[] = [];
  for (const migration of migrations) {
    if (applied.has(migration.name)) continue;
    logger.log(`Migrating: ${migration.name}`);
    await migration.up(context);
    await queryInterface.bulkInsert(TABLE, [{ name: migration.name, appliedAt: new Date() }]);
    ran.push(migration.name);
  }
  return ran;
}
