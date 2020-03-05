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
      await query.save();
      return response.status(200).send({
        payload: {
          type: "success",
          message: `${student.fullname} your attendance has been submitted`
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
      if (!query.signout_code) {
        query.signout_code = signout_code;
        console.log("no code");
        //await query.save();
        return response.status(200).send({
          payload: {
            type: "success",
            message: `signout code created`
          }
        });
      }
      /*
    const validation = await validate(data, rules);
    if (validation.fails()) {
      return response
        .status(400)
        .send({ payload: { type: "error", error: validation.messages() } });
    }
 */
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
  async signout({  request, response, auth }) {
    try {
      await auth.check();

      const user = await auth.getUser();
      const student = await user.student().fetch();
      const { signout_code } = request.all();
      let query = await Attendance.findBy("signout_code", signout_code);

      const queryJson = query.toJSON();
      let attendance = JSON.parse(queryJson.attendance);
      let data;
      let message;

      for (let i = 0; i < attendance.length; i++) {
        const index = attendance[i];

        //check for marked attendance
        if (
          index.hasOwnProperty("student_id") &&
          index.student_id === student.id &&
          !index.signed_out
        ) {
          data = index;
          // fix already signed out
          const element = attendance.indexOf(data);
          if (~element) {
            data.signed_out = true;
            attendance[element] = data;
          }
          query.attendance = JSON.stringify(attendance);

          await query.save();
          message = {
            type: "sucess",
            message: `${student.fullname} sign out sucessfull`
          };
          console.log(attendance);
        }
        //if student has signed out before
        else if (
          index.hasOwnProperty("student_id") &&
          index.student_id === student.id &&
          index.signed_out
        ) {
          message = {
            type: "error",
            error: `${student.fullname} You've already signed out`
          };
        } else if (
          index.hasOwnProperty("student_id") &&
          index.student_id === student.id &&
          !index.signed_out
        ) {
          message = {
            type: "error",
            error: `${student.fullname} You've need to mark attendance before you can sign out`
          };
        }
      }

      // response
      return response.status(message.type === "error" ? 400 : 200).send({
        payload: { ...message }
      });
    } catch (error) {
      return response
        .status(error.status)
        .send({ payload: { type: "error", error } });
    }
  }
}

module.exports = AttendanceController;
