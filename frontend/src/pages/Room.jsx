import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import AddMember from "./AddMember";

const API = "https://daybook-j903.onrender.com/api";

const Room = () => {
  const { roomId } = useParams();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const isAdmin = currentUser.role === "admin";

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await axios.get(
          `${API}/rooms/${roomId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("ROOM:", response.data);

        setRoom(response.data.room);
      } catch (error) {
        console.error(
          "ROOM ERROR:",
          error.response?.data || error
        );

        setError(
          error.response?.data?.message ||
            "Unable to load room"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  if (loading) {
    return <div className="p-6">Loading room...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        {error}
      </div>
    );
  }

  if (!room) {
    return <div className="p-6">Room not found</div>;
  }

  return (
    <div className="mx-auto max-w-4xl p-6">

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {room.name}
          </h1>

          <p className="text-gray-500">
            Room Members
          </p>
        </div>

        {isAdmin && (
          <AddMember
            roomId={room._id}
            onMemberAdded={(updatedRoom) => {
              setRoom(updatedRoom);
            }}
          />
        )}
      </div>

      <div className="rounded-xl border bg-white p-5 shadow">

        <h2 className="mb-4 text-lg font-semibold">
          Members
        </h2>

        <div className="mb-3 flex justify-between rounded-lg bg-gray-50 p-4">
          <div>
            <p className="font-medium">
              {room.admin.username}
            </p>

            <p className="text-sm text-gray-500">
              {room.admin.email}
            </p>
          </div>

          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
            Admin
          </span>
        </div>

        {room.members.map((member) => (
          <div
            key={member._id}
            className="mb-3 flex justify-between rounded-lg border p-4"
          >
            <div>
              <p className="font-medium">
                {member.username}
              </p>

              <p className="text-sm text-gray-500">
                {member.email}
              </p>
            </div>

            <span className="text-sm text-gray-500">
              Member
            </span>
          </div>
        ))}

      </div>
    </div>
  );
};

export default Room;