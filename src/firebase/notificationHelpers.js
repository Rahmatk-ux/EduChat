import { doc, setDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";

export async function sendNotification(studentId, title, message) {
  // 1. Create parent document if it doesn't exist
  const notifDocRef = doc(db, "notifications", studentId);
  await setDoc(notifDocRef, { createdAt: serverTimestamp() }, { merge: true });

  // 2. Add notification to subcollection
  const userNotifRef = doc(collection(db, "notifications", studentId, "userNotifications"));
  await setDoc(userNotifRef, {
    title,
    message,
    createdAt: serverTimestamp(),
  });
}
