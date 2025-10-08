import { useState } from "react";
import { uploadAssignment } from "../firebase/firestoreSetup";
import { auth } from "../firebase/firebaseConfig";

export default function UploadAssignment() {
  const [title, setTitle] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  const handleUpload = async () => {
    if (!title || !fileUrl) return alert("Fill all fields");
    await uploadAssignment(title, "", fileUrl, auth.currentUser.uid);
    setTitle("");
    setFileUrl("");
    alert("Uploaded successfully!");
  };

  return (
    <div style={{ marginTop: "10px" }}>
      <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input placeholder="File URL" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} />
      <button onClick={handleUpload}>Upload Assignment</button>
    </div>
  );
}
