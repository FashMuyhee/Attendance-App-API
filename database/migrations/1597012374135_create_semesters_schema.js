"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class CreateSemestersSchema extends Schema {
    up() {
        this.create("semesters", (table) => {
            // alter table
            table.increments();
            table.string("semster", 10);
            table.timestamps();
        });
    }

    down() {
        this.drop("levels");
    }
}

module.exports = CreateSemestersSchema;