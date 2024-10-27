import React, { useEffect, useState } from 'react';
import { CircleX, Download, Loader } from 'lucide-react';
import CustomDropdown from './CustomDropdown';

interface Version {
  npm: string;
  version: string;
  active: boolean;
}

interface VersionListProps {
  onSave: (version: string) => void;
  onClose: () => void;
}

export default function RecommendList({ onSave, onClose }: VersionListProps) {
  const [loadingVersion, setLoadingVersion] = useState<string | null>(null); // Track the version being installed
  const [versions, setVersions] = useState<Version[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Set how many items you want to display per page

  useEffect(() => {
    window.electron.recommendVersions().then((resp) => {
      if (resp.success) {
        setVersions(resp.data); // Set the versions data when fetched
      }
    });
  }, []);

  // Calculate the current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVersions = versions.slice(indexOfFirstItem, indexOfLastItem);

  // Total number of pages
  const totalPages = Math.ceil(versions.length / itemsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleAddVersion = async (newVersion: string) => {
    setLoadingVersion(newVersion); // Set loading for the specific version
    const resp = await window.electron.installVersion(newVersion);
    if (resp.success) {
      onSave(newVersion);
    } else {
      alert(`${resp.message}`);
    }
    setLoadingVersion(null); // Reset loading state
  };

  // Function to handle page selection from the dropdown
  const handlePageChange = (page: number) => {
    setCurrentPage(Number(page));
  };

  // const handlePageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   setCurrentPage(Number(e.target.value));
  // };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="relative bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Recommend Version</h3>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <CircleX className="w-6 h-6 mr-2" />
        </button>

        <table className="w-full">
          <thead>
          <tr className="bg-gray-50 text-left">
            <th className="p-2 font-semibold text-gray-600">Version</th>
            <th className="p-2 font-semibold text-gray-600">Npm</th>
            <th className="p-2 font-semibold text-gray-600" style={{ textAlign: 'center' }}>Actions</th>
          </tr>
          </thead>
          <tbody>
          {currentVersions.map((v) => (
            <tr key={v.version} className="border-b border-gray-200">
              <td className="p-2 font-medium">{v.version}</td>
              <td className="p-2 font-medium">{v.npm}</td>
              <td className="p-2 flex justify-center">
                <button
                  onClick={() => handleAddVersion(v.version)}
                  className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center ${loadingVersion === v.version ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={loadingVersion === v.version}
                >
                  {loadingVersion === v.version ? (
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  {loadingVersion === v.version ? 'Installing...' : 'Install'}
                </button>
              </td>
            </tr>
          ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 focus:outline-none disabled:opacity-50"
          >
            Previous
          </button>

          {/*/!* Page Dropdown *!/*/}
          {/*<span className="text-gray-700">*/}
          {/*  Page*/}
          {/*  &nbsp;*/}
          {/*  <select*/}
          {/*    value={currentPage}*/}
          {/*    onChange={handlePageChange}*/}
          {/*    className="ml-2 px-2 py-1 border border-gray-300 rounded"*/}
          {/*    style={{ maxHeight: '200px'}}*/}
          {/*    >*/}
          {/*    {Array.from({ length: totalPages }, (_, i) => (*/}
          {/*      <option key={i + 1} value={i + 1}>*/}
          {/*        {i + 1}*/}
          {/*      </option>*/}
          {/*    ))}*/}
          {/*  </select>*/}
          {/*  &nbsp;*/}
          {/*  of {totalPages}*/}
          {/*</span>*/}
          <CustomDropdown totalPages={totalPages} currentPage={currentPage} handlePageChange={handlePageChange} />

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 focus:outline-none disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
