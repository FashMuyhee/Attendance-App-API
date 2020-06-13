const deepai = require("deepai");
deepai.setApiKey("9d0faa99-bb3f-4209-bc28-5855b6951d3d"); // get your free API key at https://deepai.org
const fs = require("fs");

const objIsEmpty = (obj) => {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }
  return true;
};

const compareImageDp = async (cameraDp, saveDp) => {
  try {
    const resp = await deepai.callStandardApi("image-similarity", {
      image1: fs.createReadStream(cameraDp),
      image2: fs.createReadStream(saveDp),
    });
    const {
      output: { distance },
    } = resp;
    console.log(distance);
    return distance;
  } catch (error) {
    console.log(error.response);
    return error.response;
  }
};
module.exports = { objIsEmpty, compareImageDp };
