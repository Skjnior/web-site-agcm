/** Salles Jitsi dérivées du mandat (pas de secrets — tout membre avec le nom peut rejoindre) */

export const JITSI_DOMAIN = 'meet.jit.si';

export function sanitizeJitsiRoomPart(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 22);
}

export function buildSalonJitsiRoom(mandatId: string): { roomName: string; roomUrl: string } {
  const roomName = `agcmsalon${sanitizeJitsiRoomPart(mandatId)}`.slice(0, 90);
  return { roomName, roomUrl: `https://${JITSI_DOMAIN}/${roomName}` };
}

export function buildDirectJitsiRoom(
  mandatId: string,
  userIdA: string,
  userIdB: string,
): { roomName: string; roomUrl: string } {
  const [a, b] = [userIdA, userIdB].sort();
  const roomName = `agcmdm${sanitizeJitsiRoomPart(mandatId)}${sanitizeJitsiRoomPart(a)}${sanitizeJitsiRoomPart(b)}`.slice(
    0,
    95,
  );
  return { roomName, roomUrl: `https://${JITSI_DOMAIN}/${roomName}` };
}
