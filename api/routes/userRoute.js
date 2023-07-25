import express from "express";
import User from "../models/userModel.js";
import multer from "multer";
import { signIn } from "../utils/authUser.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const route = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

//Register User
route.post("/", upload.single("picture"), signIn);

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
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );
    res.status(200).json(format);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

//Add or remove a Friend
route.patch("/:id/friendId", verifyToken, async (req, res) => {
  try {
    const { id, friendId } = req.params;
    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    if (user.friends.includes(friendId)) {
      user.friends = user.friends.filter((id) => id !== friendId);
      friend.friends = friend.friends.filter((id) => id !== id);
    } else {
      user.friends.push(friendId);
      friend.friends.push(id);
    }
    await user.save();
    await friend.save();

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );

    const format = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
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
          picturePath: req.body.picturePath,
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
