import { useState, useEffect } from "react";
import { uploadAssignment } from "../firebase/firestoreSetup";
import { uploadFileToCloudinary } from "../firebase/cloudinaryUpload";
import { auth } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function UploadAssignment() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) navigate("/login");
      else setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleUpload = async () => {
    if (!title.trim() || !file) return alert("Fill all fields");
    if (!auth.currentUser) return alert("User not authenticated");

    try {
      setUploading(true);

      // Upload to Cloudinary and get PUBLIC secure URL
      const fileUrl = await uploadFileToCloudinary(file);

      // Store in Firestore
      await uploadAssignment(title, description, fileUrl, auth.currentUser.uid);

      alert("Assignment uploaded successfully!");
      setTitle("");
      setDescription("");
      setFile(null);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload file or assignment");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <p className="text-white">Loading...</p>;

  return (
    <div className="flex flex-col space-y-2 mt-4 max-w-md mx-auto">
      <input
        className="p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
        placeholder="Assignment Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        className="p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
        placeholder="Assignment Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
        className="p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />
      <button
        onClick={handleUpload}
        disabled={uploading}
        className={`bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold ${
          uploading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {uploading ? "Uploading..." : "Upload Assignment"}
      </button>
    </div>
  );
}
