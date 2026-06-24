import { useEffect, useState } from 'react';
import { makeLogoTransparent } from '@/lib/imageUtils';

export function ZeroGravityFooter() {
  const [logoSrc, setLogoSrc] = useState('/0g-logo.png');

  useEffect(() => {
    makeLogoTransparent('/0g-logo.png', (transparentUrl) => {
      setLogoSrc(transparentUrl);
    });
  }, []);

  return (
    <div className="flex items-center justify-center gap-1.5 mt-2 text-[10px] text-neutral-500/80 font-medium select-none tracking-wide">
      <span>Built using</span>
      <img
        src={logoSrc}
        alt="0G Logo"
        className="h-[13px] w-auto opacity-60 hover:opacity-90 transition-all duration-200"
      />
    </div>
  );
}
