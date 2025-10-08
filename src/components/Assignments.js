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
    <div>
      <h3>Assignments</h3>
      <ul>
        {assignments.map((a) => (
          <li key={a.id}>
            <a href={a.fileUrl} target="_blank" rel="noreferrer">
              {a.title}
            </a>{" "}
            by {a.uploadedBy}
          </li>
        ))}
      </ul>
    </div>
  );
}
