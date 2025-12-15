const XLSX = require('xlsx');
const fs = require('fs');

// Create a simple test Excel file for dump upload
const dumpData = [
  {
    'APPL_REF': 'ARN001234570',
    'FULL_NAME': 'Test Customer 1',
    'CITY': 'Mumbai',
    'PRODUCT': 'Credit Card',
    'DECLINE_DESCRIPTION': '',
    'DECLINE_CATEGORY': '',
    'Activation Status': 'ACTIVE',
    'DECISIN_DT': '2024-01-20'
  },
  {
    'APPL_REF': 'ARN001234571',
    'FULL_NAME': 'Test Customer 2',
    'CITY': 'Delhi',
    'PRODUCT': 'Credit Card',
    'DECLINE_DESCRIPTION': '',
    'DECLINE_CATEGORY': '',
    'Activation Status': 'PENDING',
    'DECISIN_DT': ''
  },
  {
    'APPL_REF': 'ARN001234572',
    'FULL_NAME': 'Test Customer 3',
    'CITY': 'Bangalore',
    'PRODUCT': 'Credit Card',
    'DECLINE_DESCRIPTION': 'Insufficient Income',
    'DECLINE_CATEGORY': 'Financial',
    'Activation Status': 'INACTIVE',
    'DECISIN_DT': '2024-01-18'
  }
];

// Create MIS test data
const misData = [
  {
    'DATE': '2024-01-15',
    'ARN NO': 'ARN001234570',
    'CUSTOMER NAME': 'Test Customer 1',
    'MOBILE NO': '9876543210',
    'EMP NAME': 'John Smith',
    'VKYC STATUS': 'COMPLETED',
    'BKYC STATUS': 'COMPLETED',
    'DECLINE CODE': '',
    'FINAL': 'APPROVED'
  },
  {
    'DATE': '2024-01-16',
    'ARN NO': 'ARN001234571',
    'CUSTOMER NAME': 'Test Customer 2',
    'MOBILE NO': '9876543211',
    'EMP NAME': 'Sarah Johnson',
    'VKYC STATUS': 'COMPLETED',
    'BKYC STATUS': 'PENDING',
    'DECLINE CODE': '',
    'FINAL': 'PENDING'
  }
];

// Create dump Excel file
const dumpWs = XLSX.utils.json_to_sheet(dumpData);
const dumpWb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(dumpWb, dumpWs, 'Dump Data');
XLSX.writeFile(dumpWb, 'test-files/sample-dump.xlsx');

// Create MIS Excel file
const misWs = XLSX.utils.json_to_sheet(misData);
const misWb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(misWb, misWs, 'MIS Data');
XLSX.writeFile(misWb, 'test-files/sample-mis.xlsx');

console.log('✅ Test Excel files created:');
console.log('📁 test-files/sample-dump.xlsx');
console.log('📁 test-files/sample-mis.xlsx');