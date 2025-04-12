import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

export default function Chat({ chatId, otherUser, onBack }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const { currentUser, logout } = useAuth();
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /* function convertDateFormat(isoDateString) {
    // Parse the ISO date string
    const date = new Date(isoDateString);

    // Convert to the specified format
    return date.toString();
  }

  const isoDate = "2025-04-12T10:27:14+0000";
  const formattedDate = convertDateFormat(isoDate);
  console.log({ formattedDate }); */

  // Format timestamp in a WhatsApp-like style
  const formatMessageTime = (timestamp) => {
    console.log({ timestamp });
    if (!timestamp) return "";

    const messageDate = timestamp.toDate();
    console.log({ messageDate });
    const now = new Date();

    // Calculate time difference in seconds
    const diffInSeconds = Math.floor((now - messageDate) / 1000);

    // Just now: less than 1 minute ago
    if (diffInSeconds < 60) {
      return "just now";
    }

    // Minutes ago: less than 1 hour ago
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    }

    // Hours ago: less than 24 hours ago
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }

    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    // Within the last week: show day of week
    if (diffInSeconds < 604800) {
      return (
        messageDate.toLocaleDateString([], { weekday: "long" }) +
        ` at ${messageDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`
      );
    }

    // Older than a week: show full date
    return (
      messageDate.toLocaleDateString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
      }) +
      ` at ${messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    );
  };

  // Load messages for the selected chat
  useEffect(() => {
    if (!chatId) return;

    setLoading(true);
    setMessages([]);

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesData = [];
      querySnapshot.forEach((doc) => {
        messagesData.push({ id: doc.id, ...doc.data() });
      });
      setMessages(messagesData);
      setLoading(false);
    });

    return unsubscribe;
  }, [chatId]);

  // Refresh timestamps periodically
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update relative timestamps
      setMessages((prevMessages) => [...prevMessages]);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  //   // Load messages
  //   useEffect(() => {
  //     const q = query(collection(db, "messages"), orderBy("createdAt"));
  //     const unsubscribe = onSnapshot(q, (querySnapshot) => {
  //       const messagesData = [];
  //       querySnapshot.forEach((doc) => {
  //         messagesData.push({ id: doc.id, ...doc.data() });
  //       });
  //       setMessages(messagesData);
  //     });

  //     return unsubscribe;
  //   }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (newMessage.trim() === "") return;

    try {
      // Add message to the chat subcollection
      const messageData = {
        text: newMessage,
        createdAt: serverTimestamp(),
        senderId: currentUser.uid,
        senderEmail: currentUser.email,
      };

      await addDoc(collection(db, "chats", chatId, "messages"), messageData);

      // Update chat document with last message and time
      await updateDoc(doc(db, "chats", chatId), {
        lastMessage: newMessage,
        lastMessageTime: serverTimestamp(),
      });

      setNewMessage("");
      //   const abc = await addDoc(collection(db, "messages"), {
      //     text: newMessage,
      //     createdAt: serverTimestamp(),
      //     uid: currentUser.uid,
      //     email: currentUser.email,
      //   });
      //   console.log({ abc });
      //   console.log("serverTimestamp()", serverTimestamp());
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  if (!chatId || !otherUser) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-100">
        <p className="text-gray-500">Select a conversation to start chatting</p>
      </div>
    );
  }
  console.log("Rendering chat", { chatId, otherUser });
  return (
    <div className="grid grid-rows-[auto_1fr_auto] h-full w-full">
      {/* Header */}
      <div className="bg-white shadow flex items-center px-4 py-2 border">
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
          <span className="text-lg font-medium text-white">
            {otherUser.displayName[0].toUpperCase()}
          </span>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            {otherUser.displayName}
          </h2>
          <p className="text-sm text-gray-500">{otherUser.email}</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="bg-white shadow overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">
              No messages yet. Start a conversation!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.senderId === currentUser.uid
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs rounded-lg px-4 py-2 ${
                    message.senderId === currentUser.uid
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  <div className="text-sm">{message.text}</div>
                  <div className="mt-1 text-xs opacity-75 text-right">
                    {formatMessageTime(message.createdAt)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Text Box for Sending Message */}
      <div className="bg-white shadow-md px-4 py-2 border-t border-gray-200 w-full items-center">
      <form
          onSubmit={handleSendMessage}
          className="items-center w-full space-x-2"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-grow rounded-full border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium shadow hover:bg-blue-700 transition-all duration-200"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
