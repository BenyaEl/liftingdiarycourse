import { getWorkoutsByDate } from "@/data/workouts";
import { DashboardClient } from "@/components/dashboard-client";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

interface DashboardPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  // Check authentication
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Parse date from URL or use today
  const params = await searchParams;
  const selectedDate = params.date ? new Date(params.date) : new Date();

  // Fetch workouts for the selected date
  const workouts = await getWorkoutsByDate(selectedDate);

  return <DashboardClient initialWorkouts={workouts} initialDate={selectedDate} />;
}
