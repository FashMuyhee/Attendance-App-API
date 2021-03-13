const fs = require("fs");
const FormData = require("form-data");
const form = new FormData();

const axios = require("axios");
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
 * A Function to compare similarities
 * between two images
 * the higher their differences the similar the images
 * @param {imageOne} cameraDp
 * @param {imageTwo} saveDp
 */
const compareImageDp = async (cameraDp, saveDp) => {
  form.append("img_1", fs.createReadStream(cameraDp));
  form.append("img_2", fs.createReadStream(saveDp));

  try {
    let res = await axios({
      method: "POST",
      url: `http://facexapi.com/compare_faces`,
      data: form,
      headers: {
        user_id: `604b4bdebeb79d20279c232a`,
        // contentType: "image/jpeg",
        ...form.getHeaders(),
      },
    });

    const { data } = await res;
    console.log("good");

    console.log(data.data);
    return data.data.confidence;
  } catch (error) {
    console.log("er", error);
  }
};

module.exports = { compareImageDp, objIsEmpty };
