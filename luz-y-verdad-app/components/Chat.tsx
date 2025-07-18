import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Message } from '../types.ts';
import { createChristianChat } from '../services/geminiService.ts';
import type { Chat as GeminiChatSDK } from '@google/genai';
import { SendIcon, UserIcon, SparklesIcon, Spinner } from './Icons.tsx';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<GeminiChatSDK | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
        chatRef.current = createChristianChat();
        setMessages([
          {
            id: 'init',
            text: '¡Paz y bendiciones! Soy Luz Divina, tu consejero espiritual. ¿Cómo puedo servirte hoy? ¿Tienes alguna pregunta sobre la Palabra de Dios o algo en tu corazón que desees compartir?',
            sender: 'ai',
          },
        ]);
    } catch(e) {
        console.error("Failed to initialize chat due to missing API key.", e);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chatRef.current) return;

    const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const aiMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: aiMessageId, text: '', sender: 'ai' }]);

    try {
      const stream = await chatRef.current.sendMessageStream({ message: input });
      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk.text;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId ? { ...msg, text: fullResponse } : msg
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? { ...msg, text: 'Lo siento, ha ocurrido un error. Por favor, intenta de nuevo.' }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  return (
    <div className="bg-white rounded-xl shadow-lg flex flex-col h-[calc(100vh-200px)] max-h-[700px]">
        <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700 text-center">Chat con Luz Divina</h2>
        </div>
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex items-start gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'ai' && (
                        <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center border-2 border-sky-200 shrink-0">
                            <SparklesIcon className="w-6 h-6 text-sky-600" />
                        </div>
                    )}
                    <div className={`max-w-md p-4 rounded-2xl ${msg.sender === 'user' ? 'bg-yellow-400 text-gray-800 rounded-br-none' : 'bg-slate-200 text-gray-700 rounded-bl-none'}`}>
                        {!msg.text && msg.sender === 'ai' ? (
                            <div className="flex items-center">
                                <Spinner className="w-5 h-5 text-sky-600 mr-2" />
                                <span>Pensando...</span>
                            </div>
                        ) : (
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                        )}
                    </div>
                     {msg.sender === 'user' && (
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center border-2 border-yellow-200 shrink-0">
                            <UserIcon className="w-6 h-6 text-yellow-700" />
                        </div>
                    )}
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
        <div className="p-4 bg-white border-t border-gray-200 rounded-b-xl">
            <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe tu pregunta o mensaje..."
                    className="flex-1 w-full px-4 py-3 bg-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-800 placeholder:text-gray-500"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="p-3 rounded-full bg-sky-600 text-white hover:bg-sky-700 disabled:bg-sky-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                    disabled={isLoading || !input.trim()}
                >
                    <SendIcon className="w-6 h-6" />
                </button>
            </form>
        </div>
    </div>
  );
};

export default Chat;