/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import InitialMenu from './InitialMenu.client';
import TwilioContainer from './TwilioContainer.server';

export default function App({ roomId, isGuest }) {
  return (
    <div className="main">
      {!roomId && (
        <div className="initial-menu-container">
          <InitialMenu />
        </div>
      )}
      {roomId && <TwilioContainer key={roomId} roomId={roomId} isGuest={isGuest} />}
    </div>
  );
}
