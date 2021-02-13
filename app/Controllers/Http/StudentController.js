"use strict";

const Student = use("App/Models/Student");
const Attendance = use("App/Models/Attendance");
const Database = use("Database");
const Helpers = use("Helpers");

const { validate } = use("Validator");

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with students
 */
class StudentController {
  /**
   * student login.
   * GET students
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async login({ auth, request, response }) {
    try {
      const { matric_no, password } = request.all();
      // const student = await Student.findBy("matric_no", matric_no);
      const studentAuth = auth.authenticator("student");
      try {
        const user = await studentAuth.attempt(matric_no, password);
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
   * Create/save a new student.
   * POST students
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {
    try {
      const {
        fullname,
        matric_no,
        department,
        level,
        email,
        password,
      } = request.all();
      const data = {
        fullname,
        matric_no,
        department,
        level,
        email,
        password,
      };

      const rules = {
        matric_no: "required|unique:students,matric_no",
        fullname: "required",
        department: "required",
        level: "required",
        email: "required|unique:students,email",
        password: "required",
      };

      const validation = await validate(data, rules);
      if (validation.fails()) {
        return response
          .status(400)
          .send({ payload: { type: "error", error: validation.messages() } });
      }

      // const student = await user.student().create(data);
      try {
        // await user.lecturer().create(data);
        await Student.create(data);
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
        const user = await auth.authenticator("student").getUser();

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

        // await loginId.courses().attach(course_id);
        await user.courses().attach(course_id);

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
   * Display a single student.
   * GET students/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async show({ auth, params: { id }, response }) {
    const user = await auth.authenticator("student").getUser();
    return response.status(200).send({ payload: { data: user } });
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
    const user = await auth.authenticator("student").getUser();
    const courses = await user.courses().fetch();
    return response.status(200).send({ payload: { message: { courses } } });
  }

  /**
   * Get student attendance by course
   * GET students/:id/get_attendance_by_courses
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {} ctx.auth
   */
  async getAttendanceByCourses({ auth, request, response }) {
    const user = await auth.authenticator("student").getUser();

    const { course_id } = request.all();

    const query = await Attendance.query()
      .where("course_id", course_id)
      .fetch();

    let attendance = [];
    let totalAttendance = 0;
    let myAttendance = [];

    query.toJSON().forEach((element) => {
      totalAttendance++;
      const parsedData = JSON.parse(element.attendance);
      attendance.push(parsedData);
    });

    let myAttendanceCount = 0;
    for (let index = 0; index < attendance.length; index++) {
      const element = attendance[index];

      element.forEach((index) => {
        if (
          user.id === index.student_id &&
          index.signed_out &&
          index.signed_in
        ) {
          myAttendance.push(index);
          myAttendanceCount++;
        }
      });
    }
    return response.status(200).send({
      payload: { data: myAttendance, totalAttendance, myAttendanceCount },
    });
  }

  /**
   * Get student attendance
   * GET students/:id/get_attendance
   *
   * @param {object} ctx
   * @param {Response} ctx.response
   * @param {} ctx.auth
   */
  async getAttendance({ auth, response }) {
    const user = await auth.authenticator("student").getUser();

    const query = await Attendance.query().fetch();
    let attendance = [];
    let totalAttendance = 0;
    let myAttendance = [];

    query.toJSON().forEach((element) => {
      totalAttendance++;
      let parsedData = JSON.parse(element.attendance);
      parsedData.course_id = element.course_id;
      attendance.push(parsedData);
    });
    let myAttendanceCount = 0;
    console.log(attendance);
    for (let index = 0; index < attendance.length; index++) {
      const element = attendance[index];

      element.forEach((index) => {
        if (
          user.id === index.student_id &&
          index.signed_out &&
          index.signed_in
        ) {
          myAttendance.push(index);
          myAttendanceCount++;
        }
      });
    }
    return response.status(200).send({
      payload: { myAttendance },
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
  async update({ params, request, auth, response }) {
    try {
      const user = await auth.authenticator("student").getUser();

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

      user.fullname = fullname;
      try {
        await user.save();
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
  /**
   * Update student details.
   * PUT or PATCH students/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async uploadDp({ params: { id }, request, auth, response }) {
    // try {
    const student = await auth.authenticator("student").getUser();
    console.log(student);

    const dp = request.file("dp", {
      types: ["image"],
      size: "5mb",
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
    const studentMatricNo = student.matric_no.split("/")[3].substr(4, 7);
    const studentName = student.fullname.replace(" ", "_").toLowerCase();
    const dpFile = `${studentName}_${studentMatricNo}.${dp.extname}`;
    // move to upload folder
    await dp.move(Helpers.tmpPath("uploads"), {
      name: dpFile,
      overwrite: true,
    });
    if (!dp.moved()) {
      return response.status(400).send({
        payload: {
          type: "error",
          success: `something went wrong while uploading image`,
        },
      });
    }
    // update database
    student.dp = dpFile;
    await student.save();
    return response.status(200).send({
      payload: {
        type: "success",
        success: `profile image uploaded `,
      },
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
