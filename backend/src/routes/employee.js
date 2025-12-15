const express = require('express');
const prisma = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all employees
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        include: {
          _count: {
            select: { applications: true }
          }
        },
        orderBy: { name: 'asc' },
        skip,
        take
      }),
      prisma.employee.count()
    ]);

    res.json({
      employees,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        pages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Get employee details with applications
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, dateFrom, dateTo } = req.query;
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    // Build date filter for applications
    const dateFilter = {};
    if (dateFrom || dateTo) {
      dateFilter.applicationDate = {};
      if (dateFrom) dateFilter.applicationDate.gte = new Date(dateFrom);
      if (dateTo) dateFilter.applicationDate.lte = new Date(dateTo);
    }

    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(id) },
      include: {
        applications: {
          where: dateFilter,
          include: {
            applicationStatus: true
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take
        }
      }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Get total count for pagination
    const totalApplications = await prisma.application.count({
      where: {
        employeeId: parseInt(id),
        ...dateFilter
      }
    });

    // Calculate employee stats
    const allApplications = await prisma.application.findMany({
      where: {
        employeeId: parseInt(id),
        ...dateFilter
      },
      include: {
        applicationStatus: true
      }
    });

    const stats = {
      totalApplications: allApplications.length,
      approvedApplications: allApplications.filter(app => 
        app.applicationStatus?.approvedFlag === true
      ).length,
      rejectedApplications: allApplications.filter(app => 
        app.applicationStatus?.approvedFlag === false && 
        app.applicationStatus?.declineDescription
      ).length,
      pendingApplications: allApplications.filter(app => 
        app.applicationStatus?.approvedFlag === null
      ).length
    };

    stats.conversionRate = stats.totalApplications > 0 
      ? ((stats.approvedApplications / stats.totalApplications) * 100).toFixed(2)
      : 0;

    res.json({
      employee: {
        id: employee.id,
        name: employee.name,
        createdAt: employee.createdAt
      },
      stats,
      applications: employee.applications,
      pagination: {
        page: parseInt(page),
        limit: take,
        total: totalApplications,
        pages: Math.ceil(totalApplications / take)
      }
    });
  } catch (error) {
    console.error('Get employee details error:', error);
    res.status(500).json({ error: 'Failed to fetch employee details' });
  }
});

// Get employee performance comparison
router.get('/performance/comparison', authenticateToken, async (req, res) => {
  try {
    const { dateFrom, dateTo, limit = 20 } = req.query;
    
    const dateFilter = {};
    if (dateFrom || dateTo) {
      dateFilter.applicationDate = {};
      if (dateFrom) dateFilter.applicationDate.gte = new Date(dateFrom);
      if (dateTo) dateFilter.applicationDate.lte = new Date(dateTo);
    }

    const employees = await prisma.employee.findMany({
      include: {
        applications: {
          where: dateFilter,
          include: {
            applicationStatus: true
          }
        }
      },
      take: parseInt(limit)
    });

    const performance = employees.map(employee => {
      const applications = employee.applications;
      const total = applications.length;
      const approved = applications.filter(app => 
        app.applicationStatus?.approvedFlag === true
      ).length;
      const rejected = applications.filter(app => 
        app.applicationStatus?.approvedFlag === false && 
        app.applicationStatus?.declineDescription
      ).length;
      const pending = total - approved - rejected;

      // Calculate average processing time (if decision date available)
      const processedApps = applications.filter(app => 
        app.applicationStatus?.decisionDate
      );
      let avgProcessingDays = 0;
      if (processedApps.length > 0) {
        const totalDays = processedApps.reduce((sum, app) => {
          const appDate = new Date(app.applicationDate);
          const decisionDate = new Date(app.applicationStatus.decisionDate);
          const diffDays = Math.ceil((decisionDate - appDate) / (1000 * 60 * 60 * 24));
          return sum + diffDays;
        }, 0);
        avgProcessingDays = (totalDays / processedApps.length).toFixed(1);
      }

      return {
        employeeId: employee.id,
        employeeName: employee.name,
        totalApplications: total,
        approvedApplications: approved,
        rejectedApplications: rejected,
        pendingApplications: pending,
        conversionRate: total > 0 ? parseFloat(((approved / total) * 100).toFixed(2)) : 0,
        avgProcessingDays: parseFloat(avgProcessingDays)
      };
    });

    // Sort by conversion rate desc, then by total applications desc
    performance.sort((a, b) => {
      if (b.conversionRate !== a.conversionRate) {
        return b.conversionRate - a.conversionRate;
      }
      return b.totalApplications - a.totalApplications;
    });

    res.json(performance);
  } catch (error) {
    console.error('Employee performance comparison error:', error);
    res.status(500).json({ error: 'Failed to fetch employee performance comparison' });
  }
});

// Get top performing employees
router.get('/performance/top', authenticateToken, async (req, res) => {
  try {
    const { metric = 'conversion', limit = 10, dateFrom, dateTo } = req.query;
    
    const dateFilter = {};
    if (dateFrom || dateTo) {
      dateFilter.applicationDate = {};
      if (dateFrom) dateFilter.applicationDate.gte = new Date(dateFrom);
      if (dateTo) dateFilter.applicationDate.lte = new Date(dateTo);
    }

    const employees = await prisma.employee.findMany({
      include: {
        applications: {
          where: dateFilter,
          include: {
            applicationStatus: true
          }
        }
      }
    });

    const performance = employees
      .map(employee => {
        const applications = employee.applications;
        const total = applications.length;
        const approved = applications.filter(app => 
          app.applicationStatus?.approvedFlag === true
        ).length;

        return {
          employeeId: employee.id,
          employeeName: employee.name,
          totalApplications: total,
          approvedApplications: approved,
          conversionRate: total > 0 ? parseFloat(((approved / total) * 100).toFixed(2)) : 0
        };
      })
      .filter(emp => emp.totalApplications > 0); // Only include employees with applications

    // Sort based on metric
    switch (metric) {
      case 'conversion':
        performance.sort((a, b) => b.conversionRate - a.conversionRate);
        break;
      case 'volume':
        performance.sort((a, b) => b.totalApplications - a.totalApplications);
        break;
      case 'approved':
        performance.sort((a, b) => b.approvedApplications - a.approvedApplications);
        break;
      default:
        performance.sort((a, b) => b.conversionRate - a.conversionRate);
    }

    res.json(performance.slice(0, parseInt(limit)));
  } catch (error) {
    console.error('Top performers error:', error);
    res.status(500).json({ error: 'Failed to fetch top performers' });
  }
});

module.exports = router;