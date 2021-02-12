"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class LecturersSchema extends Schema {
  up() {
    this.create("lecturers", (table) => {
      table.increments();
      table.string("email", 100).unique().notNullable();
      table.string("fullname", 80).notNullable();
      table.string("staff_no", 15).notNullable().unique();
      table.string("department", 20).notNullable();
      table.string("level", 15).notNullable();
      table.string("dp", 100);
      table.timestamps();
    });
  }

  down() {
    this.drop("lecturers");
  }
}

module.exports = LecturersSchema;
