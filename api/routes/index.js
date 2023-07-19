import express from "express";
import userRoute from "./userRoute.js";
import authRoute from "./authRoute.js"
import postRoute from "./postsRoute.js"

function routerAPI(app) {
  const router = express.Router();
  app.use("/api/v1", router);
  router.use("/users", userRoute);
  router.use("/login", authRoute);
  router.use("/posts", postRoute)
}

export default routerAPI;
