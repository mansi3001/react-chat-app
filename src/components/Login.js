import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, signup } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
    } catch (error) {
      setError(error.message);
    }

    setLoading(false);
  }

  //   function convertDateFormat(isoDateString) {
  //     // Parse the ISO date string
  //     const date = new Date(isoDateString);

  //     // Convert to the specified format
  //     return date.toString();
  //   }
  //   const isoDate = "2025-04-12T10:27:14+0000";
  //   const formattedDate = convertDateFormat(isoDate);
  //   console.log({ formattedDate });

  /* (() => {
    // Parse the ISO date string
    const date = new Date("2025-04-12T10:27:14+0000");

    // Convert to the specified format
    console.log(date.toString());
    return date.toString();
  })() */

  // TIME AGO LOGIC
  (() => {
    let timestamp = "2025-04-11T17:39:41+0000";
    if (!timestamp) return "";

    const messageDate = new Date(timestamp);
    const now = new Date();

    // Calculate time difference in seconds
    const diffInSeconds = Math.floor((now - messageDate) / 1000);
    console.table({ timestamp, messageDate, now, diffInSeconds });

    console.log("diffInSeconds < 60", diffInSeconds < 60);
    console.log("diffInSeconds < 3600", diffInSeconds < 3600);
    console.log("diffInSeconds < 86400", diffInSeconds < 86400);
    console.log("diffInSeconds < 604800", diffInSeconds < 604800);
    // Just now: less than 1 minute ago
    if (diffInSeconds < 60) {
      const response = "just now";
      console.log(response);
      return response;
    }

    // Minutes ago: less than 1 hour ago
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      console.log("minutes", minutes);
      const response = `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
      console.log(response);
      return response;
    }

    // Hours ago: less than 24 hours ago
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      console.log("hours", hours);
      const response = `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
      console.log(response);
      return response;
    }

    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      const response = `Yesterday at ${messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
      console.log(response);
      return response;
    }

    // Within the last week: show day of week
    if (diffInSeconds < 604800) {
      const response =
        messageDate.toLocaleDateString([], { weekday: "long" }) +
        ` at ${messageDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      console.log(response);
      return response;
    }

    // Older than a week: show full date
    const response =
      messageDate.toLocaleDateString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
      }) +
      ` at ${messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    console.log(response);
    return response;
  })();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          {isSignUp ? "Sign Up" : "Sign In"}
        </h2>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div> */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-9 text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.03-10-9s4.477-9 10-9c1.033 0 2.025.162 2.953.46M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 01-6 0m6 0a3 3 0 00-6 0m6 0a3 3 0 01-6 0m13.364-4.636a9 9 0 00-12.728 0M3 3l18 18"
                  />
                </svg>
              )}
            </button>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full rounded-md bg-blue-600 py-2 px-4 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <span className="text-gray-600">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
          </span>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="ml-1 text-blue-600 hover:text-blue-800"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
