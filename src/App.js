import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import TeacherHome from "./pages/TeacherHome";
import StudentHome from "./pages/StudentHome";
import Chat from "./components/Chat";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Dashboards */}
        <Route path="/teacher" element={<TeacherHome />} />
        <Route path="/student" element={<StudentHome />} />

        {/* Chat with dynamic UID */}
        <Route path="/chat/:otherUserUid" element={<Chat />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
