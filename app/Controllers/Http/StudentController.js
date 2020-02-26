"use strict";

const Student = use("App/Models/Student");
const Attendance = use("App/Models/Attendance");
const Database = use("Database");

const { validate } = use("Validator");

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with students
 */
class StudentController {
  // /**
  //  * Show a list of all students.
  //  * GET students
  //  *
  //  * @param {object} ctx
  //  * @param {Request} ctx.request
  //  * @param {Response} ctx.response
  //  */
  // async index({ request, response }) {}

  /**
   * Create/save a new student.
   * POST students
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ auth, request, response }) {
    try {
      try {
        await auth.check();

        const user = await auth.getUser();
        const { fullname, matric_no, department, level } = request.all();
        const data = {
          fullname,
          matric_no,
          department,
          level,
          email: user.email
        };

        const rules = {
          matric_no: "required|unique:students,matric_no",
          fullname: "required",
          department: "required",
          level: "required",
          email: "required|unique:students,email"
        };

        const validation = await validate(data, rules);
        if (validation.fails()) {
          return response
            .status(400)
            .send({ payload: { type: "error", error: validation.messages() } });
        }

        const student = await user.student().create(data);

        return response.status(200).send({
          payload: { type: "success", message: "registration successful" }
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
   * Create/save a student courses.
   * POST students/:id/add_course
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Auth} ctx.auth
   */
  async addCourse({ auth, request, response, params: { id } }) {
    try {
      try {
        const user = await auth.getUser();
        const loginId = await user.student().fetch();
        if (loginId.email != user.email) {
          return response.status(400).send({
            payload: {
              type: "error",
              error: `can't access this data`
            }
          });
        }
        const student = await Student.find(id);

        const { course_id } = request.all();

        const rules = {
          course_id: "required"
        };

        const validation = await validate(course_id, rules);
        if (validation.fails()) {
          return response
            .status(400)
            .send({ payload: { type: "error", error: validation.messages() } });
        }

        // await loginId.courses().attach(course_id);
        await student.courses().attach(course_id);

        return response.status(200).send({
          payload: {
            type: "success",
            message: `course added`
          }
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
   * Display a single student.
   * GET students/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async show({ auth, params: { id }, response }) {
    const user = await auth.getUser();
    const student = await user.student().fetch();
    /* if (student.email != user.email) {
      return response.status(400).send({
        payload: {
          type: "error",
          error: `can't access this data`
        }
      });
    } */

    return response.status(200).send({ payload: { data: user, student } });
  }

  /**
   * Display a single student courses
   * GET students/:id/courses
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async getCourses({ auth, params: { id }, response }) {
    const user = await auth.getUser();
    const loginId = await user.student().fetch();
    if (loginId.email != user.email) {
      return response.status(400).send({
        payload: {
          type: "error",
          error: `can't access this data`
        }
      });
    }
    const student = await Student.find(id);
    const courses = await student.courses().fetch();
    return response.status(200).send({ payload: { message: { courses } } });
  }

  async getAttendanceByCourses({ auth, params, request, response }) {
    const user = await auth.getUser();
    const loginId = await user.student().fetch();
    if (loginId.email != user.email) {
      return response.status(400).send({
        payload: {
          type: "error",
          error: `can't access this data`
        }
      });
    }
    const { course_id } = request.all();

    const query = await Attendance.query()
      .where("course_id", course_id)
      .fetch();
    let attendance = [];
    let totalAttendance = 0;
    query.toJSON().forEach(element => {
      totalAttendance++;
      attendance.push(JSON.parse(element.attendance));
    });
    let myAttendance = 0;
    for (let index = 0; index < attendance.length; index++) {
      const element = attendance[index];

      element.forEach(index => {
        if (loginId.id === index.student_id) {
          myAttendance++;
        }
      });
    }
    return response.status(200).send({
      payload: { data: attendance, totalCount: totalAttendance, myAttendance }
    });
  }

  /**
   * Update student details.
   * PUT or PATCH students/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response }) {}

  /**
   * Delete a student with id.
   * DELETE students/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, request, response }) {}
}

module.exports = StudentController;
