import { useTransition } from 'react';
import { createFromReadableStream } from 'react-server-dom-webpack';
import { useLocation } from './LocationContext.client';
import { useRefresh } from './Cache.client';

export default function useNavigate() {
  const refresh = useRefresh();
  const [, setLocation] = useLocation();
  const [isNavigating, startNavigating] = useTransition();

  function navigate(response) {
    const cacheKey = response.headers.get('X-Location');
    const nextLocation = JSON.parse(cacheKey);
    const seededResponse = createFromReadableStream(response.body);
    startNavigating(() => {
      refresh(cacheKey, seededResponse);
      setLocation(nextLocation);
    });
  }

  return [isNavigating, navigate];
}
