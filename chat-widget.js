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
        
        // Format content with proper line breaks and lists
        const formattedContent = this.formatMessage(content);
        
        messageDiv.innerHTML = `
            <div class="chat-message-content">${formattedContent}</div>
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

    formatMessage(text) {
        // Convert markdown-style formatting to HTML
        let formatted = text;
        
        // Bold text: **text** -> <strong>text</strong>
        formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        
        // Convert bullet points to proper HTML list
        const lines = formatted.split('\n');
        let inList = false;
        let result = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.startsWith('•')) {
                if (!inList) {
                    result.push('<ul style="margin: 8px 0; padding-left: 20px;">');
                    inList = true;
                }
                const content = line.substring(1).trim();
                result.push(`<li style="margin: 4px 0;">${content}</li>`);
            } else {
                if (inList) {
                    result.push('</ul>');
                    inList = false;
                }
                if (line) {
                    result.push(`<div style="margin: 4px 0;">${line}</div>`);
                }
            }
        }
        
        if (inList) {
            result.push('</ul>');
        }
        
        return result.join('');
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

        // Check if PRs are loaded, if not try to fetch them
        if (!window.allPRs || window.allPRs.length === 0) {
            const token = localStorage.getItem('githubToken');
            
            if (!token) {
                return {
                    text: '⚠️ No GitHub token found. Please click the Refresh button in the dashboard to load PRs.',
                    suggestions: []
                };
            }

            // Show fetching message
            return {
                text: '⚠️ No PR data loaded yet. Please click the **Refresh** button in the dashboard to load PRs, then try your question again.',
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

        // Pattern: Dependencies
        if (lowerMsg.match(/dependencies|depends|conflicts|overlaps?/)) {
            const match = lowerMsg.match(/#?(\d+)/);
            if (match) {
                const prNumber = parseInt(match[1]);
                return await this.getPRDependencies(prNumber, prs);
            }
            return {
                text: 'Please specify a PR number. Example: "dependencies for PR #142"',
                suggestions: []
            };
        }

        // Pattern: Files changed
        if (lowerMsg.match(/files? changed|modified files|what files/)) {
            return await this.getFilesChanged(prs);
        }

        // Pattern: Group by labels
        if (lowerMsg.match(/group by labels?|cluster|categorize/)) {
            return this.groupByLabels(prs);
        }

        // Pattern: Analyze trends
        if (lowerMsg.match(/trends?|analytics?|statistics?|analyze/)) {
            return this.analyzeTrends(prs);
        }

        // Pattern: Insights
        if (lowerMsg.match(/insights?|patterns?|recommendations?/)) {
            return this.getPRInsights(prs);
        }

        // Pattern: Predict merge time
        if (lowerMsg.match(/predict|when.*merge|estimate.*merge/)) {
            const match = lowerMsg.match(/#?(\d+)/);
            if (match) {
                const prNumber = parseInt(match[1]);
                return this.predictMergeTime(prNumber, prs);
            }
            return {
                text: 'Please specify a PR number. Example: "predict merge time for PR #142"',
                suggestions: []
            };
        }

        // Pattern: Watch PR
        if (lowerMsg.match(/watch|monitor|track|alert/)) {
            const match = lowerMsg.match(/#?(\d+)/);
            if (match) {
                const prNumber = parseInt(match[1]);
                return this.watchPR(prNumber);
            }
            return {
                text: 'Please specify a PR number. Example: "watch PR #142"',
                suggestions: []
            };
        }

        // Default: Help message
        return {
            text: `I can help you with:\n\n` +
                  `**Basic:**\n` +
                  `• **Statistics**: "How many open PRs?"\n` +
                  `• **By status**: "Show open PRs", "Show merged PRs"\n` +
                  `• **By author**: "PRs by alice"\n` +
                  `• **By label**: "PRs with bug label"\n` +
                  `• **Contributors**: "Top contributors"\n` +
                  `• **Specific PR**: "Show PR #142"\n` +
                  `• **Search**: "Find memory leak"\n\n` +
                  `**Advanced:**\n` +
                  `• **Dependencies**: "Dependencies for PR #142"\n` +
                  `• **Files**: "What files changed?"\n` +
                  `• **Grouping**: "Group by labels"\n` +
                  `• **Trends**: "Analyze trends"\n` +
                  `• **Insights**: "Get insights"\n` +
                  `• **Predictions**: "Predict merge time for PR #142"\n` +
                  `• **Watch**: "Watch PR #142"`,
            suggestions: ['Show open PRs', 'Analyze trends', 'Get insights']
        };
    }

    // Advanced feature: Get PR Dependencies
    async getPRDependencies(prNumber, prs) {
        const targetPR = prs.find(pr => pr.number === prNumber);
        if (!targetPR) {
            return { text: `PR #${prNumber} not found.`, suggestions: [] };
        }

        // For now, we'll check title/label similarity as a proxy for dependencies
        // In a real implementation, we'd fetch file changes from GitHub API
        const related = prs.filter(pr => {
            if (pr.number === prNumber) return false;
            
            // Check for shared labels
            const sharedLabels = pr.labels.filter(label =>
                targetPR.labels.some(tl => tl.name === label.name)
            );
            
            // Check for similar titles (common words)
            const targetWords = targetPR.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
            const prWords = pr.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
            const commonWords = targetWords.filter(w => prWords.includes(w));
            
            return sharedLabels.length > 0 || commonWords.length > 1;
        });

        if (related.length === 0) {
            return {
                text: `📊 **Dependencies for PR #${prNumber}:**\n\nNo related PRs found.`,
                suggestions: ['Show open PRs']
            };
        }

        const list = related.slice(0, 5).map(pr => {
            const sharedLabels = pr.labels.filter(label =>
                targetPR.labels.some(tl => tl.name === label.name)
            ).map(l => l.name).join(', ');
            return `• #${pr.number}: ${pr.title}\n  ${sharedLabels ? `Shared labels: ${sharedLabels}` : 'Similar title'}`;
        }).join('\n');

        return {
            text: `📊 **Related PRs for #${prNumber}** (${targetPR.title}):\n\n${list}\n\n${related.length > 5 ? `...and ${related.length - 5} more` : ''}`,
            suggestions: ['Show open PRs', 'Get insights']
        };
    }

    // Advanced feature: Get Files Changed
    async getFilesChanged(prs) {
        // Group PRs by common patterns in titles (as proxy for file changes)
        const patterns = {};
        prs.forEach(pr => {
            const words = pr.title.toLowerCase().split(/\s+/).filter(w => w.length > 4);
            words.forEach(word => {
                if (!patterns[word]) patterns[word] = [];
                patterns[word].push(pr.number);
            });
        });

        const topPatterns = Object.entries(patterns)
            .sort((a, b) => b[1].length - a[1].length)
            .slice(0, 10)
            .filter(([_, prs]) => prs.length > 1);

        if (topPatterns.length === 0) {
            return {
                text: '📁 **Files Changed:**\n\nNo common patterns found across PRs.',
                suggestions: ['Show open PRs']
            };
        }

        const list = topPatterns.map(([pattern, prNumbers]) =>
            `• **${pattern}**: ${prNumbers.length} PRs (${prNumbers.slice(0, 3).map(n => `#${n}`).join(', ')}${prNumbers.length > 3 ? '...' : ''})`
        ).join('\n');

        return {
            text: `📁 **Common Areas Across PRs:**\n\n${list}`,
            suggestions: ['Group by labels', 'Analyze trends']
        };
    }

    // Advanced feature: Group by Labels
    groupByLabels(prs) {
        const labelGroups = {};
        
        prs.forEach(pr => {
            if (pr.labels.length === 0) {
                if (!labelGroups['No Labels']) labelGroups['No Labels'] = [];
                labelGroups['No Labels'].push(pr);
            } else {
                pr.labels.forEach(label => {
                    if (!labelGroups[label.name]) labelGroups[label.name] = [];
                    labelGroups[label.name].push(pr);
                });
            }
        });

        const sorted = Object.entries(labelGroups)
            .sort((a, b) => b[1].length - a[1].length)
            .slice(0, 10);

        const list = sorted.map(([label, prs]) =>
            `• **${label}**: ${prs.length} PRs`
        ).join('\n');

        return {
            text: `🏷️ **PRs Grouped by Labels:**\n\n${list}`,
            suggestions: ['Show open PRs', 'Analyze trends']
        };
    }

    // Advanced feature: Analyze Trends
    analyzeTrends(prs) {
        const now = Date.now();
        const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
        
        const recent = prs.filter(pr => new Date(pr.created_at).getTime() > thirtyDaysAgo);
        const merged = recent.filter(pr => pr.merged_at);
        const open = recent.filter(pr => pr.state === 'open');
        
        // Calculate average time to merge
        const mergeTimes = merged.map(pr => {
            const created = new Date(pr.created_at).getTime();
            const mergedTime = new Date(pr.merged_at).getTime();
            return (mergedTime - created) / (1000 * 60 * 60 * 24);
        });
        const avgMergeTime = mergeTimes.length > 0 
            ? (mergeTimes.reduce((a, b) => a + b, 0) / mergeTimes.length).toFixed(1)
            : 'N/A';

        // Top authors in last 30 days
        const authorCounts = {};
        recent.forEach(pr => {
            authorCounts[pr.user.login] = (authorCounts[pr.user.login] || 0) + 1;
        });
        const topAuthor = Object.entries(authorCounts).sort((a, b) => b[1] - a[1])[0];

        const mergeRate = recent.length > 0 ? ((merged.length / recent.length) * 100).toFixed(1) : '0';

        return {
            text: `📈 **PR Trends (Last 30 Days):**\n\n` +
                  `• Total PRs: ${recent.length}\n` +
                  `• Merged: ${merged.length} (${mergeRate}%)\n` +
                  `• Still Open: ${open.length}\n` +
                  `• Avg Merge Time: ${avgMergeTime} days\n` +
                  `• Top Contributor: ${topAuthor ? `${topAuthor[0]} (${topAuthor[1]} PRs)` : 'N/A'}`,
            suggestions: ['Get insights', 'Show open PRs']
        };
    }

    // Advanced feature: Get PR Insights
    getPRInsights(prs) {
        const insights = [];
        
        // Check for stale PRs
        const now = Date.now();
        const twoWeeksAgo = now - (14 * 24 * 60 * 60 * 1000);
        const stalePRs = prs.filter(pr => 
            pr.state === 'open' && new Date(pr.updated_at).getTime() < twoWeeksAgo
        );
        
        if (stalePRs.length > 0) {
            insights.push(`⚠️ ${stalePRs.length} PRs haven't been updated in 2+ weeks`);
        }

        // Check merge rate
        const merged = prs.filter(pr => pr.merged_at);
        const mergeRate = (merged.length / prs.length) * 100;
        if (mergeRate < 50) {
            insights.push(`⚠️ Low merge rate (${mergeRate.toFixed(1)}%) - many PRs are closed without merging`);
        } else {
            insights.push(`✅ Good merge rate (${mergeRate.toFixed(1)}%)`);
        }

        // Check for unlabeled PRs
        const unlabeled = prs.filter(pr => pr.labels.length === 0);
        if (unlabeled.length > 5) {
            insights.push(`⚠️ ${unlabeled.length} PRs have no labels`);
        }

        // Check author diversity
        const authors = new Set(prs.map(pr => pr.user.login));
        if (authors.size < 5) {
            insights.push(`ℹ️ Limited contributor diversity (${authors.size} contributors)`);
        } else {
            insights.push(`✅ Good contributor diversity (${authors.size} contributors)`);
        }

        if (insights.length === 0) {
            insights.push('✅ Everything looks good!');
        }

        return {
            text: `💡 **PR Insights:**\n\n${insights.map(i => `• ${i}`).join('\n')}`,
            suggestions: ['Analyze trends', 'Show open PRs']
        };
    }

    // Advanced feature: Predict Merge Time
    predictMergeTime(prNumber, prs) {
        const pr = prs.find(p => p.number === prNumber);
        if (!pr) {
            return { text: `PR #${prNumber} not found.`, suggestions: [] };
        }

        if (pr.merged_at) {
            return {
                text: `📊 **PR #${prNumber}:**\n\nThis PR is already merged on ${new Date(pr.merged_at).toLocaleDateString()}.`,
                suggestions: ['Show open PRs']
            };
        }

        if (pr.state === 'closed') {
            return {
                text: `📊 **PR #${prNumber}:**\n\nThis PR is closed without merging.`,
                suggestions: ['Show open PRs']
            };
        }

        // Calculate average merge time from historical data
        const merged = prs.filter(p => p.merged_at);
        const mergeTimes = merged.map(p => {
            const created = new Date(p.created_at).getTime();
            const mergedTime = new Date(p.merged_at).getTime();
            return (mergedTime - created) / (1000 * 60 * 60 * 24);
        });
        
        const avgMergeTime = mergeTimes.length > 0
            ? mergeTimes.reduce((a, b) => a + b, 0) / mergeTimes.length
            : 7;

        const prAge = (Date.now() - new Date(pr.created_at).getTime()) / (1000 * 60 * 60 * 24);
        const estimatedDaysRemaining = Math.max(0, avgMergeTime - prAge);
        
        const estimatedDate = new Date();
        estimatedDate.setDate(estimatedDate.getDate() + estimatedDaysRemaining);

        return {
            text: `📊 **Merge Prediction for PR #${prNumber}:**\n\n` +
                  `• Current Age: ${prAge.toFixed(1)} days\n` +
                  `• Avg Merge Time: ${avgMergeTime.toFixed(1)} days\n` +
                  `• Estimated Days Remaining: ${estimatedDaysRemaining.toFixed(1)}\n` +
                  `• Predicted Merge Date: ${estimatedDate.toLocaleDateString()}\n\n` +
                  `⚠️ This is an estimate based on historical data.`,
            suggestions: ['Show open PRs', 'Analyze trends']
        };
    }

    // Advanced feature: Watch PR
    watchPR(prNumber) {
        // Store in localStorage
        let watchList = JSON.parse(localStorage.getItem('pr_watch_list') || '[]');
        
        if (watchList.includes(prNumber)) {
            return {
                text: `👁️ Already watching PR #${prNumber}.\n\nNote: Alerts are not yet implemented. This feature will notify you of changes in a future update.`,
                suggestions: ['Show open PRs']
            };
        }

        watchList.push(prNumber);
        localStorage.setItem('pr_watch_list', JSON.stringify(watchList));

        return {
            text: `👁️ Now watching PR #${prNumber}!\n\n` +
                  `Currently watching ${watchList.length} PR(s).\n\n` +
                  `Note: Alerts are not yet implemented. This feature will notify you of changes in a future update.`,
            suggestions: ['Show open PRs', 'List watched PRs']
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
