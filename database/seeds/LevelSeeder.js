"use strict";

/*
|--------------------------------------------------------------------------
| LevelSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use("Factory");
const Database = use("Database");

class LevelSeeder {
    async run() {
        await Database.from("levels").insert([
            { level: "nd1" },
            { level: "nd2" },
            { level: "hnd1" },
            { level: "nd2" },
        ]);
    }
}

module.exports = LevelSeeder;