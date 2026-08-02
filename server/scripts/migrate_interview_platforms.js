import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { Interview, MEETING_PLATFORMS } from '../models/interview.model.js';
import { InterviewRoom } from '../models/interviewRoom.model.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillbridge';

async function runInterviewPlatformMigration() {
  console.log('\n===========================================================');
  console.log('🚀 SKILLBRIDGE AI — INTERVIEW PLATFORM ONE-TIME MIGRATION');
  console.log('===========================================================\n');

  let updatedCount = 0;
  let skippedCount = 0;
  let createdRoomsCount = 0;
  let errorsCount = 0;

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✔ Connected to MongoDB successfully.');

    // Fetch all interviews in database
    const interviews = await Interview.find({});
    console.log(`Found ${interviews.length} total interview records to audit.\n`);

    for (const interview of interviews) {
      try {
        let needsUpdate = false;

        // 1. Audit & Fix meetingPlatform
        if (interview.meetingPlatform !== 'SkillBridge AI Private Room') {
          interview.meetingPlatform = 'SkillBridge AI Private Room';
          needsUpdate = true;
        }

        // 2. Audit & Fix meetingLink
        let roomId = '';
        if (interview.meetingLink && interview.meetingLink.startsWith('/interview/room/')) {
          roomId = interview.meetingLink.replace('/interview/room/', '');
        } else {
          // Generate new UUID for internal room
          roomId = crypto.randomUUID();
          interview.meetingLink = `/interview/room/${roomId}`;
          needsUpdate = true;
        }

        // 3. Ensure InterviewRoom document exists
        if (roomId && interview.applicationId && interview.candidateId && interview.companyId && interview.jobId) {
          const existingRoom = await InterviewRoom.findOne({
            $or: [{ roomId }, { uuid: roomId }],
          });

          if (!existingRoom) {
            await InterviewRoom.create({
              roomId,
              uuid: roomId,
              applicationId: interview.applicationId,
              candidateId: interview.candidateId,
              companyId: interview.companyId,
              jobId: interview.jobId,
              interviewType: interview.interviewType || 'Technical',
              scheduledDate: interview.scheduledDate || new Date(),
              scheduledAt: interview.scheduledDate || new Date(),
              durationMinutes: 45,
              status: interview.status === 'Completed' ? 'completed' : interview.status === 'Cancelled' ? 'cancelled' : 'scheduled',
            });
            createdRoomsCount++;
            console.log(`✔ Created InterviewRoom [${roomId}] for Interview [${interview._id}]`);
          }
        }

        if (needsUpdate || interview.isModified()) {
          await interview.save();
          updatedCount++;
          console.log(`✔ Updated Interview [${interview._id}] -> Platform: "${interview.meetingPlatform}", Link: "${interview.meetingLink}"`);
        } else {
          skippedCount++;
        }
      } catch (err) {
        errorsCount++;
        console.error(`❌ Error migrating Interview [${interview._id}]:`, err.message);
      }
    }

    console.log('\n===========================================================');
    console.log('📊 MIGRATION SUMMARY REPORT');
    console.log('===========================================================');
    console.log(`Total Interviews Examined : ${interviews.length}`);
    console.log(`Updated Interviews       : ${updatedCount}`);
    console.log(`Skipped Interviews       : ${skippedCount}`);
    console.log(`Created InterviewRooms   : ${createdRoomsCount}`);
    console.log(`Migration Errors         : ${errorsCount}`);
    console.log('===========================================================\n');

    process.exit(0);
  } catch (fatalErr) {
    console.error('❌ FATAL MIGRATION SCRIPT ERROR:', fatalErr);
    process.exit(1);
  }
}

runInterviewPlatformMigration();
