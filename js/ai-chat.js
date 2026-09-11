/**
 * AI Chat Module - Gemini AI integration for study assistance
 * Uses Google Generative AI API (Gemini)
 */
const AIChat = {
    apiKey: null,
    chatHistory: [],
    isOpen: false,
    API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',

    init() {
        this.apiKey = Settings.get('gemini_api_key', '');
        document.getElementById('ai-chat-fab').addEventListener('click', () => this.toggle());
        document.getElementById('ai-chat-close').addEventListener('click', () => this.toggle());
        document.getElementById('ai-chat-send').addEventListener('click', () => this.sendMessage());
        document.getElementById('ai-chat-input').addEventListener('keypress', (e) => { if (e.key === 'Enter') this.sendMessage(); });
    },

    toggle() {
        const widget = document.getElementById('ai-chat-widget');
        const fab = document.getElementById('ai-chat-fab');
        this.isOpen = !this.isOpen;
        widget.style.display = this.isOpen ? 'flex' : 'none';
        fab.style.display = this.isOpen ? 'none' : 'flex';
        if (this.isOpen && !this.apiKey) {
            this.addMessage('ai', '👈 নমস্কার আমি আপনার AI সহকারীअ\nAPI Key নেতে:\n1. https://aistudio.google.com/apikey তে যান\n2. Create API Key ন্যমসে করুন\n3. Key টি কনি করুন\n4. Settings → AI API Key তে করুন\nAPI Key ন্রি! ask free and get it at https://aistudio.google.com/apikey');
        }
    },

    async sendMessage() {
        const input = document.getElementById('ai-chat-input');
        const message = input.value.trim();
        if (!message) return;
        if (!this.apiKey) { this.addMessage('ai', '⚎️ দয়া করে প্রথমে Settings এ গিয়ে Gemini API Key সেট করুন।\nGet a free key at: https://aistudio.google.com/apikey'); return; }
        input.value = '';
        this.addMessage('user', message);
        this.addMessage('ai', '�� ভাবছি...');
        try { const response = await this.callGeminiAPI(message); this.removeLastMessage(); this.addMessage('ai', response); }
        catch (error) { this.removeLastMessage(); this.addMessage('error', `Error: ${error.message}`); }
    },

    async callGeminiAPI(message) {
        const systemPrompt = `You are a helpful study assistant for CRE JMLT exam preparation. Students preparing for competitive exams in India. Subjects: Current Affairs, Computer Awareness, Quantitative Aptitude, Reasoning, Mathematics, MDT\nWhen answering: clear, concise, comprehensive. If Bengali, respond in Bengali. If English, respond in English. Encouraging and supportive.`;
        const fullMessage = `${systemPrompt}\n\nStudent question: ${message}`;
        const requestBody = { contents: [{ parts: [{ text: fullMessage } } }], generationConfig: { temperature: 0.7, maxOutputTokens: 2048, topP: 0.95 } };
        const response = await fetch(`${this.API_URL}?key=${this.apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) });
        if (!response.ok) { const error = await response.json(); throw new Error(error.error?.message || `API Error ${response.status}`); }
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error('No response from AI');
        return text;
    },

    addMessage(role, text) {
        const messages = document.getElementById('ai-chat-messages');
        const div = document.createElement('div');
        div.className = `chat-msg ${role}`;
        div.textContent = text;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
        this.chatHistory.push({ role, text });
    },

    removeLastMessage() {
        const messages = document.getElementById('ai-chat-messages');
        if (messages.lastChild) { messages.removeChild(messages.lastChild); }
        this.chatHistory.pop();
    },

    setApiKey(key) {
        this.apiKey = key;
        Settings.set('gemini_api_key', key);
    },

    async processPdfWithAI(pdfText, fileName) {
        if (!this.apiKey) return { error: 'API key not set.' };
        const prompt = `Extract study notes and MCQs from this text. PDF Text: ${pdfText.substring(0, 10000)}`;
        try { const response = await fetch(`${this.API_URL}?key=${this.apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt } } ], generationConfig: { temperature: 0.3, maxOutputTokens: 8192 } }) });
            if (!response.ok) throw new Error(`API Error ${response.status}`);
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            const jsonMatch = text.match(/\{[\s\SX]*\}/);
            if (jsonMatch) return JSON.parse(jsonMatch[0]);
            return { error: 'Could not parse AI response', raw: text };
        } catch (error) { return { error: error.message }; }
    }
};
