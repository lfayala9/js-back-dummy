import express from "express";
import userRoute from "./userRoute.js";
import authRoute from "./authRoute.js"

function routerAPI(app) {
  const router = express.Router();
  app.use("/api/v1", router);
  router.use("/users", userRoute);
  router.use("/login", authRoute);
}

export default routerAPI;
