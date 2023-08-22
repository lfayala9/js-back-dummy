import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { storage } from "../config/firebase.js";

export async function uploadFile(file) {
  const fileRef = ref(storage, `files/${file.originalname} ${Date.now()}`);
  const fileMetadata = {
    contentType: file.mimetype,
  };
  const fileUploadPromise = uploadBytesResumable(
    fileRef,
    file.buffer,
    fileMetadata,
  );

  await fileUploadPromise;
  const fileDownloadURL = await getDownloadURL(fileRef);

  return { ref: fileRef, downloadURL: fileDownloadURL };
}
