const deepai = require("deepai");
deepai.setApiKey("quickstart-QUdJIGlzIGNvbWluZy4uLi4K"); // get your free API key at https://deepai.org
// deepai.setApiKey("128c961a-e1c6-4a30-b69b-3614ad7c0037"); // get your free API key at https://deepai.org
const fs = require("fs");

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
 * the lower their differences the similar the images
 * @param {imageOne} cameraDp
 * @param {imageTwo} saveDp
 */
const compareImageDp = async(cameraDp, saveDp) => {
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

module.exports = { compareImageDp, objIsEmpty };