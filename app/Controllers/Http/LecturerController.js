"use strict";

const Lecturer = use("App/Models/Lecturer");
// const User = use("App/Models/User");
const { validate } = use("Validator");

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with lecturers
 */
class LecturerController {
  // /**
  //  * Show a list of all lecturers.
  //  * GET lecturers
  //  *
  //  * @param {object} ctx
  //  * @param {Request} ctx.request
  //  * @param {Response} ctx.response
  //  * @param {View} ctx.view
  //  */
  // async index ({ request, response, view }) {
  // }

  /**
   * Create/save a new lecturer.
   * POST lecturers
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
        const { fullname, staff_no, department, level } = request.all();
        const data = {
          fullname,
          staff_no,
          department,
          level,
          email: user.email
        };
        const rules = {
          staff_no: "required|unique:lecturers,staff_no",
          fullname: "required",
          department: "required",
          level: "required",
          email: "required|unique:lecturers,email"
        };

        const validation = await validate(data, rules);
        if (validation.fails()) {
          return response
            .status(400)
            .send({ payload: { type: "error", error: validation.messages() } });
        }

        const lecturer = await user.lecturer().create(data);

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
   * Create/save a lecturer courses.
   * POST lecturers/:id/add_course
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
        const loginId = await user.lecturer().fetch();
        if (loginId.email != user.email) {
          return response.status(400).send({
            payload: {
              type: "error",
              error: `can't access this data`
            }
          });
        }
        const lecturer = await Lecturer.find(id);

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

        await lecturer.courses().attach(course_id);

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
   * Display a single lecturer.
   * GET lecturers/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params: { id }, response, auth }) {
    try {
      await auth.check();
      const user = await auth.getUser();
      const lecturer = await user.lecturer().fetch();
      // const user = await lecturer.user().fetch();
      return response.status(200).send({ data: { lecturer, user } });
    } catch (error) {
      return response.status(error.status).send({
        payload: { type: "error", error: "something went wrong try again" }
      });
    }
  }

  /**
   * Display a single lecturer courses
   * GET lecturers/:id/courses
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async getCourses({ auth, params: { id }, response }) {
    const user = await auth.getUser();
    const loginId = await user.lecturer().fetch();
    if (loginId.email != user.email) {
      return response.status(400).send({
        payload: {
          type: "error",
          error: `can't access this data`
        }
      });
    }
    const lecturer = await Lecturer.find(id);
    const courses = await lecturer.courses().fetch();
    return response.status(200).send({ payload: { data: { courses } } });
  }

  /**
   * Update lecturer details.
   * PUT or PATCH lecturers/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response }) {}

  /**
   * Get a lecturer with attendance
   * GET lecturers/:id/get_attendance
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async getAttendance({ auth, params, request, response }) {
    const user = await auth.getUser();
    const lecturer = await user.lecturer().fetch();

    const attendance = await lecturer.myAttendances().fetch();
    return response
      .status(200)
      .send({ payload: { data: { attendance } } });
  }
}

module.exports = LecturerController;
