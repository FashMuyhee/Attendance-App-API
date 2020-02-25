"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class Student extends Model {
  user() {
    return this.belongsTo("App/Models/User");
  }

  courses() {
    return this.belongsToMany("App/Models/Course")
      .pivotTable("student_courses")
      .withTimestamps();
  }
}

module.exports = Student;
