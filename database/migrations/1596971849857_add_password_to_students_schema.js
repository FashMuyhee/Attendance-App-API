'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddPasswordToStudentsSchema extends Schema {
    up() {
        this.table('students', (table) => {
            // alter table
            table
                .string("password", 100)
                .after("email")
                .defaultTo("password");
        })
    }

    down() {
        this.table('students', (table) => {
            // reverse alternations
        })
    }
}

module.exports = AddPasswordToStudentsSchema