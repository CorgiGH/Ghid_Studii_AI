import React, { useRef, useEffect } from 'react';
import useV86 from '../../hooks/useV86';
import { useApp } from '../../contexts/AppContext';

export default function V86Terminal() {
  const screenRef = useRef(null);
  const { booted, booting, boot } = useV86(screenRef);
  const { t } = useApp();

  useEffect(() => {
    if (screenRef.current && !booted && !booting) {
      boot();
    }
  }, [boot, booted, booting]);

  return (
    <div className="relative rounded-lg overflow-hidden border dark:border-gray-600 bg-black" style={{ minHeight: '400px' }}>
      {/* v86 screen container */}
      <div
        ref={screenRef}
        style={{ width: '100%', height: '400px', overflow: 'hidden' }}
      />

      {/* Loading overlay */}
      {!booted && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 z-10">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mb-4" />
          <p className="text-sm text-gray-300 font-mono">
            {booting
              ? t('Booting Linux...', 'Se pornește Linux...')
              : t('Preparing terminal...', 'Se pregătește terminalul...')}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {t('This may take a few seconds on first load', 'Poate dura câteva secunde la prima încărcare')}
          </p>
        </div>
      )}
    </div>
  );
}
