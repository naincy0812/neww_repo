import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/auth/LoginPage.tsx';
import DashboardHome from './components/dashboard/DashboardHome.tsx';
import './App.css';
import CustomersPage from './components/customers/Customer.tsx';
import ProfilePage from './components/user/ProfilePage.tsx';
import EngagementsListPage from './components/engagements/Engagements.tsx';
import EngagementDetailPage from './components/engagements/EngagementPage.tsx'; // same component reused for detail
import CustomerDetailsPage from './components/customers/CustomerDetail.tsx';

const App: React.FC = () => {

  return (
    <div className="app">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/engagements" element={<EngagementsListPage />} />
        <Route path="/engagements/:id" element={<EngagementDetailPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/customers/:id" element={<CustomerDetailsPage />} />
      </Routes>
    </div>
  );
};

export default App;