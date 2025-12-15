const bcrypt = require('bcryptjs');
const prisma = require('./config/database');

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create admin user
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin'
      }
    });

    console.log('✅ Admin user created:', adminUser.email);

    // Create viewer user
    const viewerUser = await prisma.user.upsert({
      where: { email: 'viewer@example.com' },
      update: {},
      create: {
        email: 'viewer@example.com',
        password: hashedPassword,
        name: 'Viewer User',
        role: 'viewer'
      }
    });

    console.log('✅ Viewer user created:', viewerUser.email);

    // Create sample employees
    const employees = [
      'John Smith',
      'Sarah Johnson',
      'Mike Wilson',
      'Emily Davis',
      'David Brown'
    ];

    for (const empName of employees) {
      await prisma.employee.upsert({
        where: { name: empName },
        update: {},
        create: { name: empName }
      });
    }

    console.log('✅ Sample employees created');

    // Create sample applications
    const sampleApplications = [
      {
        arn: 'ARN001234567',
        employeeName: 'John Smith',
        customerName: 'Alice Johnson',
        mobileNo: '9876543210',
        applicationDate: new Date('2024-01-15')
      },
      {
        arn: 'ARN001234568',
        employeeName: 'Sarah Johnson',
        customerName: 'Bob Wilson',
        mobileNo: '9876543211',
        applicationDate: new Date('2024-01-16')
      },
      {
        arn: 'ARN001234569',
        employeeName: 'Mike Wilson',
        customerName: 'Carol Davis',
        mobileNo: '9876543212',
        applicationDate: new Date('2024-01-17')
      }
    ];

    for (const app of sampleApplications) {
      const employee = await prisma.employee.findUnique({
        where: { name: app.employeeName }
      });

      if (employee) {
        const application = await prisma.application.upsert({
          where: { arn: app.arn },
          update: {},
          create: {
            arn: app.arn,
            employeeId: employee.id,
            customerName: app.customerName,
            mobileNo: app.mobileNo,
            applicationDate: app.applicationDate
          }
        });

        // Create sample MIS raw data
        await prisma.misRawData.upsert({
          where: { id: parseInt(app.arn.slice(-1)) },
          update: {},
          create: {
            arn: app.arn,
            rawJson: {
              'DATE': app.applicationDate.toISOString().split('T')[0],
              'ARN NO': app.arn,
              'CUSTOMER NAME': app.customerName,
              'MOBILE NO': app.mobileNo,
              'EMP NAME': app.employeeName,
              'VKYC STATUS': 'COMPLETED',
              'BKYC STATUS': 'COMPLETED',
              'DECLINE CODE': '',
              'FINAL': 'APPROVED'
            }
          }
        });

        // Create sample application status
        await prisma.applicationStatus.upsert({
          where: { arn: app.arn },
          update: {},
          create: {
            arn: app.arn,
            bankStatus: 'APPROVED',
            approvedFlag: true,
            activationStatus: 'ACTIVE',
            decisionDate: new Date(app.applicationDate.getTime() + 5 * 24 * 60 * 60 * 1000) // 5 days later
          }
        });

        // Create sample dump raw data
        await prisma.dumpRawData.create({
          data: {
            applRef: app.arn,
            rawJson: {
              'APPL_REF': app.arn,
              'FULL_NAME': app.customerName,
              'CITY': 'Mumbai',
              'PRODUCT': 'Credit Card',
              'DECLINE_DESCRIPTION': '',
              'DECLINE_CATEGORY': '',
              'Activation Status': 'ACTIVE',
              'DECISIN_DT': new Date(app.applicationDate.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            },
            isMapped: true
          }
        });

        console.log(`✅ Sample application created: ${app.arn}`);
      }
    }

    // Create sample upload logs
    await prisma.uploadLog.create({
      data: {
        fileType: 'MIS',
        recordCount: 3,
        fileName: 'sample_mis_data.xlsx',
        uploadedBy: 'admin@example.com',
        status: 'success'
      }
    });

    await prisma.uploadLog.create({
      data: {
        fileType: 'DUMP',
        recordCount: 3,
        fileName: 'sample_dump_data.xlsx',
        uploadedBy: 'admin@example.com',
        status: 'success'
      }
    });

    console.log('✅ Sample upload logs created');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin: admin@example.com / password123');
    console.log('Viewer: viewer@example.com / password123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding
if (require.main === module) {
  seed()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = seed;