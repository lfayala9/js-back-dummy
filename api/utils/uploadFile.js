import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { storage } from "../config/firebase.js";
import sharp from "sharp";

export async function uploadFile(file, size) {
  const randomNumber = Math.floor(Math.random() * 400) + 1
  const webpImage = await sharp(file.buffer)
    .resize({ width: size })
    .toBuffer();
  const fileRef = ref(storage, `files/picture${randomNumber}${Date.now()}.webp`);
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
