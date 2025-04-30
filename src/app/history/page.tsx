"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Redemption {
  id: string;
  reward: {
    name: string;
    points?: number;
    image?: string;
  };
  createdAt: string;
  status: "PENDING" | "SHIPPED" | "COMPLETED"; // ปรับให้ตรงกับฝั่งแอดมิน
}

export default function UserHistory() {
  const { data: session } = useSession();
  const [history, setHistory] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user.id) {
      setLoading(true);
      fetch(`/api/routers/get-history?userId=${session.user.id}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch history");
          }
          return res.json();
        })
        .then((data) => {
          setHistory(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Failed to fetch history:", error);
          setError("ไม่สามารถโหลดข้อมูลประวัติได้");
          setLoading(false);
        });
    }
  }, [session]);

  const confirmReceived = async (id: string) => {
    try {
      setUpdatingId(id);
      // ใช้ endpoint เดียวกับฝั่งแอดมิน
      const response = await fetch("/api/routers/redemptions/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ redemptionId: id, status: "COMPLETED" }), // ใช้ชื่อ parameter เดียวกับฝั่งแอดมิน
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      setHistory((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "COMPLETED" } : r))
      );

      // แสดงข้อความสำเร็จและทำให้หายไปหลังจาก 3 วินาที
      setSuccessMessage("✅ ยืนยันการรับสินค้าเรียบร้อยแล้ว");
      setTimeout(() => setSuccessMessage(null), 3000);

      // รีเฟรชข้อมูล
      if (session?.user.id) {
        fetch(`/api/routers/get-history?userId=${session.user.id}`)
          .then((res) => res.json())
          .then((data) => setHistory(data))
          .catch((error) => console.error("Failed to refresh history:", error));
      }
    } catch (error) {
      console.error("Failed to update redemption status:", error);
      setError("ไม่สามารถอัพเดทสถานะได้");
      setTimeout(() => setError(null), 3000);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusEmoji = (status: string) => {
    switch(status) {
      case "PENDING": return "⏳";
      case "SHIPPED": return "🚚";
      case "COMPLETED": return "✅";
      default: return "🔄";
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "SHIPPED": return "bg-blue-100 text-blue-800 border-blue-200";
      case "COMPLETED": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case "PENDING": return "รอจัดส่ง";
      case "SHIPPED": return "จัดส่งแล้ว";
      case "COMPLETED": return "ได้รับสินค้าแล้ว";
      default: return status;
    }
  };

  const filteredHistory = filterStatus === "ALL" 
    ? history 
    : history.filter(item => item.status === filterStatus);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-green-500 border-green-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูลประวัติการแลกของ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-6 text-white">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center justify-center">
              <span className="mr-2">📦</span> ประวัติการแลกของรางวัล
            </h1>
            <p className="text-green-100 text-center mt-2">
              ตรวจสอบและติดตามสถานะของรางวัลที่คุณได้แลกไป
            </p>
          </div>
          
          {successMessage && (
            <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg mx-6 mt-6 text-center">
              {successMessage}
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg mx-6 mt-6 text-center">
              {error}
            </div>
          )}
          
          <div className="p-6">
            {/* Filter controls */}
            <div className="mb-6 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                พบ {filteredHistory.length} รายการ {filterStatus !== "ALL" ? `(กรอง: ${getStatusText(filterStatus)})` : ""}
              </div>
              
              <div className="flex space-x-2">
                <button 
                  onClick={() => setFilterStatus("ALL")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filterStatus === "ALL" 
                    ? "bg-gray-200 text-gray-800" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  ทั้งหมด
                </button>
                <button 
                  onClick={() => setFilterStatus("PENDING")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filterStatus === "PENDING" 
                    ? "bg-yellow-200 text-yellow-800" 
                    : "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                  }`}
                >
                  รอจัดส่ง
                </button>
                <button 
                  onClick={() => setFilterStatus("SHIPPED")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filterStatus === "SHIPPED" 
                    ? "bg-blue-200 text-blue-800" 
                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                  }`}
                >
                  จัดส่งแล้ว
                </button>
                <button 
                  onClick={() => setFilterStatus("COMPLETED")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filterStatus === "COMPLETED" 
                    ? "bg-green-200 text-green-800" 
                    : "bg-green-50 text-green-600 hover:bg-green-100"
                  }`}
                >
                  รับแล้ว
                </button>
              </div>
            </div>
            
            {/* Empty state */}
            {filteredHistory.length === 0 && (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  {history.length === 0 
                    ? "คุณยังไม่เคยแลกของรางวัล" 
                    : "ไม่พบรายการที่ตรงกับตัวกรอง"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {history.length === 0 
                    ? "เริ่มสะสมแต้มและแลกของรางวัลที่คุณชื่นชอบกันเถอะ" 
                    : "ลองเลือกตัวกรองอื่น หรือดูรายการทั้งหมด"}
                </p>
                {history.length === 0 && (
                  <a 
                    href="/rewards" 
                    className="inline-block bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                  >
                    ดูของรางวัลทั้งหมด
                  </a>
                )}
              </div>
            )}
            
            {/* History list */}
            {filteredHistory.length > 0 && (
              <div className="space-y-4">
                {filteredHistory.map((item) => (
                  <div 
                    key={item.id} 
                    className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Status indicator - visible on mobile */}
                      <div className="sm:hidden bg-gray-50 p-3 border-b border-gray-200">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
                          <span className="mr-1">{getStatusEmoji(item.status)}</span>
                          {getStatusText(item.status)}
                        </div>
                      </div>
                      
                      {/* Main content */}
                      <div className="flex-grow p-4">
                        <div className="flex justify-between">
                          <h3 className="font-semibold text-gray-800 text-lg">{item.reward.name}</h3>
                          
                          {/* Status indicator - visible on desktop */}
                          <div className="hidden sm:inline-flex">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
                              <span className="mr-1">{getStatusEmoji(item.status)}</span>
                              {getStatusText(item.status)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-2 text-sm text-gray-500">
                          วันที่แลก: {new Date(item.createdAt).toLocaleString("th-TH", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        
                        {item.status === "SHIPPED" && (
                          <div className="mt-4">
                            <button
                              disabled={updatingId === item.id}
                              onClick={() => confirmReceived(item.id)}
                              className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70"
                            >
                              {updatingId === item.id ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  กำลังยืนยัน...
                                </>
                              ) : (
                                <>
                                  <svg 
                                    className="mr-2 h-4 w-4" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24" 
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path 
                                      strokeLinecap="round" 
                                      strokeLinejoin="round" 
                                      strokeWidth="2" 
                                      d="M5 13l4 4L19 7"
                                    ></path>
                                  </svg>
                                  ยืนยันการรับสินค้า
                                </>
                              )}
                            </button>
                          </div>
                        )}
                        
                        {item.status === "COMPLETED" && (
                          <div className="mt-4 text-sm text-green-600 font-medium flex items-center">
                            <svg 
                              className="mr-1 h-4 w-4" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="2" 
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              ></path>
                            </svg>
                            ได้รับสินค้าเรียบร้อยแล้ว
                          </div>
                        )}
                      </div>
                      
                      {/* Timeline indicator */}
                      <div className="w-16 sm:w-20 flex-shrink-0 bg-gray-50 border-l border-gray-200 flex flex-col items-center justify-center p-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          item.status === "PENDING" 
                            ? "bg-yellow-100 text-yellow-600" 
                            : item.status === "SHIPPED" 
                            ? "bg-blue-100 text-blue-600" 
                            : "bg-green-100 text-green-600"
                        }`}>
                          {item.status === "PENDING" && "1"}
                          {item.status === "SHIPPED" && "2"}
                          {item.status === "COMPLETED" && "3"}
                        </div>
                        <div className="h-full w-0.5 my-1 bg-gray-200"></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          item.status === "PENDING" 
                            ? "bg-gray-100 text-gray-400" 
                            : "bg-blue-100 text-blue-600"
                        }`}>
                          2
                        </div>
                        <div className="h-full w-0.5 my-1 bg-gray-200"></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          item.status === "COMPLETED" 
                            ? "bg-green-100 text-green-600" 
                            : "bg-gray-100 text-gray-400"
                        }`}>
                          3
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}