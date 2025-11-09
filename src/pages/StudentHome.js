import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Assignments from "../components/Assignments";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function StudentHome() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");

  // Fetch all teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const usersCol = collection(db, "users");
        const q = query(usersCol, where("role", "==", "teacher"));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const teacherList = snapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name,
          }));
          setTeachers(teacherList);
        }
      } catch (err) {
        console.error("Error fetching teachers:", err);
      }
    };

    fetchTeachers();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const handleChat = () => {
    if (selectedTeacher) {
      navigate(`/chat/${selectedTeacher}`);
    } else {
      alert("Please select a teacher to chat with!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-4xl flex justify-between items-center mb-8 bg-white/20 backdrop-blur-md rounded-xl p-4 shadow-lg">
        <h1 className="text-2xl font-bold text-white">🎓 Student Dashboard</h1>
        <div className="flex items-center space-x-2">
          {/* Teacher Dropdown */}
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="p-2 rounded-lg text-black"
          >
            <option value="">Select Teacher</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleChat}
            className="bg-white/30 text-white px-4 py-2 rounded-lg hover:bg-white/40 transition"
          >
            💬 Chat
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Assignments Section */}
      <div className="w-full max-w-4xl bg-white/20 backdrop-blur-lg rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">📚 My Assignments</h2>
        <Assignments />
      </div>

      {/* Footer */}
      <footer className="mt-8 text-white/70 text-sm">
        © {new Date().getFullYear()} EduChat | Student Portal
      </footer>
    </div>
  );
}
