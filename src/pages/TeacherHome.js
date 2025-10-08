import { useNavigate } from "react-router-dom";
import Assignments from "../components/Assignments";
import UploadAssignment from "../components/UploadAssignment";

export default function TeacherHome() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: "20px" }}>
      <h2>Teacher Home</h2>
      <button onClick={() => navigate("/chat")}>Go to Chat</button>
      <UploadAssignment />
      <Assignments />
    </div>
  );
}
