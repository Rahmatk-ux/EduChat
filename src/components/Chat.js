// src/components/Chat.js
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { db, auth } from "../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { getOrCreateChat } from "../firebase/firestoreSetup";

export default function Chat() {
  const { otherUserUid } = useParams(); // Make sure the route passes this param
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [chatId, setChatId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Initialize chat
  useEffect(() => {
    async function initChat() {
      if (!auth.currentUser || !otherUserUid) return;

      try {
        const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
        const role = userSnap.exists() ? userSnap.data().role : null;
        setUserRole(role);

        if (!role) {
          console.error("User role not found!");
          setLoading(false);
          return;
        }

        const studentUid = role === "teacher" ? otherUserUid : auth.currentUser.uid;
        const teacherUid = role === "teacher" ? auth.currentUser.uid : otherUserUid;

        // ✅ Use consistent chat ID
        const id = await getOrCreateChat(studentUid, teacherUid);
        setChatId(id);
        setLoading(false);
      } catch (err) {
        console.error("Error initializing chat:", err);
        setLoading(false);
      }
    }
    initChat();
  }, [otherUserUid]);

  // Listen to messages in real-time
  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
      (error) => console.error("Error fetching messages:", error)
    );

    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async () => {
    if (!message.trim() || !chatId) return;

    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: message,
        senderId: auth.currentUser.uid,
        timestamp: serverTimestamp(),
      });
      setMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  if (loading) return <p className="text-white text-center mt-20">Loading chat...</p>;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center">
      <h2 className="text-2xl font-bold text-white mb-4">💬 Chat</h2>

      <div className="w-full max-w-2xl bg-white/20 backdrop-blur-lg rounded-xl p-4 h-[400px] overflow-y-auto mb-4">
        {messages.length === 0 && (
          <p className="text-white text-center mt-10">No messages yet.</p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 p-2 rounded-lg w-fit max-w-[70%] ${
              msg.senderId === auth.currentUser.uid
                ? "bg-indigo-600 ml-auto"
                : "bg-green-600 mr-auto"
            }`}
          >
            <p className="text-white break-words">{msg.text}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex w-full max-w-2xl gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-3 rounded-lg"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}
