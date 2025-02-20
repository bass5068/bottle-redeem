import path from "path";
import formidable from "formidable";
import { NextApiRequest, NextApiResponse } from "next";

// ปิดการ Parse Request Body โดย Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const form = formidable({
    uploadDir: path.join(process.cwd(), "public/uploads/profiles"),
    keepExtensions: true,
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error("Error uploading profile image:", err);
      return res.status(500).json({ message: "Error uploading file" });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) {
      console.error("No file uploaded");
      return res.status(400).json({ message: "No file uploaded" });
    }
    const fileName = path.basename(file.filepath);
    const filePath = `/uploads/profiles/${fileName}`;
    return res.status(200).json({ filePath });
  });
}
