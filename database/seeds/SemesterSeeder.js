"use strict";

/*
|--------------------------------------------------------------------------
| SemesterSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use("Factory");
const Database = use("Database");

class SemesterSeeder {
    async run() {
        await Database.from("semesters").insert([
            { semester: "first" },
            { semester: "second" },
        ]);
    }
}

module.exports = SemesterSeeder;