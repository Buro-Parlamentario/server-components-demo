import { useState } from 'react';

export default function useMutation({ endpoint, method }) {
  const [isSaving, setIsSaving] = useState(false);
  const [didError, setDidError] = useState(false);
  const [error, setError] = useState(null);
  if (didError) {
    // Let the nearest error boundary handle errors while saving.
    throw error;
  }

  async function performMutation(payload, requestedLocation) {
    setIsSaving(true);
    try {
      const response = await fetch(
        `${endpoint}?location=${
          requestedLocation ? encodeURIComponent(JSON.stringify(requestedLocation)) : ''
        }`,
        {
          method,
          body: JSON.stringify(payload),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response;
    } catch (e) {
      setDidError(true);
      setError(e);
      return e;
    } finally {
      setIsSaving(false);
    }
  }

  return [isSaving, performMutation];
}
