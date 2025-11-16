// src/firebase/attendanceSetup.js
import {
  doc,
  collection,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

/* Helper: format Date to YYYY-MM-DD (local) */
function formatDateToYMD(date = new Date()) {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Mark attendance (create/overwrite) for a student for given subject & date
 * Path:
 *   attendance/{studentId}/subjects/{subject}/lectures/{YYYY-MM-DD}
 *
 * status: "present" | "absent"
 */
export async function markAttendance(studentId, subject, date = null, status = "present", markedBy = null) {
  if (!studentId || !subject) throw new Error("studentId and subject required");
  const dateKey = typeof date === "string" ? date : formatDateToYMD(date || new Date());

  const lectureRef = doc(db, "attendance", studentId, "subjects", subject, "lectures", dateKey);

  try {
    await setDoc(
      lectureRef,
      {
        status,
        markedAt: new Date().toISOString(),
        markedBy: markedBy || null,
      },
      { merge: true }
    );
    return { ok: true };
  } catch (err) {
    console.error("markAttendance error:", err);
    throw err;
  }
}

/**
 * Delete (undo) a lecture entry for a student/subject/date.
 * Removes attendance/{studentId}/subjects/{subject}/lectures/{YYYY-MM-DD}
 */
export async function deleteLecture(studentId, subject, date = null) {
  if (!studentId || !subject) throw new Error("studentId and subject required");
  const dateKey = typeof date === "string" ? date : formatDateToYMD(date || new Date());
  const lectureRef = doc(db, "attendance", studentId, "subjects", subject, "lectures", dateKey);

  try {
    await deleteDoc(lectureRef);
    return { ok: true };
  } catch (err) {
    console.error("deleteLecture error:", err);
    throw err;
  }
}

/**
 * Get attendance stats for a single student & subject
 * Returns { totalClasses, attended, percentage, lectures }
 * lectures: [{ date, status, markedAt }]
 */
export async function getAttendanceBySubject(studentId, subject) {
  if (!studentId || !subject) return { totalClasses: 0, attended: 0, percentage: "0.00", lectures: [] };

  const lecturesCol = collection(db, "attendance", studentId, "subjects", subject, "lectures");
  const q = query(lecturesCol, orderBy("__name__", "desc")); // date keys YYYY-MM-DD
  const snap = await getDocs(q);

  let total = 0;
  let present = 0;
  const lectures = [];

  snap.forEach((d) => {
    const data = d.data();
    total += 1;
    if (data.status === "present") present += 1;
    lectures.push({ date: d.id, status: data.status || "absent", markedAt: data.markedAt || null });
  });

  const percentage = total === 0 ? "0.00" : ((present / total) * 100).toFixed(2);

  return {
    totalClasses: total,
    attended: present,
    percentage,
    lectures,
  };
}

/**
 * Get attendance records for all students for a subject (and optionally a target date)
 * Returns a map keyed by studentId -> { attended, totalClasses, percentage, todaysStatus }
 *
 * NOTE: This scans the top-level attendance collection (doc per student).
 */
export async function getAttendanceForAllStudentsBySubject(subject, date = null) {
  if (!subject) return {};

  const dateKey = date ? (typeof date === "string" ? date : formatDateToYMD(date)) : formatDateToYMD();

  const attendanceRoot = collection(db, "attendance");
  const attendanceDocs = await getDocs(attendanceRoot); // each doc id is studentId

  const results = {};

  for (const attDoc of attendanceDocs.docs) {
    const studentId = attDoc.id;

    const lecturesCol = collection(db, "attendance", studentId, "subjects", subject, "lectures");
    const lecturesSnap = await getDocs(lecturesCol);

    let total = 0;
    let present = 0;
    let todaysStatus = null;

    lecturesSnap.forEach((d) => {
      const data = d.data();
      total += 1;
      if (data.status === "present") present += 1;
      if (d.id === dateKey) todaysStatus = data.status || null;
    });

    const percentage = total === 0 ? "0.00" : ((present / total) * 100).toFixed(2);

    results[studentId] = {
      attended: present,
      totalClasses: total,
      percentage,
      todaysStatus,
    };
  }

  return results;
}

/* helper export */
export const _helpers = { formatDateToYMD };
