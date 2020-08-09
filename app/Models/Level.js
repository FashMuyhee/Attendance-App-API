"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class Level extends Model {
    courses() {
        return this.hasMany("App/Models/Course");
    }
}

module.exports = Level;