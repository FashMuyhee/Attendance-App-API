'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CoursesSchema extends Schema {
  up () {
    this.create('courses', (table) => {
      table.increments()
      table.string('title',50).unique().notNullable()
      table.string('code',8).unique().notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('courses')
  }
}

module.exports = CoursesSchema
