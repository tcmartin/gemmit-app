import { generateUuid } from '@/utils/generateUuid';

class WebSocketService {
  private ws: WebSocket | null = null;
  private conversationId: string;
  private messageHandler: ((message: any) => void) | null = null; // Change to single handler
  private htmlHandler: ((html: string) => void) | null = null; // Change to single handler

  constructor() {
    this.conversationId = generateUuid();
  }

  connect(url: string, conversationId: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
    this.conversationId = conversationId;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('WebSocket Connected');
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'stream' && message.stream === 'stdout') {
        try {
          const parsedData = JSON.parse(message.data);
          if (parsedData.type === 'html') {
            this.htmlHandler?.(parsedData.content); // Call single handler
          } else {
            this.messageHandler?.(parsedData); // Call single handler
          }
        } catch (e) {
          // If it's not JSON, treat it as a regular message
          this.messageHandler?.(message.data); // Call single handler
        }
      } else {
        this.messageHandler?.(message); // Call single handler
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket Disconnected');
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };
  }

  sendMessage(prompt: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ prompt, conversationId: this.conversationId }));
    } else {
      console.warn('WebSocket not connected.');
    }
  }

  // Change to set handler
  setMessageHandler(handler: ((message: any) => void) | null) {
    this.messageHandler = handler;
  }

  // Change to set handler
  setHtmlHandler(handler: ((html: string) => void) | null) {
    this.htmlHandler = handler;
  }

  close() {
    this.ws?.close();
  }
}

export const webSocketService = new WebSocketService();
