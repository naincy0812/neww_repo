import React, { useState, useEffect } from 'react';
import { FiBell } from "react-icons/fi";
import './Profile.css';
import { useNavigate } from 'react-router-dom';
import { logout as logoutApi } from '../../services/authService';


const Profile: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const navigate = useNavigate();

  const toggleMenu = () => setShowMenu(!showMenu);
  const toggleNotifications = () => setShowNotification(!showNotification);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.error('Logout failed', err);
    }
    // Clear any client-side cached data
    localStorage.clear();
    sessionStorage.clear();
    // Redirect to login or landing page
    window.location.href = '/';
  };

  const goToProfile = () => {
    setShowMenu(false);
    navigate('/profile');  // Navigate to your profile page in React
  };

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/profile`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setUserData(data.user ?? data))
      .catch((err) => console.error("Failed to fetch user:", err));
  }, []);


  const initial = userData?.full_name?.charAt(0).toUpperCase()
    ?? userData?.username?.charAt(0).toUpperCase()
    ?? '?';

  return (
    <>
      <div className="profile-wrapper">
        <div className="notification-icon" onClick={toggleNotifications}>
          <FiBell size={20} />
          <span
            className="notification-badge"
            style={{ display: showNotification ? 'block' : 'none' }}
          />
        </div>

        <div className="user-profile" onClick={toggleMenu} style={{ cursor: 'pointer' }}>
          {initial}
          <div className={`profile-dropdown ${showMenu ? 'active' : ''}`}>
            <div className="profile-menu-item" onClick={goToProfile}>Profile</div>
            <div className="profile-menu-item" onClick={() => alert('Settings clicked')}>Settings</div>
            <div className="profile-menu-item logout" onClick={handleLogout}>Logout</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
