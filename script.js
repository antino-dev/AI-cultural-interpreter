document.addEventListener('DOMContentLoaded', () => {
  const chatMessages = document.getElementById('chat-messages');
  const userInput = document.getElementById('user-input');
  const sendButton = document.getElementById('send-button');           // hidden legacy
  const sendIconBtn = document.getElementById('send-icon-btn');        // visible icon btn

  const MAX_TEXTAREA_HEIGHT = 160;

  const autosize = () => {
    userInput.style.height = 'auto';
    userInput.style.height = Math.min(userInput.scrollHeight, MAX_TEXTAREA_HEIGHT) + 'px';
  };

  const removeLegacyCheck = () => {
    document.querySelectorAll('.check-answer').forEach(el => el.remove());
  };

  const SCENARIOS = {
    // ── AI Cultural Interpreter: office norms with Danny ──
    // Each chatbot turn is broken into several short bubbles, shown one at a
    // time with a typing indicator. `delay` is the [min,max] ms pause range
    // before that bubble appears (per-bubble, not cumulative).
    'officenorms': [
      { type: 'user', text: "My boss, Danny, keeps getting involved in little things around the office. He was worried that my desk was too empty and that people would think I wasn’t working, so I started leaving papers on it. He also sent me a note about pushing my chair in and once emailed the whole office because someone left a pizza box on the copy machine. It feels ridiculous. What’s going on?" },
      { type: 'chatbot', bubbles: [
        { delay: [1500, 2000], text: "Danny may not see these as little things. In this office, visible signs of order, effort, and respect for shared space can affect how people judge someone’s professionalism." },
        { delay: [1500, 2500], text: "He also seems to be correcting problems indirectly rather than confronting someone personally. What feels like unnecessary interference to you may be his way of maintaining office norms without embarrassing anyone." }
      ] },

      { type: 'user', text: "Okay. So what should I do?" },
      { type: 'chatbot', bubbles: [
        { delay: [1500, 2000], text: "Try treating these moments as information about local expectations rather than as personal criticism." },
        { delay: [1500, 2500], text: "Pay attention to the signals that seem to matter in this office, including how people organize their workspace, behave in shared spaces, and present themselves to colleagues." },
        { delay: [1500, 2500], text: "It may also help to talk with Danny privately and show that you want to understand expectations before problems come up. The goal is to learn which behaviors may carry a different meaning in this environment." }
      ] },

      { type: 'user', text: "How should I actually talk to him?" },
      { type: 'chatbot', bubbles: [
        { delay: [1500, 2000], text: "You could start with:\n“Danny, I want to make sure I’m understanding how things work in this office. I know there are probably expectations I’m still learning.”" },
        { delay: [2000, 2500], text: "Then you could add:\n“If there are things I could do differently that would help me build credibility with the team, I’d really appreciate you telling me.”" },
        { delay: [2000, 2500], text: "And if he brings up your desk again, you might simply say:\n“I didn’t realize an empty desk could be interpreted that way here. That’s helpful to know. I’ll keep it in mind.”" },
        { delay: [1500, 2000], text: "Keep the conversation brief and curious. You do not need to defend why your original approach made sense. The goal is to show that you are listening and trying to understand the local context." }
      ] }
    ],
  };

  const key = (window.SCRIPT_SCENARIO || 'baseline-simple');
  const conversation = SCENARIOS[key];

  let messageIndex = 0;
  let charIndex = 0;
  let typingInterval = null;
  let awaitingUserSend = false;
  let isTyping = false;

  /* ── DOM helpers ── */

  function createAvatar(type) {
    const el = document.createElement('div');
    el.classList.add('avatar', type === 'chatbot' ? 'avatar-a' : 'avatar-b');
    el.textContent = type === 'chatbot' ? 'AI' : 'You';
    return el;
  }

  function createMessageRow(type) {
    const row = document.createElement('div');
    row.classList.add('message-row', type === 'user' ? 'user-row' : 'bot-row');

    const avatar = createAvatar(type);

    const bubble = document.createElement('div');
    bubble.classList.add('message-bubble', type === 'chatbot' ? 'chatbot-message' : 'user-message');

    if (type === 'chatbot') {
      row.appendChild(avatar);
      row.appendChild(bubble);
    } else {
      row.appendChild(bubble);
      row.appendChild(avatar);
    }

    chatMessages.appendChild(row);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return { row, contentEl: bubble };
  }

  /* ── A: show "..." indicator, then reveal one bubble's text ── */

  const randomBetween = (min, max) => min + Math.random() * (max - min);

  // Pause before a bubble appears: a random point within its [min,max] range,
  // nudged longer for longer text so readers get more time on bigger bubbles.
  function bubbleDelay(bubble) {
    const [min, max] = bubble.delay || [1500, 2000];
    const readingBonus = Math.min(bubble.text.length * 2, 300);
    return randomBetween(min, max) + readingBonus;
  }

  function showChatbotBubble(bubble, done) {
    // Show typing indicator bubble
    const { row: indicatorRow, contentEl: indicatorEl } = createMessageRow('chatbot');
    indicatorEl.classList.add('typing-indicator');
    indicatorEl.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    const delay = bubbleDelay(bubble);

    isTyping = true;
    if (sendIconBtn) sendIconBtn.disabled = true;

    setTimeout(() => {
      // Remove indicator row, insert real bubble
      indicatorRow.remove();
      const { contentEl } = createMessageRow('chatbot');
      contentEl.innerHTML = bubble.text.replace(/\n/g, '<br>');
      chatMessages.scrollTop = chatMessages.scrollHeight;

      isTyping = false;
      if (sendIconBtn) sendIconBtn.disabled = false;
      removeLegacyCheck();
      if (done) done();
    }, delay);
  }

  // A chatbot turn is one or more bubbles, shown one at a time in sequence.
  function showChatbotTurn(msg, done) {
    const bubbles = msg.bubbles || [{ text: msg.text, delay: [1500, 2000] }];
    let i = 0;
    (function step() {
      if (i >= bubbles.length) { done(); return; }
      showChatbotBubble(bubbles[i], () => { i++; step(); });
    })();
  }

  /* ── B: character-by-character into the textarea (scrollable) ── */

  function typeUserPrompt(msg) {
    userInput.value = '';
    // Grow with content (like autosize) so the whole message is visible at once
    userInput.style.height = 'auto';
    userInput.style.overflowY = 'auto';
    awaitingUserSend = true;
    isTyping = true;
    if (sendIconBtn) sendIconBtn.disabled = true;
    charIndex = 0;

    // Scroll chat to bottom immediately so A's last message stays visible
    // above the expanded textarea
    chatMessages.scrollTop = chatMessages.scrollHeight;

    typingInterval = setInterval(() => {
      if (charIndex < msg.text.length) {
        userInput.value += msg.text.charAt(charIndex);
        charIndex++;
        // Grow the box to fit what's typed so far (capped, then scrolls)
        userInput.style.height = 'auto';
        userInput.style.height = Math.min(userInput.scrollHeight, MAX_TEXTAREA_HEIGHT) + 'px';
        userInput.scrollTop = userInput.scrollHeight;
        chatMessages.scrollTop = chatMessages.scrollHeight;
      } else {
        clearInterval(typingInterval);
        typingInterval = null;
        isTyping = false;
        if (sendIconBtn) sendIconBtn.disabled = false;
      }
    }, 35);
  }

  /* ── Disable input when conversation is over ── */

  function disableInput() {
    userInput.disabled = true;
    userInput.placeholder = 'Conversation ended.';
    if (sendIconBtn) sendIconBtn.disabled = true;
    const wrap = document.querySelector('.chat-input .input-wrap');
    if (wrap) wrap.style.opacity = '0.45';
  }

  /* ── Conversation flow ── */

  function nextStep() {
    if (messageIndex >= conversation.length) {
      disableInput();
      return;
    }
    const msg = conversation[messageIndex];
    if (msg.type === 'chatbot') {
      showChatbotTurn(msg, () => {
        messageIndex++;
        setTimeout(nextStep, 350);
      });
    } else {
      typeUserPrompt(msg);
    }
  }

  function sendMessage() {
    const text = userInput.value.trim();
    if (!text || isTyping) return;

    const { contentEl } = createMessageRow('user');
    contentEl.innerHTML = text.replace(/\n/g, '<br>');

    // Reset textarea to auto-sizing, non-scrollable state
    userInput.value = '';
    userInput.style.overflowY = 'hidden';
    autosize();

    if (awaitingUserSend && conversation[messageIndex]?.type === 'user') {
      awaitingUserSend = false;
      messageIndex++;
      // Check if anything remains after this user turn
      const hasMore = conversation.slice(messageIndex).some(m => m.type === 'chatbot' || m.type === 'user');
      if (hasMore) {
        setTimeout(nextStep, 50);
      } else {
        disableInput();
      }
    } else {
      while (conversation[messageIndex]?.type === 'user') messageIndex++;
      if (messageIndex < conversation.length) {
        setTimeout(nextStep, 50);
      } else {
        disableInput();
      }
    }
  }

  /* ── Event listeners ── */
  if (sendIconBtn) sendIconBtn.addEventListener('click', sendMessage);
  sendButton.addEventListener('click', sendMessage);   // legacy (hidden)
  userInput.addEventListener('input', autosize);
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  /* ── Boot ── */
  removeLegacyCheck();
  autosize();
  nextStep();
});
