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

async function migrateDumpData() {
  try {
    console.log('🔄 Starting dump data migration...');
    
    // Get all mapped dump records
    const dumpRecords = await prisma.dumpRawData.findMany({
      where: { isMapped: true },
      orderBy: { uploadDate: 'desc' }
    });
    
    console.log(`📊 Found ${dumpRecords.length} mapped dump records to process`);
    
    let processedCount = 0;
    let updatedCount = 0;
    
    for (const dumpRecord of dumpRecords) {
      try {
        const row = dumpRecord.rawJson;
        const applRef = dumpRecord.applRef;
        
        console.log(`🔄 Processing ARN: ${applRef}`);
        
        // Check if application exists
        const application = await prisma.application.findUnique({
          where: { arn: applRef }
        });
        
        if (!application) {
          console.log(`⚠️ No application found for ARN: ${applRef}`);
          continue;
        }
        
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
        
        // Log found keys for debugging
        console.log(`  📋 Found keys:`, {
          finalDecision: finalDecisionKey,
          currentStage: currentStageKey,
          kycStatus: kycStatusKey,
          vkycStatus: vkycStatusKey,
          companyName: companyNameKey,
          productDesc: productDescKey,
          cardType: cardTypeKey
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
        console.log(`  📊 Extracted data:`, normalizedData);
        
        // Update application status with normalized data
        await prisma.applicationStatus.upsert({
          where: { arn: applRef },
          update: normalizedData,
          create: {
            arn: applRef,
            ...normalizedData
          }
        });
        
        updatedCount++;
        console.log(`  ✅ Updated application status for ARN: ${applRef}`);
        
      } catch (error) {
        console.error(`❌ Error processing ARN ${dumpRecord.applRef}:`, error.message);
      }
      
      processedCount++;
      
      if (processedCount % 10 === 0) {
        console.log(`📊 Progress: ${processedCount}/${dumpRecords.length} processed, ${updatedCount} updated`);
      }
    }
    
    console.log(`🎉 Migration completed!`);
    console.log(`📊 Total processed: ${processedCount}`);
    console.log(`✅ Total updated: ${updatedCount}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateDumpData();