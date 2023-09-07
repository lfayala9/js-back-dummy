import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { storage } from "../config/firebase.js";
import sharp from "sharp";

export async function uploadFile(file) {
  const webpImage = await sharp(file.buffer)
    .resize({ width: 700 })
    .toBuffer();
  const fileRef = ref(storage, `files/${file.originalname}${Date.now()}.webp`);
  const fileMetadata = {
    contentType: file.mimetype,
  };

  const fileUploadPromise = uploadBytesResumable(
    fileRef,
    webpImage,
    fileMetadata
  );

  await fileUploadPromise;
  const fileDownloadURL = await getDownloadURL(fileRef);

  return { ref: fileRef, downloadURL: fileDownloadURL };
}
