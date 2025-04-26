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
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [showScanner, setShowScanner] = useState(true);

  useEffect(() => {
    // เมื่อ component ถูกโหลดหรือ showScanner เปลี่ยนเป็น true ให้เริ่มสแกนเนอร์ใหม่
    if (showScanner) {
      initScanner();
    }

    // ทำความสะอาด scanner เมื่อ component unmount หรือเมื่อ showScanner เปลี่ยนเป็น false
    return () => {
      if (scanner) {
        try {
          scanner.clear().catch(() => {});
        } catch (error) {
          console.error("Error clearing scanner:", error);
        }
      }
    };
  }, [userId, onScanSuccess, showScanner]); // เพิ่ม showScanner เป็น dependency

  const initScanner = () => {
    // เคลียร์ scanner เดิมก่อนถ้ามี
    if (scanner) {
      try {
        scanner.clear().catch(() => {});
      } catch (error) {
        console.error("Error clearing existing scanner:", error);
      }
    }

    // รอให้ DOM element พร้อมด้วย setTimeout เพื่อให้แน่ใจว่า render ครบถ้วนแล้ว
    setTimeout(() => {
      try {
        // สร้าง scanner ใหม่
        const newScanner = new Html5QrcodeScanner("reader", {
          fps: 24,
          qrbox: 250,
        }, false);
        
        setScanner(newScanner);
        
        newScanner.render(
          async (decodedText) => {
            // หยุดสแกนทันทีที่พบ QR Code
            try {
              newScanner.clear().catch(() => {});
            } catch (error) {
              console.error("Error clearing scanner after scan:", error);
            }
            
            // เปลี่ยนสถานะให้ไม่แสดง scanner
            setShowScanner(false);
            
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
                setStatus("error");
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
                  setMessage(`แลกคะแนนสำเร็จ! เพิ่ม ${points} คะแนน - ${response.message || "การทำรายการเสร็จสมบูรณ์"}`);
                  setStatus("success");
                } catch (error) {
                  console.error("API Error:", error);
                  if (error instanceof Error) {
                    setMessage(error.message || "เกิดข้อผิดพลาดในการเพิ่มคะแนน กรุณาลองใหม่อีกครั้ง");
                  } else {
                    setMessage("เกิดข้อผิดพลาดในการเพิ่มคะแนน กรุณาลองใหม่อีกครั้ง");
                  }
                  setStatus("error");
                } finally {
                  setLoading(false);
                }
              } else if (!userId) {
                setMessage("กรุณาระบุ userId เพื่อเพิ่มคะแนน");
                setStatus("error");
              }
            } catch (error) {
              console.error("QR parsing error:", error);
              setMessage("รูปแบบ QR code ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
              setStatus("error");
            }
            
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
      } catch (error) {
        console.error("Error initializing scanner:", error);
        setMessage("เกิดข้อผิดพลาดในการเริ่มสแกนเนอร์ กรุณารีเฟรชหน้า");
        setStatus("error");
      }
    }, 100);
  };

  // ฟังก์ชันคำนวณคะแนน
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
      // เรียกใช้ API AddPointsAPI
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

  const handleTryAgain = () => {
    // เคลียร์ state
    setScanResult(null);
    setMessage("");
    setStatus(null);
    setBottleDetails({ big: 0, small: 0, points: 0 });
    
    // เปิดใช้งาน scanner อีกครั้ง
    setShowScanner(true);
  };

  return (
    <div className="qr-scanner-container">
      {showScanner && (
        <div id="reader" className="scanner-container"></div>
      )}
      
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>กำลังประมวลผล...</p>
        </div>
      )}
      
      {message && (
        <div className={`scan-message ${status === "success" ? "success" : status === "error" ? "error" : ""}`}>
          {message}
        </div>
      )}
      
      {scanResult && (
        <div className={`scan-result ${status === "success" ? "success-result" : status === "error" ? "error-result" : ""}`}>
          <h3>{status === "success" ? "การแลกคะแนนสำเร็จ" : status === "error" ? "เกิดข้อผิดพลาด" : "รายละเอียดการรับคะแนน"}</h3>
          
          {status === "success" && (
            <div className="success-icon">✓</div>
          )}
          
          {status === "error" && (
            <div className="error-icon">✗</div>
          )}
          
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
          
          <button 
            className={`action-button ${status === "success" ? "success-button" : "retry-button"}`} 
            onClick={handleTryAgain}
          >
            {status === "success" ? "สแกน QR Code ใหม่" : "ลองใหม่"}
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
        .scanner-container {
          width: 100%;
          min-height: 300px;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
        }
        #reader {
          width: 100%;
          min-height: 300px;
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
        .scan-message.success {
          background-color: #ecfdf5;
          border-left-color: #10b981;
        }
        .scan-message.error {
          background-color: #fef2f2;
          border-left-color: #ef4444;
        }
        .scan-result {
          margin: 16px 0;
          padding: 20px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          text-align: center;
        }
        .success-result {
          background-color: #f0fdf4;
          border-color: #bbf7d0;
        }
        .error-result {
          background-color: #fef2f2;
          border-color: #fecaca;
        }
        .success-icon {
          font-size: 48px;
          color: #10b981;
          margin: 8px 0 16px;
        }
        .error-icon {
          font-size: 48px;
          color: #ef4444;
          margin: 8px 0 16px;
        }
        .bottle-details {
          margin: 16px 0;
          text-align: left;
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
          text-align: left;
        }
        .qr-text {
          word-break: break-all;
          background: #f1f5f9;
          padding: 8px;
          border-radius: 4px;
        }
        .action-button {
          border: none;
          padding: 12px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          margin-top: 16px;
          width: 100%;
          font-size: 16px;
        }
        .success-button {
          background: #10b981;
          color: white;
        }
        .success-button:hover {
          background: #059669;
        }
        .retry-button {
          background: #3b82f6;
          color: white;
        }
        .retry-button:hover {
          background: #2563eb;
        }
      `}</style>
    </div>
  );
}