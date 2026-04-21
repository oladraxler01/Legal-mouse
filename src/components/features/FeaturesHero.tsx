export default function FeaturesHero() {
  return (
    <header className="relative w-full overflow-hidden pt-32 pb-40 mb-12">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/courtroom-hero.png"
          alt="Modern Courtroom"
          className="w-full h-full object-cover opacity-60 dark:opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-surface/20 via-surface to-surface" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12 text-center mt-12">
        <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tight text-on-surface mb-8 leading-tight">
          Intelligence{" "}
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">
            Beyond the Citation
          </span>
        </h1>
        <p className="font-body text-xl md:text-2xl text-on-surface-variant max-w-3xl mx-auto leading-relaxed">
          A highly curated, AI-driven environment designed for the modern legal
          mind. Navigate complexities with absolute clarity and precision.
        </p>
      </div>
    </header>
  );
}
