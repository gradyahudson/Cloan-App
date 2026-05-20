import { Redirect } from "expo-router";
import { useOnboardingStore } from "@/lib/store/onboarding";

export default function Index() {
  const { completed } = useOnboardingStore();
  return <Redirect href={completed ? "/(app)" : "/(onboarding)/welcome"} />;
}
