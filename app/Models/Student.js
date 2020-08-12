"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");
const Hash = use('Hash')
class Student extends Model {
    static boot() {
        super.boot();

        /**
         * A hook to hash the user password before saving
         * it to the database.
         */
        this.addHook("beforeCreate", async(userInstance) => {
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
            .pivotTable("student_courses")
            .withTimestamps();
    }
}

module.exports = Student;