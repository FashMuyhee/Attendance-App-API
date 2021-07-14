/**
 * A Function to check if an
 * object is empty by returning
 * either false or true
 * @param {} obj
 */
const objIsEmpty = (obj) => {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }
  return true;
};

/**
 * Check if auth student has registered for
 * the current marking attendance course
 * @param  {} {course_id
 * @param  {} courses}
 * @returns boolean true /false
 */
const isCourseRegistered = ({ course_id, courses = [] }) => {
  const isExist = courses.find((el) => el.id === course_id);
  return isExist ? true : false;
};

/**
 * A function check if an attendance code has expired
 ** @param code_created_at
 */
const isCodeExpiry = (code_created_at) => {
  const now = new Date();
  let diff = (code_created_at.getTime() - now.getTime()) / 1000;
  diff /= 3600;

  const rndDiff = Math.abs(Math.round(diff));
  return rndDiff <= 60 ? true : false;
};

module.exports = { objIsEmpty, isCourseRegistered, isCodeExpiry };
