import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

export default function ChatList({ onSelectChat, selectedChatId }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    let unsubscribe;

    (async () => {
      const q = query(
        collection(db, "chats"),
        where("participants", "array-contains", currentUser.uid),
        orderBy("lastMessageTime", "desc")
      );

      unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const chatsList = await Promise.all(
          querySnapshot.docs.map(async (chatDoc) => {
            const chatData = chatDoc.data();
            const otherUserId = chatData.participants.find(
              (id) => id !== currentUser.uid
            );

            if (otherUserId) {
              const userDoc = await getDoc(doc(db, "users", otherUserId));
              if (userDoc.exists()) {
                const userData = userDoc.data();

                return {
                  id: chatDoc.id,
                  otherUser: {
                    id: otherUserId,
                    displayName: userData.displayName || userData.email,
                    email: userData.email,
                    lastSeen: userData.lastSeen,
                  },
                  lastMessage: chatData.lastMessage,
                  lastMessageTime: chatData.lastMessageTime,
                };
              }
            }

            return null;
          })
        );

        setChats(chatsList.filter(Boolean)); // remove nulls
        setLoading(false);
      });
    })();

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [currentUser.uid]);

  // Format the last message time
  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return "";

    const messageDate = timestamp.toDate();
    const now = new Date();

    // Today, show time
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // Within a week, show day name
    const withinWeek = (now - messageDate) / (1000 * 60 * 60 * 24) < 7;
    if (withinWeek) {
      return messageDate.toLocaleDateString([], { weekday: "short" });
    }

    // Older, show date
    return messageDate.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
      </div>

      <div className="overflow-y-auto" style={{ height: "calc(100% - 60px)" }}>
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            Loading conversations...
          </div>
        ) : chats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No conversations yet
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {chats.map((chat) => (
              <li
                key={chat.id}
                className={`p-3 hover:bg-gray-50 cursor-pointer ${
                  selectedChatId === chat.id ? "bg-blue-50" : ""
                }`}
                onClick={() => onSelectChat(chat)}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-lg font-medium text-white">
                      {chat.otherUser.displayName[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {chat.otherUser.displayName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatLastMessageTime(chat.lastMessageTime)}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {chat.lastMessage || "No messages yet"}
                    </p>
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
