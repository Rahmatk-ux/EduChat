import { useState, useEffect } from "react";
import { uploadAssignment } from "../firebase/firestoreSetup";
import { auth } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function UploadAssignment() {
  const [title, setTitle] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Ensure user is logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) navigate("/login");
      else setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleUpload = async () => {
    if (!title.trim() || !fileUrl.trim()) return alert("Fill all fields");

    if (!auth.currentUser) {
      return alert("User not authenticated");
    }

    try {
      await uploadAssignment(title, "", fileUrl, auth.currentUser.uid);
      alert("Assignment uploaded successfully!");
      setTitle("");
      setFileUrl("");
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload. Check permissions or URL.");
    }
  };

  if (loading) return <p className="text-white">Loading...</p>;

  return (
    <div className="flex flex-col space-y-2 mt-4">
      <input
        className="p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
        placeholder="Assignment Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        className="p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
        placeholder="File URL"
        value={fileUrl}
        onChange={(e) => setFileUrl(e.target.value)}
      />
      <button
        onClick={handleUpload}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold"
      >
        Upload Assignment
      </button>
    </div>
  );
}
