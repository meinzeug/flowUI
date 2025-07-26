exports.up = async function(knex) {
  const hasColumn = await knex.schema.hasColumn('users', 'role');
  if (!hasColumn) {
    return knex.schema.table('users', table => {
      table.string('role').notNullable().defaultTo('user');
    });
  }
};

exports.down = async function(knex) {
  const hasColumn = await knex.schema.hasColumn('users', 'role');
  if (hasColumn) {
    return knex.schema.table('users', table => {
      table.dropColumn('role');
    });
  }
};
