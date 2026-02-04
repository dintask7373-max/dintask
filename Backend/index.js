import express from "express";
import dotenv from "dotenv";
dotenv.config();

import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import { dbConnect } from "./Config/dbConnect.js";
import { errorHandler } from "./Helpers/helpers.js";
import routes from "./app.js";
import { razorpayWebhook } from "./Controllers/SubscriptionCtrl.js";

const PORT = process.env.PORT || 3000;
const app = express();

// ✅ Connect DB
dbConnect();

// ✅ CORS
app.use(cors());


// ============================
// ✅ Razorpay Webhook (RAW BODY FIRST)
// ============================
app.post(
  "/api/v1/razorpay-webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);


app.get("/test", (req, res) => {
  res.send("Main router working");
});
// ============================
// ✅ Normal Middlewares AFTER webhook
// ============================
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
// ✅ API routes
app.use("/", routes);

// ✅ Error handler
app.use(errorHandler);

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running Port ${PORT} ❤️`);
});
