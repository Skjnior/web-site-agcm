'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';
import { Button } from '@/components/ui/button';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Send,
  MessageCircle,
  Loader2,
  Trash2,
  Paperclip,
  FileText,
  Image,
  Video,
  X,
  Users,
  Phone,
  ChevronLeft,
  Pencil,
  Check,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import Script from 'next/script';
import { buildDirectJitsiRoom, buildSalonJitsiRoom, JITSI_DOMAIN } from '@/lib/bureau-jitsi-rooms';
import { cn } from '@/lib/utils';

interface Attachment {
  id?: string;
  url: string;
  type: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

interface Message {
  id: string;
  texte: string;
  createdAt: Date | string;
  editedAt?: Date | string | null;
  messageKind?: 'USER' | 'SYSTEM';
  threadKind?: 'SALON' | 'DIRECT';
  deletedAt?: Date | string | null;
  deletedBy?: string | null;
  deletedByUser?: {
    id: string;
    email: string;
    member: { prenom: string; nom: string } | null;
  } | null;
  attachments?: Attachment[];
  auteur: {
    id: string;
    email: string;
    member?: {
      id: string;
      prenom: string;
      nom: string;
      photoUrl?: string | null;
    } | null;
  };
}

const MESSAGE_GROUP_GAP_MS = 5 * 60 * 1000;

function renderTextWithLinks(text: string, linkClass: string): ReactNode[] {
  return text.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" className={linkClass}>
        {part}
      </a>
    ) : (
      part
    ),
  );
}

function participantName(
  u: { member?: { prenom: string; nom: string } | null; email: string } | null | undefined,
): string {
  if (!u) return '';
  if (u.member) return `${u.member.prenom} ${u.member.nom}`;
  return u.email.split('@')[0] ?? '';
}

function tombstoneCopy(message: Message, viewerId: string | undefined): { title: string; detail: string } {
  const deletedAt = message.deletedAt ? new Date(message.deletedAt) : null;
  const timeStr = deletedAt ? format(deletedAt, "d MMM yyyy 'à' HH:mm", { locale: fr }) : '';
  const actorName = participantName(message.deletedByUser);

  if (message.deletedBy && message.deletedBy !== message.auteur.id) {
    return {
      title: 'Message retiré',
      detail: `Suppression le ${timeStr}${actorName ? ` par ${actorName}` : ' (modération)'}. Le contenu n’est plus affiché.`,
    };
  }

  return {
    title: 'Message supprimé',
    detail:
      message.auteur.id === viewerId
        ? `Vous avez supprimé ce message le ${timeStr}.`
        : `Supprimé par l’auteur le ${timeStr}.`,
  };
}

function shouldStartNewMessageGroup(prev: Message | undefined, curr: Message): boolean {
  if (!prev) return true;
  if (prev.messageKind === 'SYSTEM' || curr.messageKind === 'SYSTEM') return true;
  if (prev.deletedAt || curr.deletedAt) return true;
  if (prev.auteur.id !== curr.auteur.id) return true;
  if (new Date(prev.createdAt).toDateString() !== new Date(curr.createdAt).toDateString()) return true;
  return new Date(curr.createdAt).getTime() - new Date(prev.createdAt).getTime() > MESSAGE_GROUP_GAP_MS;
}

export interface BureauChatMember {
  userId: string;
  email: string;
  prenom: string;
  nom: string;
  photoUrl: string | null;
}

interface ChatInterfaceProps {
  scope: 'PRIVE_BUREAU';
  /** Mandat actif (requis pour Jitsi stable + fils DM) */
  mandatId: string;
  canModerate?: boolean;
}

const ACCEPTED_FILE_TYPES = 'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,application/pdf';
const MAX_FILES = 5;
const POLL_MS = 5000;

type Thread =
  | { type: 'salon' }
  | { type: 'direct'; peer: BureauChatMember };

export default function ChatInterface({ scope, mandatId, canModerate = false }: ChatInterfaceProps) {
  const { data: session } = useSession();
  const [members, setMembers] = useState<BureauChatMember[]>([]);
  const [thread, setThread] = useState<Thread>({ type: 'salon' });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [banner, setBanner] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<{ dispose: () => void } | null>(null);
  const [showVisio, setShowVisio] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ messageId: string; isOwnMessage: boolean } | null>(
    null,
  );
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (!initialLoadDone) return;
    scrollToBottom();
  }, [messages, initialLoadDone]);

  const loadMembers = useCallback(async () => {
    try {
      const res = await fetch('/api/app/chat/members');
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const loadMessages = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) setLoading(true);
      try {
        const params = new URLSearchParams({ limit: '100' });
        if (thread.type === 'salon') params.set('thread', 'salon');
        else {
          params.set('thread', 'direct');
          params.set('peerUserId', thread.peer.userId);
        }
        const response = await fetch(`/api/app/chat?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.data || []);
        }
      } catch (error) {
        console.error('Erreur chargement messages:', error);
      } finally {
        if (!opts?.silent) setLoading(false);
        setInitialLoadDone(true);
      }
    },
    [thread],
  );

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    setInitialLoadDone(false);
    void loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    const t = setInterval(() => {
      void loadMessages({ silent: true });
    }, POLL_MS);
    return () => clearInterval(t);
  }, [loadMessages]);

  useEffect(() => {
    return () => {
      jitsiApiRef.current?.dispose();
      jitsiApiRef.current = null;
    };
  }, []);

  const postJson = async (body: unknown) => {
    return fetch('/api/app/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  };

  const announceJitsiAndOpen = async (mode: 'video' | 'audio', scopeMeet: 'salon' | 'direct') => {
    if (!mandatId) {
      setBanner({ type: 'error', message: 'Mandat indisponible pour la visioconférence.' });
      return;
    }
    if (scopeMeet === 'direct' && thread.type !== 'direct') {
      setBanner({ type: 'error', message: 'Ouvrez une conversation directe pour un appel 1:1.' });
      return;
    }

    jitsiApiRef.current?.dispose();
    jitsiApiRef.current = null;

    const threadKind = scopeMeet === 'salon' ? 'SALON' : 'DIRECT';
    const dmPeerUserId = scopeMeet === 'direct' && thread.type === 'direct' ? thread.peer.userId : undefined;

    const res = await postJson({
      texte: '',
      attachments: [],
      threadKind,
      dmPeerUserId,
      jitsiSession: { mode, scope: scopeMeet },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setBanner({ type: 'error', message: data.error || 'Impossible de publier l’annonce visio.' });
      void loadMessages({ silent: true });
      return;
    }

    await loadMessages({ silent: true });

    const uid = session?.user?.id;
    if (!uid) return;

    const { roomName } =
      scopeMeet === 'salon'
        ? buildSalonJitsiRoom(mandatId)
        : buildDirectJitsiRoom(mandatId, uid, dmPeerUserId!);

    setShowVisio(true);

    const tryStart = (attempt = 0) => {
      const Api = (window as unknown as { JitsiMeetExternalAPI?: new (d: string, o: Record<string, unknown>) => { dispose: () => void; addEventListener: (e: string, fn: () => void) => void } }).JitsiMeetExternalAPI;
      if (!Api) {
        if (attempt < 40) window.setTimeout(() => tryStart(attempt + 1), 250);
        return;
      }
      if (!jitsiContainerRef.current) return;

      const display =
        session?.user?.name ||
        (session?.user as { email?: string } | undefined)?.email ||
        'Membre bureau';

      const startAudioOnly = mode === 'audio';
      const api = new Api(JITSI_DOMAIN, {
        roomName,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        lang: 'fr',
        userInfo: { displayName: display },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: startAudioOnly,
          disableDeepLinking: true,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: startAudioOnly
            ? ['microphone', 'hangup', 'tileview']
            : ['microphone', 'camera', 'hangup', 'tileview', 'settings'],
        },
      });

      jitsiApiRef.current = api;
      api.addEventListener('videoConferenceLeft', () => {
        jitsiApiRef.current = null;
        setShowVisio(false);
      });
    };

    requestAnimationFrame(() => tryStart());
  };

  const stopVisio = () => {
    jitsiApiRef.current?.dispose();
    jitsiApiRef.current = null;
    setShowVisio(false);
  };

  const openDeleteMessageDialog = (messageId: string, isOwnMessage: boolean) => {
    setDeleteDialog({ messageId, isOwnMessage });
  };

  const closeDeleteMessageDialog = () => {
    if (!deleteSubmitting) setDeleteDialog(null);
  };

  const confirmDeleteMessage = async () => {
    if (!deleteDialog) return;
    setDeleteSubmitting(true);
    try {
      const response = await fetch(`/api/app/chat/${deleteDialog.messageId}`, { method: 'DELETE' });
      if (response.ok) await loadMessages({ silent: true });
      else {
        const data = await response.json();
        setBanner({ type: 'error', message: data.error || 'Erreur suppression' });
      }
    } catch {
      setBanner({ type: 'error', message: 'Erreur suppression' });
    } finally {
      setDeleteSubmitting(false);
      setDeleteDialog(null);
    }
  };

  const startEdit = (m: Message) => {
    setEditingMessageId(m.id);
    setEditDraft(m.texte);
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditDraft('');
  };

  const saveEdit = async () => {
    if (!editingMessageId || !editDraft.trim()) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/app/chat/${editingMessageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texte: editDraft.trim() }),
      });
      if (res.ok) {
        cancelEdit();
        await loadMessages({ silent: true });
      } else {
        const data = await res.json();
        setBanner({ type: 'error', message: data.error || 'Erreur lors de la modification' });
      }
    } catch {
      setBanner({ type: 'error', message: 'Erreur lors de la modification' });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || pendingAttachments.length + files.length > MAX_FILES) return;

    setUploadingFile(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/app/chat/upload', { method: 'POST', body: formData });
        if (res.ok) {
          const data = await res.json();
          setPendingAttachments((prev) => [
            ...prev,
            {
              url: data.url,
              type: data.type,
              fileName: data.fileName,
              fileSize: data.fileSize,
              mimeType: data.mimeType,
            },
          ]);
        } else {
          const err = await res.json();
          setBanner({ type: 'error', message: err.error || 'Erreur upload' });
        }
      }
    } catch {
      setBanner({ type: 'error', message: "Erreur lors de l'upload" });
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  const removePendingAttachment = (url: string) => {
    setPendingAttachments((prev) => prev.filter((a) => a.url !== url));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !pendingAttachments.length) || sending) return;

    const messageText = newMessage.trim() || '';
    const attachments = [...pendingAttachments];
    setNewMessage('');
    setPendingAttachments([]);
    setSending(true);

    const body = {
      texte: messageText,
      attachments,
      threadKind: thread.type === 'salon' ? 'SALON' : 'DIRECT',
      dmPeerUserId: thread.type === 'direct' ? thread.peer.userId : undefined,
    };

    try {
      const response = await postJson(body);
      if (response.ok) {
        await loadMessages({ silent: true });
        scrollToBottom();
        setBanner(null);
      } else {
        const data = await response.json();
        setBanner({ type: 'error', message: data.error || "Erreur lors de l'envoi" });
        setNewMessage(messageText);
        setPendingAttachments(attachments);
      }
    } catch {
      setBanner({ type: 'error', message: "Erreur lors de l'envoi" });
      setNewMessage(messageText);
      setPendingAttachments(attachments);
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (date: Date | string) => {
    const messageDate = typeof date === 'string' ? new Date(date) : date;
    if (isToday(messageDate)) return format(messageDate, 'HH:mm', { locale: fr });
    if (isYesterday(messageDate)) return `Hier ${format(messageDate, 'HH:mm', { locale: fr })}`;
    return format(messageDate, 'dd/MM/yyyy HH:mm', { locale: fr });
  };

  const getAuthorName = (message: Message) => {
    if (message.auteur.member) return `${message.auteur.member.prenom} ${message.auteur.member.nom}`;
    return message.auteur.email.split('@')[0];
  };

  const getAuthorInitials = (message: Message) => {
    if (message.auteur.member) {
      return `${message.auteur.member.prenom[0]}${message.auteur.member.nom[0]}`.toUpperCase();
    }
    return message.auteur.email[0]?.toUpperCase() ?? '?';
  };

  const threadTitle =
    thread.type === 'salon' ? 'Salon général' : `${thread.peer.prenom} ${thread.peer.nom}`;

  const threadSubtitle =
    thread.type === 'salon'
      ? 'Tous les membres du bureau'
      : 'Message direct (même mandat, membres du bureau)';

  return (
    <div
      className={cn(
        'admin-panel flex flex-col overflow-hidden shadow-none',
        'h-[min(85vh,calc(100vh-220px))] min-h-[480px] max-h-[920px]',
      )}
    >
      <Script src={`https://${JITSI_DOMAIN}/external_api.js`} strategy="lazyOnload" />

      <div className="admin-glass flex shrink-0 flex-col gap-3 border-b border-slate-700/80 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 border-slate-600 md:hidden"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', sidebarOpen && 'rotate-180')} />
          </Button>
          <div
            className={cn(
              'rounded-lg p-2',
              scope === 'PRIVE_BUREAU' ? 'bg-slate-800 text-purple-400' : 'bg-slate-800 text-blue-400',
            )}
          >
            {thread.type === 'salon' ? <Users className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-semibold text-slate-100">{threadTitle}</h2>
            <p className="truncate text-xs text-slate-400 sm:text-sm">{threadSubtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {canModerate && (
            <div className="flex items-center gap-2 rounded-full border border-red-900/50 bg-red-950/40 px-2 py-1 text-[10px] font-medium text-red-200 sm:text-xs">
              <Trash2 className="h-3 w-3" />
              Modération
            </div>
          )}
          {mandatId && (
            <>
              {!showVisio ? (
                <>
                  <Button
                    type="button"
                    onClick={() => void announceJitsiAndOpen('video', thread.type === 'salon' ? 'salon' : 'direct')}
                    variant="outline"
                    size="sm"
                    className="gap-1 border-purple-500/50 bg-purple-500/10 text-purple-200 hover:bg-purple-500/20"
                  >
                    <Video className="h-4 w-4" />
                    <span className="hidden sm:inline">Visio</span>
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void announceJitsiAndOpen('audio', thread.type === 'salon' ? 'salon' : 'direct')}
                    variant="outline"
                    size="sm"
                    className="gap-1 border-emerald-500/50 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20"
                  >
                    <Phone className="h-4 w-4" />
                    <span className="hidden sm:inline">Audio</span>
                  </Button>
                </>
              ) : (
                <Button type="button" onClick={stopVisio} variant="destructive" size="sm" className="gap-1">
                  <X className="h-4 w-4" />
                  Quitter
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <div className={cn('relative flex min-h-0 flex-1', showVisio && 'flex-col lg:flex-row')}>
        <aside
          className={cn(
            'flex w-full flex-col border-slate-700 bg-slate-900/90 md:w-64 md:shrink-0 md:border-r',
            'absolute inset-0 z-20 md:relative md:z-0',
            sidebarOpen ? 'flex' : 'hidden md:flex',
          )}
        >
          <div className="border-b border-slate-700/80 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Conversations</p>
          </div>
          <nav className="flex-1 overflow-y-auto p-2">
            <button
              type="button"
              onClick={() => {
                setThread({ type: 'salon' });
                setSidebarOpen(false);
              }}
              className={cn(
                'mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                thread.type === 'salon'
                  ? 'bg-purple-500/20 text-purple-100'
                  : 'text-slate-300 hover:bg-slate-800',
              )}
            >
              <Users className="h-4 w-4 shrink-0" />
              Salon général
            </button>
            <p className="mt-3 px-3 pb-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">
              Messages directs
            </p>
            {members.length === 0 ? (
              <p className="px-3 py-2 text-xs text-slate-500">Aucun autre membre du bureau.</p>
            ) : (
              members.map((m) => (
                <button
                  key={m.userId}
                  type="button"
                  onClick={() => {
                    setThread({ type: 'direct', peer: m });
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    'mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                    thread.type === 'direct' && thread.peer.userId === m.userId
                      ? 'bg-blue-500/20 text-blue-100'
                      : 'text-slate-300 hover:bg-slate-800',
                  )}
                >
                  {m.photoUrl ? (
                    <img src={m.photoUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold">
                      {m.prenom[0]}
                      {m.nom[0]}
                    </div>
                  )}
                  <span className="truncate">
                    {m.prenom} {m.nom}
                  </span>
                </button>
              ))
            )}
          </nav>
        </aside>

        {showVisio && (
          <div className="flex min-h-[280px] flex-1 border-b border-slate-700 bg-black lg:min-h-0 lg:border-b-0 lg:border-r">
            <div ref={jitsiContainerRef} className="h-full min-h-[260px] w-full flex-1" />
          </div>
        )}

        <div className={cn('flex min-h-0 min-w-0 flex-1 flex-col', showVisio && 'lg:max-w-md')}>
          <div
            ref={messagesContainerRef}
            className={cn(
              'flex-1 overflow-y-auto',
              thread.type === 'salon'
                ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/90 via-slate-950/95 to-slate-950'
                : 'bg-slate-950/40',
            )}
          >
            <div
              className={cn(
                'min-h-full',
                thread.type === 'salon' ? 'px-2 py-2 sm:px-4 sm:py-4' : 'px-3 py-3 sm:px-6 sm:py-4',
              )}
            >
              <div
                className={cn(
                  thread.type === 'salon' && 'mx-auto max-w-3xl space-y-1',
                  thread.type === 'direct' && 'space-y-3 sm:space-y-4',
                )}
              >
                {loading && messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
                    <p className="text-slate-400">Chargement…</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                    <MessageCircle className="mb-4 h-14 w-14 text-slate-600" />
                    <p className="text-slate-300">Aucun message pour l’instant</p>
                    <p className="mt-1 text-sm text-slate-500">Écrivez ou proposez un appel audio / visio.</p>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const prev = messages[index - 1];
                    const newGroup = shouldStartNewMessageGroup(prev, message);
                    const blockSpacing = newGroup ? 'mt-4' : 'mt-1';

                    if (message.deletedAt) {
                      const ts = tombstoneCopy(message, session?.user?.id);
                      const isSystem = message.messageKind === 'SYSTEM';
                      if (isSystem) {
                        return (
                          <div key={message.id} className={cn('flex justify-center px-1', blockSpacing)}>
                            <div className="max-w-lg rounded-lg border border-dashed border-slate-600/70 bg-slate-900/50 px-4 py-3 text-center">
                              <p className="text-xs font-medium tracking-wide text-slate-500">{ts.title}</p>
                              <p className="mt-1 text-[11px] leading-snug text-slate-500">{ts.detail}</p>
                            </div>
                          </div>
                        );
                      }
                      const isOwn = message.auteur.id === session?.user?.id;
                      return (
                        <div key={message.id} className={cn('flex gap-2 sm:gap-3', blockSpacing, isOwn && 'flex-row-reverse')}>
                          {!isOwn && (
                            <div className="w-9 shrink-0 sm:w-10">
                              {newGroup ? (
                                message.auteur.member?.photoUrl ? (
                                  <img
                                    src={message.auteur.member.photoUrl}
                                    alt=""
                                    className="h-9 w-9 rounded-full border border-slate-600 object-cover sm:h-10 sm:w-10"
                                  />
                                ) : (
                                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-slate-300 sm:h-10 sm:w-10">
                                    {getAuthorInitials(message)}
                                  </div>
                                )
                              ) : (
                                <div className="h-9 sm:h-10" />
                              )}
                            </div>
                          )}
                          <div className={cn('flex min-w-0 max-w-[88%] flex-col sm:max-w-[80%]', isOwn && 'items-end')}>
                            {!isOwn && newGroup && (
                              <span className="mb-0.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                {getAuthorName(message)}
                              </span>
                            )}
                            <div className="rounded-2xl border border-dashed border-slate-600/60 bg-slate-900/60 px-3 py-2.5 sm:px-4">
                              <p className="text-xs font-medium text-slate-500">{ts.title}</p>
                              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{ts.detail}</p>
                            </div>
                          </div>
                          {isOwn && <div className="w-9 shrink-0 sm:w-10" />}
                        </div>
                      );
                    }

                    const isSystem = message.messageKind === 'SYSTEM';
                    if (isSystem) {
                      return (
                        <div key={message.id} className={cn('flex justify-center px-1', blockSpacing)}>
                          <div className="relative max-w-[95%] rounded-xl border border-purple-500/20 bg-slate-800/90 px-4 py-2.5 text-center shadow-sm sm:max-w-lg">
                            {canModerate && (
                              <button
                                type="button"
                                onClick={() => openDeleteMessageDialog(message.id, false)}
                                className="absolute -right-1 -top-1 rounded-full bg-red-700 p-1.5 text-white shadow hover:bg-red-600"
                                title="Retirer le message (modération)"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                            <p className="whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-300">
                              {renderTextWithLinks(message.texte, 'font-medium text-purple-300 underline')}
                            </p>
                            <p className="mt-1.5 text-[10px] text-slate-500">
                              {getAuthorName(message)} · {formatMessageTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    }

                    const isOwn = message.auteur.id === session?.user?.id;
                    const showDateSeparator =
                      index === 0 ||
                      new Date(message.createdAt).toDateString() !==
                        new Date(messages[index - 1]!.createdAt).toDateString();

                    const sepDate = new Date(message.createdAt);
                    let sepLabel: string;
                    if (isToday(sepDate)) sepLabel = "Aujourd'hui";
                    else if (isYesterday(sepDate)) sepLabel = 'Hier';
                    else sepLabel = format(sepDate, 'EEEE d MMMM yyyy', { locale: fr });

                    const showAvatar = newGroup && !isOwn;
                    const showName = newGroup && !isOwn;

                    return (
                      <div key={message.id} className={newGroup ? 'mt-4' : 'mt-1'}>
                        {showDateSeparator && (
                          <div className="mb-4 flex justify-center">
                            <span className="rounded-full border border-slate-700/80 bg-slate-800/90 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                              {sepLabel}
                            </span>
                          </div>
                        )}

                        <div className={cn('flex gap-2 sm:gap-3', isOwn && 'flex-row-reverse')}>
                          {!isOwn && (
                            <div className="relative w-9 shrink-0 sm:w-10">
                              {showAvatar ? (
                                message.auteur.member?.photoUrl ? (
                                  <img
                                    src={message.auteur.member.photoUrl}
                                    alt=""
                                    className="h-9 w-9 rounded-full border border-slate-600 object-cover sm:h-10 sm:w-10"
                                  />
                                ) : (
                                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-xs font-semibold text-white sm:h-10 sm:w-10">
                                    {getAuthorInitials(message)}
                                  </div>
                                )
                              ) : (
                                <div className="flex h-full justify-center pt-2">
                                  <span className="block w-px flex-1 bg-slate-700/60" aria-hidden />
                                </div>
                              )}
                            </div>
                          )}

                          <div className={cn('flex min-w-0 max-w-[88%] flex-col sm:max-w-[80%]', isOwn && 'items-end')}>
                            {showName && (
                              <span className="mb-0.5 px-1 text-[11px] font-semibold text-slate-400">
                                {getAuthorName(message)}
                              </span>
                            )}
                            <div
                              className={cn(
                                'group relative rounded-2xl px-3 py-2.5 shadow-md sm:px-4 sm:py-3',
                                thread.type === 'salon' && !isOwn && 'ring-1 ring-slate-700/40',
                                isOwn
                                  ? 'rounded-br-md bg-gradient-to-br from-blue-600 to-blue-800 text-white'
                                  : 'rounded-bl-md border border-slate-700/60 bg-slate-900/85 text-slate-100',
                              )}
                            >
                              {isOwn && !message.deletedAt && (
                                <div className="absolute -top-2 right-0 z-10 flex gap-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                                  <button
                                    type="button"
                                    onClick={() => startEdit(message)}
                                    className="rounded-full bg-slate-950/70 p-1.5 text-white shadow hover:bg-slate-900"
                                    title="Modifier"
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openDeleteMessageDialog(message.id, true)}
                                    className="rounded-full bg-slate-950/70 p-1.5 text-white shadow hover:bg-red-900/90"
                                    title="Supprimer"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                              {canModerate && !isOwn && (
                                <button
                                  type="button"
                                  onClick={() => openDeleteMessageDialog(message.id, false)}
                                  className="absolute -right-1 -top-1 z-10 rounded-full bg-red-700 p-1.5 text-white opacity-0 shadow transition hover:bg-red-600 sm:group-hover:opacity-100"
                                  title="Retirer (modération)"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}

                              {editingMessageId === message.id ? (
                                <div className="space-y-2">
                                  <Textarea
                                    value={editDraft}
                                    onChange={(e) => setEditDraft(e.target.value)}
                                    className="min-h-[88px] resize-y border-slate-600 bg-slate-950/40 text-sm text-slate-100"
                                    disabled={savingEdit}
                                  />
                                  <div className="flex justify-end gap-2">
                                    <Button type="button" size="sm" variant="ghost" onClick={cancelEdit} disabled={savingEdit}>
                                      Annuler
                                    </Button>
                                    <Button type="button" size="sm" onClick={() => void saveEdit()} disabled={savingEdit || !editDraft.trim()}>
                                      {savingEdit ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {message.texte && (
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                      {renderTextWithLinks(
                                        message.texte,
                                        cn('underline underline-offset-2', isOwn ? 'text-blue-100' : 'text-purple-300'),
                                      )}
                                    </p>
                                  )}
                                  {message.attachments && message.attachments.length > 0 && (
                                    <div className="mt-2 space-y-2">
                                      {message.attachments.map((att) => (
                                        <div key={att.url} className="flex flex-wrap items-center gap-2">
                                          {att.type === 'IMAGE' ? (
                                            <a href={att.url} target="_blank" rel="noopener noreferrer">
                                              <img
                                                src={att.url}
                                                alt={att.fileName}
                                                className="max-h-40 max-w-full rounded-lg border border-slate-600 object-cover sm:max-h-48"
                                              />
                                            </a>
                                          ) : att.type === 'VIDEO' ? (
                                            <video
                                              src={att.url}
                                              controls
                                              className="max-h-44 max-w-full rounded-lg border border-slate-600"
                                            />
                                          ) : (
                                            <a
                                              href={att.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm"
                                            >
                                              <FileText className="h-4 w-4" />
                                              {att.fileName}
                                            </a>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  <p
                                    className={cn(
                                      'mt-1.5 flex flex-wrap items-center gap-x-2 text-[10px] sm:text-xs',
                                      isOwn ? 'text-blue-100/90' : 'text-slate-500',
                                    )}
                                  >
                                    <span>{formatMessageTime(message.createdAt)}</span>
                                    {message.editedAt && (
                                      <span className={cn('italic', isOwn ? 'text-blue-200/70' : 'text-slate-500')}>
                                        (modifié {format(new Date(message.editedAt), 'dd/MM HH:mm', { locale: fr })})
                                      </span>
                                    )}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>

                          {isOwn && <div className="w-9 shrink-0 sm:w-10" />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            <div ref={messagesEndRef} />
          </div>

          {pendingAttachments.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-slate-700 bg-slate-900/80 px-3 py-2">
              {pendingAttachments.map((a) => (
                <div
                  key={a.url}
                  className="admin-panel flex items-center gap-2 rounded-lg px-2 py-1 text-xs shadow-none sm:text-sm"
                >
                  {a.type === 'IMAGE' ? (
                    <Image className="h-4 w-4 text-blue-400" />
                  ) : a.type === 'VIDEO' ? (
                    <Video className="h-4 w-4 text-purple-400" />
                  ) : (
                    <FileText className="h-4 w-4 text-slate-400" />
                  )}
                  <span className="max-w-[100px] truncate text-slate-200 sm:max-w-[160px]">{a.fileName}</span>
                  <button
                    type="button"
                    onClick={() => removePendingAttachment(a.url)}
                    className="rounded p-0.5 text-slate-400 hover:bg-slate-800"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-slate-700 bg-slate-950/90 p-3 sm:p-4">
            {banner && (
              <div
                className={cn(
                  'mb-3 flex items-start justify-between gap-2 rounded-lg px-3 py-2 text-sm',
                  banner.type === 'error' ? 'app-banner-error' : 'app-banner-success',
                )}
              >
                <p className="flex-1">{banner.message}</p>
                <button type="button" onClick={() => setBanner(null)} className="shrink-0 opacity-70 hover:opacity-100">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <form onSubmit={handleSend} className="flex gap-2 sm:gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_FILE_TYPES}
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 shrink-0 border-slate-600 bg-slate-900 sm:h-12 sm:w-12"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFile || pendingAttachments.length >= MAX_FILES}
                title="Joindre un fichier"
              >
                {uploadingFile ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
              </Button>
              <Input
                value={newMessage}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
                placeholder={thread.type === 'salon' ? 'Message au salon…' : `Message à ${thread.peer.prenom}…`}
                disabled={sending}
                className="h-11 min-w-0 flex-1 rounded-xl border-slate-600 bg-slate-950 text-slate-100 sm:h-12"
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend(e);
                  }
                }}
              />
              <Button
                type="submit"
                disabled={sending || (!newMessage.trim() && !pendingAttachments.length)}
                className="h-11 shrink-0 rounded-xl px-4 sm:h-12 sm:px-6"
              >
                {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </form>
            <p className="mt-2 hidden text-center text-[10px] text-slate-500 sm:block">
              Entrée pour envoyer · Salon limité au mandat en cours
            </p>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteDialog != null}
        onClose={closeDeleteMessageDialog}
        onConfirm={() => void confirmDeleteMessage()}
        title={
          deleteDialog?.isOwnMessage ? 'Supprimer votre message ?' : 'Retirer ce message pour tous ?'
        }
        type="danger"
        confirmText={deleteDialog?.isOwnMessage ? 'Supprimer le message' : 'Retirer pour tous'}
        cancelText="Annuler"
        isLoading={deleteSubmitting}
        loadingLabel="Suppression…"
        layerClassName="z-[100]"
        panelClassName="border-slate-600 bg-slate-950 text-slate-100 shadow-2xl ring-1 ring-slate-800"
        titleClassName="text-slate-100"
        footerClassName="border-slate-700"
      >
        {deleteDialog?.isOwnMessage ? (
          <div className="space-y-3 text-slate-300">
            <p className="leading-relaxed">
              Le message disparaît du contenu affiché, mais une entrée reste visible dans le fil pour
              tout le monde, comme dans les outils de messagerie professionnels.
            </p>
            <div className="rounded-lg border border-slate-700/80 bg-slate-900/80 px-3 py-2.5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Conséquences</p>
              <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm text-slate-400">
                <li>
                  Texte et pièces jointes ne sont plus montrés ; à la place : indication de message
                  retiré.
                </li>
                <li>Les autres membres voient que le message n’est plus disponible.</li>
                <li>Cette action est traçable dans l’historique du salon (qui a retiré le message).</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-slate-300">
            <p className="leading-relaxed">
              Action de modération : le message sera retiré pour tous les participants. Une trace
              indiquera qu’il a été supprimé par l’équipe.
            </p>
            <div className="rounded-lg border border-red-900/40 bg-red-950/25 px-3 py-2.5">
              <ul className="list-inside list-disc space-y-1.5 text-sm text-slate-400">
                <li>Le contenu ne sera plus visible.</li>
                <li>Le fil conserve une mention de retrait pour transparence.</li>
              </ul>
            </div>
          </div>
        )}
      </ConfirmationModal>
    </div>
  );
}
