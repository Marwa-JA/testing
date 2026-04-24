import { useState, useRef, useEffect } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { aiService } from '../services/aiService';

const SYSTEM_MESSAGE = {
  role: 'system',
  content:
    'You are the official assistant for EventMarketPlace, an event booking platform. ' +
    'Be concise, friendly, and helpful. Answer questions about the platform accurately using the facts below. ' +
    'If asked about something unrelated to events or the platform, politely redirect.\n\n' +
    'PLATFORM FACTS:\n' +
    '- EventMarketPlace lets users browse, book, and manage event tickets and host packages.\n' +
    '- Two event types: PUBLIC EVENT (open ticketed events) and HOST PACKAGE (private event packages where the user picks their own date).\n' +
    '- Three user roles: User (attendees), Organizer (event creators), Supplier (service providers).\n' +
    '- Payment methods accepted: Credit Card, PayPal, Stripe, Cash, and Bank Transfer.\n' +
    '- Cancellation policy: Free cancellation up to 24 hours before the event. Refunds are processed automatically.\n' +
    '- Users can view upcoming and past bookings from "My Bookings" in their profile menu.\n' +
    '- Each booking gets a unique reference number (e.g. BK-2026-XXXXXXXX).\n' +
    '- Organizers can add extra services (e.g. catering, photography) to HOST PACKAGE events. Users can select these add-ons at checkout.\n' +
    '- Suppliers can list their services on the platform and be discovered through the Providers directory.\n' +
    '- The AI Planner feature helps users find matching events based on their preferences (event type, guest count, budget, location).\n' +
    '- Users receive email confirmations for bookings and cancellations (if email notifications are enabled in profile settings).\n' +
    '- To book an event: browse events, click an event, click "Go to Checkout", select seats/date/services, choose payment method, and confirm.\n' +
    '- Users can contact event organizers via the "Contact Organizer" button on event pages.\n' +
    '- Users can leave reviews and ratings (1-5 stars) for events they have attended.\n\n' +
    'IMPORTANT: The backend will append real-time event data below. Use ONLY that data when answering about specific events. Never invent events.',
};

export const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your EventMarketPlace assistant. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      // Filter out the initial greeting — only send actual user/assistant turns to the API
      const conversationMessages = updated.filter((_, i) => i > 0 || updated[0].role === 'user');
      const apiMessages = [SYSTEM_MESSAGE, ...conversationMessages.map(m => ({ role: m.role, content: m.content }))];
      const reply = await aiService.chat(apiMessages);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      {open && (
        <div
          style={{
            width: '360px',
            height: '480px',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(99,102,241,0.15)',
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            marginBottom: '12px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.3)',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              color: '#fff',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div className="flex align-items-center gap-2">
              <i className="pi pi-comments text-lg"></i>
              <span className="font-semibold">EventMarketPlace Assistant</span>
            </div>
            <Button
              icon="pi pi-times"
              className="p-button-text p-button-sm"
              style={{ color: '#fff', padding: '4px' }}
              onClick={() => setOpen(false)}
            />
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              background: 'rgba(248,249,252,0.5)',
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '8px 12px',
                    borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    background: msg.role === 'user' ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)' : 'rgba(255,255,255,0.8)',
                    color: msg.role === 'user' ? '#fff' : '#1f2937',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    padding: '8px 16px',
                    borderRadius: '12px 12px 12px 2px',
                    background: 'rgba(255,255,255,0.8)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    fontSize: '14px',
                    color: '#6b7280',
                  }}
                >
                  <i className="pi pi-spin pi-spinner mr-1"></i> Thinking...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: '10px 12px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              gap: '8px',
              background: '#fff',
            }}
          >
            <InputText
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1"
              style={{ fontSize: '14px' }}
              disabled={loading}
            />
            <Button
              icon="pi pi-send"
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              style={{ flexShrink: 0 }}
            />
          </div>
        </div>
      )}

      {/* Toggle button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          icon={open ? 'pi pi-times' : 'pi pi-comments'}
          onClick={() => setOpen(o => !o)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
            boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
          }}
          tooltip={open ? 'Close chat' : 'Chat with AI assistant'}
          tooltipOptions={{ position: 'left' }}
        />
      </div>
    </div>
  );
};
