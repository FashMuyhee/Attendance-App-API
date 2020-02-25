"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class LecturersSchema extends Schema {
  up() {
    this.create("lecturers", table => {
      table.increments();
      table
        .integer("user_id")
        .unsigned()
        .notNullable();
      table
        .string("email", 100)
        .unique()
        .notNullable();
      table.string("fullname", 80).notNullable();
      table
        .string("staff_no", 15)
        .notNullable()
        .unique();
      table.string("department", 20).notNullable();
      table.string("level", 15).notNullable();
      table.string("dp", 15);

      table
        .foreign("user_id")
        .references("id")
        .inTable("users");
      table.timestamps();
    });
  }

  down() {
    this.drop("lecturers");
  }
}

module.exports = LecturersSchema;
