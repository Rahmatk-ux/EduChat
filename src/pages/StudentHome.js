// src/pages/StudentHome.js
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Assignments from "../components/Assignments";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { collection, getDocs, query, where, onSnapshot } from "firebase/firestore";

export default function StudentHome() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");

  const [subjects, setSubjects] = useState(["PCS302", "MATH101", "PHY101"]);
  const [selectedSubject, setSelectedSubject] = useState("PCS302");

  const [attendance, setAttendance] = useState({
    totalClasses: 0,
    attended: 0,
    percentage: "0.00",
    lectures: [],
  });

  // fetch teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const usersCol = collection(db, "users");
        const q = query(usersCol, where("role", "==", "teacher"));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setTeachers(list);
      } catch (err) {
        console.error("Error fetching teachers:", err);
      }
    };
    fetchTeachers();
  }, []);

  // Real-time attendance for selected subject
  useEffect(() => {
    if (!auth.currentUser || !selectedSubject) return;

    // No orderBy => No index needed
    const lecturesCol = collection(
      db,
      "attendance",
      auth.currentUser.uid,
      "subjects",
      selectedSubject,
      "lectures"
    );

    const unsub = onSnapshot(
      lecturesCol,
      (snap) => {
        let lectures = [];

        snap.forEach((d) => {
          const data = d.data();
          lectures.push({
            date: d.id,
            status: data.status || "absent",
            markedAt: data.markedAt || null,
          });
        });

        // Sort by date manually — newest first
        lectures.sort((a, b) => b.date.localeCompare(a.date));

        // Calculate summary
        const total = lectures.length;
        const present = lectures.filter((x) => x.status === "present").length;

        const percentage =
          total === 0 ? "0.00" : ((present / total) * 100).toFixed(2);

        setAttendance({
          totalClasses: total,
          attended: present,
          percentage,
          lectures,
        });
      },
      (err) => {
        console.error("Attendance onSnapshot error:", err);
      }
    );

    return () => unsub();
  }, [selectedSubject]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const handleChat = () => {
    if (selectedTeacher) navigate(`/chat/${selectedTeacher}`);
    else alert("Please select a teacher to chat with!");
  };

return (
  <div className="min-h-screen p-4 sm:p-6 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center">

    {/* Header */}
    <header className="w-full max-w-4xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white/20 backdrop-blur-md rounded-xl p-4 shadow-lg">

      <h1 className="text-2xl font-bold text-white">🎓 Student Dashboard</h1>

      {/* Teacher Select + Chat + Logout */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">

        <select
          value={selectedTeacher}
          onChange={(e) => setSelectedTeacher(e.target.value)}
          className="p-2 rounded-lg text-black w-full sm:w-auto"
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
          className="bg-white/30 text-white px-4 py-2 rounded-lg w-full sm:w-auto"
        >
          💬 Chat
        </button>

        <button
          onClick={handleLogout}
          className="bg-red-500 px-3 py-2 rounded-lg w-full sm:w-auto"
        >
          Logout
        </button>
      </div>
    </header>

    {/* Attendance */}
    <div className="w-full max-w-4xl bg-white/20 backdrop-blur-lg rounded-2xl p-4 sm:p-6 mb-6">
      <h2 className="text-xl font-semibold text-white mb-4">📝 My Attendance</h2>

      {/* Subject Dropdown */}
      <div className="mb-4">
        <label className="text-white mr-2">Subject:</label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="p-2 rounded-lg text-black w-full sm:w-auto"
        >
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Attendance Summary */}
      <div className="text-white mb-4 text-sm sm:text-base">
        <p>
          Subject: <strong>{selectedSubject}</strong>
        </p>
        <p>Total Classes: {attendance.totalClasses}</p>
        <p>Attended: {attendance.attended}</p>
        <p>Percentage: {attendance.percentage}%</p>
      </div>

      {/* Recent Lectures */}
      <div className="bg-white/10 p-3 rounded text-sm sm:text-base">
        <h4 className="text-white mb-2">Recent Lectures</h4>
        <ul className="text-white/90 space-y-1">
          {attendance.lectures.length === 0 && <li>No lectures yet.</li>}
          {attendance.lectures.map((lec) => (
            <li key={lec.date}>
              {lec.date} — {lec.status}
            </li>
          ))}
        </ul>
      </div>
    </div>

    {/* Assignments */}
    <div className="w-full max-w-4xl bg-white/20 backdrop-blur-lg rounded-2xl p-4 sm:p-6">
      <h2 className="text-xl font-semibold text-white mb-4">📚 My Assignments</h2>
      <Assignments />
    </div>

    <footer className="mt-8 text-white/70 text-xs sm:text-sm">
      © {new Date().getFullYear()} EduChat | Student Portal
    </footer>
  </div>
);
}
