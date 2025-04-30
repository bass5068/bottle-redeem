// src/components/QRCodeScanner.tsx

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
  [key: string]: unknown;
}

export default function QRCodeScannerWithPoints({ onScanSuccess }: { onScanSuccess?: (decodedText: string) => void }) {
  const { data: session, status } = useSession();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [bottleDetails, setBottleDetails] = useState<BottleDetails>({ big: 0, small: 0, points: 0 });
  const [userId, setUserId] = useState<string | undefined>(undefined); // เก็บ userId แยก
  const [scannerError, setScannerError] = useState(false);

  console.log("session.user.id =", session?.user?.id);

  // เพิ่ม state เพื่อป้องกันการสแกนซ้ำ
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannerInitialized, setScannerInitialized] = useState(false);

  // ใช้ useRef เก็บค่า QR ที่สแกนได้ล่าสุดเพื่อป้องกันการประมวลผลซ้ำ
  const lastScannedCode = useRef<string | null>(null);
    

  // ติดตามการเปลี่ยนแปลงของ session และอัปเดต userId
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      setUserId(session.user.id);
      console.log("Session loaded - User ID:", session.user.id);
    } else if (status === "unauthenticated") {
      console.log("User not authenticated");
    } else if (status === "loading") {
      console.log("Session loading...");
    }
  }, [session, status]);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (status !== "loading" && !scannerInitialized && !scanResult) { // รอให้ session โหลดเสร็จก่อน
      initializeScanner();
    }
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [status, scannerInitialized, scanResult]); // เพิ่ม dependency เป็น status

  const initializeScanner = () => {
    if (scannerRef.current) return; // ป้องกัน initialize ซ้ำ
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
    scannerRef.current = scanner;

    scanner.render(handleScan, (error) => {
      console.warn("Scan error:", error);
    });
  };


  const calculatePoints = (big: number, small: number) => big * 200 + small * 100;

  const handleScan = async (decodedText: string) => {
    
    if (!decodedText || decodedText.trim() === "") {
      console.warn("Empty decodedText, ignoring...");
      return;
    }

    try {
      console.log("Raw decodedText:", decodedText);

      const queryText = decodedText.includes("?") ? decodedText.split("?")[1] : decodedText;
      const params = queryText.split(";").reduce((acc, pair) => {
        const [key, value] = pair.split(":");
        acc[key] = value;
        return acc;
      }, {} as { [key: string]: string });

      const token = params.token;
      if (!token || token.trim() === "") {
        setMessage("❌ ไม่พบ token ใน QR Code");
        return;
      }

      if (!decodedText.includes("token:")) {
        console.warn("Invalid QR format, ignoring...");
        return;
      }

      const PETbig = parseInt(params.big || "0", 10);
      const PETsmall = parseInt(params.small || "0", 10);

      const isValid = await validateToken(token);
      if (!isValid) {
        setMessage("❌ Token ไม่ถูกต้องหรือหมดอายุ");
        return;
      }

      const points = calculatePoints(PETbig, PETsmall);
      // ตรวจสอบสถานะการเข้าสู่ระบบและ userId อีกครั้ง
      const currentUserId = userId || session?.user?.id;
      console.log("Current userId:", currentUserId, "| points:", points, "| type:", typeof points);

      setBottleDetails({ big: PETbig, small: PETsmall, points });

      if (currentUserId && points > 0) {
        console.log("กำลังส่ง request ไป add-points:", { userId: currentUserId, points });
        setLoading(true);
        try {
          const response = await addPointsToUser(currentUserId, points);
          setMessage(`🎉 เพิ่มคะแนนสำเร็จ: ${points} คะแนน - ${response.message}`);
        } catch (err: any) {
          console.error("Error adding points:", err);
          setMessage(err.message || "เกิดข้อผิดพลาดในการเพิ่มคะแนน");
        } finally {
          setLoading(false);
        }
      } else {
        // แสดงข้อความแจ้งเตือนเมื่อไม่มี userId
        if (!currentUserId) {
          console.error("ไม่พบ User ID - กรุณาเข้าสู่ระบบอีกครั้ง");
          setMessage("❌ ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบอีกครั้ง");
        } else {
          setMessage(`✅ ขวดใหญ่ ${PETbig} (${PETbig * 200} คะแนน), ขวดเล็ก ${PETsmall} (${PETsmall * 100} คะแนน), รวม ${points} คะแนน`);
        }
      }

      setScanResult(decodedText);
      scannerRef.current?.clear().catch(() => {});

    } catch (error) {
      console.error("Parsing error:", error);
      setMessage("❌ ไม่สามารถอ่านข้อมูล QR ได้");
    }

    if (onScanSuccess) {
      onScanSuccess(decodedText);
    }
  };

  

  const validateToken = async (token: string): Promise<boolean> => {
    try {
      const res = await axios.post("/api/routers/validate-token", { token });
      return res.data.valid;
    } catch {
      return false;
    }
  };

  const addPointsToUser = async (userId: string, points: number): Promise<AddPointsResponse> => {
    const res = await axios.post("/api/routers/add-points", { userId: userId, points: Number(points) });
    return res.data;
  };
  

  const handleRescan = () => {
    setScanResult(null);
    setMessage("");
    setBottleDetails({ big: 0, small: 0, points: 0 });
    scannerRef.current = null; // reset scannerRef
    initializeScanner(); // สั่ง initialize ใหม่
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

      {/* เอา style เดิมที่คุณมีมาแปะตรงนี้ได้เลย */}
    </div>
  );
}
