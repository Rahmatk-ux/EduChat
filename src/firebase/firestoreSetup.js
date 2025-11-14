// firestoreSetup.js
import { db } from "./firebaseConfig.js";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

// Create a user in Firestore after signup
export async function createUserInFirestore(user, name, role) {
  try {
    await setDoc(doc(db, "users", user.uid), {
      name,
      email: user.email,
      role,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding user:", error);
  }
}

// Always generate same chatId for same users
const generateChatId = (uid1, uid2) => {
  return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
};

// Upload assignment
export async function uploadAssignment(title, description, fileUrl, uploadedByUid) {
  try {
    const userSnap = await getDoc(doc(db, "users", uploadedByUid));
    const uploadedByName = userSnap.exists() ? userSnap.data().name : "Unknown";

    await addDoc(collection(db, "assignments"), {
      title,
      description,
      fileUrl,
      uploadedBy: uploadedByName,
      uploadedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error uploading assignment:", error);
  }
}

// Create or get chat
export async function getOrCreateChat(uid1, uid2) {
  console.log("getOrCreateChat called with:", uid1, uid2);
  if (!uid1 || !uid2) {
    console.error("Missing UID!");
    throw new Error("Both user IDs are required.");
  }

  const chatId = generateChatId(uid1, uid2);
  const chatRef = doc(db, "chats", chatId);

  try {
    const chatSnap = await getDoc(chatRef);

    if (!chatSnap.exists()) {
      console.log("Chat does not exist, creating...");
      await setDoc(chatRef, {
        participants: [uid1, uid2],
        createdAt: serverTimestamp(),
      });
      console.log("Chat created successfully:", chatId);
    } else {
      console.log("Chat already exists:", chatId);
    }
  } catch (err) {
    console.error("Error in getOrCreateChat:", err);
    throw err; // rethrow so caller knows
  }

  return chatId;
}

