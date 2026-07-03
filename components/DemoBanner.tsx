import Link from "next/link";

const DemoBanner = () => {
  return (
    <div className="warning-banner">
      <div className="warning-banner-content justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="warning-banner-icon">👋</span>
          <span className="warning-banner-text">
            You're browsing a shared public demo. Uploads here are visible to everyone and may be reset.
          </span>
        </div>
        <Link href="/sign-in" className="text-sm font-semibold underline text-[var(--accent-warm)] whitespace-nowrap">
          Sign up to keep your own private library →
        </Link>
      </div>
    </div>
  );
};

export default DemoBanner;