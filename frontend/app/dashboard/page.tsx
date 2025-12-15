'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useQuery } from 'react-query'
import { dashboardAPI } from '@/lib/api'
import Layout from '@/components/Layout'
import { useState } from 'react'
import { format } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#6b7280']

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [dateRange, setDateRange] = useState({
    dateFrom: '',
    dateTo: ''
  })

  // Redirect if not authenticated
  if (!loading && !user) {
    router.push('/login')
    return null
  }

  const { data: metrics, isLoading: metricsLoading } = useQuery(
    ['dashboard-metrics', dateRange],
    () => dashboardAPI.getMetrics(dateRange),
    { enabled: !!user }
  )

  const { data: employeePerformance } = useQuery(
    ['employee-performance', dateRange],
    () => dashboardAPI.getEmployeePerformance({ ...dateRange, limit: 10 }),
    { enabled: !!user }
  )

  const { data: rejectionAnalysis } = useQuery(
    ['rejection-analysis', dateRange],
    () => dashboardAPI.getRejectionAnalysis(dateRange),
    { enabled: !!user }
  )

  const { data: trends } = useQuery(
    ['trends'],
    () => dashboardAPI.getTrends(30),
    { enabled: !!user }
  )

  const { data: kycFunnel } = useQuery(
    ['kyc-funnel', dateRange],
    () => dashboardAPI.getKYCFunnel(dateRange),
    { enabled: !!user }
  )

  if (loading || metricsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  const metricsData = metrics?.data
  const performanceData = employeePerformance?.data || []
  const rejectionData = rejectionAnalysis?.data
  const trendsData = trends?.data || []
  const kycData = kycFunnel?.data

  // Prepare chart data
  const statusPieData = [
    { name: 'Approved', value: metricsData?.approvedApplications || 0, color: '#22c55e' },
    { name: 'Rejected', value: metricsData?.rejectedApplications || 0, color: '#ef4444' },
    { name: 'Pending', value: metricsData?.pendingApplications || 0, color: '#f59e0b' },
  ]

  const rejectionReasonsData = rejectionData?.rejectionReasons?.slice(0, 5) || []

  return (
    <Layout>
      <div className="space-y-8">
        {/* Beautiful Header */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-white text-2xl">📊</span>
            </div>
            <div className="text-left">
              <h1 className="section-header">Analytics Dashboard</h1>
              <p className="section-subtitle">
                Real-time insights into MIS and Bank Dump analytics
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>Live Data • Last updated {new Date().toLocaleString()}</span>
          </div>
        </div>

        {/* Beautiful Date Range Filter */}
        <div className="card-gradient">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">📅</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Date Range Filter</h3>
                <p className="text-sm text-slate-600">Filter analytics by date range</p>
              </div>
            </div>
            <button
              onClick={() => setDateRange({ dateFrom: '', dateTo: '' })}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 bg-white/60 hover:bg-white/80 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Clear Filters
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">
                📅 From Date
              </label>
              <input
                type="date"
                value={dateRange.dateFrom}
                onChange={(e) => setDateRange(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">
                📅 To Date
              </label>
              <input
                type="date"
                value={dateRange.dateTo}
                onChange={(e) => setDateRange(prev => ({ ...prev, dateTo: e.target.value }))}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Beautiful Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="metric-card bg-gradient-to-br from-blue-50 via-blue-100/50 to-blue-200/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">📋</span>
                  <p className="text-sm font-bold text-blue-700">Total Applications</p>
                </div>
                <p className="text-4xl font-black text-blue-900">
                  {metricsData?.totalApplications?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-blue-600 font-medium mt-1">All time records</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-white text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="metric-card bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-emerald-200/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">✅</span>
                  <p className="text-sm font-bold text-emerald-700">Approved</p>
                </div>
                <p className="text-4xl font-black text-emerald-900">
                  {metricsData?.approvedApplications?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-emerald-600 font-medium mt-1">Successful applications</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-white text-2xl">🎉</span>
              </div>
            </div>
          </div>

          <div className="metric-card bg-gradient-to-br from-red-50 via-red-100/50 to-red-200/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">❌</span>
                  <p className="text-sm font-bold text-red-700">Rejected</p>
                </div>
                <p className="text-4xl font-black text-red-900">
                  {metricsData?.rejectedApplications?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-red-600 font-medium mt-1">Declined applications</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-white text-2xl">🚫</span>
              </div>
            </div>
          </div>

          <div className="metric-card bg-gradient-to-br from-purple-50 via-purple-100/50 to-purple-200/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">📈</span>
                  <p className="text-sm font-bold text-purple-700">Approval Rate</p>
                </div>
                <p className="text-4xl font-black text-purple-900">
                  {metricsData?.approvalRate || 0}%
                </p>
                <p className="text-xs text-purple-600 font-medium mt-1">Success percentage</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-white text-2xl">🎯</span>
              </div>
            </div>
          </div>
        </div>

        {/* Beautiful Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Application Status Distribution */}
          <div className="card-gradient">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">🥧</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Application Status</h3>
                  <p className="text-sm text-slate-600">Distribution overview</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full">
                <span className="text-xs font-bold text-blue-800">Live Data</span>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="#fff"
                    strokeWidth={3}
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Rejection Reasons */}
          <div className="card-gradient">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">📊</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Rejection Analysis</h3>
                  <p className="text-sm text-slate-600">Top 5 reasons</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-gradient-to-r from-red-100 to-pink-100 rounded-full">
                <span className="text-xs font-bold text-red-800">Insights</span>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rejectionReasonsData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="reason" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={11}
                    stroke="#64748b"
                    fontWeight="600"
                  />
                  <YAxis stroke="#64748b" fontWeight="600" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="url(#redGradient)" 
                    radius={[8, 8, 0, 0]}
                    stroke="#ef4444"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#dc2626" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Beautiful Employee Performance */}
        <div className="card-gradient">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">👥</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Top Employee Performance</h3>
                <p className="text-sm text-slate-600">Leading performers by conversion rate</p>
              </div>
            </div>
            <div className="px-3 py-1 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full">
              <span className="text-xs font-bold text-purple-800">Top 10</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="text-left">🏆 Employee</th>
                  <th className="text-center">📊 Total</th>
                  <th className="text-center">✅ Approved</th>
                  <th className="text-center">❌ Rejected</th>
                  <th className="text-center">⏳ Pending</th>
                  <th className="text-center">📈 Rate</th>
                </tr>
              </thead>
              <tbody>
                {performanceData.slice(0, 10).map((emp: any, index: number) => (
                  <tr key={emp.employeeId} className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-indigo-50/50">
                    <td className="font-bold">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>
                        <span>{emp.employeeName}</span>
                      </div>
                    </td>
                    <td className="text-center font-bold text-slate-900">{emp.totalApplications}</td>
                    <td className="text-center">
                      <span className="badge badge-success font-bold">
                        {emp.approvedApplications}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="badge badge-danger font-bold">
                        {emp.rejectedApplications}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="badge badge-warning font-bold">
                        {emp.pendingApplications}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="font-black text-lg bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        {emp.conversionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Beautiful Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card-gradient bg-gradient-to-br from-emerald-50 via-emerald-100/30 to-teal-100/30">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">🔗</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Data Mapping</h3>
                <p className="text-sm text-slate-600">Record linkage status</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                <span className="font-semibold text-slate-700">✅ Mapped Records:</span>
                <span className="font-black text-xl text-emerald-700">
                  {metricsData?.mappedDumpRecords || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                <span className="font-semibold text-slate-700">⚠️ Unmapped Records:</span>
                <span className="font-black text-xl text-red-700">
                  {metricsData?.unmappedDumpRecords || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="card-gradient bg-gradient-to-br from-blue-50 via-blue-100/30 to-indigo-100/30">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">⚙️</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">System Overview</h3>
                <p className="text-sm text-slate-600">Platform statistics</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                <span className="font-semibold text-slate-700">👥 Total Employees:</span>
                <span className="font-black text-xl text-blue-700">
                  {metricsData?.totalEmployees || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                <span className="font-semibold text-slate-700">🟢 Active Users:</span>
                <span className="font-black text-xl text-green-700">1</span>
              </div>
            </div>
          </div>

          {kycData && (
            <div className="card-gradient bg-gradient-to-br from-purple-50 via-purple-100/30 to-pink-100/30">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">🔐</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">KYC Completion</h3>
                  <p className="text-sm text-slate-600">Verification progress</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                  <span className="font-semibold text-slate-700">📹 VKYC Completed:</span>
                  <span className="font-black text-xl text-purple-700">
                    {kycData.vkycCompletionRate}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                  <span className="font-semibold text-slate-700">👆 BKYC Completed:</span>
                  <span className="font-black text-xl text-pink-700">
                    {kycData.bkycCompletionRate}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}