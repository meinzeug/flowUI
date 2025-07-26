exports.up = function(knex) {
  return knex.schema.createTable('sessions', table => {
    table.increments('id').primary();
    table.string('name');
    table.jsonb('data');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('sessions');
};
