import { redirect } from "next/navigation";

/** Public self-registration is intentionally unavailable for provisioned event accounts. */
export default function RegisterPage() {
  redirect("/login");
}
