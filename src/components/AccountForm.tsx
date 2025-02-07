"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function AccountForm() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user.id) {
      fetch(`/api/account?userId=${session.user.id}`)
        .then((res) => res.json())
        .then((data) => {
          setName(data.name);
          setImage(data.image);
        })
        .catch((error) => console.error("Failed to fetch account data:", error));
    }
  }, [session]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const formData = new FormData();
    formData.append("image", e.target.files[0]);

    try {
      setLoading(true);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setImage(data.imageUrl);
      setLoading(false);
    } catch (error) {
      console.error("Upload failed", error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/account`, {
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
    <form onSubmit={handleSubmit} className="p-4 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Account Settings</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Profile Picture</label>
        <input type="file" accept="image/*" onChange={handleUpload} />
        {loading && <p className="text-sm text-gray-500">Uploading...</p>}
        {image && (
          <div>
            <img src={image} alt="Profile Preview" className="w-24 h-24 rounded-full" />
          </div>
        )}
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
