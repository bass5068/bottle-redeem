
import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";

interface Props {
  userId: string;
  onScanSuccess?: (decodedText: string) => void;
}

interface BottleDetails {
  big: number;
  small: number;
  points: number;
}

interface AddPointsResponse {
  message: string;
  [key: string]: unknown;
}

export default function QRCodeScannerWithPoints({ userId, onScanSuccess }: Props) {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [bottleDetails, setBottleDetails] = useState<BottleDetails>({ big: 0, small: 0, points: 0 });

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (!scanResult) {
      initializeScanner();
    }

    return () => {
      scannerRef.current?.clear().catch(() => {});
    };
  }, [scanResult]);

  const initializeScanner = () => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
    scannerRef.current = scanner;

    scanner.render(handleScan, (error) => {
      console.warn("Scan error:", error);
    });
  };

  const handleScan = async (decodedText: string) => {
    setScanResult(decodedText);
    console.log("QR Code scanned:", decodedText);

    try {
      const queryText = decodedText.includes("?") ? decodedText.split("?")[1] : decodedText;
      const params = new URLSearchParams(queryText);
      const PETbig = parseInt(params.get("PETbig") || "0", 10);
      const PETsmall = parseInt(params.get("PETsmall") || "0", 10);
      const token = params.get("token");

      if (!token) {
        return setMessage("❌ ไม่พบ token ใน QR Code");
      }

      const isValid = await validateToken(token);
      if (!isValid) {
        return setMessage("❌ Token ไม่ถูกต้องหรือหมดอายุ");
      }

      const points = calculatePoints(PETbig, PETsmall);
      setBottleDetails({ big: PETbig, small: PETsmall, points });
      setMessage(`✅ ขวดใหญ่ ${PETbig} (${PETbig * 200} คะแนน), ขวดเล็ก ${PETsmall} (${PETsmall * 100} คะแนน), รวม ${points} คะแนน`);

      if (userId && points > 0) {
        setLoading(true);
        try {
          const response = await addPointsToUser(userId, points, token);
          setMessage(`🎉 เพิ่มคะแนนสำเร็จ: ${points} คะแนน - ${response.message}`);
        } catch (err: any) {
          setMessage(err.message || "เกิดข้อผิดพลาดในการเพิ่มคะแนน");
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Parsing error:", error);
      setMessage("❌ ไม่สามารถอ่านข้อมูล QR ได้");
    }

    if (onScanSuccess) {
      onScanSuccess(decodedText);
    }

    scannerRef.current?.clear();
  };

  const calculatePoints = (big: number, small: number) => big * 200 + small * 100;

  const validateToken = async (token: string): Promise<boolean> => {
    try {
      const res = await axios.post("/api/validate-token", { token });
      return res.data.valid;
    } catch {
      return false;
    }
  };

  const addPointsToUser = async (userId: string, points: number, token: string): Promise<AddPointsResponse> => {
    const res = await axios.post("/api/addPoints", { userId, points, token });
    return res.data;
  };

  const handleRescan = () => {
    setScanResult(null);
    setMessage("");
    setBottleDetails({ big: 0, small: 0, points: 0 });
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
    </div>
  );
}