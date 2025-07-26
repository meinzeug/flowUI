exports.up = function(knex) {
  return knex.schema
    .createTable('memory_entries', table => {
      table.uuid('id').primary();
      table.string('namespace').notNullable();
      table.text('query').notNullable();
      table.text('summary').notNullable();
      table.timestamp('timestamp').defaultTo(knex.fn.now());
    })
    .createTable('activity_log', table => {
      table.increments('id').primary();
      table.timestamp('timestamp').defaultTo(knex.fn.now());
      table.enum('type', ['info', 'success', 'error', 'warning']).notNullable();
      table.text('message').notNullable();
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('activity_log')
    .dropTableIfExists('memory_entries');
};
