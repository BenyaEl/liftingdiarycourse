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
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Types for creating workouts
export interface CreateSetInput {
  reps: number;
  weight: string | null;
  weightUnit: string;
}

export interface CreateExerciseInput {
  exerciseId: number;
  sets: CreateSetInput[];
}

export interface CreateWorkoutInput {
  title: string;
  workoutDate: Date;
  exercises: CreateExerciseInput[];
}

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

/**
 * Create a new workout with exercises and sets
 * @param input - The workout data to create
 */
export async function createWorkout(input: CreateWorkoutInput) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const now = new Date();

  // Create the workout
  const [workout] = await db
    .insert(workoutsTable)
    .values({
      userId,
      title: input.title,
      workoutDate: input.workoutDate,
      startedAt: now,
      completedAt: now,
    })
    .returning({ id: workoutsTable.id });

  // Create workout exercises and sets
  for (let i = 0; i < input.exercises.length; i++) {
    const exercise = input.exercises[i];

    // Create workout exercise
    const [workoutExercise] = await db
      .insert(workoutExercisesTable)
      .values({
        workoutId: workout.id,
        exerciseId: exercise.exerciseId,
        order: i + 1,
      })
      .returning({ id: workoutExercisesTable.id });

    // Create sets for this exercise
    for (let j = 0; j < exercise.sets.length; j++) {
      const set = exercise.sets[j];

      await db.insert(setsTable).values({
        workoutExerciseId: workoutExercise.id,
        setNumber: j + 1,
        reps: set.reps,
        weight: set.weight,
        weightUnit: set.weightUnit,
      });
    }
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
