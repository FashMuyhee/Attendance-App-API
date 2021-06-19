"use strict";

const Student = use("App/Models/Student");
const Attendance = use("App/Models/Attendance");
const Course = use("App/Models/Course");
const Cloudinary = use("App/Services/Cloudinary");
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
      const { fullname, matric_no, department, level, email, password } =
        request.all();
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
    return response.status(200).send({ payload: { courses } });
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
      const date = element.created_at;
      attendance.push([...parsedData, date]);
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
          const attendanceDate = element[element.length - 1];
          myAttendance.push({ ...index, date: attendanceDate });
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
  async getDetailedAttendance({ auth, response }) {
    const user = await auth.authenticator("student").getUser();

    const query = await Attendance.query().fetch();
    let myAttendance = [];

    const attendance = await Promise.all(
      query.toJSON().map(async (element) => {
        const course = await Course.find(element.course_id);
        const { title, code } = course.toJSON();
        let parsedData = JSON.parse(element.attendance);
        const date = element.created_at;
        return {
          course: { title, code },
          date,
          attendance: parsedData,
        };
      })
    );

    for (let index = 0; index < attendance.length; index++) {
      const attendanceElement = attendance[index].attendance;
      const { date, course } = attendance[index];
      attendanceElement.forEach((value) => {
        if (
          user.id === value.student_id &&
          value.signed_out &&
          value.signed_in
        ) {
          myAttendance.push({ date, course, ...value });
        }
      });
    }
    return response.status(200).send({
      payload: myAttendance,
    });
  }

  /**
   * Get student summarized attendance
   * GET students/:id/get_summarized_attendance
   *
   * @param {object} ctx
   * @param {Response} ctx.response
   * @param {} ctx.auth
   */

  async getSummarizedAttendance({ auth, response }) {
    // get all student attendance
    const user = await auth.authenticator("student").getUser();

    const query = await Attendance.query().fetch();

    const attendance = await Promise.all(
      query.toJSON().map(async (element) => {
        const course = await Course.find(element.course_id);
        const { title, code } = course.toJSON();
        let parsedData = JSON.parse(element.attendance);
        const date = element.created_at;
        return {
          course: { title, code },
          date,
          attendance: parsedData,
        };
      })
    );

    // save all students course
    const courses = [];

    for (let index = 0; index < attendance.length; index++) {
      const item = attendance[index].course.code;
      const courseIsExist = courses.find((index) => index === item);
      if (courseIsExist) {
        continue;
      }
      courses.push(item);
    }

    // save attendance by course
    const attendanceSummary = [];
    courses.forEach((course) => {
      // filter each course attendance
      const courseAttendance = attendance.filter(
        (x) => x.course.code === course
      );
      // save attendance count per course
      const totalCount = courseAttendance.length;
      // get the attendance column
      const allAttendance = courseAttendance.map((e) => e.attendance);

      // filter attendance by student id
      let studentCount = 0;
      allAttendance.forEach((el) => {
        const filterByStudent = el.filter(
          (x) => x.student_id === user.id && x.signed_in && x.signed_out
        );
        // save student attendance count
        if (filterByStudent.length) studentCount++;
      });

      attendanceSummary.push({
        [course]: {
          totalClassHeld: totalCount,
          aggregate: `${(100 * studentCount) / totalCount}%`,
        },
      });
    });

    return response.status(200).send({
      payload: attendanceSummary,
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
    const dp = request.file("dp", {
      types: ["image"],
      size: "5mb",
    });

    // check if dp field isn't null
    if (typeof student.dp != "object") {
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
      student.dp = imageUpload.data;
      await student.save();
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
