const BASE_URL = 'http://localhost:8080/api/ai';

export const aiService = {
  async planEvent({ eventType, theme, audienceSize, budget, locationType }) {
    const response = await fetch(`${BASE_URL}/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType, theme, audienceSize, budget, locationType }),
    });
    if (!response.ok) throw new Error('Failed to get AI suggestions');
    const data = await response.json();
    return data.response;
  },

  async chat(messages) {
    const response = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
    if (!response.ok) throw new Error('Failed to get AI response');
    const data = await response.json();
    return data.response;
  },
};
