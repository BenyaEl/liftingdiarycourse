"use server";

import { db } from "@/src";
import {
  workoutsTable,
  workoutExercisesTable,
  exercisesTable,
  setsTable,
  type Workout,
} from "@/src/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

/**
 * Get all workouts for the authenticated user on a specific date
 * @param date - The date to fetch workouts for
 */
export async function getWorkoutsByDate(date: Date) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Set date to start of day (00:00:00)
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  // Set date to end of day (23:59:59)
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const workouts = await db
    .select({
      id: workoutsTable.id,
      userId: workoutsTable.userId,
      workoutDate: workoutsTable.workoutDate,
      title: workoutsTable.title,
      startedAt: workoutsTable.startedAt,
      completedAt: workoutsTable.completedAt,
      createdAt: workoutsTable.createdAt,
      updatedAt: workoutsTable.updatedAt,
    })
    .from(workoutsTable)
    .where(
      and(
        eq(workoutsTable.userId, userId),
        sql`${workoutsTable.workoutDate} >= ${startOfDay}`,
        sql`${workoutsTable.workoutDate} <= ${endOfDay}`
      )
    )
    .orderBy(desc(workoutsTable.startedAt));

  return workouts;
}

/**
 * Get a single workout with all exercises and sets
 * @param workoutId - The workout ID
 */
export async function getWorkoutById(workoutId: number) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // First, verify the workout belongs to the user
  const workout = await db
    .select()
    .from(workoutsTable)
    .where(
      and(eq(workoutsTable.id, workoutId), eq(workoutsTable.userId, userId))
    )
    .limit(1);

  if (!workout[0]) {
    return null;
  }

  // Get all exercises for this workout with their details
  const workoutExercises = await db
    .select({
      workoutExerciseId: workoutExercisesTable.id,
      order: workoutExercisesTable.order,
      exerciseId: exercisesTable.id,
      exerciseName: exercisesTable.name,
      videoUrl: exercisesTable.videoUrl,
    })
    .from(workoutExercisesTable)
    .innerJoin(
      exercisesTable,
      eq(workoutExercisesTable.exerciseId, exercisesTable.id)
    )
    .where(eq(workoutExercisesTable.workoutId, workoutId))
    .orderBy(workoutExercisesTable.order);

  // Get all sets for each exercise
  const exercises = await Promise.all(
    workoutExercises.map(async (exercise) => {
      const sets = await db
        .select({
          id: setsTable.id,
          setNumber: setsTable.setNumber,
          reps: setsTable.reps,
          weight: setsTable.weight,
          weightUnit: setsTable.weightUnit,
          completed: setsTable.completed,
        })
        .from(setsTable)
        .where(eq(setsTable.workoutExerciseId, exercise.workoutExerciseId))
        .orderBy(setsTable.setNumber);

      return {
        ...exercise,
        sets,
      };
    })
  );

  return {
    ...workout[0],
    exercises,
  };
}

/**
 * Get recent workouts for the authenticated user (last 10)
 */
export async function getRecentWorkouts() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return await db
    .select()
    .from(workoutsTable)
    .where(eq(workoutsTable.userId, userId))
    .orderBy(desc(workoutsTable.workoutDate))
    .limit(10);
}
