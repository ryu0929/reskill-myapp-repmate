import { ConsultScreen } from "./_components/ConsultScreen";
import { createClient } from "@/lib/supabase/server";
import { getActiveGoal } from "@/lib/goals";

const ConsultPage = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const activeGoal = user ? await getActiveGoal(user.id) : null;

  return (
    <ConsultScreen
      goal={
        activeGoal
          ? {
              id: activeGoal.id,
              name: activeGoal.title,
              statusLabel: "設定済み",
              description: activeGoal.description,
            }
          : null
      }
    />
  );
};

export default ConsultPage;
