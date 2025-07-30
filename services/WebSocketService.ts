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
    // Close existing connection if any
    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close();
      }
    }
    
    this.conversationId = conversationId;
    
    try {
      console.log('Attempting to connect to:', url);
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('WebSocket Connected to:', url);
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'stream' && message.stream === 'stdout') {
            try {
              const parsedData = JSON.parse(message.data);
              if (parsedData.type === 'html') {
                this.htmlHandler?.(parsedData.content);
              } else {
                this.messageHandler?.(parsedData);
              }
            } catch (e) {
              // If it's not JSON, treat it as a regular message
              this.messageHandler?.(message.data);
            }
          } else {
            this.messageHandler?.(message);
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket Disconnected. Code:', event.code, 'Reason:', event.reason);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }

  sendMessage(prompt: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = { prompt, conversationId: this.conversationId };
      console.log('Sending message:', message);
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected. ReadyState:', this.ws?.readyState);
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
