import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";
import { useSession } from "next-auth/react";

interface BottleDetails {
  big: number;
  small: number;
  points: number;
}

interface AddPointsResponse {
  message: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
  error?: string;
}

export default function QRCodeScannerWithPoints({ 
  onScanSuccess 
}: { 
  onScanSuccess?: (decodedText: string) => void 
}) {
  const { data: session } = useSession();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [bottleDetails, setBottleDetails] = useState<BottleDetails>({ big: 0, small: 0, points: 0 });

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    initializeScanner();
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (error) {
          console.error("Error clearing scanner:", error);
        }
      }
    };
  }, []);

  const initializeScanner = () => {
    if (scannerRef.current) return; // ป้องกัน initialize ซ้ำ
    
    try {
      const scanner = new Html5QrcodeScanner(
        "reader", 
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
        }, 
        false
      );
      
      scannerRef.current = scanner;

      scanner.render(handleScan, (error) => {
        console.warn("Scan error:", error);
      });
    } catch (error) {
      console.error("Scanner initialization error:", error);
      setError("ไม่สามารถเริ่มต้นกล้องได้ โปรดตรวจสอบการอนุญาตกล้อง");
    }
  };

  const parseQrCode = (decodedText: string) => {
    try {
      // รองรับทั้งรูปแบบ URL query string และ custom format
      if (decodedText.includes("?")) {
        // รูปแบบ URL: "example.com?token=123&big=1&small=2"
        const queryText = decodedText.split("?")[1];
        const urlParams = new URLSearchParams(queryText);
        
        return {
          token: urlParams.get("token") || "",
          big: parseInt(urlParams.get("big") || "0", 10),
          small: parseInt(urlParams.get("small") || "0", 10)
        };
      } else {
        // รูปแบบ custom: "token:123;big:1;small:2"
        const params = decodedText.split(";").reduce((acc, pair) => {
          const [key, value] = pair.split(":");
          if (key && value) {
            acc[key.trim()] = value.trim();
          }
          return acc;
        }, {} as { [key: string]: string });
        
        return {
          token: params.token || "",
          big: parseInt(params.big || "0", 10),
          small: parseInt(params.small || "0", 10)
        };
      }
    } catch (error) {
      console.error("QR parsing error:", error);
      throw new Error("รูปแบบ QR Code ไม่ถูกต้อง");
    }
  };

  const handleScan = async (decodedText: string) => {
    if (!decodedText || decodedText.trim() === "") {
      console.warn("Empty decodedText, ignoring...");
      return;
    }

    try {
      console.log("Raw decodedText:", decodedText);
      setLoading(true);
      setError(null);
      
      // แยกข้อมูลจาก QR Code
      const parsedData = parseQrCode(decodedText);
      const { token, big: PETbig, small: PETsmall } = parsedData;

      if (!token || token.trim() === "") {
        setError("ไม่พบ token ใน QR Code");
        setLoading(false);
        return;
      }

      // ตรวจสอบความถูกต้องของ token
      const isValid = await validateToken(token);
      if (!isValid) {
        setError("Token ไม่ถูกต้องหรือหมดอายุ");
        setLoading(false);
        return;
      }

      // คำนวณคะแนน
      const points = calculatePoints(PETbig, PETsmall);
      setBottleDetails({ big: PETbig, small: PETsmall, points });

      const userId = session?.user?.id;
      
      // ตรวจสอบว่ามี user login อยู่หรือไม่
      if (!userId) {
        setMessage("โปรดเข้าสู่ระบบก่อนรับคะแนน");
        setLoading(false);
        setScanResult(decodedText);
        scannerRef.current?.clear().catch(() => {});
        return;
      }

      // เพิ่มคะแนนให้ user
      if (points > 0) {
        try {
          const response = await addPointsToUser(userId, points);
          
          if (response.error) {
            setError(response.error);
          } else {
            setMessage(`🎉 เพิ่มคะแนนสำเร็จ: ${points} คะแนน - ${response.message}`);
          }
        } catch (err: unknown) {
          if (err instanceof Error) {
            setError(err.message || "เกิดข้อผิดพลาดในการเพิ่มคะแนน");
          } else {
            setError("เกิดข้อผิดพลาดในการเพิ่มคะแนน");
          }
        }
      } else {
        setMessage(`ไม่มีคะแนนที่จะเพิ่ม (ขวด = 0)`);
      }

      setScanResult(decodedText);
      scannerRef.current?.clear().catch(() => {});

      if (onScanSuccess) {
        onScanSuccess(decodedText);
      }
    } catch (error: unknown) {
      console.error("Scan handling error:", error);
      if (error instanceof Error) {
        setError(error.message || "เกิดข้อผิดพลาดในการอ่าน QR Code");
      } else {
        setError("เกิดข้อผิดพลาดในการอ่าน QR Code");
      }
    } finally {
      setLoading(false);
    }
  };

  const calculatePoints = (big: number, small: number): number => {
    // ตรวจสอบค่าติดลบ
    const validBig = Math.max(0, big);
    const validSmall = Math.max(0, small);
    return validBig * 200 + validSmall * 100;
  };

  const validateToken = async (token: string): Promise<boolean> => {
    try {
      const res = await axios.post("/api/validate-token", { token });
      return res.data.valid === true;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  };

  const addPointsToUser = async (userId: string, points: number): Promise<AddPointsResponse> => {
    try {
      const res = await axios.post("/api/add-points", { userId, points });
      return res.data;
    } catch (error: unknown) {
      console.error("Add points error:", error);
      const errorMessage = axios.isAxiosError(error) && error.response?.data?.error 
        ? error.response.data.error 
        : "เกิดข้อผิดพลาดในการเพิ่มคะแนน";
      throw new Error(errorMessage);
    }
  };

  const handleRescan = () => {
    setScanResult(null);
    setMessage("");
    setError(null);
    setBottleDetails({ big: 0, small: 0, points: 0 });
    
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (error) {
        console.error("Error clearing scanner:", error);
      }
    }
    
    scannerRef.current = null;
    initializeScanner();
  };

  return (
    <div className="qr-scanner-container">
      {!scanResult && <div id="reader"></div>}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>กำลังประมวลผล...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          ❌ {error}
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
          color: #000;
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
          color: #000;
          margin: 16px 0;
          padding: 12px;
          background-color: #f0f9ff;
          border-left: 4px solid #0ea5e9;
          border-radius: 4px;
        }
        .error-message {
          color: #000;
          margin: 16px 0;
          padding: 12px;
          background-color: #fef2f2;
          border-left: 4px solid #ef4444;
          border-radius: 4px;
        }
        .scan-result {
          color: #000;
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