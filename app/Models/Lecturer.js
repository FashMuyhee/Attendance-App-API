"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class Lecturer extends Model {
  user() {
    return this.belongsTo("App/Models/User");
  }

  courses() {
    return this.belongsToMany("App/Models/Course")
      .pivotTable("lecturer_courses")
      .withTimestamps();
  }

  myAttendances() {
    return this.hasMany("App/Models/Attendance");
  }
}

module.exports = Lecturer;
