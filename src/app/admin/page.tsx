import UserTable from "@/components/UserTable";
import RewardTable from "@/components/RewardTable";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="flex">
        {/* ปุ่มไปยังหน้า Reward */}
        <div className="mb-6">
          <Link href="/admin/rewards">
            <button className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600">
              Manage Rewards
            </button>
          </Link>
        </div>
        {/* ปุ่มไปยังหน้า historu */}
        <div className="mb-6 ml-3">
          <Link href="/admin/history">
            <button className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600">
              Redemption History
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <UserTable />
        <RewardTable />
      </div>
    </div>
  );
}
