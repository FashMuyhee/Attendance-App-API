"use strict";

/*
|--------------------------------------------------------------------------
| CourseSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use("Factory");
const Database = use("Database");
const courseList = require("./CourseList");

class CourseSeeder {
    async run() {
        await Database.from("courses").insert(courseList);
    }
}

module.exports = CourseSeeder;