import { db } from "./firebaseConfig.js";
import { doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth } from "./firebaseConfig.js"; // import auth to use current user

// Create a user in Firestore after signup
export async function createUserInFirestore(user, name, role) {
  try {
    await setDoc(doc(db, "users", user.uid), {
      name,
      email: user.email,
      role,
      createdAt: serverTimestamp(),
    });
    console.log("User added to Firestore successfully");
  } catch (error) {
    console.error("Error adding user to Firestore:", error);
  }
}

// Upload assignment (for teachers)
export async function uploadAssignment(title, description, fileUrl, uploadedByUid) {
  try {
    const uploadedByDoc = doc(db, "users", uploadedByUid);
    const uploadedBySnapshot = await getDoc(uploadedByDoc);
    const uploadedByName = uploadedBySnapshot.exists()
      ? uploadedBySnapshot.data().name
      : "Unknown";

    await addDoc(collection(db, "assignments"), {
      title,
      description: description || "",
      fileUrl,
      uploadedBy: uploadedByName,
      uploadedAt: serverTimestamp(),
    });

    console.log("Assignment uploaded successfully");
  } catch (error) {
    console.error("Error uploading assignment:", error);
  }
}

// Get or create chat between student and teacher
export async function getOrCreateChat(studentUid, teacherUid) {
  if (!studentUid || !teacherUid) throw new Error("Both studentUid and teacherUid are required");

  // Consistent chatId ordering
  const chatId = studentUid < teacherUid ? `${studentUid}_${teacherUid}` : `${teacherUid}_${studentUid}`;
  const chatRef = doc(db, "chats", chatId);

  try {
    const chatSnap = await getDoc(chatRef);

    if (!chatSnap.exists()) {
      // Ensure auth.currentUser.uid is in participants to satisfy rules
      const currentUid = auth.currentUser.uid;
      const participants =
        currentUid === studentUid || currentUid === teacherUid
          ? [currentUid, currentUid === studentUid ? teacherUid : studentUid]
          : [studentUid, teacherUid];

      await setDoc(chatRef, {
        participants,
        createdAt: serverTimestamp(),
      });
      console.log("Chat created:", chatId);
    }

    return chatId;
  } catch (error) {
    console.error("Error creating/fetching chat:", error);
    throw error;
  }
}

// Optional: fetch assignments (for components using real-time updates)
export async function fetchAssignments(callback) {
  const assignmentsRef = collection(db, "assignments");
  // Real-time updates can be implemented using onSnapshot in components
}
