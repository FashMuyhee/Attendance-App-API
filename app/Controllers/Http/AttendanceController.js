"use strict";
const Attendance = use("App/Models/Attendance");
const Student = use("App/Models/Student");
const User = use("App/Models/User");
const { validate } = use("Validator");
const randomstring = require("randomstring");
const {
  objIsEmpty,
  compareImageDp,
} = require("../OtherFunctions/HelperFunction");

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
        const attd_code = randomstring.generate({
          length: 7,
          charset: "hex",
          capitalization: "uppercase",
        });
        const attendance = JSON.stringify(new Array());
        let mycourse;
        // check if the lecturer his assigned to the take the course
        try {
          mycourse = await lecturer
            .courses()
            .where("course_id", course_id)
            .fetch();
        } catch (error) {
          return error;
        }

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

        // save created attendace
        if (Array.isArray(mycourse.toJSON()) && mycourse.toJSON().length) {
          // const attd_code = `${mycourse.toJSON()[0].code}_${code}`
          const data = {
            code: attd_code,
            course_id,
            location,
            attendance: attendance,
          };

          await lecturer.myAttendances().create(data);
          return response.status(200).send({
            payload: {
              type: "success",
              message: {
                msg: "attendance created",
                attendance_code: attd_code,
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

      const cameraDp = request.file("cameraDp", {
        types: ["image"],
        size: "5mb",
      });
      const saveDp = `tmp/uploads/${student.dp}`;

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
          // check if user's  dp match image sent and  add student to the attendance list
          const imgComp = await compareImageDp(cameraDp.tmpPath, saveDp);
          console.log(imgComp);
          if (imgComp < 20) {
            data.push({
              student_id: student.id,
              gps: gps,
              signed_in: true,
              signed_in_time: new Date().toLocaleTimeString(),
              signed_out: false,
              signed_out_time: null,
            });
            query.attendance = JSON.stringify(data);

            /*  const validation = await validate(data, rules);
                                    if (validation.fails()) {
                                      return response.status(400).send({
                                        payload: { type: "error", error: validation.messages() },
                                      });
                                    } */

            await query.save();
            return response.status(200).send({
              payload: {
                type: "success",
                message: `${student.fullname} your attendance has been submitted`,
              },
            });
          } else if (imgComp === undefined) {
            // if facial recoginiton returned undefined
            return response.status(400).send({
              payload: {
                type: "error",
                error: `Something went wrong while matching your captured face with your profile picture please try again to continue`,
              },
            });
          } else {
            return response.status(400).send({
              // if facial recognition retuned false
              payload: {
                type: "error",
                error: `${student.fullname} ,Attendance not added,  you can't sign for someone else`,
              },
            });
          }
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
   * Update attendance details.
   * PUT or PATCH attendances/signout
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
      const cameraDp = request.file("cameraDp", {
        types: ["image"],
        size: "5mb",
      });
      const saveDp = `tmp/uploads/${student.dp}`;
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
            // facial recognition/compare
            const imgComp = await compareImageDp(cameraDp.tmpPath, saveDp);
            if (imgComp < 20) {
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
                type: "sucess",
                message: `${student.fullname} sign out sucessfull`,
              };
            } else if (imgComp === undefined) {
              // if facial recognition returned undefined
              return response.status(200).send({
                payload: {
                  type: "error",
                  error: `Something went wrong while matching your captured face with your profile picture please try again to continue`,
                },
              });
            } else {
              // if facial recogintion returned false for similarities
              return response.status(200).send({
                payload: {
                  type: "error",
                  error: `${student.fullname} , you can't signout for someelse`,
                },
              });
            }
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
              error: `${student.fullname} You've need to mark attendance before you can sign out`,
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
