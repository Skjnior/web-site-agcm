// lib/email-templates.ts

type MemberValidationEmailData = {
  prenom: string;
  nom: string;
  numeroMembre: string;
  dateExpiration: Date;
};

type MemberRefusalEmailData = {
  prenom: string;
  nom: string;
  raison?: string;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
}

function formatDateTime(date: Date, time?: string) {
  const dateStr = formatDate(date);
  return time ? `${dateStr} à ${time}` : dateStr;
}

export function getMemberValidationEmailTemplate(data: MemberValidationEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Validation de votre adhésion - AGCM</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #DC143C 0%, #FFD700 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Association Guinéenne des Auditeurs</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #DC143C; margin-top: 0;">Félicitations ${data.prenom} !</h2>
    
    <p>Votre demande d'adhésion à l'Association Guinéenne des Auditeurs (AGCM) a été <strong>validée</strong>.</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #DC143C;">
      <p style="margin: 0 0 10px 0;"><strong>Votre numéro de membre :</strong></p>
      <p style="font-size: 24px; font-weight: bold; color: #DC143C; margin: 0;">${data.numeroMembre}</p>
    </div>
    
    <p><strong>Date d'expiration de votre adhésion :</strong> ${formatDate(data.dateExpiration)}</p>
    
    <p>Vous pouvez maintenant accéder à votre espace membre et bénéficier de tous les avantages de l'AGCM.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" 
         style="background: #DC143C; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Accéder à mon espace membre
      </a>
    </div>
    
    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      Si vous avez des questions, n'hésitez pas à nous contacter.
    </p>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
      Association Guinéenne des Auditeurs (AGCM)<br>
      Cet email a été envoyé automatiquement, merci de ne pas y répondre.
    </p>
  </div>
</body>
</html>
  `;
}

export function getMemberRefusalEmailTemplate(data: MemberRefusalEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Décision concernant votre adhésion - AGCM</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #DC143C 0%, #FFD700 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Association Guinéenne des Auditeurs</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #DC143C; margin-top: 0;">Bonjour ${data.prenom} ${data.nom},</h2>
    
    <p>Nous vous remercions de votre intérêt pour l'Association Guinéenne des Auditeurs (AGCM).</p>
    
    <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
      <p style="margin: 0 0 10px 0;"><strong>Décision :</strong></p>
      <p style="margin: 0;">Votre demande d'adhésion n'a pas pu être acceptée pour le moment.</p>
    </div>
    
    ${data.raison ? `
    <p><strong>Raison :</strong></p>
    <p style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #DC143C;">
      ${data.raison}
    </p>
    ` : ''}
    
    <p>Si vous souhaitez obtenir plus d'informations ou contester cette décision, n'hésitez pas à nous contacter.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/contact" 
         style="background: #DC143C; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Nous contacter
      </a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
      Association Guinéenne des Auditeurs (AGCM)<br>
      Cet email a été envoyé automatiquement, merci de ne pas y répondre.
    </p>
  </div>
</body>
</html>
  `;
}

// ============================================
// TEMPLATES POUR INSCRIPTIONS FORMATIONS
// ============================================

type FormationInscriptionEmailData = {
  prenom: string;
  nom: string;
  formationTitre: string;
  dateDebut: Date;
  dateFin: Date;
  heureDebut: string;
  heureFin: string;
  lieu: string;
  status: 'CONFIRMEE' | 'LISTE_ATTENTE';
  tarifMembre?: number | string;
  tarifNonMembre?: number | string;
  devise?: string;
};

export function getFormationInscriptionEmailTemplate(data: FormationInscriptionEmailData): string {
  const isConfirmed = data.status === 'CONFIRMEE';
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isConfirmed ? 'Inscription confirmée' : 'Liste d\'attente'} - Formation ${data.formationTitre}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #DC143C 0%, #FFD700 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Association Guinéenne des Auditeurs</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #DC143C; margin-top: 0;">Bonjour ${data.prenom} ${data.nom},</h2>
    
    ${isConfirmed ? `
    <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
      <p style="margin: 0; font-size: 18px; font-weight: bold; color: #155724;">
        ✓ Votre inscription à la formation "${data.formationTitre}" est confirmée !
      </p>
    </div>
    ` : `
    <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
      <p style="margin: 0; font-size: 18px; font-weight: bold; color: #856404;">
        ⏳ Vous êtes sur la liste d'attente pour la formation "${data.formationTitre}"
      </p>
    </div>
    `}
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #DC143C; margin-top: 0;">Détails de la formation</h3>
      <p><strong>Titre :</strong> ${data.formationTitre}</p>
      <p><strong>Date :</strong> Du ${formatDate(data.dateDebut)} au ${formatDate(data.dateFin)}</p>
      <p><strong>Horaires :</strong> ${data.heureDebut} - ${data.heureFin}</p>
      <p><strong>Lieu :</strong> ${data.lieu}</p>
      ${data.tarifMembre ? `
      <p><strong>Tarif membre :</strong> ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: data.devise || 'GNF' }).format(Number(data.tarifMembre))}</p>
      ` : ''}
    </div>
    
    ${isConfirmed ? `
    <p>Nous avons le plaisir de vous confirmer votre inscription à cette formation. Veuillez noter les informations ci-dessus dans votre calendrier.</p>
    ` : `
    <p>La formation est actuellement complète, mais vous avez été ajouté(e) à la liste d'attente. Nous vous contacterons automatiquement si une place se libère.</p>
    `}
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${baseUrl}/formations/${encodeURIComponent(data.formationTitre.toLowerCase().replace(/\s+/g, '-'))}" 
         style="background: #DC143C; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Voir les détails de la formation
      </a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
      Association Guinéenne des Auditeurs (AGCM)<br>
      Cet email a été envoyé automatiquement, merci de ne pas y répondre.
    </p>
  </div>
</body>
</html>
  `;
}

type FormationPromotionEmailData = {
  prenom: string;
  nom: string;
  formationTitre: string;
  dateDebut: Date;
  dateFin: Date;
  heureDebut: string;
  heureFin: string;
  lieu: string;
};

export function getFormationPromotionEmailTemplate(data: FormationPromotionEmailData): string {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bonne nouvelle ! Votre inscription est confirmée - AGCM</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #DC143C 0%, #FFD700 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Association Guinéenne des Auditeurs</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #DC143C; margin-top: 0;">Bonne nouvelle ${data.prenom} !</h2>
    
    <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
      <p style="margin: 0; font-size: 18px; font-weight: bold; color: #155724;">
        🎉 Une place s'est libérée ! Votre inscription à la formation "${data.formationTitre}" est maintenant confirmée.
      </p>
    </div>
    
    <p>Nous avons le plaisir de vous informer qu'une place s'est libérée et que vous avez été promu(e) de la liste d'attente. Votre inscription est maintenant confirmée.</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #DC143C; margin-top: 0;">Détails de la formation</h3>
      <p><strong>Titre :</strong> ${data.formationTitre}</p>
      <p><strong>Date :</strong> Du ${formatDate(data.dateDebut)} au ${formatDate(data.dateFin)}</p>
      <p><strong>Horaires :</strong> ${data.heureDebut} - ${data.heureFin}</p>
      <p><strong>Lieu :</strong> ${data.lieu}</p>
    </div>
    
    <p><strong>Important :</strong> Veuillez noter ces informations dans votre calendrier et vous assurer de votre présence.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${baseUrl}/formations/${encodeURIComponent(data.formationTitre.toLowerCase().replace(/\s+/g, '-'))}" 
         style="background: #DC143C; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Voir les détails de la formation
      </a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
      Association Guinéenne des Auditeurs (AGCM)<br>
      Cet email a été envoyé automatiquement, merci de ne pas y répondre.
    </p>
  </div>
</body>
</html>
  `;
}

// ============================================
// TEMPLATES POUR INSCRIPTIONS ÉVÉNEMENTS
// ============================================

type EvenementInscriptionEmailData = {
  prenom: string;
  nom: string;
  evenementTitre: string;
  dateEvenement: Date;
  heureDebut: string;
  heureFin: string;
  lieu: string;
  lienVisio?: string | null;
  status: 'CONFIRMEE' | 'LISTE_ATTENTE';
};

export function getEvenementInscriptionEmailTemplate(data: EvenementInscriptionEmailData): string {
  const isConfirmed = data.status === 'CONFIRMEE';
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isConfirmed ? 'Inscription confirmée' : 'Liste d\'attente'} - ${data.evenementTitre}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #DC143C 0%, #FFD700 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Association Guinéenne des Auditeurs</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #DC143C; margin-top: 0;">Bonjour ${data.prenom} ${data.nom},</h2>
    
    ${isConfirmed ? `
    <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
      <p style="margin: 0; font-size: 18px; font-weight: bold; color: #155724;">
        ✓ Votre inscription à l'événement "${data.evenementTitre}" est confirmée !
      </p>
    </div>
    ` : `
    <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
      <p style="margin: 0; font-size: 18px; font-weight: bold; color: #856404;">
        ⏳ Vous êtes sur la liste d'attente pour l'événement "${data.evenementTitre}"
      </p>
    </div>
    `}
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #DC143C; margin-top: 0;">Détails de l'événement</h3>
      <p><strong>Titre :</strong> ${data.evenementTitre}</p>
      <p><strong>Date :</strong> ${formatDateTime(data.dateEvenement, data.heureDebut)}</p>
      <p><strong>Horaires :</strong> ${data.heureDebut} - ${data.heureFin}</p>
      <p><strong>Lieu :</strong> ${data.lieu}</p>
      ${data.lienVisio ? `
      <p><strong>Lien visioconférence :</strong> <a href="${data.lienVisio}" style="color: #DC143C;">${data.lienVisio}</a></p>
      ` : ''}
    </div>
    
    ${isConfirmed ? `
    <p>Nous avons le plaisir de vous confirmer votre inscription à cet événement. Nous avons hâte de vous y voir !</p>
    ` : `
    <p>L'événement est actuellement complet, mais vous avez été ajouté(e) à la liste d'attente. Nous vous contacterons automatiquement si une place se libère.</p>
    `}
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${baseUrl}/evenements/${encodeURIComponent(data.evenementTitre.toLowerCase().replace(/\s+/g, '-'))}" 
         style="background: #DC143C; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Voir les détails de l'événement
      </a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
      Association Guinéenne des Auditeurs (AGCM)<br>
      Cet email a été envoyé automatiquement, merci de ne pas y répondre.
    </p>
  </div>
</body>
</html>
  `;
}

type EvenementPromotionEmailData = {
  prenom: string;
  nom: string;
  evenementTitre: string;
  dateEvenement: Date;
  heureDebut: string;
  heureFin: string;
  lieu: string;
  lienVisio?: string | null;
};

export function getEvenementPromotionEmailTemplate(data: EvenementPromotionEmailData): string {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bonne nouvelle ! Votre inscription est confirmée - AGCM</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #DC143C 0%, #FFD700 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Association Guinéenne des Auditeurs</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #DC143C; margin-top: 0;">Bonne nouvelle ${data.prenom} !</h2>
    
    <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
      <p style="margin: 0; font-size: 18px; font-weight: bold; color: #155724;">
        🎉 Une place s'est libérée ! Votre inscription à l'événement "${data.evenementTitre}" est maintenant confirmée.
      </p>
    </div>
    
    <p>Nous avons le plaisir de vous informer qu'une place s'est libérée et que vous avez été promu(e) de la liste d'attente. Votre inscription est maintenant confirmée.</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #DC143C; margin-top: 0;">Détails de l'événement</h3>
      <p><strong>Titre :</strong> ${data.evenementTitre}</p>
      <p><strong>Date :</strong> ${formatDateTime(data.dateEvenement, data.heureDebut)}</p>
      <p><strong>Horaires :</strong> ${data.heureDebut} - ${data.heureFin}</p>
      <p><strong>Lieu :</strong> ${data.lieu}</p>
      ${data.lienVisio ? `
      <p><strong>Lien visioconférence :</strong> <a href="${data.lienVisio}" style="color: #DC143C;">${data.lienVisio}</a></p>
      ` : ''}
    </div>
    
    <p><strong>Important :</strong> Veuillez noter ces informations dans votre calendrier et vous assurer de votre présence.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${baseUrl}/evenements/${encodeURIComponent(data.evenementTitre.toLowerCase().replace(/\s+/g, '-'))}" 
         style="background: #DC143C; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Voir les détails de l'événement
      </a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
      Association Guinéenne des Auditeurs (AGCM)<br>
      Cet email a été envoyé automatiquement, merci de ne pas y répondre.
    </p>
  </div>
</body>
</html>
  `;
}

