const fs = require('fs');
const path = require('path');

const deleteOldImage = (imagePath) => {
  if (imagePath && imagePath.startsWith("/uploads/products/")) {
    try {
      const fullPath = path.join(__dirname, "..", imagePath); // Go up to 'backend' then into uploads
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      } else {
        console.log("File not found for deletion:", fullPath);
      }
    } catch (err) {
      console.error("Error deleting old image:", err);
    }
  }
};

const deleteOldImages = (imagePaths) => {
  if (Array.isArray(imagePaths)) {
    imagePaths.forEach(deleteOldImage);
  }
};

module.exports = { deleteOldImage, deleteOldImages };
