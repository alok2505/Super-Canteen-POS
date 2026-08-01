const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "products", // Specify the folder name in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp"], // Specify allowed file formats
  },
});

const upload = multer({ storage: storage });

module.exports = upload;