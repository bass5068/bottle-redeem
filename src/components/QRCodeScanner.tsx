import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";

export default function QRCodeScannerWithPoints({
  onScanSuccess,
  userId
}: {
  onScanSuccess?: (decodedText: string) => void;
  userId: string;
}) {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [bottleDetails, setBottleDetails] = useState({ big: 0, small: 0, points: 0 });

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: 250,
    }, false);

    scanner.render(
      async (decodedText) => {
        // เก็บข้อมูลที่สแกนได้
        setScanResult(decodedText);
        console.log("QR Code scanned:", decodedText);
        
        try {
          // แยกข้อมูลจาก QR code
          // ตรวจสอบว่าเป็น URL หรือไม่ และดึงส่วน query params
          let queryText = decodedText;
          if (decodedText.includes("http") && decodedText.includes("?")) {
            queryText = decodedText.split("?")[1];
          }
          
          const params = new URLSearchParams(queryText);
          const PETbig = parseInt(params.get("PETbig") || "0");
          const PETsmall = parseInt(params.get("PETsmall") || "0");
          const token = params.get("token");
          
          console.log("Parsed data:", { PETbig, PETsmall, token });
          
          if (!token) {
            setMessage("ไม่พบข้อมูล token กรุณาสแกน QR code ใหม่");
            return;
          }
          
          // คำนวณคะแนน
          const points = calculatePoints(PETbig, PETsmall);
          
          // เก็บข้อมูลขวดและคะแนน
          setBottleDetails({
            big: PETbig,
            small: PETsmall,
            points: points
          });
          
          // แสดงข้อมูลการสแกน
          setMessage(`พบข้อมูล: ขวดใหญ่ ${PETbig} ขวด (${PETbig * 200} คะแนน), ขวดเล็ก ${PETsmall} ขวด (${PETsmall * 100} คะแนน), คะแนนรวม ${points} คะแนน`);
          
          if (points > 0 && userId) {
            // ส่งข้อมูลไปยัง API เพื่อเพิ่มคะแนน
            try {
              setLoading(true);
              const response = await addPointsToUser(userId, points, token);
              setMessage(`เพิ่มคะแนนสำเร็จ ${points} คะแนน - ${response.message || "การทำรายการเสร็จสมบูรณ์"}`);
            } catch (error) {
              console.error("API Error:", error);
              if (error instanceof Error) {
                setMessage(error.message || "เกิดข้อผิดพลาดในการเพิ่มคะแนน กรุณาลองใหม่อีกครั้ง");
              } else {
                setMessage("เกิดข้อผิดพลาดในการเพิ่มคะแนน กรุณาลองใหม่อีกครั้ง");
              }
            } finally {
              setLoading(false);
            }
          } else if (!userId) {
            setMessage("กรุณาระบุ userId เพื่อเพิ่มคะแนน");
          }
        } catch (error) {
          console.error("QR parsing error:", error);
          setMessage("รูปแบบ QR code ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
        }
        
        // เคลียร์ scanner หลังจากสแกนสำเร็จ
        scanner.clear();
        
        // เรียกฟังก์ชัน callback หากมีการกำหนด
        if (onScanSuccess) {
          onScanSuccess(decodedText);
        }
      },
      (errorMessage) => {
        // จัดการกรณีสแกนไม่สำเร็จ
        console.error("QR scan error:", errorMessage);
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [userId, onScanSuccess]);

  // ฟังก์ชันคำนวณคะแนน
  // interface BottleDetails {
  //   big: number;
  //   small: number;
  //   points: number;
  // }

  const calculatePoints = (bigBottles: number, smallBottles: number): number => {
    const BIG_BOTTLE_POINTS = 200;
    const SMALL_BOTTLE_POINTS = 100;
    
    return (bigBottles * BIG_BOTTLE_POINTS) + (smallBottles * SMALL_BOTTLE_POINTS);
  };

  // ฟังก์ชันเรียกใช้ API เพิ่มคะแนน
  interface AddPointsRequest {
    userId: string;
    points: number;
    token: string;
  }

  interface AddPointsResponse {
    message: string;
    [key: string]: unknown; // For any additional fields returned by the API
  }

  const addPointsToUser = async (
    userId: string, 
    points: number, 
    token: string
  ): Promise<AddPointsResponse> => {
    try {
      // เรียกใช้ API AddPointsAPI ที่คุณมีอยู่แล้ว
      const response = await axios.post<AddPointsResponse>('/api/addPoints', {
        userId,
        points,
        token
      } as AddPointsRequest);
      
      console.log("API Response:", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error("Error adding points:", error);
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else {
        throw new Error(
          "เกิดข้อผิดพลาดในการเพิ่มคะแนน โปรดลองอีกครั้งหรือติดต่อผู้ดูแลระบบ"
        );
      }
    }
  };

  const handleRescan = () => {
    // เริ่มสแกนใหม่
    setScanResult(null);
    setMessage("");
    setBottleDetails({ big: 0, small: 0, points: 0 });
    
    // สร้าง scanner ใหม่
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: 250,
    }, false);
    
    scanner.render(
      (decodedText) => {
        // ใช้ลอจิกเดิมที่กำหนดใน useEffect
        setScanResult(decodedText);
        // คำสั่งอื่นๆ...
      },
      (error) => {
        console.error(error);
      }
    );
  };

  return (
    <div className="qr-scanner-container">
      <div id="reader"></div>
      
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>กำลังประมวลผล...</p>
        </div>
      )}
      
      {message && (
        <div className="scan-message">
          {message}
        </div>
      )}
      
      {scanResult && (
        <div className="scan-result">
          <h3>รายละเอียดการรับคะแนน</h3>
          <div className="bottle-details">
            <div className="bottle-item">
              <span className="bottle-label">ขวด PET ใหญ่:</span>
              <span className="bottle-value">{bottleDetails.big} ขวด</span>
              <span className="bottle-points">({bottleDetails.big * 200} คะแนน)</span>
            </div>
            <div className="bottle-item">
              <span className="bottle-label">ขวด PET เล็ก:</span>
              <span className="bottle-value">{bottleDetails.small} ขวด</span>
              <span className="bottle-points">({bottleDetails.small * 100} คะแนน)</span>
            </div>
            <div className="bottle-total">
              <span className="bottle-label">คะแนนรวม:</span>
              <span className="bottle-value">{bottleDetails.points} คะแนน</span>
            </div>
          </div>
          
          <div className="qr-value">
            <details>
              <summary>แสดงข้อมูล QR Code</summary>
              <p className="qr-text">{scanResult}</p>
            </details>
          </div>
          
          <button className="rescan-button" onClick={handleRescan}>
            สแกนใหม่
          </button>
        </div>
      )}
      
      <style jsx>{`
        .qr-scanner-container {
          max-width: 500px;
          margin: 0 auto;
          padding: 16px;
          font-family: sans-serif;
        }
        #reader {
          width: 100%;
          min-height: 300px;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
        }
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          z-index: 1000;
        }
        .loading-spinner {
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top: 4px solid white;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .scan-message {
          margin: 16px 0;
          padding: 12px;
          background-color: #f0f9ff;
          border-left: 4px solid #0ea5e9;
          border-radius: 4px;
        }
        .scan-result {
          margin: 16px 0;
          padding: 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }
        .bottle-details {
          margin: 16px 0;
        }
        .bottle-item {
          display: flex;
          margin-bottom: 8px;
        }
        .bottle-label {
          flex: 1;
          font-weight: 500;
        }
        .bottle-value {
          flex: 1;
          text-align: right;
        }
        .bottle-points {
          flex: 1;
          text-align: right;
          color: #10b981;
        }
        .bottle-total {
          display: flex;
          margin-top: 16px;
          padding-top: 8px;
          border-top: 1px dashed #cbd5e1;
          font-weight: bold;
        }
        .qr-value {
          margin: 16px 0;
          font-size: 14px;
        }
        .qr-text {
          word-break: break-all;
          background: #f1f5f9;
          padding: 8px;
          border-radius: 4px;
        }
        .rescan-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          margin-top: 16px;
          width: 100%;
        }
        .rescan-button:hover {
          background: #2563eb;
        }
      `}</style>
    </div>
  );
}