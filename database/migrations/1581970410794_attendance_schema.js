"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class AttendanceSchema extends Schema {
  up() {
    this.create("attendances", table => {
      table.increments();
      table
        .string("code", 15)
        .unique()
        .notNullable();
      table
        .integer("lecturer_id")
        .unsigned()
        .notNullable();
      table.integer("course_id").notNullable();
      table.string("location", 60).notNullable();
      table.json("attendance");

      table
        .foreign("lecturer_id")
        .references("id")
        .inTable("lecturers");
      table
        .foreign("course_id")
        .references("id")
        .inTable("courses");

      table.timestamps();
    });
  }

  down() {
    this.drop("attendances");
  }
}

module.exports = AttendanceSchema;
