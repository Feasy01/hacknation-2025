import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface ElevenLabsWidgetProps {
  agentId?: string;
  webhookUrl?: string;
  conversationId?: string;
  onError?: (error: Error) => void;
}

// Global function to trigger call - can be called from anywhere
export const triggerElevenLabsCall = () => {
  const findAndClickCallButton = (): boolean => {
    // Try multiple selectors including shadow DOM
    const selectors = [
      'button[aria-label="Zadzwon do nas"]',
      'button[aria-label*="Zadzwon"]',
      'elevenlabs-convai button',
      'elevenlabs-convai [role="button"]',
    ];

    for (const selector of selectors) {
      const button = document.querySelector(selector) as HTMLElement;
      if (button && button.offsetParent !== null) {
        button.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          button.click();
          // Also dispatch events
          button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        }, 300);
        return true;
      }
    }

    // Try to access shadow DOM
    const widgetElement = document.querySelector('elevenlabs-convai');
    if (widgetElement && widgetElement.shadowRoot) {
      const shadowButton = widgetElement.shadowRoot.querySelector('button[aria-label="Zadzwon do nas"]') as HTMLElement;
      if (shadowButton) {
        shadowButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          shadowButton.click();
        }, 300);
        return true;
      }
    }

    return false;
  };

  // First attempt
  if (findAndClickCallButton()) {
    return;
  }

  // Scroll to widget
  const widgetElement = document.querySelector('elevenlabs-convai');
  if (widgetElement) {
    widgetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Use MutationObserver to wait for button
  const observer = new MutationObserver(() => {
    if (findAndClickCallButton()) {
      observer.disconnect();
    }
  });

  const targetNode = widgetElement || document.body;
  observer.observe(targetNode, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['aria-label', 'class'],
  });

  // Also observe shadow DOM if available
  if (widgetElement) {
    const shadowObserver = new MutationObserver(() => {
      if (findAndClickCallButton()) {
        shadowObserver.disconnect();
      }
    });
    
    // Try to observe shadow root
    const checkShadowRoot = () => {
      if (widgetElement.shadowRoot) {
        shadowObserver.observe(widgetElement.shadowRoot, {
          childList: true,
          subtree: true,
        });
      } else {
        setTimeout(checkShadowRoot, 100);
      }
    };
    checkShadowRoot();
  }

  // Retry with delays
  const retryDelays = [500, 1000, 2000, 3000];
  retryDelays.forEach((delay) => {
    setTimeout(() => {
      if (findAndClickCallButton()) {
        observer.disconnect();
      }
    }, delay);
  });

  setTimeout(() => {
    observer.disconnect();
  }, 5000);
};

/**
 * ElevenLabs Conversational AI Widget Component
 * 
 * Embeds the ElevenLabs ConvAI widget with:
 * - Async script loading
 * - Error handling
 * - Webhook configuration
 * - Accessibility support
 * - Non-blocking fallback
 */
export const ElevenLabsWidget: React.FC<ElevenLabsWidgetProps> = ({
  agentId = 'agent_6401kbszf8bdffjrme0cb1c9may9',
  webhookUrl,
  conversationId,
  onError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Prevent multiple script loads
    if (scriptLoadedRef.current) {
      return;
    }

    // Check if script already exists in DOM
    const existingScript = document.querySelector(
      'script[src*="@elevenlabs/convai-widget-embed"]'
    );
    if (existingScript) {
      scriptLoadedRef.current = true;
      setIsLoading(false);
      return;
    }

    // Error event handler for widget errors
    const handleWidgetError = (event: Event) => {
      const customEvent = event as CustomEvent;
      const errorMessage = customEvent.detail?.message || 'Widget error occurred';
      const error = new Error(errorMessage);
      setError(errorMessage);
      setIsLoading(false);
      onError?.(error);
      console.error('ElevenLabs widget error:', customEvent.detail);
    };

    // Add error event listener
    document.addEventListener('elevenlabs-convai:error', handleWidgetError);

    // Load script asynchronously
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    script.type = 'module';

    script.onload = () => {
      scriptLoadedRef.current = true;
      
      // Wait for custom element to be defined
      const checkElement = () => {
        if (customElements.get('elevenlabs-convai')) {
          setIsLoading(false);
        } else {
          // Retry after a short delay
          setTimeout(checkElement, 100);
        }
      };
      
      // Start checking after a brief delay
      setTimeout(checkElement, 100);
    };

    script.onerror = () => {
      const error = new Error('Failed to load ElevenLabs widget script');
      setError(error.message);
      setIsLoading(false);
      onError?.(error);
      console.error('ElevenLabs widget script load error');
      document.removeEventListener('elevenlabs-convai:error', handleWidgetError);
    };

    document.head.appendChild(script);

    // Cleanup function
    return () => {
      document.removeEventListener('elevenlabs-convai:error', handleWidgetError);
    };
  }, [onError]);

  // Build webhook URL if not provided
  const finalWebhookUrl = webhookUrl || (() => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    return `${apiBaseUrl}/api/elevenlabs/webhook`;
  })();

  const dynamicVariables = useMemo(() => {
    if (!conversationId) return undefined;
    return JSON.stringify({ conversation_id: conversationId });
  }, [conversationId]);

  return (
    <div className="w-full mb-6" role="region" aria-label="Asystent wypełniania formularza">
      {error ? (
        <div
          className="zus-panel border-yellow-500/50 bg-yellow-500/10"
          role="alert"
          aria-live="polite"
        >
          <div className="zus-panel-content">
            <div className="flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  Nie udało się załadować asystenta
                </p>
                <p className="text-yellow-700 dark:text-yellow-300 text-xs">
                  Formularz działa normalnie. Możesz kontynuować wypełnianie ręcznie.
                </p>
                {process.env.NODE_ENV === 'development' && (
                  <p className="text-yellow-600 dark:text-yellow-400 text-xs mt-1 font-mono">
                    {error}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="w-full"
          style={{ minHeight: isLoading ? '200px' : 'auto' }}
        >
          {/* Widget container - will be populated by the custom element */}
          <elevenlabs-convai
            agent-id={agentId}
            webhook-url={finalWebhookUrl}
            dynamic-variables={dynamicVariables}
            style={{
              display: 'block',
              width: '100%',
            }}
            aria-label="Asystent wypełniania formularza - kliknij, aby rozpocząć rozmowę"
            tabIndex={0}
          />
          
          {/* Loading state (hidden once widget loads) */}
          {isLoading && (
            <div
              className="zus-panel animate-pulse"
              aria-hidden="true"
              style={{ display: 'none' }}
            >
              <div className="zus-panel-content">
                <div className="h-32 bg-muted/30 rounded" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
