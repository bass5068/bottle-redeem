"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function AccountForm() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(false);

  // Placeholder: ใช้ข้อมูลเดิมจาก Session ก่อนเปลี่ยน
  const placeholderName = session?.user?.name || "Your Name";
  const placeholderImage =
    session?.user?.image || "/default-profile.png"; // รูป default-profile.png ใส่ไว้ใน public folder

  // ดึงข้อมูลจาก Database เพื่อมาเติมใน Form
  useEffect(() => {
    if (session?.user.id) {
      fetch(`/api/account?userId=${session.user.id}`)
        .then((res) => res.json())
        .then((data) => {
          setName(data.name || placeholderName);
          setImage(data.image || placeholderImage);
          setPreviewImage(data.image || placeholderImage); // ใช้ preview จาก database หรือ placeholder
        })
        .catch((error) =>
          console.error("Failed to fetch account data:", error)
        );
    }
  }, [session, placeholderImage, placeholderName]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // แสดง Preview รูปภาพ
      setPreviewImage(URL.createObjectURL(file));
      uploadImage(file);
    }
  };

  const uploadImage = async (file: File) => {
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload/profile", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      setImage(data.filePath); // เก็บ Path ของรูปที่อัพโหลดได้
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image.");
    } finally {
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
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto p-6 bg-white shadow rounded-lg"
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-green-600">
        Account Settings
      </h1>

      <div className="mb-6 flex justify-center">
        <Image
          src={previewImage || placeholderImage}
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
          placeholder={placeholderName}
          className="w-full border border-gray-300 px-3 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Profile Picture
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full text-gray-600 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

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
