import { useState, useEffect } from "react";
import { db, auth } from "../firebase/firebaseConfig";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const chatId = "default_chat"; // Can be dynamic for multiple chats

  useEffect(() => {
    const q = query(collection(db, "chats", chatId, "messages"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) return;
    await addDoc(collection(db, "chats", chatId, "messages"), {
      text: message,
      senderId: auth.currentUser.uid,
      timestamp: new Date(),
    });
    setMessage("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Chat</h2>
      <div style={{ height: "300px", overflowY: "scroll", border: "1px solid gray", padding: "5px" }}>
        {messages.map((msg) => (
          <p key={msg.id} style={{ color: msg.senderId === auth.currentUser.uid ? "blue" : "green" }}>
            {msg.text}
          </p>
        ))}
      </div>
      <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message" />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
