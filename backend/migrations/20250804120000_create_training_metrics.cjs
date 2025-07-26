exports.up = function(knex) {
  return knex.schema.createTable('training_metrics', table => {
    table.increments('id').primary();
    table.integer('epoch').notNullable();
    table.float('loss').notNullable();
    table.float('accuracy').notNullable();
    table.timestamp('timestamp').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('training_metrics');
};
