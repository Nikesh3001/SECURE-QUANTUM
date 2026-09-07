import { useEffect } from 'react';

export function useBreachMode(isCritical: boolean) {
  useEffect(() => {
    if (isCritical) {
      document.body.classList.add('breach-mode');
    } else {
      document.body.classList.remove('breach-mode');
    }
    return () => document.body.classList.remove('breach-mode');
  }, [isCritical]);
}
