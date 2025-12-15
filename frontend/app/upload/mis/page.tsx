'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { uploadAPI } from '@/lib/api'
import Layout from '@/components/Layout'
import toast from 'react-hot-toast'

export default function UploadMISPage() {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)

  // Handle authentication redirect in useEffect to avoid early return before hooks
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/dashboard')
    }
  }, [loading, user, isAdmin, router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['.xlsx', '.xls']
      const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'))
      
      if (!allowedTypes.includes(fileExtension)) {
        toast.error('Please select an Excel file (.xlsx or .xls)')
        return
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (selectedFile.size > maxSize) {
        toast.error('File size must be less than 10MB')
        return
      }

      setFile(selectedFile)
      setUploadResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first')
      return
    }

    setUploading(true)
    try {
      const response = await uploadAPI.uploadMIS(file)
      const result = response.data
      
      setUploadResult(result)
      toast.success('MIS file uploaded successfully!')
      
      // Clear file input
      setFile(null)
      const fileInput = document.getElementById('misFile') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.response?.data?.error || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  if (loading || (!loading && (!user || !isAdmin))) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Beautiful Header */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-white text-2xl">📤</span>
            </div>
            <div className="text-left">
              <h1 className="section-header">Upload MIS File</h1>
              <p className="section-subtitle">
                Establish ARN → Employee mapping with daily MIS data
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
            <span>Secure Upload • Excel Processing • Auto-mapping</span>
          </div>
        </div>

        {/* Beautiful Upload Form */}
        <div className="card-gradient">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl">📁</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Select MIS Excel File</h3>
              <p className="text-sm text-slate-600">Choose your daily MIS Excel file for processing</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="misFile" className="block text-sm font-bold text-slate-700 mb-3">
                📊 Choose Excel File (.xlsx or .xls)
              </label>
              <div className="relative">
                <input
                  id="misFile"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-700 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-gradient-to-r file:from-orange-500 file:to-red-500 file:text-white hover:file:from-orange-600 hover:file:to-red-600 file:shadow-lg hover:file:shadow-xl file:transition-all file:duration-200 file:transform hover:file:scale-105 border-2 border-dashed border-orange-300 rounded-xl p-4 bg-orange-50/50 hover:bg-orange-100/50 transition-all duration-200"
                />
              </div>
            </div>

            {file && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border-2 border-emerald-200 shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">✅</span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">Selected File</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-white/60 rounded-xl">
                    <span className="text-sm font-semibold text-slate-600">📄 Name:</span>
                    <div className="font-bold text-slate-900 truncate">{file.name}</div>
                  </div>
                  <div className="p-3 bg-white/60 rounded-xl">
                    <span className="text-sm font-semibold text-slate-600">📏 Size:</span>
                    <div className="font-bold text-slate-900">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                  <div className="p-3 bg-white/60 rounded-xl">
                    <span className="text-sm font-semibold text-slate-600">📊 Type:</span>
                    <div className="font-bold text-slate-900">{file.type || 'Excel File'}</div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed w-full"
            >
              {uploading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span className="font-bold">Processing MIS File...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-xl">🚀</span>
                  <span className="font-bold">Upload MIS File</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Expected File Format */}
        <div className="card mb-6">
          <h3 className="text-lg font-medium mb-4">Expected MIS File Format</h3>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Column Name</th>
                  <th>Required</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-medium">DATE</td>
                  <td><span className="badge badge-warning">Optional</span></td>
                  <td>Application date</td>
                </tr>
                <tr>
                  <td className="font-medium">ARN NO</td>
                  <td><span className="badge badge-danger">Required</span></td>
                  <td>Application Reference Number (Primary Key)</td>
                </tr>
                <tr>
                  <td className="font-medium">CUSTOMER NAME</td>
                  <td><span className="badge badge-danger">Required</span></td>
                  <td>Customer full name</td>
                </tr>
                <tr>
                  <td className="font-medium">MOBILE NO</td>
                  <td><span className="badge badge-warning">Optional</span></td>
                  <td>Customer mobile number</td>
                </tr>
                <tr>
                  <td className="font-medium">EMP NAME</td>
                  <td><span className="badge badge-danger">Required</span></td>
                  <td>Employee name (establishes ARN → Employee mapping)</td>
                </tr>
                <tr>
                  <td className="font-medium">VKYC STATUS</td>
                  <td><span className="badge badge-warning">Optional</span></td>
                  <td>Video KYC status</td>
                </tr>
                <tr>
                  <td className="font-medium">BKYC STATUS</td>
                  <td><span className="badge badge-warning">Optional</span></td>
                  <td>Biometric KYC status</td>
                </tr>
                <tr>
                  <td className="font-medium">DECLINE CODE</td>
                  <td><span className="badge badge-warning">Optional</span></td>
                  <td>MIS decline code</td>
                </tr>
                <tr>
                  <td className="font-medium">FINAL</td>
                  <td><span className="badge badge-warning">Optional</span></td>
                  <td>Final status (Approved/Rejected)</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Important Notes:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Column names are case-insensitive and flexible (spaces/underscores allowed)</li>
              <li>• All columns from your Excel file will be preserved in raw format</li>
              <li>• ARN NO establishes the primary mapping for bank dump data</li>
              <li>• Employee names will be automatically created if they don't exist</li>
              <li>• Duplicate ARNs will update existing records</li>
            </ul>
          </div>
        </div>

        {/* Upload Result */}
        {uploadResult && (
          <div className="card">
            <h3 className="text-lg font-medium mb-4">Upload Results</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-success-50 p-4 rounded-lg">
                <div className="text-success-800 font-medium">Processed Records</div>
                <div className="text-2xl font-bold text-success-900">
                  {uploadResult.processedCount}
                </div>
              </div>
              
              {uploadResult.errorCount > 0 && (
                <div className="bg-danger-50 p-4 rounded-lg">
                  <div className="text-danger-800 font-medium">Errors</div>
                  <div className="text-2xl font-bold text-danger-900">
                    {uploadResult.errorCount}
                  </div>
                </div>
              )}
            </div>

            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Error Details:</h4>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <ul className="text-sm text-red-800 space-y-1">
                    {uploadResult.errors.map((error: string, index: number) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="mt-4 text-sm text-gray-600">
              <strong>Message:</strong> {uploadResult.message}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}