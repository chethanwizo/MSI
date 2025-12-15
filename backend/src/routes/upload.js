const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const prisma = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${timestamp}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  }
});

// CRITICAL: Enhanced column normalization (MANDATORY)
const normalizeColumnName = (name) => {
  return name.toString()
    .trim()                                    // Trim whitespace
    .replace(/\u00A0/g, ' ')                   // Replace non-breaking spaces
    .toLowerCase()                             // Convert to lowercase
    .replace(/[^a-z0-9]+/g, '_')               // Replace all non-alphanumeric with _
    .replace(/_+/g, '_')                       // Collapse multiple _ into one
    .replace(/^_|_$/g, '');                    // Remove leading/trailing _
};

// CRITICAL: Universal ARN aliases (SINGLE SOURCE OF TRUTH)
const ARN_ALIASES = [
  'arn', 'arn_no', 'application_no', 'application_number', 'application_id',
  'reference_number', 'ref_no', 'appl_ref', 'application_reference_number'
];

// CRITICAL: Multi-sheet Excel analysis and ARN detection
const findDataSheetWithARN = (workbook, fileType = 'DUMP') => {
  console.log(`📚 Scanning all sheets for ${fileType}:`, workbook.SheetNames);
  
  console.log('📚 Scanning all sheets:', workbook.SheetNames);
  
  for (const sheetName of workbook.SheetNames) {
    console.log(`🔍 Analyzing sheet: ${sheetName}`);
    
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (jsonData.length === 0) {
      console.log(`⚠️ Sheet ${sheetName} is empty, skipping`);
      continue;
    }
    
    // Get headers from first non-empty row
    let headers = null;
    for (let i = 0; i < Math.min(5, jsonData.length); i++) {
      if (jsonData[i] && jsonData[i].length > 0) {
        headers = jsonData[i].filter(h => h && h.toString().trim());
        if (headers.length > 0) break;
      }
    }
    
    if (!headers || headers.length === 0) {
      console.log(`⚠️ Sheet ${sheetName} has no valid headers, skipping`);
      continue;
    }
    
    console.log(`📋 Sheet ${sheetName} headers:`, headers);
    const normalizedHeaders = headers.map(h => ({
      original: h,
      normalized: normalizeColumnName(h)
    }));
    
    console.log(`📋 Sheet ${sheetName} normalized:`, normalizedHeaders.map(h => h.normalized));
    
    // Check for ARN aliases
    for (const alias of ARN_ALIASES) {
      const found = normalizedHeaders.find(h => 
        h.normalized === alias || h.normalized.includes(alias)
      );
      if (found) {
        console.log(`✅ Found ARN column "${found.original}" (${found.normalized}) in sheet: ${sheetName}`);
        return {
          sheetName,
          worksheet,
          arnColumn: found.original,
          headers: headers
        };
      }
    }
    
    console.log(`❌ No ARN column found in sheet: ${sheetName}`);
  }
  
  return null;
};

// CRITICAL: ARN Detection with enhanced logging (SINGLE SOURCE OF TRUTH)
const findARNColumn = (headers) => {
  const normalizedHeaders = headers.map(h => ({ original: h, normalized: normalizeColumnName(h) }));
  console.log('🔍 ARN Detection - Normalized headers:', normalizedHeaders.map(h => `"${h.original}" → "${h.normalized}"`));
  
  // Exact match first
  for (const alias of ARN_ALIASES) {
    const found = normalizedHeaders.find(h => h.normalized === alias);
    if (found) {
      console.log(`✅ ARN Exact Match: "${found.original}" matches alias "${alias}"`);
      return found.original;
    }
  }
  
  // Partial matching fallback
  for (const alias of ARN_ALIASES) {
    const found = normalizedHeaders.find(h => h.normalized.includes(alias));
    if (found) {
      console.log(`✅ ARN Partial Match: "${found.original}" contains alias "${alias}"`);
      return found.original;
    }
  }
  
  console.log('❌ No ARN column found with any alias');
  return null;
};

// CRITICAL: Dump variant detection based on indicators
const detectDumpVariant = (headers) => {
  const normalizedHeaders = headers.map(normalizeColumnName);
  
  // Variant 1 indicators
  const variant1Indicators = ['setup_stat', 'activation_status', 'misdeccode', 'product_desc'];
  const hasVariant1 = variant1Indicators.some(indicator => 
    normalizedHeaders.some(h => h.includes(indicator))
  );
  
  // Variant 2 indicators  
  const variant2Indicators = ['final_decision', 'current_stage', 'card_activation_staus', 'company_name'];
  const hasVariant2 = variant2Indicators.some(indicator => 
    normalizedHeaders.some(h => h.includes(indicator))
  );
  
  if (hasVariant1 && hasVariant2) return 'hybrid';
  if (hasVariant2) return 'variant2';
  return 'variant1';
};

// CRITICAL: Find column by multiple aliases
const findColumnByAliases = (row, aliases) => {
  const keys = Object.keys(row);
  for (const alias of aliases) {
    const found = keys.find(key => normalizeColumnName(key).includes(alias));
    if (found) return found;
  }
  return null;
};

// CRITICAL: Robust date parsing for Excel files
const parseExcelDate = (dateValue, rowIndex = null) => {
  if (!dateValue) return new Date(); // Default to current date
  
  try {
    let parsedDate = null;
    
    if (typeof dateValue === 'number') {
      // Excel date serial number (days since 1900-01-01, adjusted for Excel's leap year bug)
      parsedDate = new Date((dateValue - 25569) * 86400 * 1000);
    } else if (typeof dateValue === 'string' && dateValue.trim()) {
      const trimmedValue = dateValue.trim();
      parsedDate = new Date(trimmedValue);
    } else if (dateValue instanceof Date) {
      parsedDate = dateValue;
    }
    
    // Validate the parsed date
    if (parsedDate && !isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  } catch (e) {
    console.log(`⚠️ Date parsing error${rowIndex ? ` for row ${rowIndex}` : ''}: ${dateValue}`);
  }
  
  // Return current date as fallback
  return new Date();
};

// CRITICAL: MIS File Upload with Multi-Variant Support
router.post('/mis', authenticateToken, requireAdmin, upload.single('misFile'), async (req, res) => {
  try {
    console.log('🔄 MIS upload request received');
    console.log('👤 User:', req.user?.email);
    console.log('📁 File:', req.file?.originalname);
    
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('📖 Reading MIS Excel file...');
    const workbook = XLSX.readFile(req.file.path);
    console.log('📚 Total sheets found:', workbook.SheetNames.length);
    
    // CRITICAL: Multi-sheet scanning for ARN detection
    const sheetData = findDataSheetWithARN(workbook, 'MIS');
    if (!sheetData) {
      // Collect all headers from all sheets for error reporting
      const allSheetsInfo = workbook.SheetNames.map(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const headers = jsonData.length > 0 ? jsonData[0] || [] : [];
        return {
          sheetName,
          headers: headers.filter(h => h && h.toString().trim()),
          normalizedHeaders: headers.filter(h => h && h.toString().trim()).map(normalizeColumnName)
        };
      });
      
      console.log('❌ No sheet with ARN column found in MIS file');
      console.log('📋 All MIS sheets analysis:', allSheetsInfo);
      
      return res.status(400).json({
        error: 'ARN column not found in any MIS sheet. Required: arn, arn_no, application_no, application_number, application_id, reference_number, ref_no, appl_ref, application_reference_number',
        sheetsAnalyzed: allSheetsInfo,
        suggestion: 'Ensure your MIS Excel file contains a sheet with one of the supported ARN column names'
      });
    }
    
    console.log(`✅ Using MIS sheet: ${sheetData.sheetName}`);
    console.log(`✅ ARN column: ${sheetData.arnColumn}`);
    
    const jsonData = XLSX.utils.sheet_to_json(sheetData.worksheet);
    console.log('📊 MIS rows found:', jsonData.length);

    if (jsonData.length === 0) {
      console.log('❌ Empty MIS data sheet');
      return res.status(400).json({ error: 'Selected MIS data sheet is empty' });
    }

    const firstRow = jsonData[0];
    const headers = Object.keys(firstRow);
    const arnKey = sheetData.arnColumn;
    
    console.log('📋 MIS headers:', headers);
    console.log('📋 MIS normalized:', headers.map(normalizeColumnName));

    let processedCount = 0;
    let errorCount = 0;
    const errors = [];

    // Process each row with multi-variant support
    for (let i = 0; i < jsonData.length; i++) {
      try {
        const row = jsonData[i];
        
        // CRITICAL: Multi-variant field extraction
        const arn = row[arnKey]?.toString().trim();
        
        // Customer name variants: customer_name, customer, name
        const customerNameKey = findColumnByAliases(row, ['customer_name', 'customer', 'name']);
        const customerName = customerNameKey ? row[customerNameKey]?.toString().trim() : null;
        
        // Employee name variants: emp_name, employee_name, employee, emp
        const empNameKey = findColumnByAliases(row, ['emp_name', 'employee_name', 'employee', 'emp']);
        const empName = empNameKey ? row[empNameKey]?.toString().trim() : null;
        
        // Mobile variants: mobile_no, mobile, phone, contact
        const mobileKey = findColumnByAliases(row, ['mobile_no', 'mobile', 'phone', 'contact']);
        const mobileNo = mobileKey ? row[mobileKey]?.toString().trim() : null;
        
        // Date variants: date, application_date, app_date, created_date
        const dateKey = findColumnByAliases(row, ['date', 'application_date', 'app_date', 'created_date']);
        const applicationDate = parseExcelDate(dateKey ? row[dateKey] : null, i + 1);

        if (!arn || !customerName || !empName) {
          errors.push(`Row ${i + 1}: Missing required data (ARN: ${arn || 'missing'}, Customer: ${customerName || 'missing'}, Employee: ${empName || 'missing'})`);
          errorCount++;
          continue;
        }

        console.log(`📝 Processing MIS row ${i + 1}: ARN=${arn}, Customer=${customerName}, Employee=${empName}`);

        // Create/find employee
        const employee = await prisma.employee.upsert({
          where: { name: empName },
          update: {},
          create: { name: empName }
        });

        // Store raw MIS data
        await prisma.misRawData.create({
          data: {
            arn,
            rawJson: row
          }
        });

        // Create/update application
        await prisma.application.upsert({
          where: { arn },
          update: {
            customerName,
            mobileNo,
            applicationDate
          },
          create: {
            arn,
            employeeId: employee.id,
            customerName,
            mobileNo,
            applicationDate
          }
        });

        // CRITICAL: Multi-variant MIS status extraction
        const declineCodeKey = findColumnByAliases(row, ['decline_code', 'decline', 'dec_code', 'decline_reason']);
        const finalStatusKey = findColumnByAliases(row, ['final', 'status', 'final_status', 'decision']);
        const vkycStatusKey = findColumnByAliases(row, ['vkyc_status', 'vkyc', 'video_kyc']);
        const bkycStatusKey = findColumnByAliases(row, ['bkyc_status', 'bkyc', 'biometric_kyc']);

        const declineCode = declineCodeKey ? row[declineCodeKey]?.toString() : null;
        const finalStatus = finalStatusKey ? row[finalStatusKey]?.toString() : null;
        const vkycStatus = vkycStatusKey ? row[vkycStatusKey]?.toString() : null;
        const bkycStatus = bkycStatusKey ? row[bkycStatusKey]?.toString() : null;

        await prisma.applicationStatus.upsert({
          where: { arn },
          update: {
            misDecCode: declineCode,
            approvedFlag: finalStatus?.toLowerCase() === 'approved',
            vkycStatus: vkycStatus,
            kycStatus: bkycStatus // Map BKYC to general KYC status
          },
          create: {
            arn,
            misDecCode: declineCode,
            approvedFlag: finalStatus?.toLowerCase() === 'approved',
            vkycStatus: vkycStatus,
            kycStatus: bkycStatus
          }
        });

        processedCount++;
      } catch (rowError) {
        console.error(`Error processing row ${i + 1}:`, rowError);
        errors.push(`Row ${i + 1}: ${rowError.message}`);
        errorCount++;
      }
    }

    // Log upload
    await prisma.uploadLog.create({
      data: {
        fileType: 'MIS',
        recordCount: processedCount,
        fileName: req.file.originalname,
        uploadedBy: req.user.email,
        status: errorCount > 0 ? 'partial' : 'success',
        errorLog: errors.length > 0 ? errors.join('\n') : null
      }
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'MIS file processed successfully',
      processedCount,
      errorCount,
      errors: errors.slice(0, 10) // Return first 10 errors
    });

  } catch (error) {
    console.error('❌ MIS upload error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to process MIS file', details: error.message });
  }
});

// Bank Dump File Upload with Variant Detection
router.post('/dump', authenticateToken, requireAdmin, upload.single('dumpFile'), async (req, res) => {
  try {
    console.log('🔄 Dump upload request received');
    console.log('👤 User:', req.user?.email);
    console.log('📁 File:', req.file?.originalname);
    
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('📖 Reading Excel file...');
    const workbook = XLSX.readFile(req.file.path);
    console.log('📚 Total sheets found:', workbook.SheetNames.length);
    
    // CRITICAL: Multi-sheet scanning for ARN detection
    const sheetData = findDataSheetWithARN(workbook);
    if (!sheetData) {
      // Collect all headers from all sheets for error reporting
      const allSheetsInfo = workbook.SheetNames.map(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const headers = jsonData.length > 0 ? jsonData[0] || [] : [];
        return {
          sheetName,
          headers: headers.filter(h => h && h.toString().trim()),
          normalizedHeaders: headers.filter(h => h && h.toString().trim()).map(normalizeColumnName)
        };
      });
      
      console.log('❌ No sheet with ARN column found');
      console.log('📋 All sheets analysis:', allSheetsInfo);
      
      return res.status(400).json({
        error: `ARN column not found in any sheet. Required: ${ARN_ALIASES.join(', ')}`,
        sheetsAnalyzed: allSheetsInfo,
        suggestion: 'Ensure your Excel file contains a sheet with one of the supported ARN column names'
      });
    }
    
    console.log(`✅ Using sheet: ${sheetData.sheetName}`);
    console.log(`✅ ARN column: ${sheetData.arnColumn}`);
    
    const jsonData = XLSX.utils.sheet_to_json(sheetData.worksheet);
    console.log('📊 Rows found:', jsonData.length);

    if (jsonData.length === 0) {
      console.log('❌ Empty data sheet');
      return res.status(400).json({ error: 'Selected data sheet is empty' });
    }

    const firstRow = jsonData[0];
    const headers = Object.keys(firstRow);
    const applRefKey = sheetData.arnColumn;
    
    console.log('📋 Final headers:', headers);
    console.log('📋 Final normalized:', headers.map(normalizeColumnName));
    
    // CRITICAL: Dump variant detection
    const variant = detectDumpVariant(headers);
    
    // Find customer name column
    const customerNameKey = findColumnByAliases(firstRow, ['full_name', 'customer_name', 'name']);

    console.log(`🔍 Detected Dump Variant: ${variant}`);
    console.log(`📋 Key Column: ${applRefKey}`);
    console.log(`👤 Customer Column: ${customerNameKey || 'Not found'}`);
    

    let processedCount = 0;
    let mappedCount = 0;
    let unmappedCount = 0;
    const errors = [];

    // Process each row
    for (let i = 0; i < jsonData.length; i++) {
      try {
        const row = jsonData[i];
        const applRef = row[applRefKey]?.toString().trim();
        const customerName = customerNameKey ? row[customerNameKey]?.toString().trim() : null;

        if (!applRef) {
          errors.push(`Row ${i + 1}: Missing ${applRefKey}`);
          continue;
        }

        // Store raw dump data with variant info
        const dumpRecord = await prisma.dumpRawData.create({
          data: {
            applRef,
            rawJson: row,
            isMapped: false,
            variant,
            customerName
          }
        });

        // Try to map to existing application
        const application = await prisma.application.findUnique({
          where: { arn: applRef }
        });

        if (application) {
          // Update mapping status
          await prisma.dumpRawData.update({
            where: { id: dumpRecord.id },
            data: { isMapped: true }
          });

          // CRITICAL: Extract normalized fields for search display
          const normalizedData = {};
          
          // Common fields for all variants - Enhanced aliases for better matching
          const finalDecisionKey = findColumnByAliases(row, ['final_decision', 'setup_stat', 'bank_status']);
          const decisionDateKey = findColumnByAliases(row, ['final_decision_date', 'decisin_dt', 'decision_date', 'creation_date_time', 'creation_date']);
          const currentStageKey = findColumnByAliases(row, ['current_stage', 'stage', 'status']);
          const kycStatusKey = findColumnByAliases(row, ['kyc_status', 'kyc']);
          const vkycStatusKey = findColumnByAliases(row, ['vkyc_status', 'vkyc']);
          const vkycConsentDateKey = findColumnByAliases(row, ['vkyc_consent_date', 'vkyc_date']);
          const declineCodeKey = findColumnByAliases(row, ['decline_code', 'misdeccode', 'dec_code']);
          const declineDescKey = findColumnByAliases(row, ['decline_description', 'decline_desc', 'drop_satge']);
          const companyNameKey = findColumnByAliases(row, ['company_name', 'company']);
          const productDescKey = findColumnByAliases(row, ['product_description', 'product_desc', 'product_des', 'product']);
          const cardActivationKey = findColumnByAliases(row, ['card_activation_status', 'card_activation_staus', 'activation_status']);
          const cardTypeKey = findColumnByAliases(row, ['card_type', 'type']);
          
          // Populate normalized data
          if (finalDecisionKey) normalizedData.finalDecision = row[finalDecisionKey]?.toString();
          if (decisionDateKey && row[decisionDateKey]) {
            const parsedDate = parseExcelDate(row[decisionDateKey], i + 1);
            // Only set if we have actual date data (not just the fallback current date)
            if (row[decisionDateKey]) {
              normalizedData.finalDecisionDate = parsedDate;
            }
          }
          if (currentStageKey) normalizedData.currentStage = row[currentStageKey]?.toString();
          if (kycStatusKey) normalizedData.kycStatus = row[kycStatusKey]?.toString();
          if (vkycStatusKey) normalizedData.vkycStatus = row[vkycStatusKey]?.toString();
          if (vkycConsentDateKey && row[vkycConsentDateKey]) {
            const parsedDate = parseExcelDate(row[vkycConsentDateKey], i + 1);
            // Only set if we have actual date data (not just the fallback current date)
            if (row[vkycConsentDateKey]) {
              normalizedData.vkycConsentDate = parsedDate;
            }
          }
          if (declineCodeKey) normalizedData.declineCode = row[declineCodeKey]?.toString();
          if (declineDescKey) normalizedData.declineDescription = row[declineDescKey]?.toString();
          if (companyNameKey) normalizedData.companyName = row[companyNameKey]?.toString();
          if (productDescKey) normalizedData.productDescription = row[productDescKey]?.toString();
          if (cardActivationKey) normalizedData.cardActivationStatus = row[cardActivationKey]?.toString();
          if (cardTypeKey) normalizedData.cardType = row[cardTypeKey]?.toString();
          
          // Legacy fields for backward compatibility
          if (finalDecisionKey) normalizedData.bankStatus = row[finalDecisionKey]?.toString();
          if (cardActivationKey) normalizedData.activationStatus = row[cardActivationKey]?.toString();
          if (decisionDateKey && row[decisionDateKey]) {
            const parsedDate = parseExcelDate(row[decisionDateKey], i + 1);
            // Only set if we have actual date data (not just the fallback current date)
            if (row[decisionDateKey]) {
              normalizedData.decisionDate = parsedDate;
            }
          }

          // Update application status with normalized data
          await prisma.applicationStatus.upsert({
            where: { arn: applRef },
            update: normalizedData,
            create: {
              arn: applRef,
              ...normalizedData
            }
          });

          mappedCount++;
        } else {
          unmappedCount++;
        }

        processedCount++;
      } catch (rowError) {
        console.error(`Error processing dump row ${i + 1}:`, rowError);
        errors.push(`Row ${i + 1}: ${rowError.message}`);
      }
    }

    // Log upload
    await prisma.uploadLog.create({
      data: {
        fileType: 'DUMP',
        recordCount: processedCount,
        fileName: req.file.originalname,
        uploadedBy: req.user.email,
        status: errors.length > 0 ? 'partial' : 'success',
        errorLog: errors.length > 0 ? errors.join('\n') : null
      }
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'Bank dump file processed successfully',
      variant: variant,
      processedCount,
      mappedCount,
      unmappedCount,
      errors: errors.slice(0, 10)
    });

  } catch (error) {
    console.error('❌ Dump upload error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to process dump file', details: error.message });
  }
});

// Get upload history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.uploadLog.findMany({
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { uploadedAt: 'desc' }
      }),
      prisma.uploadLog.count()
    ]);

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Upload history error:', error);
    res.status(500).json({ error: 'Failed to fetch upload history' });
  }
});

module.exports = router;