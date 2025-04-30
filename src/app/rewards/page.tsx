"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Reward {
  id: number;
  name: string;
  description: string;
  image?: string;
  points: number;
  stock: number;
}

// ฟังก์ชันสำหรับแปลง Cloudinary URL เพื่อปรับขนาดและคุณภาพอัตโนมัติ
const optimizeCloudinaryUrl = (url: string, options: { width?: number; height?: number; quality?: number } = {}): string => {
  if (!url || !url.includes('cloudinary.com')) return url || '/placeholder.png';
  
  const { width = 400, height = 0, quality = 'auto' } = options;
  
  // แยก URL เพื่อแทรก transformations
  const parts = url.split('/upload/');
  
  // สร้าง transformation string
  let transformations = 'c_fill,f_auto';
  if (width > 0) transformations += `,w_${width}`;
  if (height > 0) transformations += `,h_${height}`;
  transformations += `,q_${quality}`;
  
  return `${parts[0]}/upload/${transformations}/${parts[1]}`;
};

export default function RewardsPage() {
  const { data: session } = useSession();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userData, setUserData] = useState<{ points: number } | null>(null);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [animatePoints, setAnimatePoints] = useState(false);

  useEffect(() => {
    fetchRewards();
    if (session?.user?.id) {
      fetchUserPoints();
    }
  }, [session]);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/routers/rewards");
      if (!res.ok) throw new Error("Failed to fetch rewards");
      const data = await res.json();
      setRewards(data);
    } catch (error) {
      console.error("Error fetching rewards:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPoints = async () => {
    if (!session?.user?.id) return;
    
    try {
      const res = await fetch(`/api/users/${session.user.id}/points`);
      if (!res.ok) throw new Error("Failed to fetch user points");
      const data = await res.json();
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user points:", error);
    }
  };

  const refreshUserData = async () => {
    await fetchUserPoints();
    // เพิ่ม animation เมื่อคะแนนมีการเปลี่ยนแปลง
    setAnimatePoints(true);
    setTimeout(() => setAnimatePoints(false), 1500);
  };

  const handleRedeem = (reward: Reward) => {
    if ((userData?.points ?? 0) < reward.points) {
      setErrorMessage("คุณมีแต้มไม่เพียงพอในการแลกรางวัลนี้");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
    
    if (reward.stock <= 0) {
      setErrorMessage("ขออภัย สินค้าหมด");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
    
    setSelectedReward(reward);
    setShowModal(true);
  };

  const confirmRedeem = async () => {
    if (!selectedReward || !session) return;

    try {
      const response = await fetch("/api/routers/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rewardId: selectedReward.id,
          userId: session.user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to redeem reward");
      }

      // อัพเดทสินค้าและคะแนนของผู้ใช้
      await fetchRewards();
      await refreshUserData();
      setShowModal(false);
      
      // แสดงข้อความสำเร็จ
      setErrorMessage("🎉 แลกรางวัลสำเร็จ! ตรวจสอบสถานะการจัดส่งได้ในประวัติการแลก");
      setTimeout(() => setErrorMessage(null), 5000);
    } catch (error: unknown) {
      console.error("Error redeeming reward:", error);
      if (error instanceof Error) {
        setErrorMessage(error.message || "ไม่สามารถแลกรางวัลได้ กรุณาลองใหม่อีกครั้ง");
      } else {
        setErrorMessage("ไม่สามารถแลกรางวัลได้ กรุณาลองใหม่อีกครั้ง");
      }
      setTimeout(() => setErrorMessage(null), 3000);
      setShowModal(false);
    }
  };

  const isRewardNew = (id: number) => {
    // สมมติว่ารางวัลที่มี id เป็นเลขคู่เป็นรางวัลใหม่ (แค่ตัวอย่าง)
    return id % 2 === 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* แสดงคะแนนของผู้ใช้ */}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-green-600 flex items-center">
            <span className="mr-2">🎁</span> ของรางวัล
          </h1>
          
          {session && userData && (
            <div className={`flex items-center bg-white rounded-full px-4 py-2 shadow-md border border-yellow-200 mt-4 md:mt-0 ${animatePoints ? 'animate-pulse' : ''}`}>
              <div className="mr-2 bg-yellow-400 text-white rounded-full w-10 h-10 flex items-center justify-center">
                <span className="font-bold">🪙</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">คะแนนของคุณ</p>
                <p className="font-bold text-yellow-500 text-xl">
                  {userData.points.toLocaleString()}
                  <span className="text-xs ml-1">points</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ข้อความแจ้งเตือน */}
        {errorMessage && (
          <div className={`mb-6 p-3 rounded-lg text-center text-sm font-medium transition-all duration-300 ${errorMessage.includes("สำเร็จ") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {errorMessage}
          </div>
        )}

        {/* แสดงรายการของรางวัล */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-gray-500">กำลังโหลดรายการของรางวัล...</p>
            </div>
          </div>
        ) : (
          <>
            {rewards.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-10 text-center">
                <div className="text-7xl mb-4">🏆</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">ยังไม่มีของรางวัลในขณะนี้</h3>
                <p className="text-gray-500">โปรดกลับมาใหม่ในภายหลัง เรากำลังเพิ่มของรางวัลใหม่ๆ</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.map((reward) => {
                  const canRedeem = reward.stock > 0 && (userData?.points ?? 0) >= reward.points;
                  const isNew = isRewardNew(reward.id);

                  return (
                    <div
                      key={reward.id}
                      className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden transform hover:-translate-y-1"
                    >
                      {isNew && (
                        <div className="absolute top-3 left-3 z-10">
                          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow flex items-center">
                            <span className="mr-1">✨</span> ใหม่
                          </div>
                        </div>
                      )}

                      {reward.stock <= 3 && reward.stock > 0 && (
                        <div className="absolute top-3 right-3 z-10">
                          <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                            เหลือเพียง {reward.stock} ชิ้น
                          </div>
                        </div>
                      )}

                      <div className="relative h-48 overflow-hidden">
                        {reward.image ? (
                          <img
                            src={optimizeCloudinaryUrl(reward.image, { width: 480, height: 360, })}
                            alt={reward.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-green-200 to-green-300 flex items-center justify-center">
                            <span className="text-5xl">🎁</span>
                          </div>
                        )}
                        
                        {/* เพิ่ม overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>

                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <h2 className="text-xl font-bold text-gray-800 group-hover:text-green-600 transition-colors duration-300">
                            {reward.name}
                          </h2>
                          <div className="flex items-center bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg border border-yellow-100">
                            <span className="mr-1 text-yellow-500">🪙</span>
                            <span className="font-bold">{reward.points.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm min-h-[40px] mb-4">
                          {reward.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className={`text-sm font-medium ${reward.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                            {reward.stock > 0 ? (
                              <>
                                <span className="inline-block mr-1">📦</span> สต็อก: {reward.stock}
                              </>
                            ) : (
                              <>
                                <span className="inline-block mr-1">⚠️</span> สินค้าหมด
                              </>
                            )}
                          </div>
                          
                          {canRedeem ? (
                            <div className="relative overflow-hidden">
                              <button
                                onClick={() => handleRedeem(reward)}
                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 flex items-center"
                              >
                                <span>แลกเลย</span>
                                <span className="ml-1 transform group-hover:translate-x-1 transition-transform duration-300">🚀</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              disabled
                              className={`py-2 px-4 rounded-lg font-bold ${
                                reward.stock === 0
                                  ? "bg-red-100 text-red-500"
                                  : "bg-gray-200 text-gray-500"
                              }`}
                            >
                              {reward.stock === 0 ? "หมดแล้ว" : "แต้มไม่พอ"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal ยืนยันการแลกรางวัล */}
      {showModal && selectedReward && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white w-20 h-20 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
              {selectedReward.image ? (
                <img 
                  src={optimizeCloudinaryUrl(selectedReward.image, { width: 100, height: 100 })} 
                  alt={selectedReward.name} 
                  className="w-16 h-16 object-cover rounded-full"
                />
              ) : (
                <span className="text-4xl">🎁</span>
              )}
            </div>
            
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
            >
              ✕
            </button>
            
            <div className="text-center pt-4 pb-2">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                ยืนยันการแลกรางวัล
              </h2>
              <div className="h-1 w-16 bg-green-500 mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="text-center mb-6">
              <p className="text-xl font-semibold text-gray-800">{selectedReward.name}</p>
              <p className="text-gray-600 mt-1 mb-4">
                {selectedReward.description}
              </p>
              
              <div className="bg-yellow-50 py-3 px-4 rounded-lg inline-block">
                <p className="text-gray-700">
                  คุณจะใช้ <span className="text-yellow-600 font-bold text-xl">{selectedReward.points.toLocaleString()}</span> แต้ม
                </p>
                {userData && (
                  <p className="text-sm text-gray-500">
                    (คงเหลือ <span className="font-medium">{(userData.points - selectedReward.points).toLocaleString()}</span> แต้ม)
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center"
                onClick={confirmRedeem}
              >
                <span>ยืนยันการแลก</span>
                <span className="ml-2">🚀</span>
              </button>
              <button
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-colors duration-300"
                onClick={() => setShowModal(false)}
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// เพิ่ม CSS animation สำหรับ modal
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes scaleIn {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }
  .animate-scaleIn {
    animation: scaleIn 0.3s ease-out forwards;
  }
`;
document.head.appendChild(style);