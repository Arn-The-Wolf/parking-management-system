import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Car, ParkingSquare, LogOut, Menu,
  Users, BarChart3, FileText, ChevronRight
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'parking_attendant'] },
    { to: '/parkings', icon: ParkingSquare, label: 'Parkings', roles: ['admin', 'parking_attendant'] },
    { to: '/car-entries', icon: Car, label: 'Car Entries', roles: ['admin', 'parking_attendant'] },
    { to: '/reports/outgoing', icon: FileText, label: 'Outgoing Report', roles: ['admin'] },
    { to: '/reports/entered', icon: BarChart3, label: 'Entered Report', roles: ['admin'] },
    { to: '/users', icon: Users, label: 'Users', roles: ['admin'] },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && (
          <div className="sidebar-brand">
            <div className="brand-icon">P</div>
            <div className="brand-text">
              <span className="brand-name">XWZ Parking</span>
              <span className="brand-sub">Management</span>
            </div>
          </div>
        )}
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {visibleItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={collapsed ? label : ''}
          >
            <Icon size={20} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {!collapsed && (
          <div className="user-info">
            <div className="user-avatar">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.firstName} {user?.lastName}</span>
              <span className="user-role">{user?.role?.replace('_', ' ')}</span>
            </div>
          </div>
        )}
        <button className="logout-btn" onClick={handleLogout} title="Logout">
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
