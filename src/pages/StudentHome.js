import { useNavigate } from "react-router-dom";
import Assignments from "../components/Assignments";

export default function StudentHome() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: "20px" }}>
      <h2>Student Home</h2>
      <button onClick={() => navigate("/chat")}>Go to Chat</button>
      <Assignments />
    </div>
  );
}
