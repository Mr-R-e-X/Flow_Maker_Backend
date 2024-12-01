import "./env.js";
import app from "./app.js";
import connectToDB from "./config/mongodb.js";
import agenda from "./config/agenda.js";

const PORT: string = process.env.PORT!;
if (!PORT) {
  console.log("😵‍💫 Error: PORT is not defined in environment variables!");
  process.exit(1);
}

connectToDB()
  .then(() => {
    agenda
      .start()
      .then(() => {
        console.log("Agenda job queue started successfully.");
      })
      .catch((error) => {
        console.log("😵‍💫 Error starting Agenda job queue:", error);
      });
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    app.on("error", (error: any) => {
      console.log("😵‍💫 Error in Server ON --> ", error);
      throw error;
    });
  })
  .catch((error: Error) => {
    console.log("😵‍💫 Error in Server ON --> ", error);
    throw error;
  });
