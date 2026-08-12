import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateRoom = () => {
  const navigate = useNavigate();

  const createRoom = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "https://daybook-j903.onrender.com/api/rooms",
        {
          name: "My Room",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Created room:", response.data);

      const roomId = response.data.room._id;

      navigate(`/room/${roomId}`);
    } catch (error) {
      console.error(
        "Create room error:",
        error.response?.data || error
      );
    }
  };

  return (
    <button
      onClick={createRoom}
      className="rounded-lg bg-blue-600 px-5 py-3 text-white"
    >
      Create Room
    </button>
  );
};

export default CreateRoom;