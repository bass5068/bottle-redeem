"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function AccountForm() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (session?.user.id) {
      fetch(`/api/routers/account?userId=${session.user.id}`)
        .then((res) => res.json())
        .then((data) => {
          setName(data.name );
          setImage(data.image);
        })
        .catch((error) =>
          console.error("Failed to fetch account data:", error)
        );
    }
  }, [session,]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/routers/account`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session?.user.id,
          name,
          image,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update account");
      }

      alert("Account updated successfully!");
    } catch (error) {
      console.error("Error updating account:", error);
      alert("Failed to update account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto p-6 bg-white shadow rounded-lg"
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-green-600">
        Account Settings
      </h1>

      <div className="mb-6 flex justify-center">
        <Image
          src={image}
          alt="Profile Preview"
          className="w-32 h-32 rounded-full object-cover border-4 border-green-500 shadow-lg"
          width={128}
          height={128}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={name}
          className="w-full border border-gray-300 px-3 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Profile Picture URL
        </label>
        <input
          type="text"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full border border-gray-300 px-3 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          ใช้ URL ของรูปจาก Google (หรือเว็บอื่น ๆ)
        </p>
      </div> */}

      <button
        type="submit"
        className="w-full bg-green-500 text-white font-bold py-2 rounded-lg shadow-md hover:bg-green-600 transition duration-300 ease-in-out"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
