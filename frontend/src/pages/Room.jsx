import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import AddMember from "../components/AddMember";

const API = "https://daybook-j903.onrender.com/api";

const Room = () => {
  const { roomId } = useParams();
  console.log("roomid",roomId);

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
        setLoading(true);

        const response = await axios.get(
          `${API}/rooms/${roomId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Room:", response.data);

        setRoom(response.data.room);
      } catch (error) {
        console.error(error);

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
    return (
      <div className="p-6">
        Loading room...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        {error}
      </div>
    );
  }

  if (!room) {
    return (
      <div className="p-6">
        Room not found
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6">

      {/* HEADER */}

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold">
            {room.name}
          </h1>

          <p className="text-gray-500">
            Shared Expense Room
          </p>
        </div>

        {/* ONLY ADMIN */}

        {isAdmin && (
          <AddMember
            roomId={room._id}
            onMemberAdded={(updatedRoom) => {
              setRoom(updatedRoom);
            }}
          />
        )}

      </div>

      {/* MEMBERS */}

      <div className="rounded-xl border bg-white p-6 shadow-sm">

        <h2 className="mb-5 text-xl font-semibold">
          Members
        </h2>

        {/* ADMIN */}

        <div className="mb-3 flex items-center justify-between rounded-lg bg-gray-50 p-4">

          <div>
            <p className="font-semibold">
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

        {/* MEMBERS */}

        {room.members.map((member) => (
          <div
            key={member._id}
            className="mb-3 flex items-center justify-between rounded-lg border p-4"
          >

            <div>
              <p className="font-semibold">
                {member.username}
              </p>

              <p className="text-sm text-gray-500">
                {member.email}
              </p>
            </div>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
              Member
            </span>

          </div>
        ))}

        {room.members.length === 0 && (
          <p className="py-5 text-center text-gray-500">
            No members yet. Add members above.
          </p>
        )}

      </div>

    </div>
  );
};

export default Room;