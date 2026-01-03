'use client';

import Image from 'next/image';

export default function QRLoader({ size = 'md', className = '' }) {
  const sizes = {
    sm: 48,
    md: 64,
    lg: 96,
    xl: 128
  };

  const pixelSize = sizes[size] || sizes.md;

  return (
    <div className={`${className}`}>
      <Image
        src="/qr-code.gif"
        alt="Loading..."
        width={pixelSize}
        height={pixelSize}
        priority
        unoptimized
      />
    </div>
  );
}

// Full page loader variant
export function QRLoaderFullPage({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <QRLoader size="lg" />
      <p className="mt-4 text-gray-600 text-sm">{message}</p>
    </div>
  );
}
