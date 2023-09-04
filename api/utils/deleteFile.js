import { ref, getStorage, deleteObject } from "firebase/storage";

const storage = getStorage();
const deleteImg = (refUrl) => {
  const imageRef = ref(storage, refUrl);
  deleteObject(imageRef)
  .then(() => console.log('deleted'))
  .catch((error) => console.log("error:", error));
};
export default deleteImg;
