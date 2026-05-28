import React from 'react';
import './Card.css';

export const Card = ({ children, className = '', style }) => (
  <div className={`card ${className}`} style={style}>{children}</div>
);

export const CardHeader = ({ children, className = '' }) => (
  <div className={`card-header ${className}`}>{children}</div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`card-body ${className}`}>{children}</div>
);

export const StatCard = ({ icon: Icon, label, value, color = 'primary', trend }) => (
  <div className={`stat-card stat-card-${color}`}>
    <div className="stat-icon">
      <Icon size={24} />
    </div>
    <div className="stat-content">
      <p className="stat-label">{label}</p>
      <h3 className="stat-value">{value}</h3>
      {trend && <p className="stat-trend">{trend}</p>}
    </div>
  </div>
);
