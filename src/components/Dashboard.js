import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import ChatList from "./ChatList";
import Chat from "./Chat";
import UserSearch from "./UserSearch";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export default function Dashboard() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [mobileView, setMobileView] = useState("chatlist"); // 'chatlist', 'chat'
  const { currentUser, logout } = useAuth();

  const handleSelectChat = (chat) => {
    // Normalize structure
    const normalizedChat = {
      id: chat.id,
      otherUser: chat.otherUser || chat.user, // from ChatList or existing chat
    };
    setSelectedChat(normalizedChat);
    setMobileView("chat");
  };

  const handleSelectUser = async (user) => {
    if (!user || !currentUser?.uid) {
      console.error("User or currentUser is undefined.");
      return;
    }

    // Check if a chat already exists with this user
    const chatsRef = collection(db, "chats");
    // const q = query(
    //   chatsRef,
    //   where('participants', 'array-contains', currentUser.uid)
    // );
    const chatKey = [currentUser.uid, user.id].sort().join("_");

    const q = query(chatsRef, where("chatKey", "==", chatKey));

    const querySnapshot = await getDocs(q);
    let existingChat = null;

    querySnapshot.forEach((doc) => {
      const chatData = doc.data();
      if (chatData.participants.includes(user.id)) {
        existingChat = {
          id: doc.id,
          otherUser: user,
        };
      }
    });

    if (existingChat) {
      // If chat exists, select it
      setSelectedChat(existingChat);
    } else {
      // Create a new chat
      const newChatRef = await addDoc(chatsRef, {
        participants: [currentUser.uid, user.id],
        createdAt: serverTimestamp(),
        lastMessageTime: serverTimestamp(),
      });

      setSelectedChat({
        id: newChatRef.id,
        otherUser: user,
      });
    }

    setShowUserSearch(false);
    setMobileView("chat");
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const handleBack = () => {
    setMobileView("chatlist");
  };

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white p-4 shadow">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Firebase Chat</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden md:inline">
              {currentUser.email}
            </span>
            <button
              onClick={() => setShowUserSearch(!showUserSearch)}
              className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
            >
              New Chat
            </button>
            <button
              onClick={handleLogout}
              className="rounded bg-gray-200 px-3 py-1 text-sm text-gray-800 hover:bg-gray-300"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto flex flex-1 overflow-hidden p-4 h-[calc(100vh-64px)]">
        {/* <div className="flex flex-1 overflow-hidden rounded-lg shadow"> */}
        {/* Mobile Navigation */}
        <div
          className={`w-full md:w-1/3 ${
            mobileView === "chatlist" ? "block" : "hidden md:block"
          }`}
        >
          {showUserSearch ? (
              <UserSearch onSelectUser={handleSelectUser} />
            ) : (
              <ChatList
                onSelectChat={handleSelectChat}
                selectedChatId={selectedChat?.id}
              />
            )}
          {/* <ChatList
            onSelectChat={handleSelectChat}
            selectedChatId={selectedChat?.id}
          /> */}
        </div>

        {/* Chat Area */}
        <div
          className={`w-full md:w-2/3 md:border-l ${
            mobileView === "chat" ? "block" : "hidden md:block"
          }`}
        >
          <Chat
            chatId={selectedChat?.id}
            otherUser={selectedChat?.otherUser}
            onBack={handleBack}
          />
        </div>
        {/* </div> */}
      </div>
    </div>
  );
}
