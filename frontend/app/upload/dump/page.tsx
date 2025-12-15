'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { uploadAPI } from '@/lib/api'
import Layout from '@/components/Layout'
import toast from 'react-hot-toast'

export default function UploadDumpPage() {
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
      const response = await uploadAPI.uploadDump(file)
      const result = response.data
      
      setUploadResult(result)
      toast.success('Bank dump file uploaded successfully!')
      
      // Clear file input
      setFile(null)
      const fileInput = document.getElementById('dumpFile') as HTMLInputElement
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
      <div className="px-4 sm:px-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Upload Bank Dump File</h1>
          <p className="mt-1 text-sm text-gray-600">
            Upload daily bank dump Excel files to attach bank data to existing ARNs
          </p>
        </div>

        {/* Upload Form */}
        <div className="card mb-6">
          <h3 className="text-lg font-medium mb-4">Select Bank Dump Excel File</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="dumpFile" className="block text-sm font-medium text-gray-700 mb-2">
                Choose Excel File (.xlsx or .xls)
              </label>
              <input
                id="dumpFile"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
            </div>

            {file && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Selected File:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div><strong>Name:</strong> {file.name}</div>
                  <div><strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB</div>
                  <div><strong>Type:</strong> {file.type}</div>
                </div>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </div>
              ) : (
                'Upload Bank Dump File'
              )}
            </button>
          </div>
        </div>

        {/* Expected File Format */}
        <div className="card mb-6">
          <h3 className="text-lg font-medium mb-4">Expected Bank Dump File Format</h3>
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
                  <td className="font-medium">APPL_REF</td>
                  <td><span className="badge badge-danger">Required</span></td>
                  <td>Application Reference (maps to MIS ARN NO)</td>
                </tr>
                <tr>
                  <td className="font-medium">FULL_NAME</td>
                  <td><span className="badge badge-warning">Optional</span></td>
                  <td>Customer full name (validation only)</td>
                </tr>
                <tr>
                  <td className="font-medium">DECLINE_DESCRIPTION</td>
                  <td><span className="badge badge-warning">Optional</span></td>
                  <td>Bank decline reason</td>
                </tr>
                <tr>
                  <td className="font-medium">DECLINE_CATEGORY</td>
                  <td><span className="badge badge-warning">Optional</span></td>
                  <td>Decline category</td>
                </tr>
                <tr>
                  <td className="font-medium">Activation Status</td>
                  <td><span className="badge badge-warning">Optional</span></td>
                  <td>Card activation status</td>
                </tr>
                <tr>
                  <td className="font-medium">DECISIN_DT</td>
                  <td><span className="badge badge-warning">Optional</span></td>
                  <td>Bank decision date</td>
                </tr>
                <tr>
                  <td className="font-medium">All Other Columns</td>
                  <td><span className="badge badge-success">Preserved</span></td>
                  <td>All columns are stored in raw format</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Important Notes:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• APPL_REF must match existing ARN from MIS data for mapping</li>
              <li>• ALL columns from your Excel file will be preserved in raw format</li>
              <li>• Records without matching ARN will be marked as "Unmapped"</li>
              <li>• Employee information comes from MIS only, never from dump</li>
              <li>• Bank status information will update existing application records</li>
            </ul>
          </div>
        </div>

        {/* Key Dump Columns Reference */}
        <div className="card mb-6">
          <h3 className="text-lg font-medium mb-4">Common Bank Dump Columns (All Preserved)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Application Info</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• APPL_REF</li>
                <li>• SEG_ID</li>
                <li>• SETUP_STAT</li>
                <li>• FULL_NAME</li>
                <li>• APPLDATE</li>
                <li>• QDE_SUBMISSION_DATE</li>
                <li>• DECISIN_DT</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Location & Team</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• CITY</li>
                <li>• CATEGORY</li>
                <li>• TEAMCD</li>
                <li>• DSA Name</li>
                <li>• Final Team Code</li>
                <li>• SOURCE</li>
                <li>• SPC_CHANNEL ME</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Product & Status</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• PRODUCT</li>
                <li>• PRODUCT_DESC</li>
                <li>• DECLINE_DESCRIPTION</li>
                <li>• DECLINE_CATEGORY</li>
                <li>• Activation Status</li>
                <li>• ONEPLUS_ELIGIBILITY</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Upload Result */}
        {uploadResult && (
          <div className="card">
            <h3 className="text-lg font-medium mb-4">Upload Results</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-success-50 p-4 rounded-lg">
                <div className="text-success-800 font-medium">Processed Records</div>
                <div className="text-2xl font-bold text-success-900">
                  {uploadResult.processedCount}
                </div>
              </div>
              
              <div className="bg-primary-50 p-4 rounded-lg">
                <div className="text-primary-800 font-medium">Mapped to ARN</div>
                <div className="text-2xl font-bold text-primary-900">
                  {uploadResult.mappedCount}
                </div>
              </div>
              
              <div className="bg-warning-50 p-4 rounded-lg">
                <div className="text-warning-800 font-medium">Unmapped</div>
                <div className="text-2xl font-bold text-warning-900">
                  {uploadResult.unmappedCount}
                </div>
              </div>
              
              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div className="bg-danger-50 p-4 rounded-lg">
                  <div className="text-danger-800 font-medium">Errors</div>
                  <div className="text-2xl font-bold text-danger-900">
                    {uploadResult.errors.length}
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

            {uploadResult.unmappedCount > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Unmapped Records Found</h4>
                <p className="text-sm text-yellow-700">
                  {uploadResult.unmappedCount} records could not be mapped to existing ARNs. 
                  These records are stored and can be viewed in the "Unmapped Records" section.
                  Make sure the corresponding MIS data is uploaded first.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}