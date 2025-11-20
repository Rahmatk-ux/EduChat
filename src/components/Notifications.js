// src/components/Notifications.js
import { useEffect } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Notifications({ userId, role }) {
  useEffect(() => {
    if (!userId) return;

    // Listen to "notifications" collection for this user
    const notifCol = collection(db, "notifications", userId, "userNotifications");
    const q = query(notifCol, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          toast.info(`${data.title}: ${data.message}`, {
            position: "top-right",
            autoClose: 5000,
            pauseOnHover: true,
            draggable: true,
          });
        }
      });
    });

    return () => unsub();
  }, [userId]);

  return <ToastContainer />;
}
