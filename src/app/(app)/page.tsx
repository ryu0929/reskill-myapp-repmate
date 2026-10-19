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
  const [activeGoal, dataByExercise] = user
    ? await Promise.all([
      getActiveGoal(user.id),
      getProgressDataByExercise(user.id),
    ])
    : [null, null];
  const growthReport = dataByExercise
    ? getBestProgressData(dataByExercise)
    : null;

  return (
    <FitnessAppHome
      goal={activeGoal ? {
        name: activeGoal.title,
        statusLabel: "設定済み",
        description: activeGoal.description,
      } : null}
      growthReport={growthReport}
    />
  );
};

export default Home;
