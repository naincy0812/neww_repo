import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import './Sidebar.css';
 
const Sidebar: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
 
  useEffect(() => {
    fetch("http://localhost:8000/auth/profile", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setUserData(data);
      })
      .catch((err) => {
        console.error("Error fetching sidebar user data:", err);
      });
  }, []);
 
  const initials = userData?.full_name
    ? userData.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : "U";
 
  const goToProfile = () => {
    navigate("/profile");
  };
 
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
 
  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Toggle Button */}
      <div className="toggle-button" onClick={toggleSidebar}>
        {isCollapsed ? <FaAngleRight /> : <FaAngleLeft />}
      </div>
 
      {/* Header */}
      <div className="sidebar-header">
        <div className="app-logo">AH</div>
        {!isCollapsed && (
          <>
            <div className="app-title">AppHelix</div>
            <div className="online-status">Online</div>
          </>
        )}
      </div>
 
      {/* Navigation */}
      <div className="nav-section">
        {[
          { path: "/dashboard", icon: "dashboard", label: "Dashboard" },
          { path: "/customers", icon: "person", label: "Customers" },
          { path: "/reports", icon: "edit", label: "Reports" },
          { path: "/invoices", icon: "receipt_long", label: "Invoices" },
          { path: "/settings", icon: "settings", label: "Settings" },
        ].map((item) => (
          <a
            key={item.path}
            href={item.path}
            className={`nav-item ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
          >
            <span className="material-icons nav-item-icon">{item.icon}</span>
            {!isCollapsed && item.label}
          </a>
        ))}
      </div>
 
      {/* User Info */}
      <div className="user-id" onClick={goToProfile}>
        <div className="user-id-avatar">{initials}</div>
        {!isCollapsed && (
          <div className="user-id-info">
            <span className="user-id-name">{userData?.full_name}</span>
            <span className="user-id-role">Admin</span>
          </div>
        )}
      </div>
    </div>
  );
};
 
export default Sidebar;