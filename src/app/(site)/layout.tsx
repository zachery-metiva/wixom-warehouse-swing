import { FirstTimerStrip } from "@/components/site/FirstTimerStrip";
import { Footer } from "@/components/site/Footer";
import { Nav } from "@/components/site/Nav";
import { getSettings } from "@/lib/data";
import { todayIso } from "@/lib/dates";

async function Strip() {
  "use cache";
  const s = await getSettings();
  return s.firstTimerStrip ? <FirstTimerStrip /> : null;
}

async function SiteFooter() {
  "use cache";
  const s = await getSettings();
  return <Footer settings={s} year={todayIso().slice(0, 4)} />;
}

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <Strip />
      <Nav />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter />
    </div>
  );
}
