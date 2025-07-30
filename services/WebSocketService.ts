import { generateUuid } from '@/utils/generateUuid';

class WebSocketService {
  private ws: WebSocket | null = null;
  private conversationId: string;
  private messageHandler: ((message: any) => void) | null = null;
  private htmlHandler: ((html: string) => void) | null = null;
  private connectionStatusHandler: ((status: 'connecting' | 'connected' | 'disconnected' | 'error') => void) | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectDelay = 1000; // 1 second

  constructor() {
    this.conversationId = generateUuid();
  }

  connect(url: string, conversationId: string) {
    // Reset reconnect attempts for new connection
    this.reconnectAttempts = 0;
    this._connect(url, conversationId);
  }

  private _connect(url: string, conversationId: string) {
    // Close existing connection if any
    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close();
      }
    }
    
    this.conversationId = conversationId;
    
    try {
      console.log(`Attempting to connect to: ${url} (attempt ${this.reconnectAttempts + 1})`);
      this.connectionStatusHandler?.('connecting');
      
      this.ws = new WebSocket(url);

      // Set a connection timeout
      const connectionTimeout = setTimeout(() => {
        if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
          console.log('Connection timeout, closing...');
          this.ws.close();
          this.connectionStatusHandler?.('error');
        }
      }, 10000); // 10 second timeout

      this.ws.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log('WebSocket Connected to:', url);
        this.reconnectAttempts = 0; // Reset on successful connection
        this.connectionStatusHandler?.('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Received message:', message);
          
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
          // Still call the message handler with raw data
          this.messageHandler?.(event.data);
        }
      };

      this.ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        console.log('WebSocket Disconnected. Code:', event.code, 'Reason:', event.reason);
        this.connectionStatusHandler?.('disconnected');
        
        // Attempt to reconnect if it wasn't a manual close
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Attempting to reconnect in ${this.reconnectDelay}ms...`);
          setTimeout(() => {
            this._connect(url, conversationId);
          }, this.reconnectDelay);
          this.reconnectDelay *= 2; // Exponential backoff
        }
      };

      this.ws.onerror = (error) => {
        clearTimeout(connectionTimeout);
        console.error('WebSocket Error:', error);
        this.connectionStatusHandler?.('error');
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.connectionStatusHandler?.('error');
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

  setMessageHandler(handler: ((message: any) => void) | null) {
    this.messageHandler = handler;
  }

  setHtmlHandler(handler: ((html: string) => void) | null) {
    this.htmlHandler = handler;
  }

  setConnectionStatusHandler(handler: ((status: 'connecting' | 'connected' | 'disconnected' | 'error') => void) | null) {
    this.connectionStatusHandler = handler;
  }

  getConnectionState(): number | undefined {
    return this.ws?.readyState;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  close() {
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
    this.ws?.close(1000, 'Manual close'); // Normal closure
  }
}

export const webSocketService = new WebSocketService();
