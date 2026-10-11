import type { Metadata } from "next";
import { Profile } from "@/components/Profile";

export const metadata: Metadata = { title: "Profile · Quiz2Earn" };

export default function MePage() {
  return <Profile />;
}
