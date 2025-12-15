// Simple test script to verify upload functionality
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testLogin() {
  try {
    console.log('🔐 Testing login...');
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',
      password: 'password123'
    });
    
    console.log('✅ Login successful');
    console.log('👤 User:', response.data.user.email);
    console.log('🔑 Token received:', response.data.token ? 'Yes' : 'No');
    
    return response.data.token;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return null;
  }
}

async function testUpload(token) {
  try {
    console.log('\n📤 Testing file upload...');
    
    // Check if test file exists
    const testFile = 'test-files/sample-dump.csv';
    if (!fs.existsSync(testFile)) {
      console.log('❌ Test file not found:', testFile);
      return;
    }
    
    const formData = new FormData();
    formData.append('dumpFile', fs.createReadStream(testFile));
    
    const response = await axios.post('http://localhost:5000/api/upload/dump', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`
      },
      timeout: 30000
    });
    
    console.log('✅ Upload successful');
    console.log('📊 Result:', response.data);
    
  } catch (error) {
    console.error('❌ Upload failed');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data || error.message);
  }
}

async function runTest() {
  const token = await testLogin();
  if (token) {
    await testUpload(token);
  }
}

runTest();