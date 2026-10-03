import { redirect } from "next/navigation";

/** Compatibility route for the judge workspace. */
export default function JudgePage() {
  redirect("/judging");
}
