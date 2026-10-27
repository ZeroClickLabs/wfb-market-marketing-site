import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, homeFor, safeNext } from "@/lib/auth";
import { PortalFrame } from "@/components/portal/PortalShell";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Vendor portal login", robots: { index: false, follow: false } };

const ERRORS: Record<string, string> = {
  link: "That login link didn't work or has expired. Enter your email for a new one.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = safeNext(typeof params.next === "string" ? params.next : undefined);
  const user = await getCurrentUser();
  if (user) redirect(next.startsWith(homeFor(user.role)) ? next : homeFor(user.role));
  const error = typeof params.error === "string" ? ERRORS[params.error] : undefined;

  return (
    <PortalFrame>
      <div className="mx-auto w-full max-w-[460px] rounded-lg border-3 border-ink bg-paper p-6 shadow-print max-tablet:p-5">
        <h1 className="mt-0 mb-1 font-display text-[44px] leading-[44px] font-normal uppercase">Vendor portal</h1>
        <p className="mt-0 mb-5 font-sans text-[16px] leading-[25px] text-ink-muted">
          For vendors, event partners and the Market team. Your access comes from an invitation; ask us if you need one.
        </p>
        <LoginForm next={next} error={error} />
      </div>
    </PortalFrame>
  );
}
