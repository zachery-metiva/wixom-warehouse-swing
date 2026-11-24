import { saveSettings } from "@/app/admin/actions";
import { ActionForm } from "@/components/admin/forms";
import { AdminTitle, Area, Check, Field, Panel } from "@/components/admin/fields";
import { requireEditor } from "@/lib/admin";
import { DEFAULT_SETTINGS } from "@/lib/data";
import type { SiteSettings } from "@/lib/types";

export const metadata = { title: "Settings" };

export default async function SettingsAdmin() {
  const sb = await requireEditor();
  const [{ data }, pricing] = await Promise.all([
    sb.from("site_settings").select("data").eq("id", "default").maybeSingle(),
    sb.rpc("site_public_pricing"),
  ]);
  const stored = (data?.data ?? {}) as Partial<SiteSettings>;
  const s: SiteSettings = {
    ...DEFAULT_SETTINGS,
    ...stored,
    links: { ...DEFAULT_SETTINGS.links, ...(stored.links ?? {}) },
    monthlyPass: { ...DEFAULT_SETTINGS.monthlyPass, ...(stored.monthlyPass ?? {}) },
  };
  const tiers = (pricing.data ?? []) as { name: string; price: number }[];

  return (
    <>
      <AdminTitle kicker="SITE-WIDE">SETTINGS</AdminTitle>
      <ActionForm action={saveSettings} submit="SAVE SETTINGS">
        <div className="grid gap-3.5 xl:grid-cols-2">
          <Panel>
            <div className="mb-4 font-mono text-[10px] tracking-[2px] text-blue">HOME + GENERAL</div>
            <Area label="Home page intro" name="tagline" defaultValue={s.tagline} rows={3} />
            <Check label="Show the blue first-timer strip at the top of every page" name="firstTimerStrip" defaultChecked={s.firstTimerStrip} />
            <Field label="Contact email" name="email" type="email" defaultValue={s.email} />
            <Area
              label="Weekly schedule (time | name | one-line description)"
              name="schedule"
              defaultValue={s.schedule.map((x) => `${x.time} | ${x.label} | ${x.blurb}`).join("\n")}
              rows={4}
            />
          </Panel>
          <Panel>
            <div className="mb-4 font-mono text-[10px] tracking-[2px] text-blue">LOCATION</div>
            <Field label="Venue name" name="locationName" defaultValue={s.locationName} />
            <Area label="Location note" name="locationNote" defaultValue={s.locationNote} rows={2} />
            <Field label="Map link" name="mapUrl" type="url" defaultValue={s.mapUrl} />
          </Panel>
          <Panel>
            <div className="mb-4 font-mono text-[10px] tracking-[2px] text-blue">LINKS (BLANK = HIDDEN)</div>
            <Field label="Meetup" name="meetup" type="url" defaultValue={s.links.meetup} />
            <Field label="Instagram" name="instagram" type="url" defaultValue={s.links.instagram} />
            <Field label="Facebook" name="facebook" type="url" defaultValue={s.links.facebook} />
            <Field label="Discord invite" name="discord" type="url" defaultValue={s.links.discord} />
            <Field label="Waiver (door app signing page)" name="waiver" type="url" defaultValue={s.links.waiver} hint="Shown on /links so dancers can sign before they arrive." />
          </Panel>
          <Panel>
            <div className="mb-4 font-mono text-[10px] tracking-[2px] text-blue">PRICING</div>
            <p className="mb-4 text-[13px] leading-[1.6] text-body">
              Door and student prices come from the door app&apos;s pricing settings, so they always match what&apos;s charged:{" "}
              <span className="text-white">{tiers.map((t) => `${t.name} $${t.price}`).join(" · ") || "not set"}</span>. Change them in the door app.
            </p>
            <Check label="Show the monthly pass" name="passEnabled" defaultChecked={s.monthlyPass.enabled} />
            <div className="grid grid-cols-2 gap-x-4">
              <Field label="Monthly pass price ($)" name="passPrice" type="number" defaultValue={s.monthlyPass.price} />
              <Field label="Pass label" name="passLabel" defaultValue={s.monthlyPass.label} />
            </div>
          </Panel>
        </div>
      </ActionForm>
    </>
  );
}
