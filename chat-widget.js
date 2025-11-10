// PR Dashboard Chat Widget
// Client-side chatbot for answering questions about PRs

class PRChatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.init();
    }

    init() {
        this.createWidget();
        this.addWelcomeMessage();
    }

    createWidget() {
        // Create chat button
        const button = document.createElement('button');
        button.className = 'chat-widget-button';
        button.innerHTML = `
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                <path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/>
            </svg>
        `;
        button.onclick = () => this.toggle();
        document.body.appendChild(button);

        // Create chat container
        const container = document.createElement('div');
        container.className = 'chat-widget-container';
        container.innerHTML = `
            <div class="chat-widget-header">
                <h3>💬 PR Assistant</h3>
                <button class="chat-widget-close">×</button>
            </div>
            <div class="chat-widget-messages" id="chat-messages"></div>
            <div class="chat-widget-input-container">
                <input 
                    type="text" 
                    class="chat-widget-input" 
                    id="chat-input" 
                    placeholder="Ask about PRs..."
                    autocomplete="off"
                />
                <button class="chat-widget-send" id="chat-send">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                </button>
            </div>
        `;
        document.body.appendChild(container);

        // Add event listeners
        container.querySelector('.chat-widget-close').onclick = () => this.toggle();
        const input = container.querySelector('#chat-input');
        const sendBtn = container.querySelector('#chat-send');
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && input.value.trim()) {
                this.sendMessage(input.value.trim());
                input.value = '';
            }
        });

        sendBtn.onclick = () => {
            if (input.value.trim()) {
                this.sendMessage(input.value.trim());
                input.value = '';
            }
        };
    }

    toggle() {
        this.isOpen = !this.isOpen;
        const container = document.querySelector('.chat-widget-container');
        if (this.isOpen) {
            container.classList.add('open');
            document.querySelector('#chat-input').focus();
        } else {
            container.classList.remove('open');
        }
    }

    addMessage(content, isBot = true, suggestions = []) {
        const messagesContainer = document.querySelector('#chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isBot ? 'bot' : 'user'}`;
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="chat-message-content">${content}</div>
            <div class="chat-message-time">${time}</div>
        `;
        
        messagesContainer.appendChild(messageDiv);

        // Add suggestions if provided
        if (suggestions.length > 0 && isBot) {
            const suggestionsDiv = document.createElement('div');
            suggestionsDiv.className = 'chat-message bot';
            suggestionsDiv.innerHTML = `
                <div class="chat-suggestions">
                    ${suggestions.map(s => `<span class="chat-suggestion" onclick="prChatbot.sendMessage('${s}')">${s}</span>`).join('')}
                </div>
            `;
            messagesContainer.appendChild(suggestionsDiv);
        }

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        this.messages.push({ content, isBot, time });
    }

    showTyping() {
        const messagesContainer = document.querySelector('#chat-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message bot';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="chat-message-content">
                <div class="chat-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTyping() {
        const typing = document.querySelector('#typing-indicator');
        if (typing) typing.remove();
    }

    addWelcomeMessage() {
        const suggestions = [
            'Show open PRs',
            'PRs by author',
            'Recent merged PRs',
            'PRs with bugs label'
        ];
        this.addMessage(
            'Hi! I can help you find and analyze pull requests. What would you like to know?',
            true,
            suggestions
        );
    }

    async sendMessage(message) {
        // Add user message
        this.addMessage(message, false);

        // Show typing indicator
        this.showTyping();

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Process message and get response
        const response = await this.processMessage(message);
        
        this.hideTyping();
        this.addMessage(response.text, true, response.suggestions || []);
    }

    async processMessage(message) {
        const lowerMsg = message.toLowerCase();

        // Check if PRs are loaded
        if (!window.allPRs || window.allPRs.length === 0) {
            return {
                text: '⚠️ No PR data loaded yet. Please enter your GitHub token and fetch PRs first.',
                suggestions: []
            };
        }

        const prs = window.allPRs;

        // Pattern: Count/Stats queries
        if (lowerMsg.match(/how many|count|total/)) {
            const openCount = prs.filter(pr => pr.state === 'open').length;
            const closedCount = prs.filter(pr => pr.state === 'closed' && !pr.merged_at).length;
            const mergedCount = prs.filter(pr => pr.merged_at).length;
            
            return {
                text: `📊 **PR Statistics:**\n\n` +
                      `• Total PRs: ${prs.length}\n` +
                      `• Open: ${openCount}\n` +
                      `• Merged: ${mergedCount}\n` +
                      `• Closed: ${closedCount}`,
                suggestions: ['Show open PRs', 'Show merged PRs', 'Top contributors']
            };
        }

        // Pattern: Open PRs
        if (lowerMsg.match(/open prs?|show open/)) {
            const openPRs = prs.filter(pr => pr.state === 'open');
            if (openPRs.length === 0) {
                return { text: 'No open PRs found.', suggestions: [] };
            }
            const list = openPRs.slice(0, 5).map(pr => 
                `• #${pr.number}: ${pr.title} (by ${pr.user.login})`
            ).join('\n');
            return {
                text: `🟢 **Open PRs (showing ${Math.min(5, openPRs.length)} of ${openPRs.length}):**\n\n${list}`,
                suggestions: ['Show merged PRs', 'PRs by author']
            };
        }

        // Pattern: Merged PRs
        if (lowerMsg.match(/merged prs?|show merged|recently merged/)) {
            const mergedPRs = prs.filter(pr => pr.merged_at).slice(0, 5);
            if (mergedPRs.length === 0) {
                return { text: 'No merged PRs found.', suggestions: [] };
            }
            const list = mergedPRs.map(pr => 
                `• #${pr.number}: ${pr.title} (by ${pr.user.login})`
            ).join('\n');
            return {
                text: `🟣 **Recently Merged PRs:**\n\n${list}`,
                suggestions: ['Show open PRs', 'Top contributors']
            };
        }

        // Pattern: By author
        if (lowerMsg.match(/prs? by|author|from (\w+)/)) {
            const match = lowerMsg.match(/(?:by|from|author)\s+(\w+)/);
            if (match) {
                const author = match[1];
                const authorPRs = prs.filter(pr => 
                    pr.user.login.toLowerCase().includes(author.toLowerCase())
                );
                if (authorPRs.length === 0) {
                    return { text: `No PRs found from author "${author}".`, suggestions: [] };
                }
                const list = authorPRs.slice(0, 5).map(pr => 
                    `• #${pr.number}: ${pr.title} (${pr.state})`
                ).join('\n');
                return {
                    text: `👤 **PRs by ${author} (showing ${Math.min(5, authorPRs.length)} of ${authorPRs.length}):**\n\n${list}`,
                    suggestions: ['Show open PRs', 'Top contributors']
                };
            }
            return {
                text: 'Please specify an author name. Example: "PRs by alice"',
                suggestions: []
            };
        }

        // Pattern: By label
        if (lowerMsg.match(/label|tag|with (\w+)/)) {
            const match = lowerMsg.match(/(?:label|tag|with)\s+(\w+)/);
            if (match) {
                const label = match[1];
                const labeledPRs = prs.filter(pr => 
                    pr.labels.some(l => l.name.toLowerCase().includes(label.toLowerCase()))
                );
                if (labeledPRs.length === 0) {
                    return { text: `No PRs found with label "${label}".`, suggestions: [] };
                }
                const list = labeledPRs.slice(0, 5).map(pr => 
                    `• #${pr.number}: ${pr.title} (by ${pr.user.login})`
                ).join('\n');
                return {
                    text: `🏷️ **PRs with label "${label}" (showing ${Math.min(5, labeledPRs.length)} of ${labeledPRs.length}):**\n\n${list}`,
                    suggestions: ['Show open PRs', 'All labels']
                };
            }
        }

        // Pattern: Top contributors
        if (lowerMsg.match(/top (contributors?|authors?)|who/)) {
            const authorCounts = {};
            prs.forEach(pr => {
                const author = pr.user.login;
                authorCounts[author] = (authorCounts[author] || 0) + 1;
            });
            const topAuthors = Object.entries(authorCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([author, count]) => `• ${author}: ${count} PRs`)
                .join('\n');
            return {
                text: `👥 **Top Contributors:**\n\n${topAuthors}`,
                suggestions: ['Show open PRs', 'Show merged PRs']
            };
        }

        // Pattern: All labels
        if (lowerMsg.match(/all labels|what labels|list labels/)) {
            const labelCounts = {};
            prs.forEach(pr => {
                pr.labels.forEach(label => {
                    labelCounts[label.name] = (labelCounts[label.name] || 0) + 1;
                });
            });
            const topLabels = Object.entries(labelCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([label, count]) => `• ${label} (${count})`)
                .join('\n');
            return {
                text: `🏷️ **Most Used Labels:**\n\n${topLabels}`,
                suggestions: ['PRs with bug label', 'Show open PRs']
            };
        }

        // Pattern: Specific PR number
        if (lowerMsg.match(/#?(\d+)/)) {
            const match = lowerMsg.match(/#?(\d+)/);
            const prNumber = parseInt(match[1]);
            const pr = prs.find(p => p.number === prNumber);
            if (pr) {
                const status = pr.merged_at ? 'Merged' : pr.state === 'closed' ? 'Closed' : 'Open';
                const labels = pr.labels.map(l => l.name).join(', ') || 'None';
                return {
                    text: `📄 **PR #${pr.number}:**\n\n` +
                          `**Title:** ${pr.title}\n` +
                          `**Author:** ${pr.user.login}\n` +
                          `**Status:** ${status}\n` +
                          `**Labels:** ${labels}\n` +
                          `**Created:** ${new Date(pr.created_at).toLocaleDateString()}\n` +
                          `**Updated:** ${new Date(pr.updated_at).toLocaleDateString()}\n\n` +
                          `[View on GitHub](${pr.html_url})`,
                    suggestions: ['Show open PRs', 'PRs by ' + pr.user.login]
                };
            }
            return { text: `PR #${prNumber} not found.`, suggestions: [] };
        }

        // Pattern: Search in title
        if (lowerMsg.match(/search|find|look for/)) {
            const searchTerm = lowerMsg.replace(/search|find|look for/gi, '').trim();
            if (searchTerm.length > 2) {
                const results = prs.filter(pr => 
                    pr.title.toLowerCase().includes(searchTerm)
                );
                if (results.length === 0) {
                    return { text: `No PRs found matching "${searchTerm}".`, suggestions: [] };
                }
                const list = results.slice(0, 5).map(pr => 
                    `• #${pr.number}: ${pr.title}`
                ).join('\n');
                return {
                    text: `🔍 **Search results for "${searchTerm}" (showing ${Math.min(5, results.length)} of ${results.length}):**\n\n${list}`,
                    suggestions: ['Show open PRs', 'Top contributors']
                };
            }
        }

        // Default: Help message
        return {
            text: `I can help you with:\n\n` +
                  `• **Statistics**: "How many open PRs?"\n` +
                  `• **By status**: "Show open PRs", "Show merged PRs"\n` +
                  `• **By author**: "PRs by alice"\n` +
                  `• **By label**: "PRs with bug label"\n` +
                  `• **Contributors**: "Top contributors"\n` +
                  `• **Specific PR**: "Show PR #142"\n` +
                  `• **Search**: "Find memory leak"`,
            suggestions: ['Show open PRs', 'Top contributors', 'How many PRs?']
        };
    }
}

// Initialize chatbot when DOM is ready
let prChatbot;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        prChatbot = new PRChatbot();
    });
} else {
    prChatbot = new PRChatbot();
}
