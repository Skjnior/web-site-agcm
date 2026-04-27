'use client';

export type SignOutConfirmPayload = {
  callbackUrl: string;
  redirect: boolean;
  resolve: (confirmed: boolean) => void;
};

type OpenHandler = (payload: SignOutConfirmPayload) => void;

let openHandler: OpenHandler | null = null;

/** Réservé au `SignOutConfirmProvider` — enregistre l’ouverture de la modale personnalisée. */
export function registerSignOutConfirmHandler(handler: OpenHandler | null) {
  openHandler = handler;
}

/**
 * Demande confirmation via la modale personnalisée (si le provider est monté).
 * @returns `true` si l’utilisateur confirme et que la déconnexion est lancée.
 */
export function signOutWithConfirmation(options?: {
  callbackUrl?: string;
  redirect?: boolean;
}): Promise<boolean> {
  const callbackUrl = options?.callbackUrl ?? '/';
  const redirect = options?.redirect ?? true;

  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (openHandler) {
      openHandler({ callbackUrl, redirect, resolve });
      return;
    }

    const ok = window.confirm(
      'Voulez-vous vraiment vous déconnecter ?\n\nVous devrez vous reconnecter pour accéder à nouveau à votre compte.'
    );
    if (ok) {
      void import('next-auth/react').then(({ signOut }) => {
        if (redirect) {
          void signOut({ callbackUrl, redirect: true });
        } else {
          void signOut({ callbackUrl, redirect: false });
        }
      });
    }
    resolve(ok);
  });
}
