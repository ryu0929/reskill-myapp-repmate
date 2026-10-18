import { FitnessAppHome } from "./_components/FitnessAppHome";
import { createClient } from "@/lib/supabase/server";
import { getActiveGoal } from "@/lib/goals";

const Home = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const activeGoal = user ? await getActiveGoal(user.id) : null;

  return (
    <FitnessAppHome
      goal={activeGoal ? {
        name: activeGoal.title,
        statusLabel: "設定済み",
        description: activeGoal.description,
      } : null}
    />
  );
};

export default Home;
