// import GoalsHeader from "../components/goals/goals-header";
import GoalsOverviewCards from "../components/goals/GoalsOverviewCards";
import DailyGoalCard from "../components/goals/DailyGoalCard";
import WeeklyProgressCard from "../components/goals/WeeklyPorgressCard";
import GoalCategories from "../components/goals/GoalCategories";
import GoalHistory from "../components/goals/GoalHistory";

export default function GoalsPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        {/* <GoalsHeader /> */}
        <GoalsOverviewCards />

        <div className="grid gap-6 lg:grid-cols-2">
          <DailyGoalCard />
          <WeeklyProgressCard />
        </div>

        <GoalCategories />
        <GoalHistory />
      </div>
    </main>
  );
}