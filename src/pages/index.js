import { useEffect, useState } from "react";
import { signIn, getUser } from "../auth";
import { getUserFragments } from "../api";
import { set } from "mongoose";

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function init() {
      const currentUser = await getUser();
      if (currentUser) {
        setUser(currentUser);
        const userFragments = await getUserFragments(currentUser);
      }
    }
    init();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 pt-10">
      <div className="bg-white border px-6 py-4 max-w-3xl mx-auto rounded">
        <h1 className="text-xl font-semibold text-gray-800 mb-3">
          Fragments UI
        </h1>

        {!user && (
          <button
            onClick={signIn}
            className="bg-blue-600 text-white px-4 py-2 rounded
                     hover:bg-blue-700 transition"
          >
            Login
          </button>
        )}

        {user && (
          <p className="text-gray-700">
            Welcome,
            <span className="ml-1 font-medium text-blue-600">
              {user.username}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
