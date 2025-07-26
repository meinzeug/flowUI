exports.up = function(knex) {
  return knex.schema.createTable('workflows', table => {
    table.uuid('id').primary();
    table.integer('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .index();
    table.string('name').notNullable();
    table.text('description');
    table.jsonb('steps').notNullable();
    table.timestamp('last_run');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('workflows');
};
