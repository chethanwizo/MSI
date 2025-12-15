const express = require('express');
const prisma = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Advanced search across all data
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      query,
      employeeName,
      arn,
      customerName,
      mobileNo,
      status,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20
    } = req.query;

    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    // Build search conditions
    const searchConditions = [];

    // General query search
    if (query) {
      searchConditions.push({
        OR: [
          { arn: { contains: query, mode: 'insensitive' } },
          { customerName: { contains: query, mode: 'insensitive' } },
          { mobileNo: { contains: query } },
          { employee: { name: { contains: query, mode: 'insensitive' } } }
        ]
      });
    }

    // Specific field searches
    if (employeeName) {
      searchConditions.push({
        employee: { name: { contains: employeeName, mode: 'insensitive' } }
      });
    }

    if (arn) {
      searchConditions.push({
        arn: { contains: arn, mode: 'insensitive' }
      });
    }

    if (customerName) {
      searchConditions.push({
        customerName: { contains: customerName, mode: 'insensitive' }
      });
    }

    if (mobileNo) {
      searchConditions.push({
        mobileNo: { contains: mobileNo }
      });
    }

    // Status filter
    if (status) {
      switch (status.toLowerCase()) {
        case 'approved':
          searchConditions.push({
            applicationStatus: { approvedFlag: true }
          });
          break;
        case 'rejected':
          searchConditions.push({
            applicationStatus: { 
              approvedFlag: false,
              declineDescription: { not: null }
            }
          });
          break;
        case 'pending':
          searchConditions.push({
            applicationStatus: { approvedFlag: null }
          });
          break;
      }
    }

    // Date range filter
    if (dateFrom || dateTo) {
      const dateFilter = {};
      if (dateFrom) dateFilter.gte = new Date(dateFrom);
      if (dateTo) dateFilter.lte = new Date(dateTo);
      searchConditions.push({
        applicationDate: dateFilter
      });
    }

    // Combine all conditions
    const whereClause = searchConditions.length > 0 
      ? { AND: searchConditions }
      : {};

    // Execute search
    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where: whereClause,
        include: {
          employee: {
            select: { id: true, name: true }
          },
          applicationStatus: true,

        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.application.count({ where: whereClause })
    ]);

    // Get MIS and Dump data separately for each application
    const results = await Promise.all(applications.map(async (app) => {
      // Get latest MIS data for this ARN
      const misData = await prisma.misRawData.findFirst({
        where: { arn: app.arn },
        orderBy: { uploadDate: 'desc' },
        select: { rawJson: true, uploadDate: true }
      });

      // Get latest Dump data for this ARN
      const dumpData = await prisma.dumpRawData.findFirst({
        where: { applRef: app.arn },
        orderBy: { uploadDate: 'desc' },
        select: { rawJson: true, uploadDate: true }
      });

      // Use decision date from dump data (variant-aware)
      const dumpDecisionDate = dumpData?.rawJson?.DECISIN_DT || 
                              dumpData?.rawJson?.['DECISIN_DT'] ||
                              dumpData?.rawJson?.FINAL_DECISION_DATE ||
                              dumpData?.rawJson?.['FINAL_DECISION_DATE'];
      const displayDate = dumpDecisionDate ? new Date(dumpDecisionDate) : app.applicationDate;

      return {
        id: app.id,
        arn: app.arn,
        customerName: app.customerName || 
                     dumpData?.rawJson?.CUSTOMER_NAME || 
                     dumpData?.rawJson?.['CUSTOMER_NAME'] || 
                     misData?.rawJson?.['CUSTOMER NAME'],
        mobileNo: app.mobileNo || 
                 misData?.rawJson?.['MOBILE NO'] || 
                 dumpData?.rawJson?.MOBILE_NO,
        applicationDate: displayDate,
        employee: app.employee,
        
        // Enhanced status with fallback to raw data when structured data is missing
        status: {
          approved: app.applicationStatus?.approvedFlag,
          bankStatus: app.applicationStatus?.bankStatus,
          declineDescription: app.applicationStatus?.declineDescription,
          declineCategory: app.applicationStatus?.declineCategory,
          activationStatus: app.applicationStatus?.activationStatus,
          decisionDate: app.applicationStatus?.decisionDate,
          
          // Enhanced fields with fallback to raw dump data
          finalDecision: app.applicationStatus?.finalDecision || 
                        dumpData?.rawJson?.FINAL_DECISION || 
                        dumpData?.rawJson?.['FINAL_DECISION'],
          finalDecisionDate: app.applicationStatus?.finalDecisionDate || 
                           (dumpData?.rawJson?.CREATION_DATE_TIME ? new Date(dumpData.rawJson.CREATION_DATE_TIME) : null),
          currentStage: app.applicationStatus?.currentStage || 
                       dumpData?.rawJson?.CURRENT_STAGE || 
                       dumpData?.rawJson?.['CURRENT_STAGE'],
          kycStatus: app.applicationStatus?.kycStatus || 
                    dumpData?.rawJson?.['KYC Status'] || 
                    dumpData?.rawJson?.KYC_STATUS,
          vkycStatus: app.applicationStatus?.vkycStatus || 
                     dumpData?.rawJson?.VKYC_STATUS || 
                     dumpData?.rawJson?.['VKYC_STATUS'],
          vkycConsentDate: app.applicationStatus?.vkycConsentDate || 
                          (dumpData?.rawJson?.VKYC_CONSENT_DATE ? new Date(dumpData.rawJson.VKYC_CONSENT_DATE) : null),
          declineCode: app.applicationStatus?.declineCode || 
                      dumpData?.rawJson?.DECLINE_CODE,
          companyName: app.applicationStatus?.companyName || 
                      dumpData?.rawJson?.COMPANY_NAME || 
                      dumpData?.rawJson?.['COMPANY_NAME'],
          productDescription: app.applicationStatus?.productDescription || 
                             dumpData?.rawJson?.['Product Des'] || 
                             dumpData?.rawJson?.PRODUCT_DESC,
          cardActivationStatus: app.applicationStatus?.cardActivationStatus || 
                               dumpData?.rawJson?.['Card Activation Status'] || 
                               dumpData?.rawJson?.CARD_ACTIVATION_STATUS,
          cardType: app.applicationStatus?.cardType || 
                   dumpData?.rawJson?.['Card Type'] || 
                   dumpData?.rawJson?.CARD_TYPE
        },
        
        // Raw data with variant info
        misData: misData?.rawJson || null,
        dumpData: {
          variant: dumpData ? (dumpData.rawJson?.APPLICATION_REFERENCE_NUMBER ? 'variant2' : 'variant1') : null,
          data: dumpData?.rawJson || null
        },
        lastUpdated: app.applicationStatus?.lastUpdated || app.updatedAt
      };
    }));

    res.json({
      results,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        pages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get unmapped dump records
router.get('/unmapped', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    const [unmappedRecords, total] = await Promise.all([
      prisma.dumpRawData.findMany({
        where: { isMapped: false },
        orderBy: { uploadDate: 'desc' },
        skip,
        take
      }),
      prisma.dumpRawData.count({ where: { isMapped: false } })
    ]);

    res.json({
      records: unmappedRecords,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        pages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Unmapped records error:', error);
    res.status(500).json({ error: 'Failed to fetch unmapped records' });
  }
});

// Export search results to Excel format (JSON response for frontend to handle)
router.post('/export', authenticateToken, async (req, res) => {
  try {
    const {
      query,
      employeeName,
      arn,
      customerName,
      mobileNo,
      status,
      dateFrom,
      dateTo
    } = req.body;

    // Build same search conditions as main search
    const searchConditions = [];

    if (query) {
      searchConditions.push({
        OR: [
          { arn: { contains: query, mode: 'insensitive' } },
          { customerName: { contains: query, mode: 'insensitive' } },
          { mobileNo: { contains: query } },
          { employee: { name: { contains: query, mode: 'insensitive' } } }
        ]
      });
    }

    if (employeeName) {
      searchConditions.push({
        employee: { name: { contains: employeeName, mode: 'insensitive' } }
      });
    }

    if (arn) {
      searchConditions.push({
        arn: { contains: arn, mode: 'insensitive' }
      });
    }

    if (customerName) {
      searchConditions.push({
        customerName: { contains: customerName, mode: 'insensitive' }
      });
    }

    if (mobileNo) {
      searchConditions.push({
        mobileNo: { contains: mobileNo }
      });
    }

    if (status) {
      switch (status.toLowerCase()) {
        case 'approved':
          searchConditions.push({
            applicationStatus: { approvedFlag: true }
          });
          break;
        case 'rejected':
          searchConditions.push({
            applicationStatus: { 
              approvedFlag: false,
              declineDescription: { not: null }
            }
          });
          break;
        case 'pending':
          searchConditions.push({
            applicationStatus: { approvedFlag: null }
          });
          break;
      }
    }

    if (dateFrom || dateTo) {
      const dateFilter = {};
      if (dateFrom) dateFilter.gte = new Date(dateFrom);
      if (dateTo) dateFilter.lte = new Date(dateTo);
      searchConditions.push({
        applicationDate: dateFilter
      });
    }

    const whereClause = searchConditions.length > 0 
      ? { AND: searchConditions }
      : {};

    // Get all matching records (limit to 10000 for performance)
    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        employee: {
          select: { name: true }
        },
        applicationStatus: true,
        misRawData: {
          select: { rawJson: true },
          orderBy: { uploadDate: 'desc' },
          take: 1
        },
        dumpRawData: {
          select: { rawJson: true },
          orderBy: { uploadDate: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10000
    });

    // Format for Excel export
    const exportData = applications.map(app => {
      const misData = app.misRawData[0]?.rawJson || {};
      const dumpData = app.dumpRawData[0]?.rawJson || {};

      return {
        ARN: app.arn,
        'Customer Name': app.customerName,
        'Mobile No': app.mobileNo,
        'Employee Name': app.employee.name,
        'Application Date': app.applicationDate,
        'Approved': app.applicationStatus?.approvedFlag ? 'Yes' : 'No',
        'Bank Status': app.applicationStatus?.bankStatus || '',
        'Decline Description': app.applicationStatus?.declineDescription || '',
        'Decline Category': app.applicationStatus?.declineCategory || '',
        'Activation Status': app.applicationStatus?.activationStatus || '',
        'Decision Date': app.applicationStatus?.decisionDate || '',
        // Add key MIS fields
        'VKYC Status': misData['VKYC STATUS'] || '',
        'BKYC Status': misData['BKYC STATUS'] || '',
        'MIS Decline Code': misData['DECLINE CODE'] || '',
        'Final Status': misData['FINAL'] || '',
        // Add key dump fields
        'City': dumpData['CITY'] || '',
        'Product': dumpData['PRODUCT'] || '',
        'Source': dumpData['SOURCE'] || ''
      };
    });

    res.json({
      data: exportData,
      count: exportData.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

module.exports = router;