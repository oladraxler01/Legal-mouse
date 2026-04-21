import Link from "next/link";

export default function FinalCTA() {
  return (
    <section
      className="relative w-full px-8 py-32 text-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCVcErHQxd8ZkgEKzYC60CpQqAIvN5I3cSjWWIS4N5SWFt1FuTX_4E-6GSci26hWuiBl6ci38ZPj8iHbgsYTFzqkLwrFrePPRpvF0PN0aokrH7ytPzBg3O071-jdF__VNfUcZpa5Dqksea-zTtbb53F3CgaxZ6p7WstDKUMbw7IZlWhaGfiqkb75VJJ7dx2RkhCGx60hvaa9GDR47lTk4P8z4B28czDMPidWART6Ukn3JbnYKk4fA0kk4WhRPWLiQVTsulmBUYhBNA')",
      }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 max-w-4xl mx-auto">
        <h2 className="font-headline text-4xl md:text-5xl font-bold text-white mb-8">
          Join the Future of Legal Intelligence
        </h2>
        <p className="font-body text-xl text-white/90 mb-10">
          Step into a curated environment where clarity meets rigorous legal
          analysis.
        </p>
        <Link
          href="/register"
          className="inline-block bg-gradient-to-br from-primary to-primary-container text-white font-label text-lg font-semibold py-4 px-10 rounded-md hover:opacity-90 shadow-ambient transition-all"
        >
          Create Your Account
        </Link>
      </div>
    </section>
  );
}
