"use server";

import { db } from "@/src";
import { exercisesTable } from "@/src/db/schema";
import { eq, or, isNull } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

/**
 * Get all exercises available to the authenticated user
 * This includes global exercises (isCustom = false) and user's custom exercises
 */
export async function getExercises() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const exercises = await db
    .select()
    .from(exercisesTable)
    .where(
      or(
        eq(exercisesTable.isCustom, false),
        eq(exercisesTable.userId, userId)
      )
    )
    .orderBy(exercisesTable.name);

  return exercises;
}

/**
 * Get a single exercise by ID
 * @param exerciseId - The exercise ID
 */
export async function getExerciseById(exerciseId: number) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const exercise = await db
    .select()
    .from(exercisesTable)
    .where(eq(exercisesTable.id, exerciseId))
    .limit(1);

  if (!exercise[0]) {
    return null;
  }

  // Verify the exercise is accessible to the user (global or owned by user)
  if (exercise[0].isCustom && exercise[0].userId !== userId) {
    return null;
  }

  return exercise[0];
}
