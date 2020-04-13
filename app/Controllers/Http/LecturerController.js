"use strict";

const Lecturer = use("App/Models/Lecturer");
// const User = use("App/Models/User");
const { validate } = use("Validator");
const Helpers = use("Helpers");

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with lecturers"
 */
class LecturerController {
  /**
   * Show a list of all lecturers.
   * GET lecturers
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async login({ auth, request, response }) {
    try {
      const { email } = request.all();
      const lecturerAuth = auth.authenticator("lecturer");
      const lecturer = await Lecturer.findBy("email", email);
      try {
        const user = await lecturerAuth.generate(lecturer);
        console.log(user);
        return response
          .status(200)
          .send({ payload: { type: "success", user } });
      } catch (error) {
        return response
          .status(error.status)
          .send({ payload: { type: "error", error } });
      }
    } catch (error) {
      return response
        .status(error.status)
        .send({ payload: { type: "error", error } });
    }
  }

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
      const user = await auth.authenticator("lecturer").getUser();
      const { fullname, staff_no, department, level, email } = request.all();
      const data = {
        fullname,
        staff_no,
        department,
        level,
        email
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

      try {
        await user.lecturer().create(data);
      } catch (error) {
        console.log(error);
      }

      return response.status(200).send({
        payload: { type: "success", message: "registration successful" }
      });
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
        const lecturer = await auth.authenticator("lecturer").getUser();

        // const lecturer = await Lecturer.find(id);

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
      const user = await auth.authenticator("lecturer").getUser();
      const lecturer = await user.lecturer().fetch();
      return response.status(200).send({ data: { lecturer } });
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
    const user = await auth.authenticator("lecturer").getUser();
    const lecturer = await user.lecturer().fetch();
    const courses = await lecturer.courses().fetch();
    return response.status(200).send({ payload: { data: { courses } } });
  }

  async update({ params, auth, request, response }) {
    try {
      const user = await auth.authenticator("lecturer").getUser();
      const lecturer = await user.lecturer().fetch();
      const { fullname } = request.all();

      const rules = {
        fullname: "required"
      };
      
      const validation = await validate(request.all(), rules);
      if (validation.fails()) {
        return response
          .status(400)
          .send({ payload: { type: "error", error: validation.messages() } });
      }

      lecturer.fullname = fullname;
      try {
        await lecturer.save();
        return response.status(400).send({
          payload: {
            type: "success",
            success: `profile updated`
          }
        });
      } catch (error) {
        return response.status(400).send({
          payload: {
            type: "error",
            error: `something went wrong try again`
          }
        });
      }
    } catch (error) {
      return response.status(400).send({
        payload: {
          type: "error",
          error: `You need to login`
        }
      });
    }
  }

  async uploadDp({ params: { id }, request, auth, response }) {
    // try {
    const user = await auth.authenticator("lecturer").getUser();
    const lecturer = await user.lecturer().fetch();

    const dp = request.file("dp", {
      types: ["image"],
      size: "5mb"
    });

    // validations
    /* const rules = {
        dp: "required"
      };

      const validation = await validate(dp, rules);
      if (validation.fails()) {
        return response
          .status(400)
          .send({ payload: { type: "error", error: validation.messages() } });
      } */
    const lecturerStaffNo = lecturer.staff_no.split("/")[2];
    const lecturerName = lecturer.fullname.replace(" ", "_").toLowerCase();
    const dpFile = `${lecturerName}_${lecturerStaffNo}.jpg`;
    // move to upload folder
    await dp.move(Helpers.tmpPath("uploads"), {
      name: dpFile,
      overwrite: true
    });
    if (!dp.moved()) {
      return response.status(400).send({
        payload: {
          type: "error",
          success: `something went wrong while uploading image`
        }
      });
    }
    // update database
    lecturer.dp = dpFile;
    await lecturer.save();
    return response.status(200).send({
      payload: {
        type: "success",
        success: `profile image uploaded `
      }
    });
    // } catch (error) {
    //   return response.status(400).send({
    //     payload: {
    //       type: "error",
    //       error: `You need to login`
    //     }
    //   });
    // }
  }
  /**
   * Get a lecturer with attendance
   * GET lecturers/:id/get_attendance
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async getAttendance({ auth, params, request, response }) {
    const lecturer = await auth.authenticator("lecturer").getUser();

    const attendance = await lecturer.myAttendances().fetch();
    return response.status(200).send({ payload: { data: { attendance } } });
  }
}

module.exports = LecturerController;
