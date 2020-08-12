"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class AddPasswordSchema extends Schema {
  up() {
    this.table("lecturers", table => {
      // alter table
      table
        .string("password", 100)
        .after("email")
        .defaultTo("password");
    });
  }

  down() {
    this.table("lectures", table => {
      // reverse alternations
    });
  }
}

module.exports = AddPasswordSchema;
