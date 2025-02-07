import UserTable from "@/components/UserTable";
import RewardTable from "@/components/RewardTable";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center text-green-700">
        Admin Dashboard
      </h1>

      <div className="flex flex-wrap justify-center md:justify-start gap-4 p-4">
        {/* Button to Manage Rewards */}
        <Link href="/admin/rewards">
          <button className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600 transition-all duration-300">
            Manage Rewards
          </button>
        </Link>
        {/* Button to Redemption History */}
        <Link href="/admin/history">
          <button className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600 transition-all duration-300">
            Redemption History
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User Table Section */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
          <h2 className="text-xl font-semibold bg-green-500 text-white px-4 py-2">
            User Management
          </h2>
          <div className="p-4">
            <UserTable />
          </div>
        </div>

        {/* Reward Table Section */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
          <h2 className="text-xl font-semibold bg-green-500 text-white px-4 py-2">
            Reward Management
          </h2>
          <div className="p-4">
            <RewardTable />
          </div>
        </div>
      </div>
    </div>
  );
}
