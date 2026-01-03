'use client';

export default function QRLoader({ text = 'Loading...' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* QR Code Animation */}
      <div className="relative w-24 h-24 mb-6">
        {/* QR Grid */}
        <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 gap-1">
          {[...Array(25)].map((_, i) => {
            // Create QR-like pattern
            const isCorner = [0, 1, 2, 4, 5, 6, 10, 12, 14, 18, 19, 20, 22, 23, 24].includes(i);
            const delay = (i % 5) * 0.1 + Math.floor(i / 5) * 0.1;
            return (
              <div
                key={i}
                className={`rounded-sm ${isCorner ? 'bg-blue-500' : 'bg-blue-400/50'}`}
                style={{
                  animation: `qrPulse 1.5s ease-in-out ${delay}s infinite`,
                }}
              />
            );
          })}
        </div>
        
        {/* Corner markers */}
        <div className="absolute top-0 left-0 w-6 h-6 border-4 border-blue-400 rounded-sm animate-pulse" />
        <div className="absolute top-0 right-0 w-6 h-6 border-4 border-blue-400 rounded-sm animate-pulse" style={{ animationDelay: '0.2s' }} />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-4 border-blue-400 rounded-sm animate-pulse" style={{ animationDelay: '0.4s' }} />
        
        {/* Scanning line */}
        <div 
          className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
          style={{
            animation: 'scanLine 2s ease-in-out infinite',
          }}
        />
      </div>
      
      {/* Loading text */}
      <p className="text-blue-300 text-lg font-medium animate-pulse">{text}</p>
      
      {/* Inline styles for animations */}
      <style jsx>{`
        @keyframes qrPulse {
          0%, 100% {
            opacity: 0.4;
            transform: scale(0.9);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes scanLine {
          0% {
            top: 0;
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
      `}</style>
    </div>
  );
}
