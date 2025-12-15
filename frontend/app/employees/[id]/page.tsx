'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter, useParams } from 'next/navigation'
import { useQuery } from 'react-query'
import { employeeAPI } from '@/lib/api'
import Layout from '@/components/Layout'
import Link from 'next/link'

export default function EmployeeDetailPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const employeeId = params.id as string
  const [currentPage, setCurrentPage] = useState(1)
  const [dateRange, setDateRange] = useState({
    dateFrom: '',
    dateTo: ''
  })

  // Redirect if not authenticated
  if (!loading && !user) {
    router.push('/login')
    return null
  }

  const { data: employeeData, isLoading } = useQuery(
    ['employee-detail', employeeId, currentPage, dateRange],
    () => employeeAPI.getById(parseInt(employeeId), {
      page: currentPage,
      limit: 20,
      ...dateRange
    }),
    { enabled: !!user && !!employeeId }
  )

  if (loading || isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  if (!employeeData?.data) {
    return (
      <Layout>
        <div className="px-4 sm:px-0">
          <div className="card text-center py-12">
            <div className="text-gray-500">
              <div className="text-4xl mb-4">❌</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Employee Not Found</h3>
              <p className="text-gray-600 mb-4">
                The employee you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/employees" className="btn btn-primary">
                Back to Employees
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  const employee = employeeData.data.employee
  const stats = employeeData.data.stats
  const applications = employeeData.data.applications || []
  const pagination = employeeData.data.pagination

  const getStatusBadge = (application: any) => {
    if (application.applicationStatus?.approvedFlag === true) {
      return <span className="badge badge-success">Approved</span>
    } else if (application.applicationStatus?.approvedFlag === false && application.applicationStatus?.declineDescription) {
      return <span className="badge badge-danger">Rejected</span>
    } else {
      return <span className="badge badge-warning">Pending</span>
    }
  }

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/employees" className="text-primary-600 hover:text-primary-800 text-sm font-medium mb-2 inline-block">
                ← Back to Employees
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
              <p className="mt-1 text-sm text-gray-600">
                Employee since {new Date(employee.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-bold text-xl">
                {employee.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-primary-600 font-semibold">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalApplications}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                  <span className="text-success-600 font-semibold">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.approvedApplications}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-danger-100 rounded-lg flex items-center justify-center">
                  <span className="text-danger-600 font-semibold">❌</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.rejectedApplications}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                  <span className="text-warning-600 font-semibold">📈</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.conversionRate}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="card mb-6">
          <h3 className="text-lg font-medium mb-4">Filter Applications</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={dateRange.dateFrom}
                onChange={(e) => setDateRange(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={dateRange.dateTo}
                onChange={(e) => setDateRange(prev => ({ ...prev, dateTo: e.target.value }))}
                className="input"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setDateRange({ dateFrom: '', dateTo: '' })}
                className="btn btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium">Applications</h3>
            {pagination && (
              <div className="text-sm text-gray-600">
                {pagination.total} total applications
              </div>
            )}
          </div>

          {applications.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ARN</th>
                      <th>Customer Name</th>
                      <th>Mobile</th>
                      <th>Application Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((application: any) => (
                      <tr key={application.id}>
                        <td className="font-medium">{application.arn}</td>
                        <td>{application.customerName}</td>
                        <td>{application.mobileNo || 'N/A'}</td>
                        <td>{new Date(application.applicationDate).toLocaleDateString()}</td>
                        <td>{getStatusBadge(application)}</td>
                      </tr>
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
                    {pagination.total} applications
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
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
                <p className="text-gray-600">
                  {dateRange.dateFrom || dateRange.dateTo 
                    ? 'No applications found for the selected date range'
                    : 'This employee has no applications yet'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}