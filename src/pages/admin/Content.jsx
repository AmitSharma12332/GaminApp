/* eslint-disable react/prop-types */
import { lazy } from "react";

const Allrequests = lazy(() => import("./Allrequests"));
const UserManagement = lazy(() => import("./UserManagement"));
const WebsiteManagement = lazy(() => import("./WebsiteManagement"));

const tabContent = {
  dashboard: (
    <div className="min-h-screen">
      <main className="">
        <WebsiteManagement />
      </main>
    </div>
  ),
  users: (
    <div className="min-h-screen">
      <main className="">
        <UserManagement />
      </main>
    </div>
  ),
  requests: (
    <div className="min-h-screen">
      <main className="">
        <Allrequests />
      </main>
    </div>
  ),
  settings: (
    <div>
      <h2 className="text-xl font-semibold mb-4">System Settings</h2>
      <p>Configure your application settings and preferences.</p>
    </div>
  ),
};

const Content = ({ activeTab }) => {
  return (
    <div className="flex-1 bg-gradient-to-b from-gray-900 to-gray-950 h-screen">
      <div className=" text-white rounded-lg shadow lg:pt-6 pt-24 p-6">
        {tabContent[activeTab]}
      </div>
    </div>
  );
};

export default Content;
