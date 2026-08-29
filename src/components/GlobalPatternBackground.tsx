'use client';

export function GlobalPatternBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black"
    >
      {/* Full-screen looping cosmic galaxy tunnel video from web3-eos */}
      <video
        className="absolute inset-0 w-full h-full object-cover scale-105 opacity-100"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden
      >
        <source src="/videos/web3-eos-galaxy.mp4" type="video/mp4" />
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260217_030345_246c0224-10a4-422c-b324-070b7c0eceda.mp4"
          type="video/mp4"
        />
      </video>

      {/* Subtle atmospheric vignette overlay for maximum galaxy visibility */}
      <div className="absolute inset-0 bg-black/25" />
    </div>
  );
}
