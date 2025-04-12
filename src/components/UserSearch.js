import React, { useState, useEffect } from "react";
import { collection, query, getDocs, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

export default function UserSearch({ onSelectUser }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  // Load all users on component mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const usersCollection = collection(db, "users");
        const q = query(usersCollection);
        const querySnapshot = await getDocs(q);

        const usersList = [];
        // querySnapshot.forEach((doc) => {
        //   if (doc.id !== currentUser.uid) {
        //     usersList.push({
        //       id: doc.id,
        //       ...doc.data(),
        //     });
        //   }
        // });
        querySnapshot.forEach((doc) => {
            if (doc.id !== currentUser.uid) {
              const userData = doc.data();
              console.log('Fetched User:', userData);
              usersList.push({
                id: doc.id,
                ...userData,
              });
            }
          });
        console.log({usersList});
        setUsers(usersList);
        setFilteredUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
      setLoading(false);
    })();
  }, [currentUser.uid]);

  // Filter users based on search term
  useEffect(() => {
    console.log({ searchTerm });
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.displayName &&
            user.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // Format the last seen timestamp
  const formatLastSeen = (timestamp) => {
    if (!timestamp) return "Never";

    const lastSeenDate = timestamp.toDate();
    const now = new Date();

    // Calculate time difference in seconds
    const diffInSeconds = Math.floor((now - lastSeenDate) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return lastSeenDate.toLocaleDateString([], { weekday: "short" });

    return lastSeenDate.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  };
console.log({filteredUsers});
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No users found</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <li
                key={user.id}
                className="p-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectUser(user)}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-lg font-medium text-white">
                      {user.displayName
                        ? user.displayName
                        : user.email}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.displayName || user.email}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {user.lastSeen
                      ? formatLastSeen(user.lastSeen)
                      : "Never seen"}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
