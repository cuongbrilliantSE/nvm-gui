import React from "react"
import { Check, Trash2 } from "lucide-react"

interface Version {
  version: string
  active: boolean
}

interface VersionListProps {
  versions: Version[]
  onVersionChange: (version: string) => void
  onVersionRemove: (version: string) => void
}

export default function VersionList({ versions, onVersionChange, onVersionRemove }: VersionListProps) {
  return (
    <table className="w-full">
      <thead>
      <tr className="bg-gray-50 text-left">
        <th className="p-2 font-semibold text-gray-600">Version</th>
        <th className="p-2 font-semibold text-gray-600">Status</th>
        <th className="p-2 font-semibold text-gray-600 text-right">Actions</th>
      </tr>
      </thead>
      <tbody>
      {versions.map((v) => (
        <tr key={v.version} className="border-b border-gray-200">
          <td className="p-2 font-medium">{v.version}</td>
          <td className="p-2">
            {v.active ? (
              <span className="flex items-center text-green-600">
                  <Check className="w-4 h-4 mr-2" />
                  Active
                </span>
            ) : (
              <button
                onClick={() => onVersionChange(v.version)}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Set Active
              </button>
            )}
          </td>
          <td className="p-2 text-right">
            <button
              onClick={() => onVersionRemove(v.version)}
              className="p-1 text-red-500 hover:bg-red-50 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label={`Remove version ${v.version}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </td>
        </tr>
      ))}
      </tbody>
    </table>
  )
}
