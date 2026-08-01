const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './backend/.env' });
const Product = require('./backend/models/productModel');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pos').then(async () => {
  try {
    const product = await Product.findOne();
    if (!product) {
      console.log('No product found');
      process.exit(0);
    }
    console.log('Found product', product._id);
    product.name = product.name + " Test";
    await product.save();
    console.log('Saved successfully');
  } catch (err) {
    console.error('Error saving:', err);
  } finally {
    mongoose.disconnect();
  }
});
