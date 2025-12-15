const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

async function fixSpecificARN() {
  try {
    const arn = 'D25L11297946H0S2';
    
    console.log(`🔧 Fixing ARN: ${arn}`);
    
    // Get the dump record
    const dumpRecord = await prisma.dumpRawData.findFirst({
      where: { applRef: arn }
    });
    
    if (!dumpRecord) {
      console.log('❌ Dump record not found');
      return;
    }
    
    console.log('📊 Raw data keys:', Object.keys(dumpRecord.rawJson));
    
    // Mark as mapped
    await prisma.dumpRawData.update({
      where: { id: dumpRecord.id },
      data: { isMapped: true }
    });
    
    console.log('✅ Marked dump record as mapped');
    
    // Extract normalized fields
    const row = dumpRecord.rawJson;
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
    
    // Log found keys for debugging
    console.log(`📋 Found keys:`, {
      finalDecision: finalDecisionKey,
      currentStage: currentStageKey,
      kycStatus: kycStatusKey,
      vkycStatus: vkycStatusKey,
      companyName: companyNameKey,
      productDesc: productDescKey,
      cardType: cardTypeKey,
      declineDesc: declineDescKey
    });
    
    // Show actual values
    console.log(`📊 Actual values:`, {
      finalDecision: finalDecisionKey ? row[finalDecisionKey] : 'N/A',
      currentStage: currentStageKey ? row[currentStageKey] : 'N/A',
      kycStatus: kycStatusKey ? row[kycStatusKey] : 'N/A',
      vkycStatus: vkycStatusKey ? row[vkycStatusKey] : 'N/A',
      companyName: companyNameKey ? row[companyNameKey] : 'N/A',
      productDesc: productDescKey ? row[productDescKey] : 'N/A',
      cardType: cardTypeKey ? row[cardTypeKey] : 'N/A',
      declineDesc: declineDescKey ? row[declineDescKey] : 'N/A'
    });
    
    // Populate normalized data
    if (finalDecisionKey) normalizedData.finalDecision = row[finalDecisionKey]?.toString();
    if (decisionDateKey && row[decisionDateKey]) {
      const parsedDate = parseExcelDate(row[decisionDateKey]);
      if (row[decisionDateKey]) {
        normalizedData.finalDecisionDate = parsedDate;
      }
    }
    if (currentStageKey) normalizedData.currentStage = row[currentStageKey]?.toString();
    if (kycStatusKey) normalizedData.kycStatus = row[kycStatusKey]?.toString();
    if (vkycStatusKey) normalizedData.vkycStatus = row[vkycStatusKey]?.toString();
    if (vkycConsentDateKey && row[vkycConsentDateKey]) {
      const parsedDate = parseExcelDate(row[vkycConsentDateKey]);
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
      const parsedDate = parseExcelDate(row[decisionDateKey]);
      if (row[decisionDateKey]) {
        normalizedData.decisionDate = parsedDate;
      }
    }
    
    // Log extracted data
    console.log(`📊 Extracted normalized data:`, normalizedData);
    
    // Update application status with normalized data
    await prisma.applicationStatus.upsert({
      where: { arn },
      update: normalizedData,
      create: {
        arn,
        ...normalizedData
      }
    });
    
    console.log(`✅ Updated application status for ARN: ${arn}`);
    
    // Verify the update
    const updatedStatus = await prisma.applicationStatus.findUnique({
      where: { arn }
    });
    
    console.log('🔍 Updated status:', updatedStatus);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSpecificARN();