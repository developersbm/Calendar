import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

interface ParsedEvent {
  title: string;
  startTime: string;
  endTime: string;
  description?: string;
}

const systemPrompt = `You are a calendar assistant that helps users create events. Your task is to extract calendar events from user messages and return them in a specific JSON format.

Current date: ${new Date().toLocaleDateString()}
Current time: ${new Date().toLocaleTimeString()}

IMPORTANT RULES:
1. ALWAYS use the user's local time as specified in their message
2. DO NOT convert times to UTC or any other timezone
3. Keep the exact times that the user specifies
4. For relative dates (today, tomorrow, next week), use the current date as reference
5. Return ONLY a JSON array of events, no other text
6. Each event must have: title, startTime, and endTime
7. Times should be in ISO format but should match the user's specified times exactly
8. If a user says "2pm to 3pm", the event should be exactly from 2pm to 3pm in their local time
9. When creating dates, use the user's local timezone offset
10. Under no circumstances should times be converted to UTC or any other timezone.
11. If the user specifies "2pm", it must be returned exactly as "2pm" in their timezone.

Example response for "I have a meeting tomorrow from 2pm to 3pm":
[
  {
    "title": "Meeting",
    "startTime": "2025-04-04T14:00:00-07:00",
    "endTime": "2025-04-04T15:00:00-07:00"
  }
]`;

const processWithDeepSeek = async (message: string): Promise<ParsedEvent[]> => {
  try {
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        }
      }
    );

    if (!response.data || !response.data.choices || !response.data.choices[0]?.message?.content) {
      throw new Error('Invalid response from DeepSeek API');
    }

    const aiResponse = response.data.choices[0].message.content;
    console.log('Raw AI response:', aiResponse);

    // Remove markdown code block syntax and any notes
    const cleanResponse = aiResponse
      .replace(/```json\n?|\n?```/g, '')
      .replace(/\*Note:.*\*/g, '')
      .trim();

    console.log('Cleaned response:', cleanResponse);

    let events;
    try {
      events = JSON.parse(cleanResponse);
    } catch (error) {
      console.error('Error parsing AI response:', cleanResponse);
      throw new Error('Invalid JSON response from AI');
    }

    if (!Array.isArray(events)) {
      events = [events];
    }

    // Convert the events to proper format with current date
    return events.map((event: any) => {
      const startTime = new Date(event.startTime);
      const endTime = new Date(event.endTime);

      // Validate dates
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        throw new Error('Invalid date format in event');
      }

      // Ensure we're using the local timezone
      const localStartTime = new Date(startTime.getTime() - startTime.getTimezoneOffset() * 60000);
      const localEndTime = new Date(endTime.getTime() - endTime.getTimezoneOffset() * 60000);

      return {
        title: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
        description: message
      };
    });
  } catch (error) {
    console.error('Error processing with DeepSeek:', error);
    throw error;
  }
};

export const createEventFromChat = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      res.status(400).json({ message: 'Message is required' });
      return;
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      console.error('DeepSeek API key is not configured');
      res.status(500).json({ 
        message: 'Server configuration error. Please contact support.',
        error: 'API key not configured'
      });
      return;
    }

    const events = await processWithDeepSeek(message);
    
    if (!events || events.length === 0) {
      res.status(400).json({ 
        message: "I couldn't understand the events in your message. Please try again with a different format." 
      });
      return;
    }

    res.status(200).json({ 
      events,
      message: 'Events parsed successfully'
    });
  } catch (error) {
    console.error('Error processing chat message:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ENOTFOUND') {
        res.status(503).json({ 
          message: 'Unable to connect to the AI service. Please try again later.',
          error: 'Service unavailable'
        });
      } else if (error.response?.status === 401) {
        res.status(500).json({ 
          message: 'Server configuration error. Please contact support.',
          error: 'Invalid API key'
        });
      } else {
        res.status(500).json({ 
          message: 'Error processing your request. Please try again with a different format.',
          error: error.message
        });
      }
    } else {
      res.status(500).json({ 
        message: 'Error processing your request. Please try again with a different format.',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}; 