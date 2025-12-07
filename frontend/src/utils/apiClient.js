const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Helper function to handle API responses
async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Health check
export const fetchHealth = async () => {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error('Unable to reach backend');
  }
  return response.json();
};

// Applications API
export const applicationsApi = {
  // Create application
  create: async (formData, attachments = null) => {
    const payload = {
      form_data: formData,
      status: 'draft',
      ...(attachments && attachments.length > 0 && { attachments }),
    };
    
    const response = await fetch(`${API_BASE_URL}/api/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    return handleResponse(response);
  },

  // List applications with filters
  list: async (params = {}) => {
    const {
      page = 1,
      page_size = 10,
      pesel = null,
      date_from = null,
      date_to = null,
      status = null,
    } = params;

    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('page_size', page_size.toString());
    if (pesel) queryParams.append('pesel', pesel);
    if (date_from) queryParams.append('date_from', date_from);
    if (date_to) queryParams.append('date_to', date_to);
    if (status) queryParams.append('status', status);

    const response = await fetch(`${API_BASE_URL}/api/applications?${queryParams.toString()}`);
    return handleResponse(response);
  },

  // Get single application
  get: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/applications/${id}`);
    return handleResponse(response);
  },

  // Update application
  update: async (id, updates) => {
    const response = await fetch(`${API_BASE_URL}/api/applications/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    return handleResponse(response);
  },

  // Delete application
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/applications/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    
    return response.status === 204 ? null : await response.json();
  },
};

// Attachments API
export const attachmentsApi = {
  // Create attachment
  create: async (applicationId, attachment) => {
    const response = await fetch(`${API_BASE_URL}/api/applications/${applicationId}/attachments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(attachment),
    });
    
    return handleResponse(response);
  },

  // List attachments for an application
  list: async (applicationId) => {
    const response = await fetch(`${API_BASE_URL}/api/applications/${applicationId}/attachments`);
    return handleResponse(response);
  },

  // Get attachment (returns blob URL)
  get: async (applicationId, attachmentId) => {
    const response = await fetch(
      `${API_BASE_URL}/api/applications/${applicationId}/attachments/${attachmentId}`
    );
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  },

  // Delete attachment
  delete: async (applicationId, attachmentId) => {
    const response = await fetch(
      `${API_BASE_URL}/api/applications/${applicationId}/attachments/${attachmentId}`,
      {
        method: 'DELETE',
      }
    );
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    
    return response.status === 204 ? null : await response.json();
  },
};

// Helper to convert file to base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Chat/Form API
export const chatApi = {
  // Get form state
  getFormState: async (sessionId = null) => {
    const queryParams = new URLSearchParams();
    if (sessionId) queryParams.append('sessionId', sessionId);
    
    const response = await fetch(`${API_BASE_URL}/api/form/state?${queryParams.toString()}`);
    return handleResponse(response);
  },

  // Send chat message
  sendMessage: async (message, sessionId = null) => {
    const response = await fetch(`${API_BASE_URL}/api/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, sessionId }),
    });
    
    return handleResponse(response);
  },

  // Skip to acceptance
  skipToAcceptance: async (sessionId) => {
    const response = await fetch(`${API_BASE_URL}/api/form/skip?sessionId=${sessionId}`, {
      method: 'POST',
    });
    
    return handleResponse(response);
  },
};

// ElevenLabs integration helpers
export const elevenLabsApi = {
  // Sync manual form edits into ElevenLabs conversation session
  syncConversation: async (conversationId, formData, analyse = false) => {
    const response = await fetch(
      `${API_BASE_URL}/api/elevenlabs/conversation/${conversationId}/sync`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          form_data: formData,
          analyse: analyse  // NOWE - opcjonalna flaga
        }),
      }
    );

    return handleResponse(response);
  },

  // NEW: Trigger form analysis
  analyseConversation: async (conversationId) => {
    const response = await fetch(
      `${API_BASE_URL}/api/elevenlabs/conversation/${conversationId}/analyse`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return handleResponse(response);
  },

  // NEW: Get conversation snapshot (includes ai_notes)
  getConversationSnapshot: async (conversationId) => {
    const response = await fetch(
      `${API_BASE_URL}/api/elevenlabs/snapshot/${conversationId}`
    );

    return handleResponse(response);
  },
};
