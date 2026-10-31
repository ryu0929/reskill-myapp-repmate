import { FitnessAppHome } from "./_components/FitnessAppHome";
import { createClient } from "@/lib/supabase/server";
import { getActiveGoal } from "@/lib/goals";
import {
  getBestProgressData,
  getProgressDataByExercise,
} from "./progress/_lib/progress";

const Home = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // 目標と成長データは独立しているため並列取得し、片方が失敗してもホームを表示する。
  const [goalResult, progressResult] = user
    ? await Promise.allSettled([
        getActiveGoal(user.id),
        getProgressDataByExercise(user.id),
      ])
    : [];
  const activeGoal =
    goalResult?.status === "fulfilled" ? goalResult.value : null;
  const dataByExercise =
    progressResult?.status === "fulfilled" ? progressResult.value : null;

  if (goalResult?.status === "rejected") {
    console.error("[home:goal]", goalResult.reason);
  }
  if (progressResult?.status === "rejected") {
    console.error("[home:progress]", progressResult.reason);
  }
  const growthReport = dataByExercise
    ? getBestProgressData(dataByExercise)
    : null;

  return (
    <FitnessAppHome
      goal={
        activeGoal
          ? {
              exercise: activeGoal.exerciseName,
              description: activeGoal.description,
            }
          : null
      }
      growthReport={growthReport}
    />
  );
};

export default Home;
