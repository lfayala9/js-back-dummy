import express from "express";
import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import Comment from "../models/commentModel.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { upload } from "../config/multer.js";
import { uploadFile } from "../utils/uploadFile.js";
import { io } from "../index.js";

const route = express.Router();

//Comment Post

route.post(
  "/:postId/comment/",
  upload.fields([{ name: "picture", maxCount: 1 }]),
  verifyToken,
  async (req, res) => {
    const { postId } = req.params;
    const { postContent, userId } = req.body;
    const picture = req.files.picture;
    const user = await User.findById(userId);
    try {
      if (picture && picture.length > 0) {
        const { downloadURL } = await uploadFile(picture[0], 700);
        const post = await Post.findById(postId);
        const createComment = new Comment({
          userId,
          postId,
          firstName: user.firstName,
          lastName: user.lastName,
          userPicture: user.picture,
          postContent,
          likes: {},
          picture: downloadURL,
        });
        await createComment.save();
        post.comments.push(createComment);
        await post.save();
        res.status(201).json(createComment);
        io.emit("new-comment", createComment);
      } else {
        const post = await Post.findById(postId);
        const createComment = new Comment({
          userId,
          postId,
          firstName: user.firstName,
          lastName: user.lastName,
          userPicture: user.picture,
          postContent,
          likes: {},
          picture,
        });
        await createComment.save();
        post.comments.push(createComment);
        await post.save();
        res.status(201).json(createComment);
        io.emit("new-comment", createComment);
      }
    } catch (error) {
      res.status(409).json({ message: error.message });
    }
  }
);
// Get single comment

route.get("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const comment = await Comment.findById(id);
  if (comment) {
    res.status(200).json(comment);
  } else {
    res.status(404).json({ message: "Comment not found" });
  }
});

//Get Post comments

route.get("/:postId/comments", verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ postId });
    res.status(200).json(comments);
  } catch (error) {
    res.status(404).json({ message: "Comments not found" });
  }
});

//Like/Dislike Comment

route.patch("/:id/like/:userId", verifyToken, async (req, res) => {
  const { id, userId } = req.params;
  const comment = await Comment.findById(id);
  const liked = comment.likes.get(userId);
  try {
    if (liked) {
      comment.likes.delete(userId);
    } else {
      comment.likes.set(userId, true);
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      { likes: comment.likes },
      { new: true }
    );
    res.status(200).json(updatedComment);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
  io.emit("deleted-comment", commentId)
});

export default route;
