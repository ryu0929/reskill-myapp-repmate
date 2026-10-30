import ProgressScreen from "./_components/ProgressScreen";
import { createClient } from "@/lib/supabase/server";
import { getProgressDataByExercise } from "./_lib/progress";

const ProgressPage = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const dataByExercise = user
    ? await getProgressDataByExercise(user.id)
    : undefined;

  return <ProgressScreen dataByExercise={dataByExercise} />;
};

export default ProgressPage;
