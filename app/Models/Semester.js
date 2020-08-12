'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Semester extends Model {
    courses() {
        return this.hasMany("App/Models/Course");
    }
}

module.exports = Semester