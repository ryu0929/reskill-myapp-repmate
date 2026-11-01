import ProgressScreen from "./_components/ProgressScreen";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProgressDataByExercise } from "./_lib/progress";

const ProgressPage = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dataByExercise = await getProgressDataByExercise(user.id);

  return <ProgressScreen dataByExercise={dataByExercise} />;
};

export default ProgressPage;
