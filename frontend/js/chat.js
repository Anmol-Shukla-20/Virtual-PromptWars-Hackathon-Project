document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) window.location.href = 'index.html';

    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    
    // Load Chat History
    let chatHistory = JSON.parse(localStorage.getItem('ecopath_chat_history') || '[]');
    chatHistory.forEach(msg => {
        appendMessage(msg.sender, msg.rawText, false);
    });

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = chatInput.value.trim();
        if (!msg) return;

        appendMessage('user', msg, true);
        chatInput.value = '';
        
        // Disable input while generating
        const btn = chatForm.querySelector('button');
        btn.disabled = true;

        // Create temporary loading bubble
        const loadingId = 'loading-' + Date.now();
        appendLoading(loadingId);

        try {
            // Call the real AI backend
            const res = await api.request('/ai/chat', { 
                method: 'POST', 
                body: JSON.stringify({ message: msg }) 
            });
            
            document.getElementById(loadingId).remove();
            
            // Render markdown or plain text returned from Groq
            appendMessage('bot', res.reply, true);
            btn.disabled = false;
            
        } catch (error) {
            document.getElementById(loadingId).remove();
            appendMessage('bot', "Oops, I encountered an error connecting to my AI brain: " + error.message);
            btn.disabled = false;
        }
    });

    document.querySelectorAll('.suggestion-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            chatInput.value = btn.innerText;
            chatForm.dispatchEvent(new Event('submit'));
            btn.parentElement.remove(); // remove suggestions once clicked
        });
    });
});

function parseMarkdown(text) {
    let parsed = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>');
    parsed = parsed.replace(/\n/g, '<br>');
    return parsed;
}

function appendMessage(sender, rawText, save = true) {
    const chatMessages = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = `flex items-start ${sender === 'user' ? 'flex-row-reverse' : ''}`;
    
    let avatar = '';
    let bubbleClasses = '';
    
    if (sender === 'bot') {
        avatar = `<div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm mr-3 shrink-0">🤖</div>`;
        bubbleClasses = `bg-white border border-gray-200 rounded-2xl rounded-tl-none`;
    } else {
        avatar = `<div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm ml-3 shrink-0">👤</div>`;
        bubbleClasses = `bg-green-600 text-white rounded-2xl rounded-tr-none`;
    }

    const parsedText = sender === 'bot' ? parseMarkdown(rawText) : rawText.replace(/\n/g, '<br>');

    div.innerHTML = `
        ${avatar}
        <div class="${bubbleClasses} p-4 shadow-sm max-w-[80%]">
            <p class="text-sm ${sender === 'bot' ? 'text-gray-800' : 'text-white'}">${parsedText}</p>
        </div>
    `;
    
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    if (save) {
        let history = JSON.parse(localStorage.getItem('ecopath_chat_history') || '[]');
        history.push({ sender, rawText });
        localStorage.setItem('ecopath_chat_history', JSON.stringify(history));
    }
}

function appendLoading(id) {
    const chatMessages = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.id = id;
    div.className = `flex items-start`;
    div.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm mr-3 shrink-0">🤖</div>
        <div class="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-4 shadow-sm">
            <div class="flex space-x-1 items-center h-4">
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
        </div>
    `;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
