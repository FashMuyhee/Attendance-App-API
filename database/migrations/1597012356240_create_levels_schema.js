'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CreateLevelsSchema extends Schema {
    up() {
        this.create('levels', (table) => {
            table.increments()
            table.string('level', 10)
            table.timestamps()
        })
    }

    down() {
        this.drop('levels')
    }
}

module.exports = CreateLevelsSchema