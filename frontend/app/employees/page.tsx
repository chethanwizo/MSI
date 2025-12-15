'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useQuery } from 'react-query'
import { employeeAPI } from '@/lib/api'
import Layout from '@/components/Layout'
import Link from 'next/link'

export default function EmployeesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)

  // Redirect if not authenticated
  if (!loading && !user) {
    router.push('/login')
    return null
  }

  const { data: employeesData, isLoading } = useQuery(
    ['employees', currentPage],
    () => employeeAPI.getAll(currentPage, 20),
    { enabled: !!user }
  )

  const { data: topPerformers } = useQuery(
    ['top-performers'],
    () => employeeAPI.getTopPerformers({ metric: 'conversion', limit: 5 }),
    { enabled: !!user }
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

  const employees = employeesData?.data?.employees || []
  const pagination = employeesData?.data?.pagination
  const performers = topPerformers?.data || []

  return (
    <Layout>
      <div className="space-y-8">
        {/* Beautiful Header */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-white text-2xl">👥</span>
            </div>
            <div className="text-left">
              <h1 className="section-header">Employee Management</h1>
              <p className="section-subtitle">
                Performance insights and team analytics
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
            <span>Team Performance • Real-time Analytics</span>
          </div>
        </div>

        {/* Beautiful Top Performers */}
        {performers.length > 0 && (
          <div className="card-gradient">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">🏆</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Top Performers</h3>
                <p className="text-sm text-slate-600">Leading team members by conversion rate</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {performers.map((performer: any, index: number) => (
                <div key={performer.employeeId} className="relative">
                  <div className={`p-6 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300 ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-100 via-yellow-200 to-amber-200 border-2 border-yellow-400' :
                    index === 1 ? 'bg-gradient-to-br from-gray-100 via-gray-200 to-slate-200 border-2 border-gray-400' :
                    index === 2 ? 'bg-gradient-to-br from-orange-100 via-orange-200 to-amber-200 border-2 border-orange-400' :
                    'bg-gradient-to-br from-blue-100 via-blue-200 to-indigo-200 border-2 border-blue-400'
                  }`}>
                    <div className="text-center">
                      <div className="text-4xl mb-3">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐'}
                      </div>
                      <div className="font-bold text-slate-900 text-lg mb-2">{performer.employeeName}</div>
                      <div className="text-sm font-bold text-emerald-700 mb-1">
                        {performer.conversionRate}% conversion
                      </div>
                      <div className="text-xs font-semibold text-slate-600">
                        {performer.totalApplications} applications
                      </div>
                    </div>
                    {index < 3 && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-xs font-bold">#{index + 1}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Beautiful Employees List */}
        <div className="card-gradient">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">📋</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">All Employees</h3>
                <p className="text-sm text-slate-600">Complete team directory</p>
              </div>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl">
              <span className="text-sm font-bold text-blue-800">
                Total: {pagination?.total || 0} employees
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="text-left">👤 Employee Name</th>
                  <th className="text-center">📊 Applications</th>
                  <th className="text-center">📅 Joined Date</th>
                  <th className="text-center">🔍 Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee: any, index: number) => (
                  <tr key={employee.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50">
                    <td>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-lg">
                            {employee.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-lg">
                            {employee.name}
                          </div>
                          <div className="text-sm text-slate-600 font-medium">
                            Team Member #{index + 1}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl border border-emerald-300">
                        <span className="text-emerald-800 font-bold">
                          {employee._count.applications}
                        </span>
                        <span className="text-emerald-600 text-xs font-semibold ml-1">apps</span>
                      </div>
                    </td>
                    <td className="text-center font-semibold text-slate-700">
                      {new Date(employee.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-center">
                      <Link
                        href={`/employees/${employee.id}`}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <span className="mr-2">👁️</span>
                        <span>View Details</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Beautiful Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-8 p-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl">
              <div className="text-sm font-semibold text-slate-700 mb-4 sm:mb-0">
                <span className="inline-flex items-center space-x-2">
                  <span>👥</span>
                  <span>
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    <span className="font-bold text-purple-700">{pagination.total}</span> employees
                  </span>
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={pagination.page <= 1}
                  className="px-4 py-2 bg-white text-slate-700 font-semibold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                >
                  <div className="flex items-center space-x-2">
                    <span>⬅️</span>
                    <span>Previous</span>
                  </div>
                </button>
                <div className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-xl shadow-lg">
                  Page {pagination.page} of {pagination.pages}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                  disabled={pagination.page >= pagination.pages}
                  className="px-4 py-2 bg-white text-slate-700 font-semibold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                >
                  <div className="flex items-center space-x-2">
                    <span>Next</span>
                    <span>➡️</span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Beautiful Empty State */}
        {employees.length === 0 && (
          <div className="card-gradient text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <span className="text-white text-3xl">👥</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">No Employees Found</h3>
              <p className="text-slate-600 font-medium mb-6">
                Employees will automatically appear here after uploading MIS files. Each unique employee name in your MIS data creates a new employee record.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-white/60 rounded-xl">
                  <div className="font-bold text-blue-700">📤 Upload MIS</div>
                  <div className="text-slate-600">Add employees</div>
                </div>
                <div className="p-3 bg-white/60 rounded-xl">
                  <div className="font-bold text-emerald-700">📊 Auto-sync</div>
                  <div className="text-slate-600">Real-time updates</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}