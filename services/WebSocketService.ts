import { v4 as uuidv4 } from 'uuid';

class WebSocketService {
  private ws: WebSocket | null = null;
  private conversationId: string;
  private messageHandlers: ((message: any) => void)[] = [];
  private htmlHandlers: ((html: string) => void)[] = [];

  constructor() {
    this.conversationId = uuidv4();
  }

  connect(url: string) {
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
            this.htmlHandlers.forEach(handler => handler(parsedData.content));
          } else {
            this.messageHandlers.forEach(handler => handler(parsedData));
          }
        } catch (e) {
          // If it's not JSON, treat it as a regular message
          this.messageHandlers.forEach(handler => handler(message.data));
        }
      } else {
        this.messageHandlers.forEach(handler => handler(message));
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

  onMessage(handler: (message: any) => void) {
    this.messageHandlers.push(handler);
  }

  onHtml(handler: (html: string) => void) {
    this.htmlHandlers.push(handler);
  }

  close() {
    this.ws?.close();
  }
}

export const webSocketService = new WebSocketService();
