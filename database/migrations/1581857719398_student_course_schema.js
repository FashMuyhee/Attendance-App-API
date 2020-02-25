"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class StudentCourseSchema extends Schema {
  up() {
    this.create("student_courses", table => {
      table.increments();
      table
        .integer("student_id")
        .unsigned()
        .notNullable();
      table
        .integer("course_id")
        .unsigned()
        .notNullable();

      table
        .foreign("student_id")
        .references("id")
        .inTable("students");
      table
        .foreign("course_id")
        .references("id")
        .inTable("courses");
      table.timestamps();
    });
  }

  down() {
    this.drop("student_courses");
  }
}

module.exports = StudentCourseSchema;
