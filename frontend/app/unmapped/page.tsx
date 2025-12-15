'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useQuery } from 'react-query'
import { searchAPI } from '@/lib/api'
import Layout from '@/components/Layout'
import dynamic from 'next/dynamic'

const ReactJson = dynamic(() => import('@microlink/react-json-view'), {
  ssr: false,
  loading: () => <div className="text-sm text-gray-500">Loading JSON viewer...</div>
})

export default function UnmappedPage() {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  // Redirect if not authenticated or not admin
  if (!loading && (!user || !isAdmin)) {
    router.push('/dashboard')
    return null
  }

  const { data: unmappedData, isLoading } = useQuery(
    ['unmapped-records', currentPage],
    () => searchAPI.getUnmapped(currentPage, 20),
    { enabled: !!user && isAdmin }
  )

  const toggleRowExpansion = (id: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  if (loading || isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  const records = unmappedData?.data?.records || []
  const pagination = unmappedData?.data?.pagination

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Unmapped Records</h1>
          <p className="mt-1 text-sm text-gray-600">
            Bank dump records that could not be mapped to existing ARNs
          </p>
        </div>

        {/* Info Alert */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                About Unmapped Records
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  These are bank dump records where the APPL_REF could not be matched to any existing ARN from MIS data.
                  This usually happens when:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>The corresponding MIS data hasn't been uploaded yet</li>
                  <li>There's a mismatch in ARN/APPL_REF format</li>
                  <li>The bank dump contains records not present in MIS</li>
                </ul>
                <p className="mt-2">
                  <strong>Solution:</strong> Upload the corresponding MIS file first, then re-upload the bank dump file.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Unmapped Records */}
        {records.length > 0 ? (
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">
                Unmapped Records ({pagination?.total || 0} total)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>APPL_REF</th>
                    <th>Customer Name</th>
                    <th>Upload Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record: any) => (
                    <>
                      <tr key={record.id}>
                        <td className="font-medium text-danger-600">
                          {record.applRef}
                        </td>
                        <td>
                          {record.rawJson?.FULL_NAME || 
                           record.rawJson?.['CUSTOMER NAME'] || 
                           'N/A'}
                        </td>
                        <td className="text-gray-600">
                          {new Date(record.uploadDate).toLocaleDateString()}
                        </td>
                        <td>
                          <button
                            onClick={() => toggleRowExpansion(record.id)}
                            className="text-primary-600 hover:text-primary-800 text-sm"
                          >
                            {expandedRows.has(record.id) ? 'Hide Data' : 'Show Data'}
                          </button>
                        </td>
                      </tr>
                      
                      {expandedRows.has(record.id) && (
                        <tr>
                          <td colSpan={4} className="bg-gray-50 p-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-3">
                                Complete Bank Dump Data for APPL_REF: {record.applRef}
                              </h4>
                              <div className="bg-white border rounded-lg p-4 max-h-96 overflow-auto">
                                <ReactJson
                                  src={record.rawJson}
                                  theme="rjv-default"
                                  collapsed={false}
                                  displayDataTypes={false}
                                  displayObjectSize={false}
                                  name={false}
                                  enableClipboard={true}
                                />
                              </div>
                              <div className="mt-3 text-sm text-gray-600">
                                <strong>Upload Date:</strong> {new Date(record.uploadDate).toLocaleString()}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} unmapped records
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={pagination.page <= 1}
                    className="btn btn-secondary disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2 text-sm text-gray-700">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                    disabled={pagination.page >= pagination.pages}
                    className="btn btn-secondary disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="card text-center py-12">
            <div className="text-gray-500">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No unmapped records
              </h3>
              <p className="text-gray-600">
                All bank dump records have been successfully mapped to existing ARNs
              </p>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="card mt-8">
          <h3 className="text-lg font-medium mb-4">How to Resolve Unmapped Records</h3>
          <div className="space-y-4 text-sm text-gray-700">
            <div className="flex items-start">
              <span className="text-primary-600 font-semibold mr-2">1.</span>
              <div>
                <strong>Check MIS Data:</strong> Ensure the corresponding MIS file containing the ARN has been uploaded first.
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-primary-600 font-semibold mr-2">2.</span>
              <div>
                <strong>Verify ARN Format:</strong> Check if the APPL_REF in bank dump matches the ARN NO format in MIS.
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-primary-600 font-semibold mr-2">3.</span>
              <div>
                <strong>Re-upload:</strong> After uploading the correct MIS file, re-upload the bank dump file to establish mapping.
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-primary-600 font-semibold mr-2">4.</span>
              <div>
                <strong>Data Integrity:</strong> All unmapped records are preserved and can be mapped later when the corresponding MIS data becomes available.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}