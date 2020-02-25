"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class LecturerCourseSchema extends Schema {
  up() {
    this.create("lecturer_courses", table => {
      table.increments();
      table
        .integer("lecturer_id")
        .unsigned()
        .notNullable();
      table
        .integer("course_id")
        .unsigned()
        .notNullable();

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
    this.drop("lecturer_courses");
  }
}

module.exports = LecturerCourseSchema;
