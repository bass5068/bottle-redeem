import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { IncomingForm } from "formidable";

export const config = {
  api: {
    bodyParser: false, // Disable Next.js default bodyParser
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to parse form data" });
    }

    const userId = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId;
    const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;

    let imagePath = null;
    if (files.image) {
      const file = files.image[0];
      const tempPath = file.filepath;
      const fileName = `${userId}-${file.originalFilename}`;
      const targetPath = path.join(
        process.cwd(),
        "public/images/profile",
        fileName
      );

      fs.renameSync(tempPath, targetPath);
      imagePath = `/images/profile/${fileName}`;
    }

    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          image: imagePath || undefined,
        },
      });

      res.status(200).json({ message: "Account updated successfully" });
    } catch (error) {
      console.error("Failed to update account:", error);
      res.status(500).json({ message: "Failed to update account" });
    }
  });
}
