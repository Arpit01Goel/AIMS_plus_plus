/**
 * Migration Script: Merge Advisor role into Instructor role
 * 
 * This script migrates existing ADVISOR users to INSTRUCTOR users with isAdvisor=true.
 * It performs the following:
 * 1. Find all users with ADVISOR role
 * 2. Create or update their instructor profile with isAdvisor=true
 * 3. Copy advisor-specific fields (primaryCohort, notes) to instructor fields
 * 4. Update user role from ADVISOR to INSTRUCTOR
 * 5. Keep student.advisorId references intact (they now point to instructor.id)
 * 
 * Run this BEFORE applying the schema migration that removes the Advisor model.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateAdvisorsToInstructors() {
  console.log('Starting migration: Advisors → Instructors with isAdvisor flag\n');

  try {
    // Step 1: Find all advisor users
    const advisorUsers = await prisma.user.findMany({
      where: { role: 'ADVISOR' },
      include: {
        advisor: {
          include: {
            department: true,
            program: true,
          },
        },
        instructor: true,
      },
    });

    console.log(`Found ${advisorUsers.length} users with ADVISOR role\n`);

    if (advisorUsers.length === 0) {
      console.log('No advisors to migrate. Exiting.');
      return;
    }

    // Step 2: Migrate each advisor
    for (const user of advisorUsers) {
      console.log(`Migrating user: ${user.email} (${user.name || 'No name'})`);

      if (!user.advisor) {
        console.log(`  ⚠️  User has ADVISOR role but no advisor profile. Skipping.`);
        continue;
      }

      try {
        // Check if instructor profile already exists
        if (user.instructor) {
          console.log(`  ℹ️  Instructor profile exists. Updating with advisor data...`);
          
          // Update existing instructor profile to include advisor info
          await prisma.instructor.update({
            where: { id: user.instructor.id },
            data: {
              isAdvisor: true,
              primaryCohort: user.advisor.primaryCohort,
              advisorNotes: user.advisor.notes,
              // Keep existing instructor fields
            },
          });

          console.log(`  ✅ Updated instructor profile with advisor data`);
        } else {
          console.log(`  ℹ️  Creating new instructor profile with advisor data...`);
          
          // Create new instructor profile from advisor data
          await prisma.instructor.create({
            data: {
              userId: user.id,
              isAdvisor: true,
              primaryCohort: user.advisor.primaryCohort,
              advisorNotes: user.advisor.notes,
              departmentId: user.advisor.departmentId,
              // Default instructor fields
              title: null,
              officialEmail: null,
            },
          });

          console.log(`  ✅ Created instructor profile with advisor data`);
        }

        // Step 3: Update user role from ADVISOR to INSTRUCTOR
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'INSTRUCTOR' },
        });

        console.log(`  ✅ Updated user role to INSTRUCTOR`);
        console.log(`  📝 Students advised: ${user.advisor._count?.students || 0}\n`);

      } catch (error) {
        console.error(`  ❌ Error migrating user ${user.email}:`, error);
        console.log(`  Continuing with next user...\n`);
      }
    }

    // Step 4: Summary
    console.log('\n' + '='.repeat(60));
    console.log('Migration Summary:');
    console.log('='.repeat(60));

    const instructorsWithAdvisor = await prisma.instructor.count({
      where: { isAdvisor: true },
    });

    const remainingAdvisors = await prisma.user.count({
      where: { role: 'ADVISOR' },
    });

    console.log(`✅ Instructors with advisor role: ${instructorsWithAdvisor}`);
    console.log(`⚠️  Remaining ADVISOR role users: ${remainingAdvisors}`);

    if (remainingAdvisors > 0) {
      console.log('\n⚠️  Warning: Some users still have ADVISOR role.');
      console.log('   Review the logs above for errors.');
    } else {
      console.log('\n✅ All advisors successfully migrated to instructors!');
      console.log('\n📋 Next steps:');
      console.log('   1. Review the migration results');
      console.log('   2. Run: npx prisma migrate dev --name merge-advisor-into-instructor');
      console.log('   3. Test the application thoroughly');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateAdvisorsToInstructors()
  .then(() => {
    console.log('\n✅ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration script failed:', error);
    process.exit(1);
  });
