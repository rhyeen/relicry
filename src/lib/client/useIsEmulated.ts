'use client';

import { useEffect, useState } from 'react';

const useIsEmulated = () => {
  const [isEmulatedState, setIsEmulatedState] = useState<boolean | null>(null);

  useEffect(() => {
    const checkEmulated = async () => {
      const { isEmulated } = await import('@/lib/environment');
      setIsEmulatedState(isEmulated);
    };
    checkEmulated();
  }, []);

  return isEmulatedState;
};

export default useIsEmulated;