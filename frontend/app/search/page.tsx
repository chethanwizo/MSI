'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useQuery } from 'react-query'
import { searchAPI } from '@/lib/api'
import Layout from '@/components/Layout'
import { useForm } from 'react-hook-form'
import dynamic from 'next/dynamic'

const ReactJson = dynamic(() => import('@microlink/react-json-view'), {
  ssr: false,
  loading: () => <div className="text-sm text-gray-500">Loading JSON viewer...</div>
})

// Enhanced Result Details Component with Beautiful Tabs
function EnhancedResultDetails({ result }: { result: any }) {
  const [activeTab, setActiveTab] = useState('summary')

  const tabs = [
    { id: 'summary', label: 'Summary', icon: '📋', color: 'from-blue-500 to-blue-600' },
    { id: 'mis', label: 'MIS Details', icon: '📊', color: 'from-emerald-500 to-emerald-600' },
    { id: 'bank', label: 'Bank Decision', icon: '🏦', color: 'from-purple-500 to-purple-600' },
    { id: 'raw', label: 'Raw Data', icon: '🔍', color: 'from-orange-500 to-orange-600' }
  ]

  return (
    <div className="w-full">
      {/* Beautiful Tab Navigation */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                  : 'bg-white/60 text-slate-600 hover:bg-white/80 hover:text-slate-800 shadow-md'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Beautiful Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === 'summary' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">📋</span>
                </div>
                <h4 className="text-xl font-bold text-slate-900">Application Overview</h4>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                  <span className="font-semibold text-slate-700">🔢 ARN:</span>
                  <span className="font-bold text-blue-700">{result.arn}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                  <span className="font-semibold text-slate-700">👤 Customer:</span>
                  <span className="font-bold text-slate-900">{result.customerName}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                  <span className="font-semibold text-slate-700">👥 Employee:</span>
                  <span className="font-bold text-purple-700">{result.employee?.name}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                  <span className="font-semibold text-slate-700">📱 Mobile:</span>
                  <span className="font-bold text-slate-900">{result.mobileNo || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                  <span className="font-semibold text-slate-700">📅 Date:</span>
                  <span className="font-bold text-slate-900">{new Date(result.applicationDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">📊</span>
                </div>
                <h4 className="text-xl font-bold text-slate-900">Current Status</h4>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                  <span className="font-semibold text-slate-700">🎯 Decision:</span>
                  <span className="font-bold text-emerald-700">{result.status.finalDecision || result.status.bankStatus || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                  <span className="font-semibold text-slate-700">🔄 Stage:</span>
                  <span className="font-bold text-slate-900">{result.status.currentStage || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                  <span className="font-semibold text-slate-700">🔐 KYC:</span>
                  <span className="font-bold text-slate-900">{result.status.kycStatus || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                  <span className="font-semibold text-slate-700">💳 Card:</span>
                  <span className="font-bold text-slate-900">{result.status.cardActivationStatus || result.status.activationStatus || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                  <span className="font-semibold text-slate-700">📅 Decision Date:</span>
                  <span className="font-bold text-slate-900">{result.status.finalDecisionDate ? new Date(result.status.finalDecisionDate).toLocaleDateString() : (result.status.decisionDate ? new Date(result.status.decisionDate).toLocaleDateString() : 'N/A')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mis' && (
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">📊</span>
              </div>
              <h4 className="text-xl font-bold text-slate-900">MIS Data Details</h4>
            </div>
            {result.misData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="p-3 bg-white/60 rounded-xl">
                    <span className="text-sm font-semibold text-slate-600">📅 Date:</span>
                    <div className="font-bold text-slate-900">{result.misData.DATE || 'N/A'}</div>
                  </div>
                  <div className="p-3 bg-white/60 rounded-xl">
                    <span className="text-sm font-semibold text-slate-600">🔢 ARN NO:</span>
                    <div className="font-bold text-blue-700">{result.misData['ARN NO'] || 'N/A'}</div>
                  </div>
                  <div className="p-3 bg-white/60 rounded-xl">
                    <span className="text-sm font-semibold text-slate-600">👥 Employee:</span>
                    <div className="font-bold text-purple-700">{result.misData['EMP NAME'] || 'N/A'}</div>
                  </div>
                  <div className="p-3 bg-white/60 rounded-xl">
                    <span className="text-sm font-semibold text-slate-600">👤 Customer:</span>
                    <div className="font-bold text-slate-900">{result.misData['CUSTOMER NAME'] || 'N/A'}</div>
                  </div>
                  <div className="p-3 bg-white/60 rounded-xl">
                    <span className="text-sm font-semibold text-slate-600">📱 Mobile:</span>
                    <div className="font-bold text-slate-900">{result.misData['MOBILE NO'] || 'N/A'}</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-white/60 rounded-xl">
                    <span className="text-sm font-semibold text-slate-600">📹 VKYC Status:</span>
                    <div className="font-bold text-emerald-700">{result.misData['VKYC STATUS'] || 'N/A'}</div>
                  </div>
                  <div className="p-3 bg-white/60 rounded-xl">
                    <span className="text-sm font-semibold text-slate-600">👆 BKYC Status:</span>
                    <div className="font-bold text-emerald-700">{result.misData['BKYC STATUS'] || 'N/A'}</div>
                  </div>
                  <div className="p-3 bg-white/60 rounded-xl">
                    <span className="text-sm font-semibold text-slate-600">🎯 Final:</span>
                    <div className="font-bold text-slate-900">{result.misData['FINAL'] || 'N/A'}</div>
                  </div>
                  <div className="p-3 bg-white/60 rounded-xl">
                    <span className="text-sm font-semibold text-slate-600">❌ Decline Code:</span>
                    <div className="font-bold text-red-700">{result.misData['DECLINE CODE'] || 'N/A'}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📭</div>
                <p className="text-slate-500 font-medium">No MIS data available</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'bank' && (
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">🏦</span>
              </div>
              <h4 className="text-xl font-bold text-slate-900">Bank Decision Details</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="p-3 bg-white/60 rounded-xl">
                  <span className="text-sm font-semibold text-slate-600">🎯 Final Decision:</span>
                  <div className="font-bold text-purple-700">{result.status.finalDecision || 'N/A'}</div>
                </div>
                <div className="p-3 bg-white/60 rounded-xl">
                  <span className="text-sm font-semibold text-slate-600">📅 Decision Date:</span>
                  <div className="font-bold text-slate-900">{result.status.finalDecisionDate ? new Date(result.status.finalDecisionDate).toLocaleDateString() : 'N/A'}</div>
                </div>
                <div className="p-3 bg-white/60 rounded-xl">
                  <span className="text-sm font-semibold text-slate-600">🔄 Current Stage:</span>
                  <div className="font-bold text-slate-900">{result.status.currentStage || 'N/A'}</div>
                </div>
                <div className="p-3 bg-white/60 rounded-xl">
                  <span className="text-sm font-semibold text-slate-600">🔐 KYC Status:</span>
                  <div className="font-bold text-emerald-700">{result.status.kycStatus || 'N/A'}</div>
                </div>
                <div className="p-3 bg-white/60 rounded-xl">
                  <span className="text-sm font-semibold text-slate-600">📹 VKYC Status:</span>
                  <div className="font-bold text-emerald-700">{result.status.vkycStatus || 'N/A'}</div>
                </div>
                <div className="p-3 bg-white/60 rounded-xl">
                  <span className="text-sm font-semibold text-slate-600">📅 VKYC Date:</span>
                  <div className="font-bold text-slate-900">{result.status.vkycConsentDate ? new Date(result.status.vkycConsentDate).toLocaleDateString() : 'N/A'}</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-white/60 rounded-xl">
                  <span className="text-sm font-semibold text-slate-600">❌ Decline Code:</span>
                  <div className="font-bold text-red-700">{result.status.declineCode || 'N/A'}</div>
                </div>
                <div className="p-3 bg-white/60 rounded-xl">
                  <span className="text-sm font-semibold text-slate-600">📝 Description:</span>
                  <div className="font-bold text-red-700">{result.status.declineDescription || 'N/A'}</div>
                </div>
                <div className="p-3 bg-white/60 rounded-xl">
                  <span className="text-sm font-semibold text-slate-600">🏢 Company:</span>
                  <div className="font-bold text-slate-900">{result.status.companyName || 'N/A'}</div>
                </div>
                <div className="p-3 bg-white/60 rounded-xl">
                  <span className="text-sm font-semibold text-slate-600">📦 Product:</span>
                  <div className="font-bold text-slate-900">{result.status.productDescription || 'N/A'}</div>
                </div>
                <div className="p-3 bg-white/60 rounded-xl">
                  <span className="text-sm font-semibold text-slate-600">💳 Card Status:</span>
                  <div className="font-bold text-blue-700">{result.status.cardActivationStatus || 'N/A'}</div>
                </div>
                <div className="p-3 bg-white/60 rounded-xl">
                  <span className="text-sm font-semibold text-slate-600">🎴 Card Type:</span>
                  <div className="font-bold text-slate-900">{result.status.cardType || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'raw' && (
          <div className="space-y-8">
            {result.misData && (
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">📊</span>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">MIS Raw Data (JSON)</h4>
                </div>
                <div className="max-h-80 overflow-auto bg-white/80 backdrop-blur-sm border-2 border-orange-200 rounded-xl p-4 shadow-inner">
                  <ReactJson
                    src={result.misData}
                    theme="rjv-default"
                    collapsed={1}
                    displayDataTypes={false}
                    displayObjectSize={false}
                    name={false}
                    enableClipboard={true}
                  />
                </div>
              </div>
            )}
            
            {result.dumpData?.data && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg">🏦</span>
                    </div>
                    <h4 className="text-xl font-bold text-slate-900">Bank Dump Raw Data (JSON)</h4>
                  </div>
                  <div className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full">
                    <span className="text-xs font-bold text-blue-800">
                      {result.dumpData.variant || 'Unknown Variant'}
                    </span>
                  </div>
                </div>
                <div className="max-h-80 overflow-auto bg-white/80 backdrop-blur-sm border-2 border-blue-200 rounded-xl p-4 shadow-inner">
                  <ReactJson
                    src={result.dumpData.data}
                    theme="rjv-default"
                    collapsed={1}
                    displayDataTypes={false}
                    displayObjectSize={false}
                    name={false}
                    enableClipboard={true}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import toast from 'react-hot-toast'

interface SearchForm {
  query: string
  employeeName: string
  arn: string
  customerName: string
  mobileNo: string
  status: string
  dateFrom: string
  dateTo: string
}

export default function SearchPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [searchParams, setSearchParams] = useState<Partial<SearchForm>>({})

  const { register, handleSubmit, reset } = useForm<SearchForm>()

  // Handle authentication redirect in useEffect to avoid early return before hooks
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  const { data: searchResults, isLoading, refetch } = useQuery(
    ['search-results', searchParams, currentPage],
    () => searchAPI.search({ ...searchParams, page: currentPage, limit: 20 }),
    { enabled: !!user && Object.keys(searchParams).length > 0 }
  )

  const onSubmit = (data: SearchForm) => {
    // Remove empty fields
    const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value && value.trim() !== '') {
        acc[key] = value.trim()
      }
      return acc
    }, {} as any)
    
    setSearchParams(cleanData)
    setCurrentPage(1)
  }

  const clearSearch = () => {
    reset()
    setSearchParams({})
    setCurrentPage(1)
  }

  const toggleRowExpansion = (id: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const exportToExcel = async () => {
    try {
      const response = await searchAPI.export(searchParams)
      const data = response.data.data

      if (data.length === 0) {
        toast.error('No data to export')
        return
      }

      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Search Results')
      
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      
      saveAs(blob, `search-results-${new Date().toISOString().split('T')[0]}.xlsx`)
      toast.success('Export completed successfully')
    } catch (error) {
      toast.error('Export failed')
    }
  }

  const getStatusBadge = (status: any) => {
    if (status.approved === true) {
      return <span className="badge badge-success">Approved</span>
    } else if (status.approved === false && status.declineDescription) {
      return <span className="badge badge-danger">Rejected</span>
    } else {
      return <span className="badge badge-warning">Pending</span>
    }
  }

  if (loading || (!loading && !user)) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  const results = searchResults?.data?.results || []
  const pagination = searchResults?.data?.pagination

  return (
    <Layout>
      <div className="space-y-8">
        {/* Beautiful Header */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-white text-2xl">🔍</span>
            </div>
            <div className="text-left">
              <h1 className="section-header">Advanced Search</h1>
              <p className="section-subtitle">
                Powerful search across MIS and Bank Dump data
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span>Real-time Search • Comprehensive Data Access</span>
          </div>
        </div>

        {/* Beautiful Search Form */}
        <div className="card-gradient">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl">🎯</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Search Filters</h3>
              <p className="text-sm text-slate-600">Use multiple filters to find specific records</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  🔍 General Search
                </label>
                <input
                  {...register('query')}
                  type="text"
                  placeholder="ARN, Customer Name, Mobile, Employee..."
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  👤 Employee Name
                </label>
                <input
                  {...register('employeeName')}
                  type="text"
                  placeholder="Employee name"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  🔢 ARN Number
                </label>
                <input
                  {...register('arn')}
                  type="text"
                  placeholder="ARN number"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  👥 Customer Name
                </label>
                <input
                  {...register('customerName')}
                  type="text"
                  placeholder="Customer name"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  📱 Mobile Number
                </label>
                <input
                  {...register('mobileNo')}
                  type="text"
                  placeholder="Mobile number"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  📊 Status
                </label>
                <select {...register('status')} className="select">
                  <option value="">All Status</option>
                  <option value="approved">✅ Approved</option>
                  <option value="rejected">❌ Rejected</option>
                  <option value="pending">⏳ Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  📅 From Date
                </label>
                <input
                  {...register('dateFrom')}
                  type="date"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  📅 To Date
                </label>
                <input
                  {...register('dateTo')}
                  type="date"
                  className="input"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Searching...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>🔍</span>
                    <span>Search</span>
                  </div>
                )}
              </button>
              <button type="button" onClick={clearSearch} className="btn btn-secondary">
                <div className="flex items-center space-x-2">
                  <span>🗑️</span>
                  <span>Clear</span>
                </div>
              </button>
              {results.length > 0 && (
                <button type="button" onClick={exportToExcel} className="btn btn-success">
                  <div className="flex items-center space-x-2">
                    <span>📊</span>
                    <span>Export to Excel</span>
                  </div>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Beautiful Search Results */}
        {results.length > 0 && (
          <div className="card-gradient">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">📋</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Search Results ({pagination?.total || 0} found)
                  </h3>
                  <p className="text-sm text-slate-600">Click on any row to view detailed information</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full">
                <span className="text-xs font-bold text-green-800">{results.length} Showing</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th className="text-left">🔢 ARN</th>
                    <th className="text-left">👤 Customer</th>
                    <th className="text-left">👥 Employee</th>
                    <th className="text-center">📱 Mobile</th>
                    <th className="text-center">📊 Status</th>
                    <th className="text-center">📅 Date</th>
                    <th className="text-center">🔍 Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result: any) => (
                    <React.Fragment key={result.id}>
                      <tr className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50">
                        <td className="font-bold text-blue-700">{result.arn}</td>
                        <td className="font-semibold">{result.customerName}</td>
                        <td className="font-semibold text-purple-700">{result.employee?.name}</td>
                        <td className="text-center font-medium">{result.mobileNo || 'N/A'}</td>
                        <td className="text-center">{getStatusBadge(result.status)}</td>
                        <td className="text-center font-medium">{new Date(result.applicationDate).toLocaleDateString()}</td>
                        <td className="text-center">
                          <button
                            onClick={() => toggleRowExpansion(result.id)}
                            className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            {expandedRows.has(result.id) ? '👆 Hide' : '👁️ View'}
                          </button>
                        </td>
                      </tr>
                      
                      {expandedRows.has(result.id) && (
                        <tr key={`expanded-${result.id}`}>
                          <td colSpan={7} className="bg-gradient-to-r from-slate-50 via-blue-50/30 to-indigo-50/30 p-6">
                            <EnhancedResultDetails result={result} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Beautiful Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-8 p-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl">
                <div className="text-sm font-semibold text-slate-700 mb-4 sm:mb-0">
                  <span className="inline-flex items-center space-x-2">
                    <span>📊</span>
                    <span>
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                      <span className="font-bold text-blue-700">{pagination.total}</span> results
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
                  <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl shadow-lg">
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
        )}

        {/* Beautiful No Results */}
        {Object.keys(searchParams).length > 0 && !isLoading && results.length === 0 && (
          <div className="card-gradient text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <span className="text-white text-3xl">🔍</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">No Results Found</h3>
              <p className="text-slate-600 font-medium mb-6">
                We couldn't find any applications matching your search criteria. Try adjusting your filters or search terms.
              </p>
              <button 
                onClick={clearSearch}
                className="btn btn-primary"
              >
                <div className="flex items-center space-x-2">
                  <span>🔄</span>
                  <span>Clear Search</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Beautiful Initial State */}
        {Object.keys(searchParams).length === 0 && (
          <div className="card-gradient text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <span className="text-white text-3xl">🚀</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Ready to Search</h3>
              <p className="text-slate-600 font-medium mb-6">
                Use the powerful search filters above to find specific applications across all your MIS and Bank Dump data.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-white/60 rounded-xl">
                  <div className="font-bold text-blue-700">📊 Real-time</div>
                  <div className="text-slate-600">Live data search</div>
                </div>
                <div className="p-3 bg-white/60 rounded-xl">
                  <div className="font-bold text-emerald-700">🔍 Advanced</div>
                  <div className="text-slate-600">Multiple filters</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}