'use client';
import { useEffect } from 'react';

export default function AdSenseBlock(props: React.ComponentProps<'ins'>) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error", e);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client="ca-pub-8299388815722920"
      {...props}
    />
  );
}
