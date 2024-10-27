import React, { useEffect, useState } from 'react';
import VersionList from "./VersionList"
import VersionInstaller from "./VersionInstaller"
import { ProxySettings } from './ProxySettings';
import RecommendList from './RecommendList';

interface Version {
  version: string
  active: boolean
}

export default function WindowsNodeVersionManager() {
  const [versions, setVersions] = useState<Version[]>([
    { version: "14.17.0", active: false },
    { version: "16.13.0", active: true },
    { version: "18.12.1", active: false },
  ])
  const [showProxyModal, setShowProxyModal] = useState(false);
  const [showRecommended, setShowRecommended] = useState(false)

  useEffect(()=>{
    getInstalledVersions();
  }, [])

  const getInstalledVersions = () => {
    window.electron.getInstalledVersions().then(versions => {
      setVersions(versions)
    });
  }

  const handleVersionChange = async (selectedVersion: string) => {
    const success = await window.electron.useVersion(selectedVersion);
    if (success) {
      setVersions(
        versions.map((v) => ({
          ...v,
          active: v.version === selectedVersion,
        }))
      )
    } else {
      alert(`Failed to switch to version ${selectedVersion}`);
    }
  }

  const handleAddVersion = async (newVersion: string) => {
    const resp = await window.electron.installVersion(newVersion);
    if (resp.success) {
      if (!versions.some((v) => v.version === newVersion)) {
        setVersions([...versions, { version: newVersion, active: false }])
      }
    } else {
      alert(`${resp.message}`);
    }
  }

  const handleRemoveVersion = async (versionToRemove: string) => {
    const resp = await window.electron.removeVersion(versionToRemove);
    if (resp.success) {
      setVersions(versions.filter((v) => v.version !== versionToRemove))
    } else {
      alert(`${resp.message}`);
    }
  }

  const handleSaveProxySettings = (proxyUrl: string, proxyPort: string) => {
    window.electron.setProxy(proxyUrl, proxyPort).then(r => {console.log(r)});
  };

  const handleInstallRecommend = async (newVersion) => {
    if (!versions.some((v) => v.version === newVersion)) {
      setVersions([...versions, { version: newVersion, active: false }])
    }
    setShowRecommended(false);
  };
  const currentVersion = versions.find((v) => v.active)?.version || "None"

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 bg-gray-100 rounded-lg shadow-md border border-gray-300">
      <div className="bg-blue-600 text-white p-4 rounded-t-lg">
        <h2 className="text-2xl font-bold">Node.js Version Manager for Windows</h2>
      </div>
      <div className="bg-white p-6 rounded-b-lg shadow-inner">
        <div className="flex items-center justify-between mb-4 bg-blue-50 p-3 rounded-md border border-blue-200">
          <span className="font-medium">Current Active Version:</span>
          <span className="font-bold text-blue-600">{currentVersion}</span>
        </div>
        <VersionList
          versions={versions}
          onVersionChange={handleVersionChange}
          onVersionRemove={handleRemoveVersion}
        />
        <VersionInstaller onAddVersion={handleAddVersion} />
        <div className="mt-1 flex justify-between items-center">
          <button
            onClick={() => setShowProxyModal(true)}
            className="py-1 text-cyan-400 rounded bg-white">
            Set Proxy
          </button>

          {showProxyModal && (
            <ProxySettings
              onSave={handleSaveProxySettings}
              onClose={() => setShowProxyModal(false)}
            />
          )}

          <button  className="text-cyan-400"
                   onClick={() => setShowRecommended(true)}>
            {showRecommended ?  'Hide recommend' : "Recommended version"}
          </button>

          {showRecommended && (
            <RecommendList
              onSave={handleInstallRecommend}
              onClose={() => setShowRecommended(false)}
            />
          )}

        </div>

      </div>
    </div>
  )
}
