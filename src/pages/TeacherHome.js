// src/pages/TeacherHome.js
import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Assignments from "../components/Assignments";
import UploadAssignment from "../components/UploadAssignment";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

import {
  markAttendance,
  deleteLecture,
  getAttendanceForAllStudentsBySubject,
  _helpers,
} from "../firebase/attendanceSetup";

export default function TeacherHome() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [subjects] = useState(["PCS302", "MATH101", "PHY101"]);
  const [selectedSubject, setSelectedSubject] = useState("PCS302");
  const [selectedDate, setSelectedDate] = useState(_helpers.formatDateToYMD());
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // Load students
  // -----------------------------
  useEffect(() => {
    const loadStudents = async () => {
      const snap = await getDocs(collection(db, "users"));
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((u) => u.role === "student");
      setStudents(list);
      setLoading(false);
    };

    loadStudents();
  }, []);

  // -----------------------------
  // Load attendance from Firestore
  // -----------------------------
  // -----------------------------
// Load attendance from Firestore (real-time)
// -----------------------------
useEffect(() => {
  if (!selectedSubject || !selectedDate) return;

  const unsubscribers = [];

  const fetchAttendanceForStudent = (studentId) => {
    const lectureRef = doc(
      db,
      "attendance",
      studentId,
      "subjects",
      selectedSubject,
      "lectures",
      selectedDate
    );

    const unsub = onSnapshot(lectureRef, (docSnap) => {
      setAttendanceRecords((prev) => {
        const prevRec = prev[studentId] || {
          attended: 0,
          totalClasses: 0,
          percentage: "0.00",
          todaysStatus: null,
        };

        let todaysStatus = docSnap.exists() ? docSnap.data().status : null;
        let totalClasses = prevRec.totalClasses;
        let attended = prevRec.attended;

        // Update totals if marking today counts
        if (!prevRec.todaysStatus && todaysStatus) {
          totalClasses += 1;
          if (todaysStatus === "present") attended += 1;
        } else if (prevRec.todaysStatus && !todaysStatus) {
          // if attendance undone
          totalClasses = Math.max(totalClasses - 1, 0);
          if (prevRec.todaysStatus === "present") attended = Math.max(attended - 1, 0);
        } else if (prevRec.todaysStatus === "present" && todaysStatus === "absent") {
          attended -= 1;
        } else if (prevRec.todaysStatus === "absent" && todaysStatus === "present") {
          attended += 1;
        }

        const percentage =
          totalClasses === 0 ? "0.00" : ((attended / totalClasses) * 100).toFixed(2);

        return {
          ...prev,
          [studentId]: {
            attended,
            totalClasses,
            percentage,
            todaysStatus,
          },
        };
      });
    });

    unsubscribers.push(unsub);
  };

  students.forEach((s) => fetchAttendanceForStudent(s.id));

  return () => unsubscribers.forEach((unsub) => unsub());
}, [selectedSubject, selectedDate, students]);


  // -----------------------------
  // Handle CHAT
  // -----------------------------
  const handleChat = () => {
    if (!selectedStudent) return alert("Select student first");
    navigate(`/chat/${selectedStudent}`);
  };

  // -----------------------------
  // Handle Mark Attendance (Instant UI update)
  // -----------------------------
  const handleMark = async (studentId, status) => {
    const prev = attendanceRecords[studentId] || {
      attended: 0,
      totalClasses: 0,
      percentage: "0.00",
      todaysStatus: null,
    };

    // -------------------------
    // 1️⃣ If same → undo
    // -------------------------
    if (prev.todaysStatus === status) {
      await deleteLecture(studentId, selectedSubject, selectedDate);

      // UPDATE UI INSTANTLY
      let total = Math.max(prev.totalClasses - 1, 0);
      let attended = prev.attended;

      if (prev.todaysStatus === "present") {
        attended = Math.max(attended - 1, 0);
      }

      const percentage =
        total === 0 ? "0.00" : ((attended / total) * 100).toFixed(2);

      setAttendanceRecords((r) => ({
        ...r,
        [studentId]: { attended, totalClasses: total, todaysStatus: null, percentage }
      }));

      return;
    }

    // -------------------------
    // 2️⃣ Otherwise → mark new
    // -------------------------
    await markAttendance(studentId, selectedSubject, selectedDate, status);

    let total = prev.totalClasses;
    let attended = prev.attended;

    // New entry
    if (!prev.todaysStatus) {
      total += 1;
      if (status === "present") attended += 1;
    } else {
      // Changing previous status
      if (prev.todaysStatus === "present" && status === "absent") {
        attended -= 1;
      } else if (prev.todaysStatus === "absent" && status === "present") {
        attended += 1;
      }
    }

    const percentage =
      total === 0 ? "0.00" : ((attended / total) * 100).toFixed(2);

    // UPDATE UI INSTANTLY
    setAttendanceRecords((r) => ({
      ...r,
      [studentId]: {
        attended,
        totalClasses: total,
        todaysStatus: status,
        percentage,
      },
    }));
  };

  // -----------------------------
  if (loading) return <div className="p-6">Loading...</div>;
  // -----------------------------

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
      <div className="w-full max-w-6xl mx-auto bg-white/20 backdrop-blur-xl rounded-2xl p-8">

        {/* Header */}
<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">

  <h2 className="text-3xl font-bold">👩‍🏫 Teacher Dashboard</h2>

  {/* Student Select + Chat */}
  <div className="flex flex-col md:flex-row flex-wrap justify-between items-start md:items-center mb-6 gap-4">


    <select
      value={selectedStudent}
      onChange={(e) => setSelectedStudent(e.target.value)}
      className="text-black p-2 rounded-lg w-full sm:w-auto"
    >
      <option value="">Select Student</option>
      {students.map((s) => (
        <option key={s.id} value={s.id}>{s.name}</option>
      ))}
    </select>

    <button
      onClick={handleChat}
      className="bg-indigo-600 px-4 py-2 rounded-lg w-full sm:w-auto"
    >
      💬 Chat
    </button>
  </div>
</div>

{/* Filters */}
<div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">

  <div>
    <label className="block mb-1 font-semibold">Subject:</label>
    <select
      value={selectedSubject}
      onChange={(e) => setSelectedSubject(e.target.value)}
      className="p-2 rounded-lg text-black w-full"
    >
      {subjects.map((sub) => (
        <option key={sub} value={sub}>{sub}</option>
      ))}
    </select>
  </div>

  <div>
    <label className="block mb-1 font-semibold">Date:</label>
    <input
      type="date"
      value={selectedDate}
      onChange={(e) => setSelectedDate(e.target.value)}
      className="p-2 rounded-lg text-black w-full"
    />
  </div>

</div>


        {/* Attendance Table */}
<div className="bg-white/10 p-4 rounded-xl shadow mb-8">
  <h3 className="text-xl mb-3">
    📝 Attendance — {selectedSubject} — {selectedDate}
  </h3>

  {/* Mobile Responsive Wrapper */}
  <div className="overflow-x-auto">
    <table className="w-full text-white text-sm md:text-base">

      <thead>
        <tr className="bg-white/20">
          <th className="border px-3 py-2">Student</th>
          <th className="border px-3 py-2">Present</th>
          <th className="border px-3 py-2">Absent</th>
          <th className="border px-3 py-2">Attended / Total</th>
          <th className="border px-3 py-2">%</th>
        </tr>
      </thead>

      <tbody>
        {students.map((s) => {
          const rec = attendanceRecords[s.id] || {
            attended: 0,
            totalClasses: 0,
            percentage: "0.00",
            todaysStatus: null,
          };

          return (
            <tr key={s.id} className="odd:bg-white/5">
              <td className="border px-3 py-2 text-black">{s.name}</td>

              <td className="border px-3 py-2 text-center">
                <button
                  onClick={() => handleMark(s.id, "present")}
                  className={`px-2 md:px-3 py-1 rounded ${
                    rec.todaysStatus === "present"
                      ? "bg-green-700"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  ✅
                </button>
              </td>

              <td className="border px-3 py-2 text-center">
                <button
                  onClick={() => handleMark(s.id, "absent")}
                  className={`px-2 md:px-3 py-1 rounded ${
                    rec.todaysStatus === "absent"
                      ? "bg-red-700"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  ❌
                </button>
              </td>

              <td className="border px-3 py-2 text-black text-center">
                {rec.attended}/{rec.totalClasses}
              </td>

              <td className="border px-3 py-2 text-black text-center">
                {rec.percentage}%
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
</div>


        {/* Assignments */}
        <div className="mb-6">
          <UploadAssignment />
        </div>

        <Assignments />
      </div>
    </div>
  );
}
