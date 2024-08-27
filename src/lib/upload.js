import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

// Updated upload function to handle both files and URLs
const upload = async (input) => {
  try {
    const storage = getStorage();
    const date = new Date().toISOString(); // Use toISOString to avoid spaces and special characters

    if (!input) {
      throw new Error("No input provided for upload.");
    }

    let file;
    let fileName;

    if (typeof input === "string") {
      // If input is a URL, fetch it as a blob
      const response = await fetch(input);
      file = await response.blob();
      fileName = `images/${date}_google_avatar.png`; // Define a custom name for the file
    } else {
      // If input is a File object
      file = input;
      fileName = `images/${date}_${file.name}`;
    }

    const metadata = {
      contentType: file.type,
    };

    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          console.error("Upload failed:", error);
          reject(error); // Propagate the error to the caller
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log("File available at", downloadURL);
            resolve(downloadURL);
          });
        }
      );
    });
  } catch (error) {
    console.error("Error in upload function:", error);
    throw error;
  }
};

export default upload;
