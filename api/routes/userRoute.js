import express from "express";
import User from "../models/userModel.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import bcrypt from "bcrypt";
import { upload } from "../config/multer.js";
import { uploadFile } from "../utils/uploadFile.js";
import { io } from "../index.js";

const route = express.Router();

//Register User
route.post(
  "/",
  upload.fields([{ name: "picture", maxCount: 1 }]),
  async (req, res) => {
    const body = req.body;
    const { password } = req.body;
    const picture = req.files.picture;
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    try {
      if (picture && picture.length > 0) {
        const { downloadURL } = await uploadFile(picture[0]);

        const newUser = await new User({
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          password: passwordHash,
          picture: downloadURL,
        }).save();
        return res.status(200).json({ newUser });
      } else {
        const newUser = await new User({
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          password: passwordHash,
        }).save();
        return res.status(200).json({ newUser });
      }
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
);

//Get All Users info
route.get("/", (req, res) => {
  User.find()
    .then((data) => res.json(data))
    .catch((error) => res.status(404).json({ message: error }));
});

//Get your User Info
route.get("/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  User.findById(id)
    .then((data) => res.json(data))
    .catch((error) => res.status(404).json({ message: error }));
});

//Get your Friends Info
route.get("/:id/friends", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );

    const format = friends.map(
      ({ _id, firstName, lastName, occupation, location, picture }) => {
        return { _id, firstName, lastName, occupation, location, picture };
      }
    );
    res.status(200).json(format);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

//Add or remove a Friend
route.patch("/:id/:friendId", verifyToken, async (req, res) => {
  try {
    const { id, friendId } = req.params;
    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    if (user.friends.includes(friendId)) {
      user.friends = user.friends.filter((id) => id !== friendId);
      friend.friends = friend.friends.filter((id) => id !== id);
      io.emit("deleted-friend", friendId);
      console.log('deleted')
    } else {
      user.friends.push(friendId);
      friend.friends.push(id);
      io.emit("added-friend", friendId);
      console.log('added')
    }
    await user.save();
    await friend.save();

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );

    const format = friends.map(
      ({ _id, firstName, lastName, occupation, location, picture }) => {
        return { _id, firstName, lastName, occupation, location, picture };
      }
    );
    res.status(200).json(format);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

// Update User

route.patch("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          password: req.body.password,
          picture: req.body.picture,
          email: req.body.email,
        },
      },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ message: "User Not Found" });
      return;
    }

    res.status(200).json({ message: "User Updated!" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Delete User
route.delete("/:id", (req, res) => {
  const { id } = req.params;
  User.findByIdAndRemove(id)
    .then((data) => res.json(data))
    .catch((error) => res.status(404).json({ message: error }));
});
export default route;
