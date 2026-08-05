import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// 1. Import plugin and register globally on Mongoose
import { realtimeMongoosePlugin } from './utils/realtime.js';
mongoose.plugin(realtimeMongoosePlugin);

// 2. Define a clean test schema that compiles AFTER plugin is registered
const testSchema = new mongoose.Schema({
  companyName: String,
  email: String,
});
const TestCompanyModel = mongoose.model('TestCompanyModel', testSchema);

const { AuditLog } = await import('./models/auditLog.model.js');
const { requestContextStore } = await import('./middleware/context.middleware.js');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillbridge';

async function runE2EAuditCenterTest() {
  console.log('\n===========================================================');
  console.log('⚡ STARTING ENTERPRISE AUDIT LOG & TIMELINE E2E TEST SUITE');
  console.log('===========================================================\n');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✔ Connected to MongoDB.');

    // Cleanup previous test logs to make test validation precise
    await AuditLog.deleteMany({ action: /SYNC_TEST_/ });
    await AuditLog.deleteMany({ targetCollection: 'TestCompanyModel' });

    // Mock Context
    const mockContext = {
      userId: new mongoose.Types.ObjectId(),
      role: 'company',
      ipAddress: '8.8.8.8',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (Chrome/120.0.0.0 Safari/537.36)',
      browser: 'Chrome',
      operatingSystem: 'Windows',
      requestId: `req-sync-test-${Date.now()}`,
    };

    console.log('--- TEST 1: ASYNC CONTEXT BINDING & IP LOCATION VERIFICATION ---');
    
    // Execute inside requestContextStore run scope
    await new Promise((resolve, reject) => {
      requestContextStore.run(mockContext, async () => {
        try {
          // Trigger a Save operation (create)
          const comp = await TestCompanyModel.create({
            companyName: 'Sync Test Corporation',
            email: `sync_test_corp_${Date.now()}@skillbridge.ai`,
          });

          // Modify company to trigger update log
          comp.companyName = 'Sync Test Corp Updated';
          await comp.save();

          // Wait a brief moment for async AuditLog.create background promises to resolve
          await new Promise((r) => setTimeout(r, 1000));

          // Query Audit Logs
          const logs = await AuditLog.find({ userId: mockContext.userId }).lean();
          console.log(`✔ Found ${logs.length} audit logs registered for context userId.`);
          
          if (logs.length === 0) {
            const allLogs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(5).lean();
            console.log('Recent logs in DB:', allLogs.map(l => ({ action: l.action, userId: l.userId, role: l.role })));
            throw new Error('No audit logs created for the test company!');
          }

          // Verify context attributes propagated correctly
          const updateLog = await AuditLog.findOne({ 
            action: 'TESTCOMPANYMODEL_UPDATE',
            targetCollection: 'TestCompanyModel',
            targetId: comp._id
          }).lean();

          if (!updateLog) {
            throw new Error('Audit log for TESTCOMPANYMODEL_UPDATE not recorded!');
          }

          console.log('✔ Audit log registered action:', updateLog.action);
          console.log('✔ Actor Role recorded:', updateLog.role);
          console.log('✔ Geolocation country:', updateLog.country);
          console.log('✔ Geolocation city:', updateLog.city);
          console.log('✔ Client IP address:', updateLog.ipAddress);
          console.log('✔ Client Browser:', updateLog.deviceInfo?.browser);
          console.log('✔ Client OS:', updateLog.deviceInfo?.os);
          console.log('✔ Request ID trace:', updateLog.requestId);

          if (updateLog.role !== 'company') throw new Error('Expected company role in audit log');
          if (updateLog.country !== 'India') throw new Error('Expected resolved Indian location for IP 8.8.8.8');
          if (updateLog.requestId !== mockContext.requestId) throw new Error('Request ID trace mismatch');

          // Clean up created company
          await TestCompanyModel.deleteOne({ _id: comp._id });
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });

    console.log('\n===========================================================');
    console.log('🎉 ENTERPRISE AUDIT TIMELINE E2E SYSTEM 100% VERIFIED');
    console.log('===========================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ E2E test failed with errors:', err.message);
    process.exit(1);
  }
}

runE2EAuditCenterTest();
