import mongoose from "mongoose";
import { DB_NAME } from "../constants/constants.js";

const connectToDB = async (): Promise<void> => {
  try {
    const dbInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\n🥁MongoDB connected!! DB Host: ${dbInstance.connection.host}. \n ${dbInstance.connection.name} `
    );
  } catch (error) {
    console.log("😵‍💫MongoDB connection FAILED: ", error);
    process.exit(1);
  }
};

export default connectToDB;
