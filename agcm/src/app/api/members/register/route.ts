// Inscription en ligne désactivée : les adhérent·es passent par le formulaire public d'adhésion ;
// les comptes sont réservés au bureau et à l'administration (création par super-admin).

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error:
        "L'inscription directe n'est pas disponible. Utilisez le formulaire d'adhésion sur le site ; si votre demande est acceptée, vous serez enregistré·e comme adhérent·e sans compte de connexion.",
    },
    { status: 403 }
  );
}
