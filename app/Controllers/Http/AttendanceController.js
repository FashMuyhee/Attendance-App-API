"use strict";
const Attendance = use("App/Models/Attendance");
const Student = use("App/Models/Student");
const User = use("App/Models/User");
const { validate } = use("Validator");
const randomstring = require("randomstring");

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class AttendanceController {
  /**
   * Create/save a new attendance.
   * POST lecturers
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */

  async createAttendance({ auth, request, response }) {
    try {
      try {
        await auth.check();

        const user = await auth.getUser();
        const lecturer = await user.lecturer().fetch();
        const { course_id, location } = request.all();
        const code = randomstring.generate({
          length: 7,
          charset: "hex",
          capitalization: "uppercase"
        });
        const attendance = JSON.stringify(new Array());
        const data = {
          code: code,
          course_id,
          location,
          attendance: attendance
        };
        /*  const rules = {
          code:'required',
          lecturer_id: lecturer.id,
          course_id: "required"
        };

        const validation = await validate(data, rules);
        if (validation.fails()) {
          return response
            .status(400)
            .send({ payload: { type: "error", error: validation.messages() } });
        } */

        await lecturer.myAttendances().create(data);

        return response.status(200).send({
          payload: { type: "success", message: "attendance created" }
          // payload: { type: "success", message: data }
        });
      } catch (error) {
        return response.status(error.status).send({
          payload: { type: "error", error: "something went wrong try again" }
        });
      }
    } catch (error) {
      return response
        .status(error.status)
        .send({ payload: { type: "error", error } });
    }
  }

  /**
   * Update attendance details.
   * PUT or PATCH attendances/mark_attendance/:code
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async markAttendance({ params: { code }, request, response, auth }) {
    try {
      await auth.check();

      const user = await auth.getUser();
      const student = await user.student().fetch();
      const { gps } = request.only(["gps"]);
      const query = await Attendance.findBy("code", code);
      let data = new Array();
      data = JSON.parse(query.attendance);

      // check if the user has submitted attendance b4
      for (let index = 0; index < data.length; index++) {
        const element = data[index];
        if (
          element.hasOwnProperty("student_id") &&
          student.id === element.student_id &&
          element.signed_in
        ) {
          return response.status(200).send({
            payload: {
              type: "success",
              message: `${student.fullname} you've submitted before`
            }
          });
        }
      }
      // else add student to the attendance list
      data.push({
        student_id: student.id,
        gps,
        signed_in: true,
        signed_out: false
      });
      query.attendance = JSON.stringify(data);
      /* 
    const validation = await validate(data, rules);
    if (validation.fails()) {
      return response
        .status(400)
        .send({ payload: { type: "error", error: validation.messages() } });
    }
 */
      await query.save(query);
      return response.status(200).send({
        payload: {
          type: "success",
          message: `attendance submitted`
        }
      });
    } catch (error) {
      return response
        .status(error.status)
        .send({ payload: { type: "error", error } });
    }
  }

  /**
   * Update attendance details.
   * PUT or PATCH attendances/signout
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async createSignout({ params: { code }, response, auth }) {
    try {
      await auth.check();

      const user = await auth.getUser();
      const lecturer = await user.lecturer().fetch();
      const signout_code = randomstring.generate({
        length: 7,
        charset: "hex",
        capitalization: "uppercase"
      });
      const query = await Attendance.findBy("code", code);
      query.signout_code = signout_code;
      /*
    const validation = await validate(data, rules);
    if (validation.fails()) {
      return response
        .status(400)
        .send({ payload: { type: "error", error: validation.messages() } });
    }
 */
      await query.save(query);

      return response.status(200).send({
        payload: {
          type: "success",
          message: `signout code created`
        }
      });
    } catch (error) {
      return response
        .status(error.status)
        .send({ payload: { type: "error", error } });
    }
  }
  /**
   * Update attendance details.
   * PUT or PATCH attendances/signout
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async signout({ params: { code }, request, response, auth }) {
    try {
      await auth.check();

      const user = await auth.getUser();
      const student = await user.student().fetch();
      const { signout_code } = request.all();
      const query = await Attendance.query()
        .where("code", code)
        .andWhere("signout_code", signout_code)
        .fetch();
      query.forEach(element => {
        console.log(element);
      });
      return response.status(200).send({
        payload: {
          type: "success",
          message: "sign out"
        }
      });
    } catch (error) {
      return response
        .status(error.status)
        .send({ payload: { type: "error", error } });
    }
  }
}

module.exports = AttendanceController;
