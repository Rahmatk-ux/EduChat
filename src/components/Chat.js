// Chat.js
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
  const { otherUserUid } = useParams();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [chatId, setChatId] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  //temp
  


  // Initialize chat
  useEffect(() => {
    async function initChat() {
      console.log("Initializing chat...");
      console.log("Current user:", auth.currentUser);
      console.log("Other user:", otherUserUid);
      if (!auth.currentUser || !otherUserUid) return;

      try {
        // Ensure both users actually exist
        const user1 = await getDoc(doc(db, "users", auth.currentUser.uid));
        const user2 = await getDoc(doc(db, "users", otherUserUid));
        //console.log(auth.currentUser.uid);
      
        
        //console.log(otherUserUid);

        if (!user1.exists() || !user2.exists()) {
          console.error("User not found in Firestore");
          setLoading(false);
          return;
        }

        // Create or get chat
        const id = await getOrCreateChat(auth.currentUser.uid, otherUserUid);
        setChatId(id);
        console.log(id);
        //console.log(chatId);
        setLoading(false);

      } catch (err) {
        console.error("Error initializing chat:", err);
        setLoading(false);
      }
    }
    initChat();
  }, [otherUserUid]);

  // Listen to messages
  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return unsubscribe;
  }, [chatId]);

  // Send message
  const sendMessage = async () => {
    console.log("Sending message:", message);
    console.log("Chat ID:", chatId);
    console.log("Current user UID:", auth.currentUser?.uid);
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
