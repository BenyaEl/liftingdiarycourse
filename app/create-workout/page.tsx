import { getExercises } from "@/data/exercises";
import { CreateWorkoutForm } from "@/components/create-workout-form";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function CreateWorkoutPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const exercises = await getExercises();

  return <CreateWorkoutForm exercises={exercises} />;
}
