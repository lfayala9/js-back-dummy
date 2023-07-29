import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { storage } from "../config/firebase.js";
import sharp from "sharp";

export async function uploadFile(file) {
  let fileBuffer = await sharp(file.buffer).resize({
    width: 200,
    height: 200,
    fit: "cover",
  }).toBuffer;

  const fileRef = ref(storage, `files/${file.originalname} ${Date.now()}`);
  const fileMetadata = {
    contentType: file.mimetype,
  };
  const fileUploadPromise = uploadBytesResumable(
    fileRef,
    // fileBuffer,
    file.buffer,
    fileMetadata,
  );

  await fileUploadPromise;
  const fileDownloadURL = await getDownloadURL(fileRef);

  return { ref: fileRef, downloadURL: fileDownloadURL };
}
