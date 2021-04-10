"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class StudentsSchema extends Schema {
  up() {
    this.create("students", table => {
      table.increments();
      table
        .string("email", 100)
        .unique()
        .notNullable();
      table.string("fullname", 80).notNullable();
      table
        .string("matric_no", 15)
        .notNullable()
        .unique();
      table.string("department", 20).notNullable();
      table.string("level", 15).notNullable();
      table.string("dp", 200);    
      table.timestamps();
    });
  }

  down() {
    this.drop("students");
  }
}

module.exports = StudentsSchema;
