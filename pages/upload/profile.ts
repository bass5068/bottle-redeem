import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";

// ปิด body parser เดิมของ Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");

  // สร้างโฟลเดอร์ uploads ถ้ายังไม่มี
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = new formidable.IncomingForm({ uploadDir, keepExtensions: true });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error("Formidable error:", err);
      return res.status(500).json({ message: "Failed to parse form data" });
    }

    const file = files.file?.[0] || files.file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filename = path.basename(Array.isArray(file) ? file[0].filepath : file.filepath);
    const filePath = `/uploads/profiles/${filename}`; // เส้นทางที่ frontend ใช้แสดงรูป

    return res.status(200).json({ filePath });
  });
}
