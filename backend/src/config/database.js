const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Remove deprecated options (useNewUrlParser and useUnifiedTopology)
    // These are defaults in MongoDB driver v4.0.0+
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
