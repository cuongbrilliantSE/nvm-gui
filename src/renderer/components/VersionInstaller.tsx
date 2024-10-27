import React, { useState } from "react";
import { Download, Loader } from "lucide-react"; // Add Loader icon for the loading state

interface VersionInstallerProps {
  onAddVersion: (version: string) => void;
}

// Regular expression for validating version strings (SemVer)
const versionRegex = /^(\d+)\.(\d+)\.(\d+)$/;

export default function VersionInstaller({ onAddVersion }: VersionInstallerProps) {
  const [newVersion, setNewVersion] = useState("");
  const [isValid, setIsValid] = useState(true);  // To track if the version is valid
  const [isLoading, setIsLoading] = useState(false);  // To track loading state

  const handleAddVersion = async () => {
    // Only proceed if the version is valid
    if (newVersion && isValid) {
      setIsLoading(true); // Set loading to true when installation starts
      await onAddVersion(newVersion); // Simulate adding version (you can replace with actual logic)
      setNewVersion("");
      setIsLoading(false); // Reset loading state when done
    }
  };

  const handleVersionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setNewVersion(inputValue);

    // Validate the version format using the regex
    if (versionRegex.test(inputValue)) {
      setIsValid(true); // Version is valid
    } else {
      setIsValid(false); // Version is invalid
    }
  };

  return (
    <div className={`mt-6 flex space-x-2 ${isValid ? "items-end" : "items-center"}`}>
      <div className="flex-grow">
        <label htmlFor="new-version" className="block text-sm font-medium text-gray-700 mb-1">
          Add New Version
        </label>
        <input
          id="new-version"
          type="text"
          placeholder="Enter version number (e.g., 20.0.0)"
          value={newVersion}
          onChange={handleVersionChange}
          className={`w-full px-3 py-2 border ${isValid ? "border-gray-300" : "border-red-500"} rounded-md shadow-sm focus:outline-none focus:ring-1 ${isValid ? "focus:ring-blue-500 focus:border-blue-500" : "focus:ring-red-500 focus:border-red-500"}`}
        />
        {!isValid && (
          <span className="text-red-500 text-sm mt-1">Invalid version format. Please use x.x.x format.</span>
        )}
      </div>
      <button
        onClick={handleAddVersion}
        className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center ${(!isValid || isLoading) ? "opacity-50 cursor-not-allowed" : ""}`}
        disabled={!isValid || isLoading} // Disable button if invalid or loading
      >
        {isLoading ? (
          <Loader className="w-4 h-4 mr-2 animate-spin" /> // Show loading spinner
        ) : (
          <Download className="w-4 h-4 mr-2" />
        )}
        {isLoading ? "Installing..." : "Install"}
      </button>
    </div>
  );
}
