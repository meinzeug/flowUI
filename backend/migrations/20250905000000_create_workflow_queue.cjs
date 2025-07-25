exports.up = function(knex) {
  return knex.schema.createTable('workflow_queue', table => {
    table.increments('id').primary();
    table.integer('workflow_id').notNullable();
    table.enum('status', ['queued', 'processing', 'done']).defaultTo('queued');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('workflow_queue');
};
