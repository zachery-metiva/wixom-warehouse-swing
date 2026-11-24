export const CATEGORIES = ["Basics", "Passes", "Turns", "Whips", "Dips", "Aerials"] as const;
export const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"] as const;
export const LEVELS = ["All levels", "Beginner", "Intermediate", "Advanced"] as const;

export type Category = (typeof CATEGORIES)[number];
export type Difficulty = (typeof DIFFICULTIES)[number];

export type CountRow = { c: string; t: string };
export type Mistake = { w: string; f: string };

export type Move = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  difficulty: Difficulty;
  counts: number;
  summary: string;
  steps: string[];
  count_rows: CountRow[];
  mistakes: Mistake[];
  video_url: string | null;
  featured: boolean;
  published: boolean;
  sort: number;
  prereqs: string[]; // move ids
};

export type Faq = { id: string; question: string; answer: string; sort: number; published: boolean };

export type Instructor = {
  id: string;
  name: string;
  role: string;
  bio: string;
  headshot_url: string | null;
  sort: number;
  active: boolean;
};

export type Photo = { id: string; url: string; caption: string; taken_on: string | null; sort: number };

export type ScheduleItem = { time: string; label: string; blurb: string };

export type SiteSettings = {
  tagline: string;
  firstTimerStrip: boolean;
  email: string;
  locationName: string;
  locationNote: string;
  mapUrl: string;
  monthlyPass: { price: number; label: string; enabled: boolean };
  schedule: ScheduleItem[];
  links: { meetup: string; instagram: string; facebook: string; discord: string; waiver: string };
};

export type Pricing = { door: number; student: number | null };

/** One night on the public calendar: either a real door-app event or a
 *  regular Tuesday generated from the weekly schedule. */
export type SiteEvent = {
  date: string; // YYYY-MM-DD
  name: string;
  topic: string;
  level: string;
  description: string;
  teachers: string;
  meetupUrl: string | null;
  fromDoorApp: boolean;
};

export const DIFF_COLOR: Record<Difficulty, string> = {
  Beginner: "var(--ws-level-beginner)",
  Intermediate: "var(--ws-level-intermediate)",
  Advanced: "var(--ws-level-advanced)",
};
