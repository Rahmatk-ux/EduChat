import { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "assignments"), orderBy("uploadedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAssignments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  // Function to download PDF or other raw files
  const handleDownload = async (url, title) => {
    if (!url) return alert("File not available");

    try {
      // Fetch the file as blob
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      // Create a temporary link to trigger download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = title || "assignment.pdf"; // filename for download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download file");
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h3 className="text-2xl font-semibold mb-4 text-white">Assignments</h3>
      <ul className="space-y-3">
        {assignments.length === 0 && <li className="text-white">No assignments uploaded yet.</li>}
        {assignments.map((a) => (
          <li
            key={a.id}
            className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition duration-150"
          >
            <p
              className="font-medium text-indigo-400 hover:underline cursor-pointer"
              onClick={() => handleDownload(a.fileUrl, a.title)}
            >
              {a.title}
            </p>
            {a.description && <p className="text-gray-300 text-sm mt-1">{a.description}</p>}
            <span className="text-gray-400 text-xs mt-1 block">By {a.uploadedBy}</span>
            <button
              onClick={() => handleDownload(a.fileUrl, a.title)}
              className="bg-indigo-600 px-3 py-1 text-white rounded mt-2"
            >
              Download
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
