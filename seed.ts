import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './src/db/schema';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const USER_ID = 'user_37ycZGbRir87wvNbnZIzI9SG7Oc';

async function seed() {
  console.log('🌱 Seeding database...\n');

  try {
    // 1. Insert exercises (common compound movements)
    console.log('📝 Creating exercises...');
    const exercises = await db.insert(schema.exercisesTable).values([
      {
        name: 'Barbell Bench Press',
        videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
        isCustom: false,
        userId: null, // Global exercise
      },
      {
        name: 'Barbell Squat',
        videoUrl: 'https://www.youtube.com/watch?v=ultWZbUMPL8',
        isCustom: false,
        userId: null,
      },
      {
        name: 'Barbell Deadlift',
        videoUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
        isCustom: false,
        userId: null,
      },
      {
        name: 'Overhead Press',
        videoUrl: 'https://www.youtube.com/watch?v=2yjwXTZQDDI',
        isCustom: false,
        userId: null,
      },
      {
        name: 'Barbell Row',
        videoUrl: 'https://www.youtube.com/watch?v=9efgcAjQe7E',
        isCustom: false,
        userId: null,
      },
      {
        name: 'Pull-ups',
        videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
        isCustom: false,
        userId: null,
      },
      {
        name: 'Dumbbell Lateral Raise',
        videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
        isCustom: false,
        userId: null,
      },
      {
        name: 'Leg Press',
        videoUrl: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
        isCustom: false,
        userId: null,
      },
      {
        name: 'Romanian Deadlift',
        videoUrl: 'https://www.youtube.com/watch?v=2SHsk9AzdjA',
        isCustom: false,
        userId: null,
      },
      {
        name: 'Incline Dumbbell Press',
        videoUrl: 'https://www.youtube.com/watch?v=8iPEnn-ltC8',
        isCustom: false,
        userId: null,
      },
      {
        name: 'Cable Tricep Pushdown',
        videoUrl: null,
        isCustom: true,
        userId: USER_ID, // Custom exercise for this user
      },
    ]).returning();

    console.log(`✓ Created ${exercises.length} exercises\n`);

    // 2. Create workout sessions
    console.log('💪 Creating workout sessions...');

    // Workout 1: Push Day (5 days ago)
    const workout1Date = new Date();
    workout1Date.setDate(workout1Date.getDate() - 5);

    const [workout1] = await db.insert(schema.workoutsTable).values({
      userId: USER_ID,
      workoutDate: workout1Date,
      title: 'Push Day',
      startedAt: new Date(workout1Date.getTime()),
      completedAt: new Date(workout1Date.getTime() + 3600000), // 1 hour later
    }).returning();

    // Workout 1 exercises
    const [w1e1] = await db.insert(schema.workoutExercisesTable).values({
      workoutId: workout1.id,
      exerciseId: exercises.find(e => e.name === 'Barbell Bench Press')!.id,
      order: 1,
    }).returning();

    await db.insert(schema.setsTable).values([
      { workoutExerciseId: w1e1.id, setNumber: 1, reps: 8, weight: '135', weightUnit: 'lbs', completed: true },
      { workoutExerciseId: w1e1.id, setNumber: 2, reps: 8, weight: '185', weightUnit: 'lbs', completed: true },
      { workoutExerciseId: w1e1.id, setNumber: 3, reps: 6, weight: '205', weightUnit: 'lbs', completed: true },
      { workoutExerciseId: w1e1.id, setNumber: 4, reps: 5, weight: '225', weightUnit: 'lbs', completed: true },
    ]);

    const [w1e2] = await db.insert(schema.workoutExercisesTable).values({
      workoutId: workout1.id,
      exerciseId: exercises.find(e => e.name === 'Overhead Press')!.id,
      order: 2,
    }).returning();

    await db.insert(schema.setsTable).values([
      { workoutExerciseId: w1e2.id, setNumber: 1, reps: 10, weight: '65', weightUnit: 'lbs', completed: true },
      { workoutExerciseId: w1e2.id, setNumber: 2, reps: 8, weight: '85', weightUnit: 'lbs', completed: true },
      { workoutExerciseId: w1e2.id, setNumber: 3, reps: 6, weight: '95', weightUnit: 'lbs', completed: true },
    ]);

    const [w1e3] = await db.insert(schema.workoutExercisesTable).values({
      workoutId: workout1.id,
      exerciseId: exercises.find(e => e.name === 'Incline Dumbbell Press')!.id,
      order: 3,
    }).returning();

    await db.insert(schema.setsTable).values([
      { workoutExerciseId: w1e3.id, setNumber: 1, reps: 12, weight: '50', weightUnit: 'lbs', completed: true },
      { workoutExerciseId: w1e3.id, setNumber: 2, reps: 10, weight: '60', weightUnit: 'lbs', completed: true },
      { workoutExerciseId: w1e3.id, setNumber: 3, reps: 8, weight: '70', weightUnit: 'lbs', completed: true },
    ]);

    console.log(`✓ Created workout: ${workout1.title}`);

    // Workout 2: Pull Day (3 days ago)
    const workout2Date = new Date();
    workout2Date.setDate(workout2Date.getDate() - 3);

    const [workout2] = await db.insert(schema.workoutsTable).values({
      userId: USER_ID,
      workoutDate: workout2Date,
      title: 'Pull Day',
      startedAt: new Date(workout2Date.getTime()),
      completedAt: new Date(workout2Date.getTime() + 3300000), // 55 minutes later
    }).returning();

    const [w2e1] = await db.insert(schema.workoutExercisesTable).values({
      workoutId: workout2.id,
      exerciseId: exercises.find(e => e.name === 'Barbell Deadlift')!.id,
      order: 1,
    }).returning();

    await db.insert(schema.setsTable).values([
      { workoutExerciseId: w2e1.id, setNumber: 1, reps: 5, weight: '225', weightUnit: 'lbs', completed: true },
      { workoutExerciseId: w2e1.id, setNumber: 2, reps: 5, weight: '275', weightUnit: 'lbs', completed: true },
      { workoutExerciseId: w2e1.id, setNumber: 3, reps: 3, weight: '315', weightUnit: 'lbs', completed: true },
    ]);

    const [w2e2] = await db.insert(schema.workoutExercisesTable).values({
      workoutId: workout2.id,
      exerciseId: exercises.find(e => e.name === 'Barbell Row')!.id,
      order: 2,
    }).returning();

    await db.insert(schema.setsTable).values([
      { workoutExerciseId: w2e2.id, setNumber: 1, reps: 10, weight: '135', weightUnit: 'lbs', completed: true },
      { workoutExerciseId: w2e2.id, setNumber: 2, reps: 8, weight: '155', weightUnit: 'lbs', completed: true },
      { workoutExerciseId: w2e2.id, setNumber: 3, reps: 8, weight: '165', weightUnit: 'lbs', completed: true },
    ]);

    const [w2e3] = await db.insert(schema.workoutExercisesTable).values({
      workoutId: workout2.id,
      exerciseId: exercises.find(e => e.name === 'Pull-ups')!.id,
      order: 3,
    }).returning();

    await db.insert(schema.setsTable).values([
      { workoutExerciseId: w2e3.id, setNumber: 1, reps: 10, weight: '0', weightUnit: 'lbs', completed: true },
      { workoutExerciseId: w2e3.id, setNumber: 2, reps: 8, weight: '0', weightUnit: 'lbs', completed: true },
      { workoutExerciseId: w2e3.id, setNumber: 3, reps: 6, weight: '0', weightUnit: 'lbs', completed: true },
      { workoutExerciseId: w2e3.id, setNumber: 4, reps: 5, weight: '0', weightUnit: 'lbs', completed: true },
    ]);

    console.log(`✓ Created workout: ${workout2.title}`);

    // Workout 3: Leg Day (1 day ago)
    const workout3Date = new Date();
    workout3Date.setDate(workout3Date.getDate() - 1);

    const [workout3] = await db.insert(schema.workoutsTable).values({
      userId: USER_ID,
      workoutDate: workout3Date,
      title: 'Leg Day',
      startedAt: new Date(workout3Date.getTime()),
      completedAt: new Date(workout3Date.getTime() + 4200000), // 70 minutes later
    }).returning();

    const [w3e1] = await db.insert(schema.workoutExercisesTable).values({
      workoutId: workout3.id,
      exerciseId: exercises.find(e => e.name === 'Barbell Squat')!.id,
      order: 1,
    }).returning();

    await db.insert(schema.setsTable).values([
      { workoutExerciseId: w3e1.id, setNumber: 1, reps: 10, weight: '135', weightUnit: 'lbs', completed: true },
      { workoutExerciseId: w3e1.id, setNumber: 2, reps: 8, weight: '185', weightUnit: 'lbs', completed: true },
      { workoutExerciseId: w3e1.id, setNumber: 3, reps: 6, weight: '225', weightUnit: 'lbs', completed: true },
      { workoutExerciseId: w3e1.id, setNumber: 4, reps: 5, weight: '245', weightUnit: 'lbs', completed: true },
    ]);

    const [w3e2] = await db.insert(schema.workoutExercisesTable).values({
      workoutId: workout3.id,
      exerciseId: exercises.find(e => e.name === 'Romanian Deadlift')!.id,
      order: 2,
    }).returning();

    await db.insert(schema.setsTable).values([
      { workoutExerciseId: w3e2.id, setNumber: 1, reps: 12, weight: '135', weightUnit: 'lbs', completed: true },
      { workoutExerciseId: w3e2.id, setNumber: 2, reps: 10, weight: '155', weightUnit: 'lbs', completed: true },
      { workoutExerciseId: w3e2.id, setNumber: 3, reps: 10, weight: '175', weightUnit: 'lbs', completed: true },
    ]);

    const [w3e3] = await db.insert(schema.workoutExercisesTable).values({
      workoutId: workout3.id,
      exerciseId: exercises.find(e => e.name === 'Leg Press')!.id,
      order: 3,
    }).returning();

    await db.insert(schema.setsTable).values([
      { workoutExerciseId: w3e3.id, setNumber: 1, reps: 15, weight: '180', weightUnit: 'lbs', completed: true },
      { workoutExerciseId: w3e3.id, setNumber: 2, reps: 12, weight: '270', weightUnit: 'lbs', completed: true },
      { workoutExerciseId: w3e3.id, setNumber: 3, reps: 10, weight: '360', weightUnit: 'lbs', completed: true },
    ]);

    console.log(`✓ Created workout: ${workout3.title}`);

    // Workout 4: In-progress workout (today)
    const workout4Date = new Date();

    const [workout4] = await db.insert(schema.workoutsTable).values({
      userId: USER_ID,
      workoutDate: workout4Date,
      title: 'Upper Body',
      startedAt: new Date(workout4Date.getTime() - 1800000), // Started 30 min ago
      completedAt: null, // Not completed yet
    }).returning();

    const [w4e1] = await db.insert(schema.workoutExercisesTable).values({
      workoutId: workout4.id,
      exerciseId: exercises.find(e => e.name === 'Barbell Bench Press')!.id,
      order: 1,
    }).returning();

    await db.insert(schema.setsTable).values([
      { workoutExerciseId: w4e1.id, setNumber: 1, reps: 8, weight: '135', weightUnit: 'lbs', completed: true },
      { workoutExerciseId: w4e1.id, setNumber: 2, reps: 8, weight: '185', weightUnit: 'lbs', completed: true },
      { workoutExerciseId: w4e1.id, setNumber: 3, reps: 6, weight: '205', weightUnit: 'lbs', completed: false },
    ]);

    console.log(`✓ Created workout: ${workout4.title} (in progress)`);

    console.log('\n✅ Seeding completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - ${exercises.length} exercises`);
    console.log(`   - 4 workouts (3 completed, 1 in progress)`);
    console.log(`   - Multiple sets with realistic progression`);
    console.log(`   - All data belongs to user: ${USER_ID}\n`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
