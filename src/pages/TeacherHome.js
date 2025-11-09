import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Assignments from "../components/Assignments";
import UploadAssignment from "../components/UploadAssignment";
import { auth, db } from "../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export default function TeacherHome() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");

  // Fetch all students from Firestore
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const usersCol = collection(db, "users");
        const snapshot = await getDocs(usersCol);
        const studentList = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((u) => u.role === "student");
        setStudents(studentList);
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    };
    fetchStudents();
  }, []);

  // Navigate to chat with selected student
  const handleChat = () => {
    if (!selectedStudent) {
      alert("Please select a student to chat with!");
      return;
    }
    // Pass the selected student UID in the URL
    navigate(`/chat/${selectedStudent}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 text-white">
      <div className="max-w-5xl mx-auto bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">👩‍🏫 Teacher Dashboard</h2>
          <div className="flex items-center space-x-2">
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="text-black p-2 rounded-lg"
            >
              <option value="">Select Student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleChat}
              className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg font-semibold"
            >
              💬 Chat
            </button>
          </div>
        </div>

        {/* Upload Assignment */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-3">📤 Upload New Assignment</h3>
          <div className="bg-white/10 p-5 rounded-xl border border-white/30 shadow-md">
            <UploadAssignment />
          </div>
        </div>

        {/* View Assignments */}
        <div>
          <h3 className="text-xl font-semibold mb-3">📚 Your Uploaded Assignments</h3>
          <div className="bg-white/10 p-5 rounded-xl border border-white/30 shadow-md">
            <Assignments />
          </div>
        </div>
      </div>
    </div>
  );
}
