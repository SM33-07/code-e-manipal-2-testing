import { redirect } from "next/navigation";

/** Compatibility route: redirects to canonical /admin/event where live broadcasting is managed */
export default function AdminAnnouncementsCompatibilityPage() {
  redirect("/admin/event");
}
