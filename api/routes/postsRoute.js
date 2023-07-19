import express from "express";
import multer from "multer";
import User from "../models/userModel.js";
import Post from "../models/postModel.js";
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

// Create Posts
route.post("/", verifyToken, upload.single("picture"), async (req, res) => {
  try {
    const { userId, postContent, picturePath } = req.body;
    const user = await User.findById(userId);
    const createPost = new Post({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      postContent,
      userPicturePath: user.picturePath,
      picturePath,
      likes: {},
      comments: [],
    });
    await createPost.save();
    const post = await Post.find();
    res.status(201).json(post);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
});

// Get all posts
route.get("/", verifyToken, async (req, res) => {
  try {
    const post = await Post.find();
    res.status(200).json(post);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
});

//Get a user posts
route.get("/:id", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const post = await Post.find({ userId });
    res.status(200).json(post);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
});

//Like Post
route.patch("/:id/like", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const post = await Post.findById(id);
    const liked = post.likes.get(userId);

    if (liked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    const updatedPost = await Post.findByIdAndUpdate(
        id,
        {likes: post.likes},
        {new: true}
    )
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
});

export default route