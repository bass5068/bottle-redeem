"use client";

import { useEffect, useState } from "react";

interface Redemption {
  id: string;
  user: {
    name: string;
  };
  reward: {
    name: string;
    points: number;
  };
  createdAt: string;
  status: string;
}

export default function AdminRedemptions() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/routers/redemptions")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => setRedemptions(data))
      .catch((error) => {
        console.error("Failed to fetch redemptions:", error);
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      })
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await fetch("/api/redemptions/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ redemptionId: id, status: newStatus }),
      });

      setRedemptions((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
      
      // โหลดข้อมูลใหม่แทนการใช้ mutate จาก swr
      fetch("/api/routers/redemptions")
        .then((res) => {
          if (res.ok) return res.json();
        })
        .then((refreshedData) => {
          if (refreshedData) setRedemptions(refreshedData);
        })
        .catch((error) => {
          console.error("Failed to refresh redemptions:", error);
        });
    } catch (error) {
      console.error("Failed to update redemption status:", error);
    }
  };

  interface StatusBadgeColorMap {
    [key: string]: string;
  }

  const getStatusBadgeColor = (status: string): string => {
    const statusBadgeColors: StatusBadgeColorMap = {
      PENDING: "bg-yellow-100 text-yellow-800",
      SHIPPED: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-green-100 text-green-800",
    };

    return statusBadgeColors[status] || "bg-gray-100 text-gray-800";
  };

  interface StatusTextMap {
    [key: string]: string;
  }

  const getStatusText = (status: string): string => {
    const statusTextMap: StatusTextMap = {
      PENDING: "กำลังดำเนินการ",
      SHIPPED: "รอรับสินค้า",
      COMPLETED: "ได้รับสินค้าแล้ว",
    };

    return statusTextMap[status] || status;
  };

  const filteredRedemptions = redemptions
    .filter(r => 
      (statusFilter === "ALL" || r.status === statusFilter) &&
      (searchQuery === "" || 
        r.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.reward.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
        <p className="text-gray-600 font-medium">กำลังโหลดข้อมูล...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-red-500 text-center mb-4 text-5xl">⚠️</div>
        <h2 className="text-xl font-bold text-center mb-2">เกิดข้อผิดพลาด</h2>
        <p className="text-center text-red-500">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors duration-200"
        >
          ลองใหม่อีกครั้ง
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center justify-center">
              <span className="mr-2">📦</span> การจัดการการแลกของรางวัล
            </h1>
          </div>
          
          <div className="p-6">
            {/* Filters and Search */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5 focus:ring-green-500 focus:border-green-500"
                  placeholder="ค้นหาชื่อผู้ใช้หรือสินค้า..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <select
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:ring-green-500 focus:border-green-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">สถานะทั้งหมด</option>
                <option value="PENDING">กำลังดำเนินการ</option>
                <option value="SHIPPED">รอรับสินค้า</option>
                <option value="COMPLETED">ได้รับสินค้าแล้ว</option>
              </select>
            </div>
            
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white border border-yellow-200 rounded-lg shadow px-4 py-5 flex items-center">
                <div className="rounded-full bg-yellow-100 p-3 mr-4">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">รอดำเนินการ</p>
                  <p className="text-xl font-semibold">{redemptions.filter(r => r.status === "PENDING").length}</p>
                </div>
              </div>
              
              <div className="bg-white border border-blue-200 rounded-lg shadow px-4 py-5 flex items-center">
                <div className="rounded-full bg-blue-100 p-3 mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">รอรับสินค้า</p>
                  <p className="text-xl font-semibold">{redemptions.filter(r => r.status === "SHIPPED").length}</p>
                </div>
              </div>
              
              <div className="bg-white border border-green-200 rounded-lg shadow px-4 py-5 flex items-center">
                <div className="rounded-full bg-green-100 p-3 mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">เสร็จสมบูรณ์</p>
                  <p className="text-xl font-semibold">{redemptions.filter(r => r.status === "COMPLETED").length}</p>
                </div>
              </div>
            </div>
            
            {/* Table */}
            <div className="overflow-x-auto rounded-lg shadow">
              {filteredRedemptions.length === 0 ? (
                <div className="bg-white p-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">ไม่พบข้อมูล</h3>
                  <p className="mt-1 text-sm text-gray-500">ไม่พบรายการที่ตรงกับการค้นหาหรือตัวกรองที่คุณเลือก</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ผู้ใช้
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ของรางวัล
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        คะแนน
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        วันที่แลก
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        สถานะ
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        การดำเนินการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRedemptions.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{r.user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{r.reward.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-semibold">{r.reward.points}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(r.createdAt).toLocaleString("th-TH", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(r.status)}`}>
                            {getStatusText(r.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {r.status === "PENDING" && (
                            <button
                              onClick={() => updateStatus(r.id, "SHIPPED")}
                              className="inline-flex items-center px-3 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                            >
                              <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                              จัดส่งสินค้า
                            </button>
                          )}
                          {r.status === "SHIPPED" && (
                            <button
                              onClick={() => updateStatus(r.id, "COMPLETED")}
                              className="inline-flex items-center px-3 py-1.5 bg-green-500 text-white text-sm font-medium rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                            >
                              <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                              ยืนยันรับสินค้า
                            </button>
                          )}
                          {r.status === "COMPLETED" && (
                            <span className="text-green-500 text-sm">เสร็จสิ้น</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}