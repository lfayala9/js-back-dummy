import express from "express";
import userRoute from "./userRoute.js";
import authRoute from "./authRoute.js"
import postRoute from "./postsRoute.js"
import commentRoute from "./commentRoute.js"

function routerAPI(app) {
  const router = express.Router();
  app.use("/api/v1", router);
  router.use("/users", userRoute);
  router.use("/login", authRoute);
  router.use("/posts", postRoute);
  router.use("/comments", commentRoute)
}

export default routerAPI;
