import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MessageCircle, Send, X } from 'lucide-react';
import { fetchGeminiResponse, generateContextualSuggestions, GeminiContext } from '@/lib/geminiClient';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  ts: number;
};

interface ChatWidgetProps {
  apiKey?: string; // Gemini API key (optional, demo mode without it)
  context?: GeminiContext; // User context for personalized responses
}

const getDemoQuestions = (context?: GeminiContext) => {
  const baseQuestions = [
    'What crops should I grow in my soil?',
    'How to optimize my irrigation schedule?',
    'What are the expected yields?',
    'How to reduce farming risks?'
  ];
  
  if (context?.selectedCrop && context?.selectedDistrict) {
    return [
      `What is the best planting time for ${context.selectedCrop} in ${context.selectedDistrict}?`,
      `How to increase ${context.selectedCrop} yield?`,
      `What are the irrigation requirements for ${context.selectedCrop}?`,
      `How to manage ${context.selectedCrop} diseases?`
    ];
  }
  
  return baseQuestions;
};


const ChatWidget = ({ apiKey, context }: ChatWidgetProps) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const handleAsk = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text.trim(), ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);
    try {
      // Debug: Log the context being sent
      console.log('ChatWidget - Sending context:', context);
      console.log('ChatWidget - Prompt:', text.trim());
      
      // Use the new Gemini client with context
      const geminiResponse = await fetchGeminiResponse({
        prompt: text.trim(),
        context: context || {},
        apiKey: apiKey
      });
      
      const botMsg: ChatMessage = { 
        id: crypto.randomUUID(), 
        role: 'assistant', 
        content: geminiResponse.response, 
        ts: Date.now() 
      };
      setMessages((prev) => [...prev, botMsg]);
      
      // Add suggestions as system messages if available
      if (geminiResponse.suggestions && geminiResponse.suggestions.length > 0) {
        const suggestionsMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'system',
          content: `💡 Suggestions: ${geminiResponse.suggestions.join(' • ')}`,
          ts: Date.now()
        };
        setMessages((prev) => [...prev, suggestionsMsg]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: ChatMessage = { 
        id: crypto.randomUUID(), 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.', 
        ts: Date.now() 
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAsk(input);
  };

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, open]);

  const fab = (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setOpen(true)}
            aria-label="Open chat"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Ask AI Assistant</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <>
      {fab}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="p-0 w-full max-w-full sm:w-[420px] lg:w-[480px]">
          <div className="flex flex-col h-full">
            <div className="px-5 py-4 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50 sticky top-0">
              <SheetHeader>
                <SheetTitle className="text-xl font-semibold">AI Assistant Hub</SheetTitle>
                <p className="text-xs text-muted-foreground">Quick Questions</p>
                {/* Debug: Show context info */}
                <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
                  <strong>Context:</strong> {context?.selectedDistrict || 'No district'} | {context?.selectedCrop || 'No crop'} | {context?.soilType || 'No soil'}
                </div>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {getDemoQuestions(context).map((q) => (
                    <Button key={q} variant="secondary" className="justify-start h-9 text-xs truncate" onClick={() => handleAsk(q)} title={q}>
                      {q}
                    </Button>
                  ))}
                </div>
              </SheetHeader>
            </div>

            <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.length === 0 && (
                <Card className="p-4 text-sm text-muted-foreground">
                  Hello! I can help with crop forecasts, irrigation plans, risk alerts, and weather trends.
                </Card>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                    m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="text-xs text-muted-foreground">Assistant is typing…</div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="border-t p-3 flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about yield, irrigation, weather, or risk…"
              />
              <Button type="submit" disabled={!input.trim() || isSending} aria-label="Send message">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ChatWidget;


