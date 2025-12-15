const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkARN() {
  try {
    const arn = 'D25L11297946H0S2';
    
    console.log(`🔍 Checking ARN: ${arn}`);
    
    // Check application
    const app = await prisma.application.findUnique({
      where: { arn },
      include: { 
        applicationStatus: true,
        employee: true
      }
    });
    
    console.log('📋 Application:', app ? 'Found' : 'Not found');
    if (app) {
      console.log('  Customer:', app.customerName);
      console.log('  Employee:', app.employee?.name);
      console.log('  Status:', app.applicationStatus ? 'Has status' : 'No status');
    }
    
    // Check dump record
    const dump = await prisma.dumpRawData.findFirst({
      where: { applRef: arn }
    });
    
    console.log('🏦 Dump record:', dump ? 'Found' : 'Not found');
    if (dump) {
      console.log('  Mapped:', dump.isMapped);
      console.log('  Variant:', dump.variant);
      console.log('  Raw data keys:', Object.keys(dump.rawJson));
    }
    
    // Check MIS record
    const mis = await prisma.misRawData.findFirst({
      where: { arn }
    });
    
    console.log('📊 MIS record:', mis ? 'Found' : 'Not found');
    if (mis) {
      console.log('  Raw data keys:', Object.keys(mis.rawJson));
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkARN();