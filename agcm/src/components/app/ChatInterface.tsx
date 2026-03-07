'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, User, MessageCircle, Loader2, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Message {
  id: string;
  texte: string;
  createdAt: Date | string;
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

export default function ChatInterface({ scope, canModerate = false }: ChatInterfaceProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
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
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const response = await fetch('/api/app/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texte: messageText }),
      });

      if (response.ok) {
        // Recharger les messages après l'envoi
        await loadMessages();
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors de l\'envoi');
        setNewMessage(messageText); // Restaurer le message en cas d'erreur
      }
    } catch (error) {
      alert('Erreur lors de l\'envoi');
      setNewMessage(messageText);
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
    <div className="flex flex-col h-[calc(100vh-280px)] min-h-[600px] max-h-[800px] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header du chat */}
      <div className={`px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${scope === 'PRIVE_BUREAU'
                ? 'bg-purple-100 text-purple-600'
                : 'bg-blue-100 text-blue-600'
              }`}>
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Salon privé bureau</h2>
              <p className="text-sm text-gray-600">Messages réservés aux membres du bureau</p>
            </div>
          </div>
          {canModerate && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
              <Trash2 className="h-3.5 w-3.5" />
              Mode modération
            </div>
          )}
        </div>
      </div>

      {/* Zone des messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-guinea-red" />
              <p className="text-gray-500">Chargement des messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucun message</p>
              <p className="text-gray-400 text-sm mt-2">
                Soyez le premier à envoyer un message !
              </p>
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
                  <div className="flex items-center justify-center my-6">
                    <div className="px-4 py-1 bg-white rounded-full border border-gray-200 shadow-sm">
                      <span className="text-xs font-medium text-gray-600">
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
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
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
                        <span className="text-xs font-semibold text-gray-700">
                          {getAuthorName(message)}
                        </span>
                      </div>
                    )}

                    <div
                      className={`group relative px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 ${isOwn
                          ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md'
                          : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md hover:shadow-md'
                        }`}
                    >
                      {canModerate && !isOwn && (
                        <button
                          onClick={() => handleDelete(message.id)}
                          className="absolute -top-2 -right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg z-20 transition-all duration-200 hover:scale-110"
                          title="Supprimer ce message (Super Admin)"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {message.texte}
                      </p>

                      <div className={`flex items-center gap-1 mt-2 ${isOwn ? 'justify-end' : 'justify-start'
                        }`}>
                        <span className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'
                          }`}>
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

      {/* Zone de saisie */}
      <div className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={handleSend} className="flex gap-3">
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Tapez votre message..."
              disabled={sending}
              className="pr-12 h-12 text-base rounded-xl border-gray-300 focus:border-guinea-red focus:ring-2 focus:ring-guinea-red/20"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              Entrée pour envoyer
            </div>
          </div>
          <Button
            type="submit"
            disabled={sending || !newMessage.trim()}
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
