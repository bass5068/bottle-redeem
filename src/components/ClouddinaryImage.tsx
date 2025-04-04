// components/CloudinaryImage.tsx
import React from 'react';
import Image from 'next/image';

interface CloudinaryImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  quality?: number;
  priority?: boolean;
}

const CloudinaryImage: React.FC<CloudinaryImageProps> = ({
  src,
  alt,
  width = 200,
  height = 200,
  className = '',
  quality = 80,
  priority = false,
}) => {
  // ตรวจสอบว่าเป็น URL ของ Cloudinary หรือไม่
  const isCloudinaryUrl = src?.includes('cloudinary.com');
  
  if (!src) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`} 
        style={{ width, height }}>
        <svg 
          className="text-gray-400" 
          width={width > 40 ? 40 : width} 
          height={height > 40 ? 40 : height}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
    );
  }

  // สำหรับ URL ของ Cloudinary ให้ปรับแต่ง URL ตามความต้องการ
  if (isCloudinaryUrl) {
    // แยก URL เพื่อแทรก transformations
    const parts = src.split('/upload/');
    const baseUrl = parts[0];
    const imagePath = parts[1];
    
    // สร้าง transformation string สำหรับ Cloudinary
    // c_fill = crop mode fill
    // w_ = width
    // h_ = height
    // q_ = quality
    const transformations = `c_fill,w_${width},h_${height},q_${quality}`;
    
    // สร้าง URL ใหม่
    const optimizedSrc = `${baseUrl}/upload/${transformations}/${imagePath}`;
    
    return (
      <Image
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority={priority}
      />
    );
  }
  
  // สำหรับรูปภาพที่ไม่ได้อยู่บน Cloudinary
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
};

export default CloudinaryImage;