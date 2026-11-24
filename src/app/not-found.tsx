import Link from "next/link";

export default function NotFound() {
  return (
    <main className="blueprint flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="eyebrow">404 · OFF THE SLOT</div>
      <h1 className="display mt-3 text-[clamp(56px,9vw,110px)]">
        WRONG <span className="text-blue">TURN.</span>
      </h1>
      <p className="mt-4 max-w-[420px] text-body">That page isn&apos;t on the floor. Head back and find your anchor.</p>
      <Link href="/" className="mt-8 rounded-[2px] bg-blue px-7 py-4 text-[15px] font-bold text-ink hover:bg-blue-hover">
        BACK TO HOME
      </Link>
    </main>
  );
}
