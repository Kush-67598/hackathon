const mongoose = require("mongoose");

async function connectDB() {
  
  const uri ="mongodb+srv://kushsingh2666:qWeRtY67598@skillnest-cluster.pd51hs8.mongodb.net/hormonal_screening";
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  await mongoose.connect(uri);
  return mongoose.connection;
}

module.exports = { connectDB };
