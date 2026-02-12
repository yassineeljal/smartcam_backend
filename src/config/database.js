const mongoose = require("mongoose");
const config = require("./index");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongo.uri);
    console.log(`MongoDB connecte : ${conn.connection.host}`);
  } catch (error) {
    console.error(`Erreur MongoDB : ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
