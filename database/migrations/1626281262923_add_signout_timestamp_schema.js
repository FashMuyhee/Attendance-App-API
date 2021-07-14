"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class AddSignoutTimestampSchema extends Schema {
  up() {
    this.table("attendances", (table) => {
      table.timestamp("signout_timestamp", { precision: 6 }).after("attendance").nullable();
    });
  }

  down() {
    this.table("attendances", (table) => {
      // reverse alternations
      this.dropColumn("signout_timestamp");
    });
  }
}

module.exports = AddSignoutTimestampSchema;
