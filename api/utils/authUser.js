import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import { uploadFile } from "./uploadFile.js";

export const signIn = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      friends,
      location,
      occupation,
    } = req.body;
    const picture = req.files.picture

    const user = await User.findOne({ email: email });
    if (user) {
      return res.status(400).json({ message: "E-mail already exists" });
    }
    
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);


    if(picture && picture.length > 0){
      const {downloadURL} = await uploadFile(picture[0])

      const newUser = await new User({
        firstName,
        lastName,
        email,
        password: passwordHash,
        picture: downloadURL,
        friends,
        location,
        occupation,
        viewedProfile: Math.floor(Math.random() * 10000),
        impressions: Math.floor(Math.random() * 10000),
      }).save()
      res.status(200).json({newUser});
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};