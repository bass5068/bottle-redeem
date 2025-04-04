// pages/api/upload-reward-image.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import formidable from 'formidable';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

// ป้องกันไม่ให้ Next.js แปลง formData เป็น JSON
export const config = {
  api: {
    bodyParser: false,
  },
};

// ตั้งค่า Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();

type ProcessedFiles = {
  fields: formidable.Fields;
  files: formidable.Files;
};

const parseForm = async (
  req: NextApiRequest
): Promise<ProcessedFiles> => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      maxFiles: 1,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    });

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
};

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { fields, files } = await parseForm(req);
    const rewardId = Array.isArray(fields.rewardId) ? fields.rewardId[0] : fields.rewardId;

    if (!rewardId) {
      return res.status(400).json({ message: 'Missing rewardId' });
    }

    // หา file ที่อัปโหลด
    const fileKey = Object.keys(files)[0];
    const fileData = files[fileKey]?.[0] || files[fileKey];

    if (!fileData) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // สร้างชื่อไฟล์สำหรับ Cloudinary
    const cloudinaryFilename = `reward-${rewardId}-${Date.now()}`;

    // อัปโหลดไปยัง Cloudinary
    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload(
        Array.isArray(fileData) ? fileData[0].filepath : fileData.filepath,
        {
          folder: 'rewards',
          public_id: cloudinaryFilename,
          overwrite: true,
          transformation: [
            { width: 800, crop: 'limit' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error('Upload result is undefined'));
        }
      );
    });

    // ลบไฟล์ชั่วคราวหลังจากอัปโหลดเสร็จ
    if (!Array.isArray(fileData) && fileData.filepath && fs.existsSync(fileData.filepath)) {
      fs.unlinkSync(fileData.filepath);
    }

    // URL ของรูปภาพจาก Cloudinary
    const imageUrl = uploadResult.secure_url;
    
    // อัปเดตฐานข้อมูล
    try {
      await prisma.reward.update({
        where: { id: rewardId },
        data: { image: imageUrl },
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return res.status(500).json({ message: 'Database error' });
    }

    return res.status(200).json({ 
      message: 'Image uploaded successfully',
      imageUrl 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}