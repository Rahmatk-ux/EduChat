import { db } from "./firebaseConfig.js";
import { doc, setDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";

// ✅ Create user in Firestore after signup
export async function createUserInFirestore(user, name, role) {
  try {
    await setDoc(doc(db, "users", user.uid), {
      name: name,
      email: user.email,
      role: role,
      createdAt: serverTimestamp()
    });
    console.log("User added to Firestore successfully");
  } catch (error) {
    console.error("Error adding user to Firestore:", error);
  }
}

// ✅ Upload assignment (for teachers)
export async function uploadAssignment(title, description, fileUrl, uploadedByUid) {
  try {
    // Optionally get teacher name from users collection
    const uploadedByDoc = doc(db, "users", uploadedByUid);
    const uploadedBySnapshot = await uploadedByDoc.get();
    const uploadedByName = uploadedBySnapshot.exists ? uploadedBySnapshot.data().name : "Unknown";

    await addDoc(collection(db, "assignments"), {
      title: title,
      description: description || "",
      fileUrl: fileUrl,
      uploadedBy: uploadedByName,
      uploadedAt: serverTimestamp()
    });

    console.log("Assignment uploaded successfully");
  } catch (error) {
    console.error("Error uploading assignment:", error);
  }
}

// ✅ Optional: fetch assignments (real-time handled in components)
export async function fetchAssignments(callback) {
  const assignmentsRef = collection(db, "assignments");
  // Components can use onSnapshot for real-time updates
}
