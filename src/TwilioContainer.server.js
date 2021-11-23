import twilio from 'twilio';
import { v1 as uuidv1 } from 'uuid';

import TwilioVideoElement from './TwilioVideoElement.client';

const { AccessToken } = twilio.jwt;
const { VideoGrant } = AccessToken;

function generateTwilioToken() {
  const token = new AccessToken(
    'ACdf5a4299820c727e81c95447f7c577a7',
    'SKee39878b92e96d103ab4a34e00d66c2f',
    'mPqZS6HdR5acLQvzyjTybWaD23rAVNZZ',
  );

  const identity = uuidv1();
  token.identity = identity;

  const grant = new VideoGrant();
  token.addGrant(grant);

  return token.toJwt();
}

export default function TwilioContainer({ roomId, isGuest }) {
  return <TwilioVideoElement token={generateTwilioToken()} roomId={roomId} isGuest={isGuest} />;
}
