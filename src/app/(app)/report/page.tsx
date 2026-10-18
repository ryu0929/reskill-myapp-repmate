import ReportScreen from "./_components/ReportScreen";
import { createClient } from "@/lib/supabase/server";
import { getActiveGoal } from "@/lib/goals";

const ReportPage = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const activeGoal = user ? await getActiveGoal(user.id) : null;

  return (
    <ReportScreen
      goal={activeGoal ? {
        title: activeGoal.title,
        detail: activeGoal.description,
      } : null}
    />
  );
};

export default ReportPage;
