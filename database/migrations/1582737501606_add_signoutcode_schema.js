"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class AddSignoutcodeSchema extends Schema {
  up() {
    this.table("attendances", table => {
      // alter table
      table
        .string("signout_code", 15)
        .unique()
        .after("code");
    });
  }

  down() {
    this.table("attendances", table => {
      // reverse alternations
      this.dropColumn("signout_code");
    });
  }
}

module.exports = AddSignoutcodeSchema;
