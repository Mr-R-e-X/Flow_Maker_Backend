import { Agenda } from "@hokify/agenda";
import { sendMail } from "../utils/nodemailer.js";
import Workflow, { WorkflowStatus } from "../model/servicesStatus.model.js";

const agenda = new Agenda({
  db: { address: process.env.MONGODB_URI!, collection: "services" },
});
agenda.defaultConcurrency(5);
agenda.define("send email", async (job) => {
  const { sourceData, workflowId, subject, body } = job.attrs.data;

  await Workflow.findByIdAndUpdate(workflowId, {
    status: WorkflowStatus.InProgress,
  });

  const emailPromises = sourceData.map(async (user: any) => {
    const personalizedBody = body.replace("{{user}}", user["username"] || "");

    try {
      const emailInfo = await sendMail(user.email, subject, personalizedBody);
      console.log(`Email sent to ${user.username}:`, emailInfo);
    } catch (error) {
      console.error(`Failed to send email to ${user.username}:`, error);
    }
  });
  await Promise.all(emailPromises);

  await Workflow.findByIdAndUpdate(workflowId, {
    status: WorkflowStatus.Completed,
  });
});

agenda.on("ready", async () => {
  console.log("Agenda is ready");
  await agenda.start();
  console.log("Agenda started");
});

// console.log(agenda);
export default agenda;
