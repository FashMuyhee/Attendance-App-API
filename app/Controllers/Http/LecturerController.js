"use strict";

const Lecturer = use("App/Models/Lecturer");
const Course = use("App/Models/Course");
const Cloudinary = use("App/Services/Cloudinary");
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
    const { email, password } = request.all();
    const lecturerAuth = auth.authenticator("lecturer");
    try {
      const user = await lecturerAuth.attempt(email, password);
      return response.status(200).send({ payload: { type: "success", user } });
    } catch (error) {
      /*  if (error.status === 401) 
            return response.status(error.status).send({
              payload: { type: "error", error: "Incorrect Password or Email" },
            }); */
      console.log(error);
      return response.status(error.status).send({
        payload: { type: "error", error },
      });
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
      // const user = await auth.authenticator("lecturer").getUser();
      const {
        fullname,
        staff_no,
        department,
        level,
        password,
        email,
      } = request.all();
      const data = {
        fullname,
        staff_no,
        department,
        level,
        email,
        password,
      };
      const rules = {
        staff_no: "required|unique:lecturers,staff_no",
        fullname: "required",
        department: "required",
        level: "required",
        password: "required",
        email: "required|unique:lecturers,email",
      };
      const validation = await validate(data, rules);
      if (validation.fails()) {
        return response
          .status(400)
          .send({ payload: { type: "error", error: validation.messages() } });
      }

      try {
        // await user.lecturer().create(data);
        await Lecturer.create(data);
      } catch (error) {
        return response.status(400).send({ payload: { type: "error", error } });
      }

      return response.status(200).send({
        payload: { type: "success", message: "registration successful" },
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
          course_id: "required",
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
            message: `course added`,
          },
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
      // const lecturer = await user.lecturer().fetch();
      return response.status(200).send({ data: { user } });
    } catch (error) {
      return response.status(error.status).send({
        payload: { type: "error", error: "something went wrong try again" },
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
    const lecturer = await auth.authenticator("lecturer").getUser();
    // const lecturer = await user.lecturer().fetch();
    const courses = await lecturer.courses().fetch();
    return response.status(200).send({ payload: { data: { courses } } });
  }

  async update({ params, auth, request, response }) {
    try {
      const lecturer = await auth.authenticator("lecturer").getUser();
      // const lecturer = await user.lecturer().fetch();
      const { fullname } = request.all();

      const rules = {
        fullname: "required",
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
            success: `profile updated`,
          },
        });
      } catch (error) {
        return response.status(400).send({
          payload: {
            type: "error",
            error: `something went wrong try again`,
          },
        });
      }
    } catch (error) {
      return response.status(400).send({
        payload: {
          type: "error",
          error: `You need to login`,
        },
      });
    }
  }

  async uploadDp({ params: { id }, request, auth, response }) {
    // try {
    const lecturer = await auth.authenticator("lecturer").getUser();

    const dp = request.file("dp", {
      types: ["image"],
      size: "5mb",
    });

    // check if dp field isn't null
    if (typeof lecturer.dp != "object") {
      return response.status(200).send({
        payload: {
          type: "error",
          message: "You can only Upload Image Once",
        },
      });
    }

    const imageUpload = await Cloudinary.uploadFile(dp);
    // update database
    if (imageUpload.status) {
      lecturer.dp = imageUpload.data;
      await lecturer.save();
      return response.status(200).send({
        payload: {
          type: "success",
          message: `profile image uploaded `,
          imageUpload,
        },
      });
    }
    return response.status(200).send({
      payload: {
        type: "error",
        message: `Something went wrong while uploading image`,
        imageUpload,
      },
    });
  }
  /**
   * Get a lecturer with attendance
   * GET lecturers/:id/get_attendance
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async getAttendance({ auth, response }) {
    const lecturer = await auth.authenticator("lecturer").getUser();

    const attendance = await lecturer.myAttendances().fetch();
    return response.status(200).send({ payload: { data: { attendance } } });
  }
  /**
   * Get a lecturer  attendance by course
   * GET lecturers/:id/attendance_by_course/
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async getAttendanceByCourse({ auth, request, response }) {
    const lecturer = await auth.authenticator("lecturer").getUser();
    const { course_id } = request.only(["course_id"]);

    const course = await Course.find(course_id);
    const attendnace_table = await course.attendances().fetch();
    const att_by_course = [];
    attendnace_table.toJSON().forEach((index) => {
      att_by_course.push(index.attendance);
    });
    return response.status(200).send({ payload: { data: { att_by_course } } });
  }
}

module.exports = LecturerController;
