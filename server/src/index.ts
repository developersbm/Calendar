import express, { Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
/* ROUTE IMPORTS */
import auditLogRoutes from "./routes/auditLogRoutes"
import calendarRoutes from "./routes/calendarRoutes"
import eventParticipant from "./routes/eventParticipantRoutes"
import eventRoutes from "./routes/eventRoutes"
import groupMemberRoutes from "./routes/groupMemberRoutes"
import groupRoutes from "./routes/groupRoutes"
import membershipRoutes from "./routes/membershipRoutes"
import notificationRoutes from "./routes/notificationRoutes"
import savingPlanRoutes from "./routes/savingPlanRoutes"
import templateRoutes from "./routes/templateRoutes"
import userRoutes from "./routes/userRoutes"

/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

/* ROUTES */
app.get("/", (req, res) => {
    res.send("This is home route");
});

app.use("/auditLog", auditLogRoutes);
app.use("/calendar", calendarRoutes);
app.use("/eventParticipant", eventParticipant);
app.use("/event", eventRoutes);
app.use("/groupMember", groupMemberRoutes);
app.use("/group", groupRoutes);
app.use("/membership", membershipRoutes);
app.use("/notification", notificationRoutes);
app.use("/savingPlan", savingPlanRoutes);
app.use("/template", templateRoutes);
app.use("/user", userRoutes);

/* SERVER */
const port = Number(process.env.PORT) || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on part ${port}`);
});