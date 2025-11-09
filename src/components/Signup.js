import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { createUserInFirestore } from "../firebase/firestoreSetup";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await createUserInFirestore(userCredential.user, name, role);
      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md p-8 text-white">
        <h2 className="text-3xl font-bold text-center mb-6">EduChat Signup</h2>

        <div className="space-y-4">
          <input
            className="w-full p-3 rounded-lg bg-white/20 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="w-full p-3 rounded-lg bg-white/20 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full p-3 rounded-lg bg-white/20 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <select
            className="w-full p-3 rounded-lg bg-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="student" className="text-black">Student</option>
            <option value="teacher" className="text-black">Teacher</option>
          </select>

          <button
            onClick={handleSignup}
            className="w-full bg-indigo-600 hover:bg-indigo-700 transition-all p-3 rounded-lg font-semibold"
          >
            Sign Up
          </button>

          <p className="text-center mt-4">
            Already have an account?{" "}
            <span
              className="text-yellow-300 cursor-pointer hover:underline"
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
