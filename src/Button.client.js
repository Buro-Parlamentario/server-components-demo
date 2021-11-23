/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useTransition } from 'react';

export default function Button({ outline, children, onClick }) {
  const [isPending, startTransition] = useTransition();

  const className = ['edit-button', !outline ? 'edit-button--solid' : 'edit-button--outline'].join(
    ' ',
  );

  function handleOnClick() {
    startTransition(() => {
      onClick();
    });
  }
  return (
    <button type="button" className={className} disabled={isPending} onClick={handleOnClick}>
      {children}
    </button>
  );
}
