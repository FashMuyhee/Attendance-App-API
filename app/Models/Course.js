"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class Course extends Model {
  lecturers() {
    return this.belongsToMany("App/Models/Lecturer")
      .pivotTable("lecturer_courses")
      .withTimestamps();
  }
  students() {
    return this.belongsToMany("App/Models/Stuudent")
      .pivotTable("student_courses")
      .withTimestamps();
  }
  attendances() {
    return this.hasMany("App/Models/Attendance");
  }
}

module.exports = Course;
