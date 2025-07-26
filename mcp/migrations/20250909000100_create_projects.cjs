exports.up = function(knex) {
  return knex.schema.createTable('projects', table => {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('name').notNullable();
    table.text('description');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('projects');
};
