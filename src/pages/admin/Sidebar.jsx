/* eslint-disable react/prop-types */
import { Menu } from 'lucide-react'
import { useState } from "react"
import { Link } from "react-router-dom"

const menuItems = [
  { id: "dashboard", icon: "📊", label: "Dashboard", href: "/admin" },
  { id: "users", icon: "👥", label: "Users", href: "/admin/usermanagement" },
  { id: "requests", icon: "🛍️", label: "All Bets", href: "/admin/requests" },
  { id: "settings", icon: "⚙️", label: "Settings", href: "/admin/management" },
]

const Sidebar = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev)
  }

  return (
    <>
      {/* Hamburger button for mobile */}
      <button
        className="fixed top-32 left-2 z-20 lg:hidden bg-[rgb(var(--color-background))] text-[rgb(var(--color-text-primary))] p-2 rounded-lg border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-background-hover))] transition-colors"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed lg:top-0 bg-[rgb(var(--color-background))] border-r border-[rgb(var(--color-border))] left-0 z-30 w-64 h-full transition-transform duration-300 ease-in-out transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0 shadow-lg`}
      >
        <div className="p-6 border-b border-[rgb(var(--color-border))]">
          <h2 className="text-2xl font-bold text-[rgb(var(--color-primary))]">Admin Panel</h2>
        </div>
        
        <nav className="p-2">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.href}
                  onClick={() => {
                    setActiveTab(item.id)
                    setIsOpen(false)
                  }}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? "bg-[rgb(var(--color-primary))] text-white"
                      : "text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-background-hover))]"
                  }`}
                >
                  <span className="mr-3 text-lg" role="img" aria-label={item.label}>
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Overlay to close sidebar on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  )
}

export default Sidebar
