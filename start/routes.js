"use strict";

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use("Route");

Route.get("/", () => {
  return { greeting: "Welcome to Mobile Attendance" };
});

// student route
Route.group(() => {
  Route.resource("students", "StudentController").except([
    "index",
    "create",
    "edit",
    "store",
  ]);
  Route.post("students/:id/add_course", "StudentController.addCourse").as(
    "students.addCourse"
  );
  Route.get("students/:id/get_courses", "StudentController.getCourses").as(
    "students.getCourses"
  );
  Route.get(
    "students/:id/get_attendance_by_courses",
    "StudentController.getAttendanceByCourses"
  ).as("students.getAttendanceByCourses");
  Route.put("students/:id/uploadDp", "StudentController.uploadDp").as(
    "students.uploadDp"
  );
  Route.put(
    "attendances/mark_attendance/:code",
    "AttendanceController.markAttendance"
  ).as("attendances.markAttendance");
  Route.put("attendances/signout", "AttendanceController.signout").as(
    "attendances.signout"
  );
  Route.get(
    "attendances/get_attendance_location/:code",
    "AttendanceController.getAttendanceLocation"
  ).as("attendances.getAttendanceLocation");
  Route.get(
    "students/:id/get_detailed_attendance",
    "StudentController.getDetailedAttendance"
  ).as("students.getDetailedAttendance");
  Route.get(
    "students/:id/get_summarized_attendance",
    "StudentController.getSummarizedAttendance"
  ).as("students.getSummarizedAttendance");
  Route.get("students/:id/get_image", "StudentController.getImage");
}).middleware(["auth:student"]);

// lecturer route
Route.group(() => {
  Route.resource("lecturers", "LecturerController").except([
    "index",
    "create",
    "edit",
    "store",
  ]);
  Route.post("lecturers/:id/add_course", "LecturerController.addCourse").as(
    "lecturers.addCourse"
  );
  Route.get("lecturers/:id/get_courses", "LecturerController.getCourses").as(
    "lecturers.getCourses"
  );
  Route.put("lecturers/:id/uploadDp", "LecturerController.uploadDp").as(
    "lecturers.uploadDp"
  );
  Route.get(
    "lecturers/:id/get_attendances",
    "LecturerController.getAttendance"
  ).as("lecturers.getAttendance");
  Route.get(
    "lecturers/:id/attendance_by_course",
    "LecturerController.getAttendanceByCourse"
  ).as("lecturers.getAttendanceByCourse");
  Route.post(
    "attendances/create_attendance",
    "AttendanceController.createAttendance"
  ).as("attendances.createAttendance");
  Route.put(
    "attendances/create_signout/:code",
    "AttendanceController.createSignout"
  ).as("attendances.createSignout");
}).middleware(["auth:lecturer"]);

// course route
Route.resource("courses", "CourseController").only(["index", "store"]);
Route.get("courses/fetch_by_level/:level", "CourseController.fetchByLevel");

Route.group(() => {
  Route.post("register", "UserController.store").as("users.register");
  Route.post("login", "UserController.login").as("auth.login");
  // Route.post("logout", "UserController.logout").as("auth.logout").middleware(['auth']);
}).prefix("auth");

// authentication
Route.post("students/login", "StudentController.login").as("students.login");
Route.post("lecturers/login", "LecturerController.login").as("lecturers.login");
Route.post("students/", "StudentController.store").as("students.store");
Route.post("lecturers/", "LecturerController.store").as("lecturers.store");
