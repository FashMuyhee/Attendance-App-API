"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class AddLevelIdNdSemesterIdToCoursesSchema extends Schema {
    up() {
        this.table("courses", (table) => {
            table.integer("level_id").unsigned().notNullable().after('title');
            table.integer("semester_id").unsigned().notNullable().after('level_id');

            table.foreign("level_id").references("id").inTable("levels");
            table.foreign("semester_id").references("id").inTable("semesters");
        });
    }

    down() {
        this.table("courses", (table) => {
            // reverse alternations
            this.dropColumn(["level_id", 'semester_id']);
        });
    }
}

module.exports = AddLevelIdNdSemesterIdToCoursesSchema;