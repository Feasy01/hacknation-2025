import React, { useState, useEffect, useRef } from 'react';
import { AccidentReportFormData } from '@/types/accident-report';
import { chatApi } from '@/utils/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Loader2, User, Bot } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatFormProps {
  onComplete: (formData: AccidentReportFormData) => void;
}

export const ChatForm: React.FC<ChatFormProps> = ({ onComplete }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AccidentReportFormData | null>(null);
  const [readyToSkip, setReadyToSkip] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat with welcome message
    const initChat = async () => {
      try {
        const state = await chatApi.getFormState();
        setFormData(state.fields);
        setReadyToSkip(state.readyToSkip);
        
        // Add welcome message
        const welcomeMessage: ChatMessage = {
          role: 'assistant',
          content: 'Witaj! Jestem asystentem, który pomoże Ci wypełnić formularz zgłoszenia wypadku przy pracy. Zacznijmy od podstawowych informacji. Proszę podać imię i nazwisko poszkodowanego.',
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
      } catch (error) {
        console.error('Error initializing chat:', error);
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: 'Wystąpił błąd podczas inicjalizacji. Spróbuj odświeżyć stronę.',
          timestamp: new Date(),
        };
        setMessages([errorMessage]);
      }
    };

    initChat();
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Check if ready to skip
    if (readyToSkip && formData) {
      // Small delay to show the last message
      setTimeout(() => {
        onComplete(formData);
      }, 1500);
    }
  }, [readyToSkip, formData, onComplete]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage(userMessage.content, sessionId || undefined);
      
      // Update session ID if provided
      if (response.sessionId) {
        setSessionId(response.sessionId);
      }

      // Update form data
      if (response.updatedState) {
        setFormData(response.updatedState);
      }

      // Check if ready to skip
      if (response.readyToSkip !== undefined) {
        setReadyToSkip(response.readyToSkip);
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-w-4xl mx-auto">
      {/* Chat Header */}
      <div className="zus-panel mb-4">
        <div className="zus-panel-header">
          <span>Rozmowa z asystentem</span>
        </div>
        <div className="zus-panel-content">
          <p className="text-sm text-muted-foreground">
            Asystent pomoże Ci wypełnić formularz. Odpowiadaj na pytania, a formularz zostanie automatycznie uzupełniony.
          </p>
        </div>
      </div>

      {/* Messages */}
      <Card className="flex-1 flex flex-col overflow-hidden mb-4">
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString('pl-PL', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-primary" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-muted rounded-lg p-3">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
      </Card>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Napisz wiadomość..."
          disabled={isLoading || readyToSkip}
          className="flex-1"
        />
        <Button
          onClick={handleSend}
          disabled={isLoading || !input.trim() || readyToSkip}
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Wyślij
        </Button>
      </div>
    </div>
  );
};

