import { lazy, useState } from "react";

const Content = lazy(() => import("./Content"));
const Sidebar = lazy(() => import("./Sidebar"));

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="flex h-screen pt-12">
      <Content activeTab={activeTab} />
    </div>
  );
};

export default AdminDashboard;
