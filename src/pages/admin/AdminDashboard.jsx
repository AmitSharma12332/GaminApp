import { lazy } from "react";

const Content = lazy(() => import("./Content"));

const AdminDashboard = () => {
  return (
    <div className="flex h-screen pt-12">
      <Content activeTab={"dashboard"} />
    </div>
  );
};

export default AdminDashboard;
