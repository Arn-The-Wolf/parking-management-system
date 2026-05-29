import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { StatCard } from '../components/UI/Card';
import { Car, ParkingSquare, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/reports/dashboard').then((r) => r.data.data),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, <strong>{user?.firstName}</strong>! Here's what's happening today.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={ParkingSquare}
          label="Total Parkings"
          value={data?.totalParkings ?? 0}
          color="primary"
        />
        <StatCard
          icon={Car}
          label="Cars Currently Parked"
          value={data?.totalCarsParked ?? 0}
          color="warning"
        />
        <StatCard
          icon={Activity}
          label="Today's Entries"
          value={data?.todayEntries ?? 0}
          color="secondary"
        />
        <StatCard
          icon={DollarSign}
          label="Today's Revenue (RWF)"
          value={`${parseFloat(data?.todayRevenue || 0).toLocaleString()}`}
          color="success"
        />
      </div>

      <div className="dashboard-grid">
        <div className="parking-status-card">
          <div className="section-header">
            <h3>Parking Locations</h3>
            <span className="badge badge-primary">{data?.parkings?.length} locations</span>
          </div>
          <div className="parking-list">
            {data?.parkings?.map((p) => {
              const occupancy = ((p.totalSpaces - p.availableSpaces) / p.totalSpaces) * 100;
              const statusColor = occupancy >= 90 ? 'danger' : occupancy >= 70 ? 'warning' : 'success';
              return (
                <div key={p.id} className="parking-item">
                  <div className="parking-item-info">
                    <div className="parking-item-header">
                      <span className="parking-code">{p.code}</span>
                      <span className={`badge badge-${statusColor}`}>
                        {occupancy >= 90 ? 'Almost Full' : occupancy >= 70 ? 'Busy' : 'Available'}
                      </span>
                    </div>
                    <p className="parking-name">{p.name}</p>
                    <p className="parking-location">{p.location}</p>
                  </div>
                  <div className="parking-spaces">
                    <div className="spaces-bar">
                      <div
                        className={`spaces-fill fill-${statusColor}`}
                        style={{ width: `${occupancy}%` }}
                      />
                    </div>
                    <div className="spaces-text">
                      <span className="spaces-available">{p.availableSpaces} free</span>
                      <span className="spaces-total">/ {p.totalSpaces}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="quick-stats-card">
          <div className="section-header">
            <h3>Quick Stats</h3>
          </div>
          <div className="quick-stats-list">
            <div className="quick-stat-item">
              <div className="qs-icon qs-blue"><Car size={20} /></div>
              <div className="qs-info">
                <span className="qs-label">Total Cars Exited</span>
                <span className="qs-value">{data?.totalCarsExited ?? 0}</span>
              </div>
            </div>
            <div className="quick-stat-item">
              <div className="qs-icon qs-green"><TrendingUp size={20} /></div>
              <div className="qs-info">
                <span className="qs-label">All-Time Revenue (RWF)</span>
                <span className="qs-value">
                  {parseFloat(data?.totalRevenue || 0).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="quick-stat-item">
              <div className="qs-icon qs-purple"><ParkingSquare size={20} /></div>
              <div className="qs-info">
                <span className="qs-label">Active Parkings</span>
                <span className="qs-value">{data?.totalParkings ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
