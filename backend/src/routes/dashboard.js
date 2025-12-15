const express = require('express');
const prisma = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get dashboard metrics
router.get('/metrics', authenticateToken, async (req, res) => {
  try {
    const { dateFrom, dateTo, employeeId } = req.query;
    
    // Build date filter for dump data (where the real status info is)
    const dateFilter = {};
    if (dateFrom || dateTo) {
      dateFilter.uploadDate = {};
      if (dateFrom) dateFilter.uploadDate.gte = new Date(dateFrom);
      if (dateTo) dateFilter.uploadDate.lte = new Date(dateTo);
    }

    // Get all dump records with date filter
    const dumpRecords = await prisma.dumpRawData.findMany({
      where: dateFilter,
      select: {
        applRef: true,
        rawJson: true,
        isMapped: true
      }
    });

    // Get employee filter if specified
    let employeeFilteredRecords = dumpRecords;
    if (employeeId) {
      const employeeApplications = await prisma.application.findMany({
        where: { employeeId: parseInt(employeeId) },
        select: { arn: true }
      });
      const employeeArns = new Set(employeeApplications.map(app => app.arn));
      employeeFilteredRecords = dumpRecords.filter(record => employeeArns.has(record.applRef));
    }

    // Analyze status from raw dump data
    let approvedApplications = 0;
    let rejectedApplications = 0;
    let pendingApplications = 0;

    employeeFilteredRecords.forEach(record => {
      const data = record.rawJson;
      
      // Check for various status indicators in the raw data
      const finalDecision = data.FINAL_DECISION || data.final_decision || data.Final_Decision || '';
      const ipaStatus = data.IPA_STATUS || data.ipa_status || data.Ipa_Status || '';
      const currentStage = data.CURRENT_STAGE || data.current_stage || data.Current_Stage || '';
      const declineDescription = data.DECLINE_DESCRIPTION || data.decline_description || data.Decline_Description || '';
      
      // Determine status based on available fields
      const statusText = (finalDecision + ' ' + ipaStatus + ' ' + currentStage).toLowerCase();
      
      if (statusText.includes('approve') || statusText.includes('approved') || ipaStatus.toLowerCase() === 'approve') {
        approvedApplications++;
      } else if (statusText.includes('reject') || statusText.includes('declined') || statusText.includes('decline') || 
                 declineDescription || statusText.includes('failed')) {
        rejectedApplications++;
      } else {
        pendingApplications++;
      }
    });

    const totalApplications = employeeFilteredRecords.length;

    // Get other metrics
    const [
      totalEmployees,
      mappedDumpRecords,
      unmappedDumpRecords
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.dumpRawData.count({ where: { isMapped: true } }),
      prisma.dumpRawData.count({ where: { isMapped: false } })
    ]);

    // Calculate approval rate
    const approvalRate = totalApplications > 0 
      ? ((approvedApplications / totalApplications) * 100).toFixed(2)
      : 0;

    res.json({
      totalApplications,
      approvedApplications,
      rejectedApplications,
      pendingApplications,
      approvalRate: parseFloat(approvalRate),
      totalEmployees,
      mappedDumpRecords,
      unmappedDumpRecords
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
});

// Get employee performance
router.get('/employee-performance', authenticateToken, async (req, res) => {
  try {
    const { dateFrom, dateTo, limit = 10 } = req.query;
    
    // Build date filter for dump data
    const dateFilter = {};
    if (dateFrom || dateTo) {
      dateFilter.uploadDate = {};
      if (dateFrom) dateFilter.uploadDate.gte = new Date(dateFrom);
      if (dateTo) dateFilter.uploadDate.lte = new Date(dateTo);
    }

    // Get all employees with their applications
    const employeeStats = await prisma.employee.findMany({
      include: {
        applications: {
          select: {
            arn: true,
            applicationDate: true
          }
        }
      }
    });

    // Get dump data for status analysis
    const dumpRecords = await prisma.dumpRawData.findMany({
      where: dateFilter,
      select: {
        applRef: true,
        rawJson: true
      }
    });

    // Create a map of ARN to status
    const statusMap = new Map();
    dumpRecords.forEach(record => {
      const data = record.rawJson;
      const finalDecision = data.FINAL_DECISION || data.final_decision || data.Final_Decision || '';
      const ipaStatus = data.IPA_STATUS || data.ipa_status || data.Ipa_Status || '';
      const currentStage = data.CURRENT_STAGE || data.current_stage || data.Current_Stage || '';
      const declineDescription = data.DECLINE_DESCRIPTION || data.decline_description || data.Decline_Description || '';
      
      const statusText = (finalDecision + ' ' + ipaStatus + ' ' + currentStage).toLowerCase();
      
      let status = 'pending';
      if (statusText.includes('approve') || statusText.includes('approved') || ipaStatus.toLowerCase() === 'approve') {
        status = 'approved';
      } else if (statusText.includes('reject') || statusText.includes('declined') || statusText.includes('decline') || 
                 declineDescription || statusText.includes('failed')) {
        status = 'rejected';
      }
      
      statusMap.set(record.applRef, status);
    });

    const performance = employeeStats.map(employee => {
      // Filter applications by date if specified
      let applications = employee.applications;
      if (dateFrom || dateTo) {
        applications = applications.filter(app => {
          const appDate = new Date(app.applicationDate);
          if (dateFrom && appDate < new Date(dateFrom)) return false;
          if (dateTo && appDate > new Date(dateTo)) return false;
          return true;
        });
      }

      const total = applications.length;
      let approved = 0;
      let rejected = 0;
      let pending = 0;

      applications.forEach(app => {
        const status = statusMap.get(app.arn) || 'pending';
        if (status === 'approved') approved++;
        else if (status === 'rejected') rejected++;
        else pending++;
      });

      const conversionRate = total > 0 ? ((approved / total) * 100).toFixed(2) : 0;

      return {
        employeeId: employee.id,
        employeeName: employee.name,
        totalApplications: total,
        approvedApplications: approved,
        rejectedApplications: rejected,
        pendingApplications: pending,
        conversionRate: parseFloat(conversionRate)
      };
    });

    // Sort by total applications desc and take top performers
    performance.sort((a, b) => b.totalApplications - a.totalApplications);

    res.json(performance.slice(0, parseInt(limit)));
  } catch (error) {
    console.error('Employee performance error:', error);
    res.status(500).json({ error: 'Failed to fetch employee performance' });
  }
});

// Get rejection analysis
router.get('/rejection-analysis', authenticateToken, async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    
    // Build date filter for dump data
    const dateFilter = {};
    if (dateFrom || dateTo) {
      dateFilter.uploadDate = {};
      if (dateFrom) dateFilter.uploadDate.gte = new Date(dateFrom);
      if (dateTo) dateFilter.uploadDate.lte = new Date(dateTo);
    }

    // Get dump records to analyze rejection reasons
    const dumpRecords = await prisma.dumpRawData.findMany({
      where: dateFilter,
      select: {
        rawJson: true
      }
    });

    // Analyze rejection reasons from raw data
    const rejectionReasonCounts = new Map();
    const rejectionCategoryCounts = new Map();

    dumpRecords.forEach(record => {
      const data = record.rawJson;
      
      // Check if this is a rejected application
      const finalDecision = data.FINAL_DECISION || data.final_decision || data.Final_Decision || '';
      const ipaStatus = data.IPA_STATUS || data.ipa_status || data.Ipa_Status || '';
      const currentStage = data.CURRENT_STAGE || data.current_stage || data.Current_Stage || '';
      const declineDescription = data.DECLINE_DESCRIPTION || data.decline_description || data.Decline_Description || '';
      const dropStage = data['Drop Satge'] || data.DROP_STAGE || data.drop_stage || '';
      
      const statusText = (finalDecision + ' ' + ipaStatus + ' ' + currentStage + ' ' + dropStage).toLowerCase();
      
      // Check if this is a rejection
      const isRejected = statusText.includes('reject') || statusText.includes('declined') || 
                        statusText.includes('decline') || statusText.includes('failed') ||
                        declineDescription;

      if (isRejected) {
        // Extract rejection reason
        let reason = declineDescription || finalDecision || dropStage || currentStage || 'Unknown Reason';
        if (reason && reason.trim()) {
          reason = reason.trim();
          rejectionReasonCounts.set(reason, (rejectionReasonCounts.get(reason) || 0) + 1);
        }

        // Extract rejection category (simplified categorization)
        let category = 'Other';
        const reasonLower = reason.toLowerCase();
        if (reasonLower.includes('kyc') || reasonLower.includes('vkyc') || reasonLower.includes('bkyc')) {
          category = 'KYC Issues';
        } else if (reasonLower.includes('document') || reasonLower.includes('doc')) {
          category = 'Documentation';
        } else if (reasonLower.includes('income') || reasonLower.includes('salary') || reasonLower.includes('eligibility')) {
          category = 'Eligibility';
        } else if (reasonLower.includes('duplicate') || reasonLower.includes('existing')) {
          category = 'Duplicate Application';
        } else if (reasonLower.includes('technical') || reasonLower.includes('system') || reasonLower.includes('error')) {
          category = 'Technical Issues';
        }
        
        rejectionCategoryCounts.set(category, (rejectionCategoryCounts.get(category) || 0) + 1);
      }
    });

    // Convert maps to arrays and sort by count
    const rejectionReasons = Array.from(rejectionReasonCounts.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const rejectionCategories = Array.from(rejectionCategoryCounts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json({
      rejectionReasons,
      rejectionCategories
    });
  } catch (error) {
    console.error('Rejection analysis error:', error);
    res.status(500).json({ error: 'Failed to fetch rejection analysis' });
  }
});

// Get date-wise trends
router.get('/trends', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get dump records for the specified period
    const dumpRecords = await prisma.dumpRawData.findMany({
      where: {
        uploadDate: {
          gte: startDate
        }
      },
      select: {
        uploadDate: true,
        rawJson: true
      },
      orderBy: {
        uploadDate: 'desc'
      }
    });

    // Group by date and calculate metrics
    const trendsMap = new Map();
    
    dumpRecords.forEach(record => {
      const dateKey = record.uploadDate.toISOString().split('T')[0];
      
      if (!trendsMap.has(dateKey)) {
        trendsMap.set(dateKey, {
          date: dateKey,
          total_applications: 0,
          approved: 0,
          rejected: 0
        });
      }
      
      const dayData = trendsMap.get(dateKey);
      dayData.total_applications++;
      
      // Analyze status from raw data
      const data = record.rawJson;
      const finalDecision = data.FINAL_DECISION || data.final_decision || data.Final_Decision || '';
      const ipaStatus = data.IPA_STATUS || data.ipa_status || data.Ipa_Status || '';
      const currentStage = data.CURRENT_STAGE || data.current_stage || data.Current_Stage || '';
      const declineDescription = data.DECLINE_DESCRIPTION || data.decline_description || data.Decline_Description || '';
      
      const statusText = (finalDecision + ' ' + ipaStatus + ' ' + currentStage).toLowerCase();
      
      if (statusText.includes('approve') || statusText.includes('approved') || ipaStatus.toLowerCase() === 'approve') {
        dayData.approved++;
      } else if (statusText.includes('reject') || statusText.includes('declined') || statusText.includes('decline') || 
                 declineDescription || statusText.includes('failed')) {
        dayData.rejected++;
      }
    });

    const trends = Array.from(trendsMap.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 30);

    res.json(trends);
  } catch (error) {
    console.error('Trends error:', error);
    res.status(500).json({ error: 'Failed to fetch trends data' });
  }
});

// Get VKYC/BKYC funnel (if available in MIS data)
router.get('/kyc-funnel', authenticateToken, async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    
    const dateFilter = {};
    if (dateFrom || dateTo) {
      dateFilter.uploadDate = {};
      if (dateFrom) dateFilter.uploadDate.gte = new Date(dateFrom);
      if (dateTo) dateFilter.uploadDate.lte = new Date(dateTo);
    }

    // Extract VKYC and BKYC status from raw MIS data
    const misData = await prisma.misRawData.findMany({
      where: dateFilter,
      select: {
        rawJson: true
      }
    });

    let vkycCompleted = 0;
    let bkycCompleted = 0;
    let totalRecords = misData.length;

    misData.forEach(record => {
      const data = record.rawJson;
      
      // Check for VKYC status (flexible key matching)
      const vkycKey = Object.keys(data).find(key => 
        key.toString().toUpperCase().includes('VKYC')
      );
      if (vkycKey && data[vkycKey]?.toString().toLowerCase().includes('completed')) {
        vkycCompleted++;
      }

      // Check for BKYC status
      const bkycKey = Object.keys(data).find(key => 
        key.toString().toUpperCase().includes('BKYC')
      );
      if (bkycKey && data[bkycKey]?.toString().toLowerCase().includes('completed')) {
        bkycCompleted++;
      }
    });

    res.json({
      totalRecords,
      vkycCompleted,
      bkycCompleted,
      vkycCompletionRate: totalRecords > 0 ? ((vkycCompleted / totalRecords) * 100).toFixed(2) : 0,
      bkycCompletionRate: totalRecords > 0 ? ((bkycCompleted / totalRecords) * 100).toFixed(2) : 0
    });
  } catch (error) {
    console.error('KYC funnel error:', error);
    res.status(500).json({ error: 'Failed to fetch KYC funnel data' });
  }
});

module.exports = router;