"use strict";
const Course = use("App/Models/Course");
const { validate } = use("Validator");
const Database = use("Database");

class CourseController {
  /**
   * Create/save a new course.
   * POST courses
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
        const data = request.only(["title", "code"]);
        const rules = {
          title: "required|unique:courses,title",
          code: "required|unique:courses,code",
        };

        const validation = await validate(data, rules);
        if (validation.fails()) {
          return response
            .status(400)
            .send({ payload: { type: "error", error: validation.messages() } });
        }

        const course = await Course.create(data);

        return response.status(200).send({
          payload: { type: "success", message: "course created" },
        });
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
   * Display all course.
   * GET courses/
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index({ response }) {
    const courses = await Course.all();
    return response.status(200).send({ payload: { data: { courses } } });
  }

  /**
   * fetch courses by level.
   * GET  courses/fetch_by_level/:level
   *
   * @param {object} ctx
   * @param {Response} ctx.response
   */
  async fetchByLevel({ params, response }) {
    try {
      const courses = await Database.from("courses").where(
        "level_id",
        params.level
      );
      return response.status(200).send({ payload: courses });
    } catch (error) {
      return response
        .status(error.status)
        .send({ payload: { type: "error", error } });
    }
  }
}

module.exports = CourseController;
