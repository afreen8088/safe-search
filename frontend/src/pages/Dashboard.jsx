import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import UploadPage from "../components/UploadPage";
import SearchPage from "../components/SearchPage";
import MetricsPage from "../components/MetricsPage";
import StoragePage from "../components/StoragePage";

export default function Dashboard({ role, logout, auditor, privateKey, showToast }) {
  const roleType = typeof role === "string" ? role : role?.type ?? null;
  const [activeTab, setActiveTab] = useState("upload");

  // Set default tab based on role
  useEffect(() => {
    if (roleType === "external") {
      setActiveTab("search");
    } else {
      setActiveTab("upload");
    }
  }, [roleType]);

  return (
    <div className="min-h-screen text-slate-100 flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        role={roleType}
        logout={logout}
      />

      {/* MAIN CONTAINER */}
      <main className="flex-grow pb-12">
        {activeTab === "upload" && roleType === "internal" && (
          <UploadPage showToast={showToast} />
        )}

        {activeTab === "search" && (
          <SearchPage
            role={roleType}
            auditor={auditor}
            privateKey={privateKey}
            showToast={showToast}
          />
        )}

        {activeTab === "storage" && roleType === "internal" && (
          <StoragePage showToast={showToast} />
        )}

        {activeTab === "metrics" && (
          <MetricsPage role={roleType} showToast={showToast} />
        )}
      </main>
    </div>
  );
}
