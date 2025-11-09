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
  const [error, setError] = useState("");

  

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      const docSnap = await getDoc(doc(db, "users", uid));
      if (docSnap.exists()) {
        const role = docSnap.data().role;
        navigate(role === "teacher" ? "/teacher" : "/student");
      }
    } catch (error) {
      console.error("Firebase Login Error:", error.code, error.message);
      setError("Invalid credentials or user not found",error.code, error.message);
    }
  };

  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md p-8 text-white">
        <h2 className="text-3xl font-bold text-center mb-6">EduChat Login</h2>

        {error && (
          <p className="text-red-300 text-center mb-4 bg-white/10 p-2 rounded-lg border border-red-400/30">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/20 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/20 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            required
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 transition-all p-3 rounded-lg font-semibold"
          >
            Login
          </button>

          <p className="text-center mt-4">
            Don’t have an account?{" "}
            <span
              className="text-yellow-300 cursor-pointer hover:underline"
              onClick={() => navigate("/")}
            >
              Sign Up
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
