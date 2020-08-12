"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");
/** @type {import('@adonisjs/framework/src/Hash')} */
const Hash = use("Hash");
class Lecturer extends Model {
  static boot() {
    super.boot();

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */
    this.addHook("beforeCreate", async (userInstance) => {
      if (userInstance.dirty.password) {
        userInstance.password = await Hash.make(userInstance.password);
      }
    });
  }
  static get hidden() {
    return ["password"];
  }
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
