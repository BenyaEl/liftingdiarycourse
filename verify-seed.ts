import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL!);
const USER_ID = 'user_37ycZGbRir87wvNbnZIzI9SG7Oc';

async function verify() {
  console.log('\n🔍 Verifying seeded data...\n');

  // Count exercises
  const exercises = await sql`SELECT COUNT(*) as count FROM exercises`;
  console.log(`✓ Exercises: ${exercises[0].count}`);

  // Count workouts for user
  const workouts = await sql`SELECT COUNT(*) as count FROM workouts WHERE user_id = ${USER_ID}`;
  console.log(`✓ Workouts for user: ${workouts[0].count}`);

  // Get workout summary
  const workoutDetails = await sql`
    SELECT
      w.title,
      w.workout_date,
      w.completed_at IS NOT NULL as completed,
      COUNT(DISTINCT we.id) as exercise_count,
      COUNT(s.id) as total_sets
    FROM workouts w
    LEFT JOIN workout_exercises we ON w.id = we.workout_id
    LEFT JOIN sets s ON we.id = s.workout_exercise_id
    WHERE w.user_id = ${USER_ID}
    GROUP BY w.id, w.title, w.workout_date, w.completed_at
    ORDER BY w.workout_date DESC
  `;

  console.log('\n📋 Workout Details:');
  workoutDetails.forEach((w: any) => {
    const status = w.completed ? '✅ Completed' : '⏳ In Progress';
    console.log(`  ${status} - ${w.title} (${w.exercise_count} exercises, ${w.total_sets} sets)`);
  });

  console.log('\n✅ Verification complete!\n');
}

verify();
