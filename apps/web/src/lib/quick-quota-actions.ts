"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { awardQuickMatchBonus } from "@/lib/quick-quota";

/**
 * Form-targetable action wired to the "watch ad → +1 match" CTA on the
 * home page. The actual ad pipeline isn't built yet — for now we just
 * award the bonus immediately so the counter UX can be validated.
 */
export async function awardQuickBonusAction(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login?from=/home");
  }
  await awardQuickMatchBonus(session.user.id);
  // Refresh /home so the QuickPlayCard reads the new counter value.
  revalidatePath("/home");
  revalidatePath("/", "layout");
}
