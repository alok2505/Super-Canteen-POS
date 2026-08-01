const cloudinary=require('cloudinary').v2;

try{
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ,
  api_secret: process.env.CLOUDINARY_API_SECRET ,
});
}catch(err){
  console.log("Cloudinary configuration error:", err);
}

module.exports = cloudinary;