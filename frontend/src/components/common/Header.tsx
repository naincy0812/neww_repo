import React from 'react';
import './Header.css';
import { FaPlus } from 'react-icons/fa';
import Profile from './Profile';

interface HeaderProps {
  title: string;
  onNewCustomerClick: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onNewCustomerClick }) => {
  return (
    <header className="dashboard-header">
      <h1 className="dashboard-title">{title}</h1>
      <div className="header-actions">
        <button className="header-btn" onClick={onNewCustomerClick}>
          <FaPlus /> New Customer
        </button>
        <Profile />
      </div>
    </header>
  );
};

export default Header;
