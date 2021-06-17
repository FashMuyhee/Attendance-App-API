"use strict";
const Attendance = use("App/Models/Attendance");
const { validate } = use("Validator");
const randomstring = require("randomstring");
const { objIsEmpty } = require("../OtherFunctions/HelperFunction");

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
class AttendaceController {
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

        const lecturer = await auth.authenticator("lecturer").getUser();
        const { course_id, location } = request.all();
        const att_code = randomstring.generate({
          length: 7,
          charset: "hex",
          capitalization: "uppercase",
        });
        const rules = {
          location: "required",
          course_id: "required",
        };

        const validation = await validate({ location, course_id }, rules);

        if (validation.fails()) {
          return response
            .status(400)
            .send({ payload: { type: "error", error: validation.messages() } });
        }
        const attendance = JSON.stringify(new Array());
        let myCourse;
        // check if the lecturer his assigned to the take the course
        try {
          myCourse = await lecturer
            .courses()
            .where("course_id", course_id)
            .fetch();
        } catch (error) {
          return error;
        }
        // save created attendace
        if (Array.isArray(myCourse.toJSON()) && myCourse.toJSON().length) {
          const data = {
            code: att_code,
            course_id,
            location: JSON.stringify(location),
            attendance: attendance,
          };
          try {
            const check = await lecturer.myAttendances().create(data);
            console.log(check);
          } catch (error) {
            console.log(error);

            return error;
          }
          // await lecturer.myAttendances().create(data);
          return response.status(200).send({
            payload: {
              type: "success",
              message: {
                msg: "attendance created",
                attendance_code: att_code,
              },
            },
          });
        } else {
          return response.status(400).send({
            payload: {
              type: "error",
              error: `you can't take attendance for course you are not assigned to`,
            },
          });
        }
      } catch (error) {
        return response.status(error.status).send({
          payload: { type: "error", error: "something went wrong try again" },
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

      const student = await auth.authenticator("student").getUser();
      const { gps } = request.only(["gps"]);

      const saveDp = student.dp;

      let query = await Attendance.findBy("code", code);

      if (objIsEmpty(query)) {
        return response.status(400).send({
          payload: {
            type: "error",
            error: "this attendance code doesn't exist or it has expired",
          },
        });
      } else if (!objIsEmpty(query)) {
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
                message: `${student.fullname} you've submitted before`,
              },
            });
          }
        }
        // check if student has uploaded dp already
        if (student.dp != null) {
          data.push({
            student_id: student.id,
            gps: gps,
            signed_in: true,
            signed_in_time: new Date().toLocaleTimeString(),
            signed_out: false,
            signed_out_time: null,
          });
          query.attendance = JSON.stringify(data);

          await query.save();
          return response.status(200).send({
            payload: {
              type: "success",
              message: `${student.fullname} your attendance has been submitted`,
            },
          });
        } else {
          // not uploded dp
          return response.status(400).send({
            payload: {
              type: "error",
              error: `${student.fullname} ,You need to upload a profile picture before marking attendance`,
            },
          });
        }
      }
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

      // const lecturer = await auth.authenticator("lecturer").getUser();
      const signout_code = randomstring.generate({
        length: 7,
        charset: "hex",
        capitalization: "uppercase",
      });
      // find the created attendace code column then update the signout_code ifempty
      // validate signout_code b4 saving to database
      /*
                const validation = await validate(data, rules);
                if (validation.fails()) {
                  return response
                    .status(400)
                    .send({ payload: { type: "error", error: validation.messages() } });
                }
                */
      const query = await Attendance.findBy("code", code);
      if (query.signout_code === null) {
        query.signout_code = signout_code;
        await query.save();
        return response.status(200).send({
          payload: {
            type: "success",
            message: { msg: `signout code created`, code: query.signout_code },
          },
        });
      }
      return response.status(400).send({
        payload: {
          type: "error",
          error: {
            msg: `you've created a signout code before`,
            code: query.signout_code,
          },
        },
      });
    } catch (error) {
      return response
        .status(error.status)
        .send({ payload: { type: "error", error } });
    }
  }
  /**
   * Student attendance Signout function
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async signout({ request, response, auth }) {
    try {
      await auth.check();

      const student = await auth.authenticator("student").getUser();
      const { signout_code } = request.all();
      let query = await Attendance.findBy("signout_code", signout_code);

      // check if attendance code exist i.e returned empty object
      if (objIsEmpty(query)) {
        return response.status(400).send({
          payload: {
            type: "error",
            error: "this attendance code doesn't exist or it has expired",
          },
        });
      } else {
        const queryJson = query.toJSON();
        let attendance = JSON.parse(queryJson.attendance);
        let data, message;

        for (let i = 0; i < attendance.length; i++) {
          const index = attendance[i];

          //check if student has signed-out before
          if (
            index.hasOwnProperty("student_id") &&
            index.student_id === student.id &&
            !index.signed_out
          ) {
            data = index;
            // check if student data is in attendace array
            const element = attendance.indexOf(data);
            if (~element) {
              data.signed_out = true;
              data.signed_out_time = new Date().toLocaleTimeString();
              attendance[element] = data;
            }
            query.attendance = JSON.stringify(attendance);

            await query.save();
            message = {
              type: "success",
              message: `${student.fullname} sign out Successful`,
            };
          }
          //if student has signed out before
          else if (
            index.hasOwnProperty("student_id") &&
            index.student_id === student.id &&
            index.signed_out
          ) {
            message = {
              type: "error",
              error: `${student.fullname} You've already signed out`,
            };
          } else if (
            index.hasOwnProperty("student_id") &&
            index.student_id === student.id &&
            !index.signed_in
          ) {
            message = {
              type: "error",
              error: `${student.fullname} You need to mark attendance before you can sign out`,
            };
          }
        }

        // main response
        return response.status(message.type === "error" ? 400 : 200).send({
          payload: { ...message },
        });
      }
    } catch (error) {
      return response
        .status(error.status)
        .send({ payload: { type: "error", error } });
    }
  }

  async getAttendanceLocation({ params: { code }, response, auth }) {
    try {
      await auth.check();

      // const student = await auth.authenticator("student").getUser();
      const query = await Attendance.findBy("code", code);
      if (objIsEmpty(query)) {
        return response.status(400).send({
          payload: {
            type: "error",
            error: "this attendance code doesnt exist or it has expired",
          },
        });
      } else {
        const attLocation = query.location;

        return response.status(200).send({
          payload: {
            type: "success",
            message: { location: attLocation },
          },
        });
      }
    } catch (error) {
      return response
        .status(error.status)
        .send({ payload: { type: "error", error } });
    }
  }
}

module.exports = AttendaceController;
