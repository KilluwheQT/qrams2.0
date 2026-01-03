'use client';

export default function QRLoader({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  const sizeClass = sizes[size] || sizes.md;
  const dotSize = dotSizes[size] || dotSizes.md;

  return (
    <div className={`${sizeClass} ${className} relative`}>
      {/* QR Code grid pattern with animated dots */}
      <div className="grid grid-cols-5 grid-rows-5 gap-0.5 w-full h-full">
        {/* Top-left finder pattern */}
        <div className={`${dotSize} bg-blue-600 rounded-sm`}></div>
        <div className={`${dotSize} bg-blue-600 rounded-sm`}></div>
        <div className={`${dotSize} bg-blue-600 rounded-sm`}></div>
        <div className={`${dotSize} bg-transparent rounded-sm`}></div>
        <div className={`${dotSize} bg-blue-600 rounded-sm`}></div>

        <div className={`${dotSize} bg-blue-600 rounded-sm`}></div>
        <div className={`${dotSize} bg-transparent rounded-sm`}></div>
        <div className={`${dotSize} bg-blue-600 rounded-sm`}></div>
        <div className={`${dotSize} bg-blue-600 rounded-sm animate-pulse`} style={{ animationDelay: '0ms' }}></div>
        <div className={`${dotSize} bg-blue-600 rounded-sm`}></div>

        <div className={`${dotSize} bg-blue-600 rounded-sm`}></div>
        <div className={`${dotSize} bg-blue-600 rounded-sm`}></div>
        <div className={`${dotSize} bg-blue-600 rounded-sm animate-pulse`} style={{ animationDelay: '150ms' }}></div>
        <div className={`${dotSize} bg-transparent rounded-sm`}></div>
        <div className={`${dotSize} bg-blue-600 rounded-sm`}></div>

        <div className={`${dotSize} bg-transparent rounded-sm`}></div>
        <div className={`${dotSize} bg-blue-600 rounded-sm animate-pulse`} style={{ animationDelay: '300ms' }}></div>
        <div className={`${dotSize} bg-transparent rounded-sm`}></div>
        <div className={`${dotSize} bg-blue-600 rounded-sm animate-pulse`} style={{ animationDelay: '450ms' }}></div>
        <div className={`${dotSize} bg-transparent rounded-sm`}></div>

        {/* Bottom-left finder pattern */}
        <div className={`${dotSize} bg-blue-600 rounded-sm`}></div>
        <div className={`${dotSize} bg-blue-600 rounded-sm`}></div>
        <div className={`${dotSize} bg-blue-600 rounded-sm`}></div>
        <div className={`${dotSize} bg-transparent rounded-sm`}></div>
        <div className={`${dotSize} bg-blue-600 rounded-sm`}></div>
      </div>

      {/* Scanning line animation */}
      <div className="absolute inset-0 overflow-hidden rounded">
        <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-scan"></div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0%, 100% {
            top: 0%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }
        .animate-scan {
          animation: scan 1.5s ease-in-out infinite;
        }
      `}</style>
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
