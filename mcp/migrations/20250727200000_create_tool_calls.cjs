exports.up = function(knex) {
  return knex.schema.createTable('tool_calls', table => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.timestamp('timestamp').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('tool_calls');
};
