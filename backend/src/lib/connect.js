import mongoose from "mongoose";

export const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not defined in environment variables");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Error Connecting to MongoDB:", error.message);
    process.exit(1);
  }

  // handles graceful shutdown
  process.on("SIGINT", async () => {
    await mongoose.disconnect();
    console.log("MongoDB connection closed due to app termination");
    process.exit(0);
  });
};
