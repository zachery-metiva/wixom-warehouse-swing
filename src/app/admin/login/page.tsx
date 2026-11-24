import { Suspense } from "react";
import { LoginForm } from "./LoginForm";
import { Wordmark } from "@/components/ui";

export const metadata = { title: "Sign in" };

async function Notice({ searchParams }: { searchParams: PageProps<"/admin/login">["searchParams"] }) {
  const sp = await searchParams;
  if (sp.error !== "forbidden") return null;
  return (
    <p className="mb-4 border border-advanced/50 px-3 py-2 font-mono text-[11px] text-[#ff8a63]">
      That account can&apos;t edit the website. Ask an owner to grant access.
    </p>
  );
}

export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <main className="blueprint flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-[400px] border border-line bg-card p-8">
        <Wordmark size={24} />
        <div className="mt-6 font-mono text-[11px] tracking-[3px] text-blue">WEBSITE ADMIN</div>
        <h1 className="display mt-2 text-[40px]">SIGN IN</h1>
        <p className="mt-2 mb-6 text-[13.5px] text-body">Use the same staff email and password as the door app.</p>
        <Suspense fallback={null}>
          <Notice searchParams={searchParams} />
        </Suspense>
        <LoginForm />
      </div>
    </main>
  );
}
