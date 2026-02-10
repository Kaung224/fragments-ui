import { useEffect, useState } from "react";
import { signIn, getUser, signOut } from "../auth";
import { getUserFragments } from "../api";

export default function Home() {
  const [user, setUser] = useState(null);
  const [content, setContent] = useState("");
  const [type, setType] = useState("text/plain");
  const [fragments, setFragments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedFragment, setExpandedFragment] = useState(null);

  async function fetchFragments() {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getUserFragments(user);
      if (data?.fragments) {
        setFragments(data.fragments);
      }
    } catch (error) {
      console.error("Error fetching fragments:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateFragment() {
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    if (!content.trim()) {
      console.error("Content cannot be empty");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/fragments`,
        {
          method: "POST",
          headers: {
            "Content-Type": type,
            Authorization: `Bearer ${user.idToken}`,
          },
          body: content,
        },
      );
      if (!response.ok) {
        throw new Error(
          `Failed to create fragment: ${response.status} ${response.statusText}`,
        );
      }
      const data = await response.json();
      console.log("Fragment created:", data);
      // Clear the content after successful creation
      setContent("");
      // Refresh the fragments list
      fetchFragments();
    } catch (error) {
      console.error("Error creating fragment:", error);
    }
  }

  async function handleDeleteFragment(fragmentId) {
    if (!user) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/fragments/${fragmentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user.idToken}`,
          },
        },
      );
      if (!response.ok) {
        throw new Error(`Failed to delete fragment: ${response.status}`);
      }
      console.log("Fragment deleted:", fragmentId);
      // Refresh the fragments list
      fetchFragments();
    } catch (error) {
      console.error("Error deleting fragment:", error);
    }
  }

  useEffect(() => {
    async function init() {
      const currentUser = await getUser();
      if (currentUser) {
        setUser(currentUser);
        // Fetch fragments for the user
        try {
          const data = await getUserFragments(currentUser);
          if (data?.fragments) {
            setFragments(data.fragments);
          }
        } catch (error) {
          console.error("Error loading fragments:", error);
        }
      }
    }
    init();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 pt-10">
      <div className="bg-white border px-6 py-4 max-w-4xl mx-auto rounded">
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
          <>
            <p className="text-gray-700 mb-6">
              Welcome,
              <span className="ml-1 font-medium text-blue-600">
                {user.username}
              </span>
            </p>
            <button
              onClick={async () => {
                await signOut();
                setUser(null);
                setFragments([]);
              }}
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
            >
              Log Out
            </button>

            <div className="mb-8 p-4 border rounded bg-gray-50 text-gray-700 mt-6">
              <h2 className="text-lg font-semibold mb-4">Create Fragment</h2>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter fragment content..."
                className="w-full border rounded p-2 mb-3"
                rows={4}
              />

              <div className="flex gap-4">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="border rounded p-2 flex-1"
                >
                  <option value="text/plain">text/plain</option>
                  <option value="text/markdown">text/markdown</option>
                  <option value="application/json">application/json</option>
                </select>

                <button
                  onClick={handleCreateFragment}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
                >
                  Create Fragment
                </button>
              </div>
            </div>

            <div className="p-4 border rounded bg-gray-50 text-gray-700">
              <h2 className="text-lg font-semibold mb-4 ">
                Your Fragments ({fragments.length})
              </h2>

              {loading && <p className="text-gray-600">Loading fragments...</p>}

              {!loading && fragments.length === 0 && (
                <p className="text-gray-600">
                  No fragments yet. Create one above!
                </p>
              )}

              {!loading && fragments.length > 0 && (
                <div className="space-y-2">
                  {fragments.map((fragment) => (
                    <div
                      key={fragment.id || fragment}
                      className="bg-white border rounded p-4"
                    >
                      <div
                        className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
                        onClick={() => toggleExpandFragment(fragment)}
                      >
                        <div className="flex-1">
                          <p className="font-mono text-sm text-gray-700">
                            ID: {fragment.id || fragment}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFragment(fragment.id || fragment);
                          }}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
