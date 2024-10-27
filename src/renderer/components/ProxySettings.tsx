import React, { useEffect, useState } from 'react';

// Interface for proxy settings
interface ProxySettingsProps {
  onSave: (proxyUrl: string, proxyPort: string) => void;
  onClose: () => void;
}

// ProxySettings component to set the proxy URL and port
export const ProxySettings = ({ onSave, onClose }: ProxySettingsProps) => {
  const [proxyUrl, setProxyUrl] = useState("");
  const [proxyPort, setProxyPort] = useState("");

  const handleSave = () => {
    onSave(proxyUrl, proxyPort);
    onClose();
  };

  useEffect(()=>{
    window.electron.getProxy().then(res => {
      setProxyUrl(res.proxyUrl || "");  // Set the default proxy URL
      setProxyPort(res.proxyPort || ""); // Set the default proxy port
    })
  }, [])


  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Set Proxy Settings</h3>
        <div className="mb-4">
          <label htmlFor="proxy-url" className="block text-sm font-medium text-gray-700 mb-1">
            Proxy URL
          </label>
          <input
            id="proxy-url"
            type="text"
            placeholder="Enter proxy URL"
            value={proxyUrl}
            onChange={(e) => setProxyUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="proxy-port" className="block text-sm font-medium text-gray-700 mb-1">
            Proxy Port
          </label>
          <input
            id="proxy-port"
            type="text"
            placeholder="Enter proxy port"
            value={proxyPort}
            onChange={(e) => setProxyPort(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
