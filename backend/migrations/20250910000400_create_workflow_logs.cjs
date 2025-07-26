exports.up = function(knex) {
  return knex.schema.createTable('workflow_logs', table => {
    table.increments('id').primary();
    table.integer('queue_id').references('id').inTable('workflow_queue').onDelete('CASCADE');
    table.text('message');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('workflow_logs');
};
