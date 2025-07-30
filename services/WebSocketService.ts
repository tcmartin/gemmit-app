import { generateUuid } from '@/utils/generateUuid';

class WebSocketService {
  private ws: WebSocket | null = null;
  private conversationId: string;
  private messageHandler: ((message: any) => void) | null = null;
  private htmlHandler: ((html: string) => void) | null = null;
  private connectionStatusHandler: ((status: 'connecting' | 'connected' | 'disconnected' | 'error') => void) | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3; // Back to reasonable number
  private reconnectDelay = 2000; // 2 seconds - longer delay
  private currentUrl: string = '';
  private currentConversationId: string = '';
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isManualClose = false;
  private isConnecting = false; // Prevent multiple connection attempts

  constructor() {
    this.conversationId = generateUuid();
  }

  connect(url: string, conversationId: string) {
    // Prevent multiple simultaneous connection attempts
    if (this.isConnecting) {
      console.log('Connection already in progress, ignoring...');
      return;
    }

    // Store connection parameters for reconnection
    this.currentUrl = url;
    this.currentConversationId = conversationId;
    this.isManualClose = false;
    
    // Reset reconnect attempts for new connection
    this.reconnectAttempts = 0;
    this.reconnectDelay = 2000; // Reset delay
    
    // Clear any existing reconnect timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    this._connect(url, conversationId);
  }

  private _connect(url: string, conversationId: string) {
    // Prevent multiple connection attempts
    if (this.isConnecting) {
      console.log('Already connecting, skipping...');
      return;
    }

    this.isConnecting = true;

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
          this.isConnecting = false;
          this.ws.close();
        }
      }, 10000); // 10 second timeout

      this.ws.onopen = () => {
        clearTimeout(connectionTimeout);
        this.isConnecting = false;
        console.log('WebSocket Connected to:', url);
        this.reconnectAttempts = 0; // Reset on successful connection
        this.reconnectDelay = 2000; // Reset delay
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
        this.isConnecting = false;
        
        console.log('WebSocket Disconnected. Code:', event.code, 'Reason:', event.reason, 'Manual:', this.isManualClose);
        this.connectionStatusHandler?.('disconnected');
        
        // Only attempt to reconnect if:
        // 1. It wasn't a manual close
        // 2. We haven't exceeded max attempts
        // 3. The close wasn't due to a normal closure (code 1000)
        if (!this.isManualClose && 
            this.reconnectAttempts < this.maxReconnectAttempts && 
            event.code !== 1000) {
          
          this.reconnectAttempts++;
          console.log(`Will attempt to reconnect in ${this.reconnectDelay}ms... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          
          this.reconnectTimeout = setTimeout(() => {
            if (!this.isManualClose) { // Double-check before reconnecting
              this._connect(this.currentUrl, this.currentConversationId);
            }
          }, this.reconnectDelay);
          
          // Increase delay for next attempt
          this.reconnectDelay = Math.min(this.reconnectDelay * 2, 10000); // Max 10 seconds
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.log('Max reconnection attempts reached');
          this.connectionStatusHandler?.('error');
        }
      };

      this.ws.onerror = (error) => {
        clearTimeout(connectionTimeout);
        this.isConnecting = false;
        console.error('WebSocket Error:', error);
        this.connectionStatusHandler?.('error');
      };
    } catch (error) {
      this.isConnecting = false;
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



  // Method to manually trigger reconnection
  reconnect() {
    if (this.currentUrl && this.currentConversationId && !this.isConnecting) {
      console.log('Manual reconnection triggered');
      this.reconnectAttempts = 0; // Reset attempts for manual reconnection
      this.reconnectDelay = 2000; // Reset delay
      this.connect(this.currentUrl, this.currentConversationId);
    }
  }

  // Method to check connection health
  getConnectionHealth(): { 
    isConnected: boolean; 
    reconnectAttempts: number; 
    maxAttempts: number;
    isConnecting: boolean;
  } {
    return {
      isConnected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts,
      isConnecting: this.isConnecting
    };
  }

  close() {
    this.isManualClose = true;
    this.isConnecting = false;
    
    // Clear reconnect timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
    this.ws?.close(1000, 'Manual close'); // Normal closure
  }
}

export const webSocketService = new WebSocketService();
