'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageCircle, Loader2, Trash2, Paperclip, FileText, Image, Video, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';

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

interface ChatInterfaceProps {
  scope: 'PRIVE_BUREAU';
  canModerate?: boolean;
}

const ACCEPTED_FILE_TYPES = 'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,application/pdf';
const MAX_FILES = 5;

export default function ChatInterface({ scope, canModerate = false }: ChatInterfaceProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [banner, setBanner] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadMessages();

    // Rafraîchir toutes les 3 secondes
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [scope]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/app/chat?limit=100`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.data || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ? Cette action est irréversible.')) return;

    try {
      const response = await fetch(`/api/super-admin/chat/${messageId}/delete`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadMessages();
        setBanner(null);
      } else {
        const data = await response.json();
        setBanner({ type: 'error', message: data.error || 'Erreur lors de la suppression' });
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setBanner({ type: 'error', message: 'Erreur lors de la suppression' });
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

        const res = await fetch('/api/app/chat/upload', {
          method: 'POST',
          body: formData,
        });
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
    } catch (err) {
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

    try {
      const response = await fetch('/api/app/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texte: messageText, attachments }),
      });

      if (response.ok) {
        await loadMessages();
        setBanner(null);
      } else {
        const data = await response.json();
        setBanner({ type: 'error', message: data.error || "Erreur lors de l'envoi" });
        setNewMessage(messageText);
        setPendingAttachments(attachments);
      }
    } catch (error) {
      setBanner({ type: 'error', message: "Erreur lors de l'envoi" });
      setNewMessage(messageText);
      setPendingAttachments(attachments);
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (date: Date | string) => {
    const messageDate = typeof date === 'string' ? new Date(date) : date;

    if (isToday(messageDate)) {
      return format(messageDate, 'HH:mm', { locale: fr });
    } else if (isYesterday(messageDate)) {
      return `Hier ${format(messageDate, 'HH:mm', { locale: fr })}`;
    } else {
      return format(messageDate, 'dd/MM/yyyy HH:mm', { locale: fr });
    }
  };

  const getAuthorName = (message: Message) => {
    if (message.auteur.member) {
      return `${message.auteur.member.prenom} ${message.auteur.member.nom}`;
    }
    return message.auteur.email.split('@')[0];
  };

  const getAuthorInitials = (message: Message) => {
    if (message.auteur.member) {
      return `${message.auteur.member.prenom[0]}${message.auteur.member.nom[0]}`.toUpperCase();
    }
    return message.auteur.email[0].toUpperCase();
  };

  const shouldShowAuthor = (currentIndex: number) => {
    if (currentIndex === 0) return true;
    const currentMessage = messages[currentIndex];
    const previousMessage = messages[currentIndex - 1];
    return currentMessage.auteur.id !== previousMessage.auteur.id;
  };

  const shouldShowDateSeparator = (currentIndex: number) => {
    if (currentIndex === 0) return true;
    const currentDate = new Date(messages[currentIndex].createdAt);
    const previousDate = new Date(messages[currentIndex - 1].createdAt);
    return currentDate.toDateString() !== previousDate.toDateString();
  };

  const formatDateSeparator = (date: Date | string) => {
    const messageDate = typeof date === 'string' ? new Date(date) : date;
    if (isToday(messageDate)) {
      return "Aujourd'hui";
    } else if (isYesterday(messageDate)) {
      return 'Hier';
    } else {
      return format(messageDate, 'EEEE d MMMM yyyy', { locale: fr });
    }
  };

  return (
    <div className="admin-panel flex flex-col h-[calc(100vh-280px)] min-h-[600px] max-h-[800px] overflow-hidden shadow-none">
      {/* Header du chat */}
      <div className="admin-glass border-b border-slate-700/80 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-lg p-2 ${
                scope === 'PRIVE_BUREAU'
                  ? 'bg-slate-800 text-guinea-red'
                  : 'bg-slate-800 text-blue-400'
              }`}
            >
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-100">Salon privé bureau</h2>
              <p className="text-sm text-slate-400">Messages réservés aux membres du bureau</p>
            </div>
          </div>
          {canModerate && (
            <div className="flex items-center gap-2 rounded-full border border-red-900/50 bg-red-950/40 px-3 py-1.5 text-xs font-medium text-red-200">
              <Trash2 className="h-3.5 w-3.5" />
              Mode modération
            </div>
          )}
        </div>
      </div>

      {/* Zone des messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 space-y-4 overflow-y-auto bg-slate-950/40 px-6 py-4 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-600"
      >
        {loading && messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-guinea-red" />
              <p className="text-slate-400">Chargement des messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <MessageCircle className="mx-auto mb-4 h-16 w-16 text-slate-600" />
              <p className="text-lg text-slate-300">Aucun message</p>
              <p className="mt-2 text-sm text-slate-500">Soyez le premier à envoyer un message !</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.auteur.id === session?.user?.id;
            const showAuthor = shouldShowAuthor(index);
            const showDateSeparator = shouldShowDateSeparator(index);

            return (
              <div key={message.id}>
                {showDateSeparator && (
                  <div className="my-6 flex items-center justify-center">
                    <div className="admin-panel rounded-full px-4 py-1 shadow-none">
                      <span className="text-xs font-medium text-slate-400">
                        {formatDateSeparator(message.createdAt)}
                      </span>
                    </div>
                  </div>
                )}

                <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  {!isOwn && (
                    <div className="flex-shrink-0">
                      {showAuthor ? (
                        message.auteur.member?.photoUrl ? (
                          <img
                            src={message.auteur.member.photoUrl}
                            alt={getAuthorName(message)}
                            className="h-10 w-10 rounded-full border-2 border-slate-600 object-cover shadow-sm"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                            {getAuthorInitials(message)}
                          </div>
                        )
                      ) : (
                        <div className="w-10" /> // Espace pour aligner les messages
                      )}
                    </div>
                  )}

                  {/* Message */}
                  <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    {!isOwn && showAuthor && (
                      <div className="mb-1 px-2">
                        <span className="text-xs font-semibold text-slate-300">{getAuthorName(message)}</span>
                      </div>
                    )}

                    <div
                      className={`group relative rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 ${
                        isOwn
                          ? 'rounded-br-md bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                          : 'admin-panel rounded-bl-md text-slate-100 hover:border-slate-600'
                      }`}
                    >
                      {canModerate && !isOwn && (
                        <button
                          onClick={() => handleDelete(message.id)}
                          className="absolute -right-2 -top-2 z-20 rounded-full bg-red-700 p-2 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-red-600"
                          title="Supprimer ce message (Super Admin)"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                      {message.texte && (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {message.texte}
                        </p>
                      )}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {message.attachments.map((att) => (
                            <div key={att.url} className="flex items-center gap-2">
                              {att.type === 'IMAGE' ? (
                                <a href={att.url} target="_blank" rel="noopener noreferrer" className="block">
                                  <img
                                    src={att.url}
                                    alt={att.fileName}
                                    className="max-h-[150px] max-w-[200px] rounded-lg border border-slate-600 object-cover"
                                  />
                                </a>
                              ) : att.type === 'VIDEO' ? (
                                <video
                                  src={att.url}
                                  controls
                                  className="max-h-[180px] max-w-[280px] rounded-lg border border-slate-600"
                                />
                              ) : (
                                <a
                                  href={att.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"
                                >
                                  <FileText className="h-4 w-4" />
                                  {att.fileName}
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className={`flex items-center gap-1 mt-2 ${isOwn ? 'justify-end' : 'justify-start'
                        }`}>
                        <span className={`text-xs ${isOwn ? 'text-blue-100' : 'text-slate-400'}`}>
                          {formatMessageTime(message.createdAt)}
                        </span>
                        {isOwn && (
                          <svg
                            className={`w-3 h-3 ${sending ? 'opacity-50' : 'opacity-100'
                              }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Espace pour l'avatar à droite pour les messages propres */}
                  {isOwn && <div className="flex-shrink-0 w-10" />}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Pièces jointes en attente */}
      {pendingAttachments.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-slate-700 bg-slate-900/80 px-4 py-2">
          {pendingAttachments.map((a) => (
            <div
              key={a.url}
              className="admin-panel flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm shadow-none"
            >
              {a.type === 'IMAGE' ? (
                <Image className="h-4 w-4 text-blue-400" />
              ) : a.type === 'VIDEO' ? (
                <Video className="h-4 w-4 text-purple-400" />
              ) : (
                <FileText className="h-4 w-4 text-slate-400" />
              )}
              <span className="max-w-[120px] truncate text-slate-200">{a.fileName}</span>
              <button
                type="button"
                onClick={() => removePendingAttachment(a.url)}
                className="rounded p-0.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Zone de saisie */}
      <div className="border-t border-slate-700 bg-slate-950/90 p-4">
        {banner && (
          <div
            className={`mb-3 flex items-start justify-between gap-3 ${
              banner.type === 'error' ? 'app-banner-error' : 'app-banner-success'
            }`}
          >
            <p className="flex-1">{banner.message}</p>
            <button
              type="button"
              onClick={() => setBanner(null)}
              className="shrink-0 rounded p-1 text-current opacity-70 hover:opacity-100"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <form onSubmit={handleSend} className="flex gap-3">
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
            className="h-12 w-12 shrink-0 border-slate-600 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingFile || pendingAttachments.length >= MAX_FILES}
            title="Joindre un fichier (PDF, image, vidéo)"
          >
            {uploadingFile ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Paperclip className="h-5 w-5" />
            )}
          </Button>
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Tapez votre message..."
              disabled={sending}
              className="h-12 rounded-xl border-slate-600 bg-slate-950 pr-12 text-base text-slate-100 placeholder:text-slate-500 focus:border-guinea-red focus:ring-2 focus:ring-guinea-red/25"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
              Entrée pour envoyer
            </div>
          </div>
          <Button
            type="submit"
            disabled={sending || (!newMessage.trim() && !pendingAttachments.length)}
            className="h-12 px-6 rounded-xl bg-gradient-to-r from-guinea-red to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
