import { useState } from "react";
import CategoryManager from "./CategoryManager";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("categories");

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Admin Dashboard
        </h1>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === "categories"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Manage Categories
          </button>
        </div>

        <div>{activeTab === "categories" && <CategoryManager />}</div>
      </div>
    </div>
  );
}
