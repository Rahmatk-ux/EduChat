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

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h3 className="text-2xl font-semibold mb-4 text-white">Assignments</h3>

      <ul className="space-y-3">
        {assignments.length === 0 && (
          <li className="text-white">No assignments uploaded yet.</li>
        )}

        {assignments.map((a) => (
          <li
            key={a.id}
            className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition duration-150"
          >
            <p className="font-medium text-indigo-400">{a.title}</p>

            {a.description && (
              <p className="text-gray-300 text-sm mt-1">{a.description}</p>
            )}

            <span className="text-gray-400 text-xs mt-1 block">
              By {a.uploadedBy}
            </span>

            <a
              href={a.fileUrl}
              target="_blank"
              className="text-indigo-400 underline text-sm mt-2 inline-block"
            >
              View File
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
