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

module.exports = { objIsEmpty };
