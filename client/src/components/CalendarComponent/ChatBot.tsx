import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, X } from 'lucide-react';
import { useAppSelector } from '@/app/redux';
import { useGetAuthUserQuery, useGetUserQuery } from "@/state/api";
import Link from 'next/link';

interface ChatBotProps {
  onEventCreate: (event: any) => Promise<void>;
  onEventsUpdated?: () => void;
}

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

const ChatBot: React.FC<ChatBotProps> = ({ onEventCreate, onEventsUpdated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const { data: authData, isLoading: isAuthLoading } = useGetAuthUserQuery({});
  const cognitoId = authData?.user?.userId;
  const { data: user, isLoading: isUserLoading } = useGetUserQuery(cognitoId ?? "", { skip: !cognitoId });
  const isAuthenticated = !!user;
  const isLoadingAuth = isAuthLoading || isUserLoading;

  useEffect(() => {
    if (!isLoadingAuth) {
        if (isAuthenticated) {
            setMessages([
                {
                  sender: 'bot',
                  text: 'Hello! I\'m your calendar assistant. I can help you create events in your calendar. Here are some examples of what you can say:\n\n• "I have a meeting tomorrow from 2pm to 3pm"\n• "I have work from 9am-5pm and then dinner from 8pm-9pm"\n• "Add a doctor appointment next Monday at 10am for 1 hour"\n\nJust type your message and I\'ll help you schedule it!'
                }
            ]);
        } else {
            setMessages([
                {
                  sender: 'bot',
                  text: 'Please sign in or sign up to use the calendar assistant.\nGo to the [Authentication Page](/auth).'
                }
            ]);
        }
    }
  }, [isAuthenticated, isLoadingAuth]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!isAuthenticated) {
        alert("Please sign in or sign up to use the chatbot.");
        return;
    }

    if (!message.trim()) return;

    const userMessage = message;
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setMessage('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process message');
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (!data.events || !Array.isArray(data.events)) {
        throw new Error('Invalid response format from server');
      }

      // Create events in the database
      const createdEvents = [];
      for (const event of data.events) {
        try {
          // Format the dates properly
          const startTime = new Date(event.startTime);
          const endTime = new Date(event.endTime);

          // Validate dates
          if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
            console.error('Invalid date format:', event);
            continue;
          }

          const eventResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/event`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: event.title,
              description: `Created from chat: ${userMessage}`,
              startTime: startTime.toISOString(),
              endTime: endTime.toISOString(),
              calendarId: user?.calendarId,
            }),
          });

          if (!eventResponse.ok) {
            const errorData = await eventResponse.json();
            console.error('Error creating event:', errorData);
            continue;
          }

          const createdEvent = await eventResponse.json();
          createdEvents.push(createdEvent);

          // Immediately add the event to the calendar
          if (onEventCreate) {
            const calendarEvent = {
              id: createdEvent.id?.toString(),
              title: createdEvent.title,
              start: new Date(createdEvent.startTime).toISOString(),
              end: new Date(createdEvent.endTime).toISOString(),
              description: createdEvent.description,
              calendarId: createdEvent.calendarId
            };
            await onEventCreate(calendarEvent);
          }
        } catch (error) {
          console.error('Error creating event:', error);
        }
      }

      if (createdEvents.length === 0) {
        throw new Error('Failed to create any events');
      }

      // Update the messages with a simple response
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: 'Sure! I have made the events you requested. Do you need anything else?'
      }]);

      // Force an immediate calendar update
      if (onEventsUpdated) {
        // First, clear any existing events
        await onEventsUpdated();
        
        // Then fetch and add all events
        try {
          const calendarResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/event/calendar?calendarId=${user?.calendarId}`);
          if (calendarResponse.ok) {
            const calendarData = await calendarResponse.json();
            // Transform the data to match FullCalendar's expected format
            const transformedEvents = calendarData.map((event: any) => ({
              id: event.id?.toString(),
              title: event.title,
              start: new Date(event.startTime).toISOString(),
              end: new Date(event.endTime).toISOString(),
              description: event.description,
              calendarId: event.calendarId
            }));
            
            // Add all events back to the calendar
            if (onEventCreate) {
              for (const event of transformedEvents) {
                await onEventCreate(event);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching calendar events:', error);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: error instanceof Error ? error.message : 'Error processing your request. Please try again.'
      }]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-96 h-[600px] flex flex-col z-[9998]">
          <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Calendar Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  {msg.sender === 'bot' && !isAuthenticated && msg.text.includes('[Authentication Page]') ? (
                    <p className="whitespace-pre-wrap">
                      Please sign in or sign up to use the calendar assistant.
                      <br />
                      Go to the <Link href="/auth" className="text-blue-400 hover:underline font-bold">Authentication Page</Link>.
                    </p>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t dark:border-gray-700">
            <div className="flex space-x-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isAuthenticated ? "Type your message..." : "Sign in to chat"}
                className="flex-1 p-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                rows={1}
                disabled={!isAuthenticated || isLoadingAuth}
              />
              <button
                onClick={handleSendMessage}
                className={`text-white rounded-lg p-2 transition-colors duration-200 ${!isAuthenticated || isLoadingAuth ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
                disabled={!isAuthenticated || isLoadingAuth}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot; 