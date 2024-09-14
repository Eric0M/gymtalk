import mongoose from "mongoose";

let isConnected = false;

export const connectToDB = async () => {
  mongoose.set("strictQuery", true);
  if (isConnected) {
    console.log("MongoDB is already connected");
    return;
  }

  try {
    await mongoose.connect(
      `mongodb+srv://eejm:${process.env.MONGO_DB_PASS}@cluster0.vhk5t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
    );
    isConnected = true;
    console.log("MongoDB connected");
  } catch (error) {
    console.log(error);
  }
};
