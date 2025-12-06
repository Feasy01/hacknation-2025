/**
 * TypeScript declarations for ElevenLabs ConvAI widget custom element
 */
declare namespace JSX {
  interface IntrinsicElements {
    'elevenlabs-convai': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        'agent-id'?: string;
        'webhook-url'?: string;
        'auto-start'?: boolean | string;
        'conversation-id'?: string;
        'dynamic-variables'?: string;
      },
      HTMLElement
    >;
  }
}

// Extend Window interface for custom events
interface WindowEventMap {
  'elevenlabs-convai:error': CustomEvent<{ message?: string; error?: Error }>;
  'elevenlabs-convai:ready': CustomEvent;
  'elevenlabs-convai:message': CustomEvent<{ message: string; role: 'user' | 'agent' }>;
}
