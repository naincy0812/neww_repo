import React, { useEffect, useState } from 'react';
import Sidebar from '../common/Sidebar';  // your existing Sidebar
import Profile from '../common/Profile';  // your existing Profile dropdown
import './ProfilePage.css';               // CSS for layout & styles

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("http://localhost:8000/auth/profile", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error("Error fetching user profile:", err));
  }, []);

  if (!user) return <p>Loading user details...</p>;
  return (
    <div className="page-container">
      <Sidebar />

    
       

        <section className="profile-container">
          <p><strong>Full Name:</strong> {user.full_name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Azure ID:</strong> {user.azure_id}</p>
          <p><strong>Roles:</strong> {user.roles?.join(', ')}</p>
          <p><strong>Last Login:</strong> {new Date(user.last_login).toLocaleString()}</p>
        </section>
     
    </div>
  );
};

export default ProfilePage;
