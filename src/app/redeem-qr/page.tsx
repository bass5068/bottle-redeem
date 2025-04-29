// src: src/app/redeem-qr/page.tsx
"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import QRCodeScanner from "@/components/QRCodeScanner";

export default function RedeemQRPage() {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);


  const handleScan = async (code: string) => {
    setMessage("กำลังแลกคะแนน...");
    setStatus("loading");

    const userId = session?.user?.id; // ดึง userId ของคนที่ login ออกมา

    if (!session?.user?.id) {
      console.error("User not authenticated");
      return;
    }
    
      // 🔽 แปลง QR code string เป็น object
    const params = Object.fromEntries(
      code.split(";").map((pair) => {
        const [key, value] = pair.split(":");
        return [key.trim(), value.trim()];
      })
    );

    const token = params.token;
    const small = parseInt(params.small || "0", 10);
    const big = parseInt(params.big || "0", 10);

    const calculatePoints = (big: number, small: number) => big * 200 + small * 100;
    
    if (!token) {
      setMessage("QR Code ไม่ถูกต้อง");
      setStatus("error");
      return;
    }

    try {
      // เรียก API เพื่อเพิ่มคะแนน
      // const res = await fetch("/api/routers/add-points", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     userId,
      //     points: calculatePoints(big, small)
      //   }),
      // });

      const points = calculatePoints(big, small);
      const res = await axios.post("/api/routers/add-points", {
        userId,
        points,
      });


      console.log(calculatePoints(big, small), "points");
  
      const data = res.data;

      if (data.success) {
        console.log("เพิ่มคะแนนสำเร็จ:", data.totalPoints);
      } else {
        console.error(data.error);
      }

      if (res.status >= 200 && res.status < 300) {
        setMessage(`แลกสำเร็จ ${data.points} Coins`);
        setStatus("success");
      } else {
        setMessage(`ล้มเหลว: ${data.error}`);
        setStatus("error");
      }
    } catch {
      setMessage("เกิดข้อผิดพลาด");
      setStatus("error");
    }
  };

  const resetScan = () => {
    setMessage("");
    setStatus("idle");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-green-600 py-4">
          <h1 className="text-2xl font-bold text-white text-center">สแกน QR เพื่อแลกคะแนน</h1>
        </div>
        
        <div className="p-6">
          {status === "idle" || status === "loading" ? (
            <div className="mb-3 bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center" style={{ minHeight: "320px" }}>
              <div className="aspect-square w-full bg-white relative">
                <QRCodeScanner onScanSuccess={handleScan} />
              </div>
            </div>
          ) : null}
          
          {status === "loading" && (
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{message}</span>
            </div>
          )}
          
          {status === "success" && (
            <div className="text-center p-4 bg-green-100 rounded-lg text-green-700">
              <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <p className="font-medium text-lg mb-5">{message}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button 
                  onClick={resetScan}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 font-medium flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  สแกนอีกครั้ง
                </button>
                <button 
                  onClick={() => window.location.href = "/"}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-medium flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
                  </svg>
                  ดำเนินการต่อ
                </button>
              </div>
            </div>
          )}
          
          {status === "error" && (
            <div className="text-center p-4 bg-red-100 rounded-lg text-red-700">
              <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <p className="font-medium text-lg mb-5">{message}</p>
              <button 
                onClick={resetScan}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 font-medium flex items-center justify-center mx-auto"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                ลองใหม่อีกครั้ง
              </button>
            </div>
          )}
          
          {status === "idle" && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">วางโค้ด QR ไว้ตรงกลางกล้องเพื่อสแกน</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}