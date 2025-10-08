import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      const docSnap = await getDoc(doc(db, "users", uid));
      if (docSnap.exists()) {
        const role = docSnap.data().role;
        navigate(role === "teacher" ? "/teacher" : "/student");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Login</h2>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <br />
      <input placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
      <br />
      <button onClick={handleLogin}>Login</button>
      <p>
        Don't have an account? <span style={{color:"blue", cursor:"pointer"}} onClick={() => navigate("/")}>Signup</span>
      </p>
    </div>
  );
}
