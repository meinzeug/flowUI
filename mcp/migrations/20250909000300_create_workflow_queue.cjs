exports.up = function(knex) {
  return knex.schema.createTable('workflow_queue', table => {
    table.increments('id').primary();
    table.uuid('workflow_id')
      .references('id')
      .inTable('workflows')
      .onDelete('CASCADE')
      .index();
    table.string('status').defaultTo('queued').index();
    table.integer('progress').defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('workflow_queue');
};
