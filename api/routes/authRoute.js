import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const route = express.Router();

route.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      res.status(400).json({ message: "Wrong Password" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    delete user.password;
    res.status(200).json({ message:"Succesful login", token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default route
