const cloudinary = require("cloudinary");
const Env = use("Env");

cloudinary.config({
  cloud_name: Env.get("CLOUDINARY_CLOUD_NAME"),
  api_key: Env.get("CLOUDINARY_API_KEY"),
  api_secret: Env.get("CLOUDINARY_API_SECRET"),
});

const uploadFile = async (file) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await cloudinary.v2.uploader.upload(file.tmpPath, {
        folder: "profile_upload",
        transformation: { quality: 50 },
      });
      resolve({ status: true, data: response.secure_url });
    } catch (error) {
      console.log(error);
      reject({ status: false, data: error.message });
    }
  });
};
module.exports = { uploadFile };
