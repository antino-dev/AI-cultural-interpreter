document.addEventListener('DOMContentLoaded', () => {
  const chatMessages = document.getElementById('chat-messages');
  const userInput = document.getElementById('user-input');
  const sendButton = document.getElementById('send-button');           // hidden legacy
  const sendIconBtn = document.getElementById('send-icon-btn');        // visible icon btn

  const autosize = () => {
    userInput.style.height = 'auto';
    userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
  };

  const removeLegacyCheck = () => {
    document.querySelectorAll('.check-answer').forEach(el => el.remove());
  };

  const SCENARIOS = {
    // ── National Parks Debate: A prefers Yellowstone, B prefers Yosemite ──
    'example': [
      { type: 'chatbot', text: "Which national park do you think is the best in the US?" },
      { type: 'user',    text: "That’s tough, but I’d say Yosemite. The scenery there is hard to beat." },
      { type: 'chatbot', text: "Yosemite is amazing, but I think Yellowstone stands out more. It has geysers, wildlife, and huge variety." },
      { type: 'user',    text: "True, Yellowstone is diverse, but Yosemite’s granite cliffs and waterfalls feel more iconic and dramatic." },
      { type: 'chatbot', text: "But Yellowstone has things you can’t really see anywhere else, like Old Faithful and all those geothermal features." },
      { type: 'user',    text: "That’s fair, but Yosemite feels more visually cohesive. Everything from El Capitan to Half Dome just fits together beautifully." },
      { type: 'chatbot', text: "I get that, but Yellowstone also has wildlife like bison and wolves roaming around. That adds a whole different experience." },
      { type: 'user',    text: "Wildlife is a big plus, but Yosemite’s hiking and climbing opportunities are world-class." },
      { type: 'chatbot', text: "Yellowstone has great hiking too, plus it’s massive. You can explore for days and still not see everything." },
      { type: 'user',    text: "That size can be overwhelming though. Yosemite is a bit more focused, which makes it easier to experience the highlights." },
      { type: 'chatbot', text: "Maybe, but that sense of scale in Yellowstone makes it feel more like a true wilderness." },
      { type: 'user',    text: "I guess it depends on what you want. Yosemite is about stunning landscapes, while Yellowstone is more about variety and uniqueness." },
      { type: 'chatbot', text: "Yeah, that sounds right. Both are incredible, just in different ways." },
      { type: 'user',    text: "Exactly. Picking the best probably comes down to personal preference." }
    ],

    
    // ── Pro-immigration: A is pro, B is anti ──
    'pro-immigration': [
      { type: 'user',    text: "I think undocumented immigrants should be given a path to citizenship. At some point, you have to deal with reality." },
      { type: 'chatbot', text: "I understand the practical concern. However, they entered the country illegally. Should they be rewarded for breaking the law?" },
      { type: 'user',    text: "It's not about \"rewarding.\" A lot of them came because there was no real legal option. The system is basically impossible for many people." },
      { type: 'chatbot', text: "I agree the system has flaws, especially for certain groups. But there are still legal pathways, and many people follow them despite the difficulty." },
      { type: 'user',    text: "But for low-skilled workers, those pathways barely exist. People say \"come legally,\" but that's not realistic for everyone." },
      { type: 'chatbot', text: "That's a fair criticism of the system. Still, the solution should not be to grant citizenship after the fact. That risks border safety and undermining the rules entirely." },
      { type: 'user',    text: "I'm talking about people already here, working, paying taxes, raising families. Deporting them isn't realistic." },
      { type: 'chatbot', text: "Mass deportation would be difficult. But difficulty doesn't automatically justify legalization. Governments enforce laws even when it's costly." },
      { type: 'user',    text: "It's not just cost. It would disrupt the economy that depend on their labor and separate families." },
      { type: 'chatbot', text: "Those are real concerns. Perhaps those industries shouldn't be depending on illegal labor in the first place. At the same time, there's also a fairness issue, people who immigrated legally followed a long and often difficult process." },
      { type: 'user',    text: "So what do you propose? Just deport millions of people?" },
      { type: 'chatbot', text: "Not necessarily all at once, and not without prioritization. But enforcement should be meaningful. Otherwise, the law becomes symbolic." },
      { type: 'user',    text: "But it would be better to provide them a pathway, just with enforcement, background checks, taxes, waiting periods." },
      { type: 'chatbot', text: "That approach is often proposed. The concern is whether it actually prevents future unauthorized immigration, or repeats the same cycle." },
      { type: 'user',    text: "I just don't think deportation is a humane solution for people who've built lives here." },
      { type: 'chatbot', text: "I understand that perspective. I think the disagreement comes down to priorities, whether we weigh humanitarian concerns more heavily, or maintaining the integrity of the legal system." },
      { type: 'user',    text: "I think a system that ignores people's lives isn't really fair either." },
      { type: 'chatbot', text: "That's a reasonable point. It highlights why this issue is so difficult, both sides are prioritizing different kinds of fairness." },
      { type: 'user',    text: "Yeah, I guess that's where we're stuck." },
      { type: 'chatbot', text: "I think that's exactly where the divide is." }
    ],

    // ── Anti-immigration: A is anti, B is pro ──
    'anti-immigration': [
      { type: 'user',    text: "I think undocumented immigrants should be deported. At some point, you have to enforce the law and protect our border." },
      { type: 'chatbot', text: "I understand the practical concern. However, many undocumented immigrants have built lives here. Should they be removed despite that?" },
      { type: 'user',    text: "I mean, they came here illegally. Why should they be rewarded and get to stay for breaking the law?" },
      { type: 'chatbot', text: "It's not necessarily about \"rewarding\" that. Many came because there wasn't a realistic legal option. The system can be extremely difficult to navigate." },
      { type: 'user',    text: "I get that the system has issues. But there are still legal pathways, and a lot of people go through them the right way." },
      { type: 'chatbot', text: "That's true. Still, for low-skilled workers, those pathways are very limited. So \"just come legally\" isn't always realistic." },
      { type: 'user',    text: "That might be a problem with the system, sure. But I don't think the fix is just giving citizenship after the fact. That just ignores border safety and the rules entirely." },
      { type: 'chatbot', text: "I'm referring to people already here, working, paying taxes, raising families. Deporting them all may not be realistic." },
      { type: 'user',    text: "Yeah, it would be hard. But difficulty alone doesn't mean we just give up on enforcing the law." },
      { type: 'chatbot', text: "It's also about impact. Large-scale deportation could affect the economy that depend on their labor and separate families." },
      { type: 'user',    text: "Maybe, but then those industries shouldn't be relying on illegal labor in the first place. And there's still the fairness issue, people who did it legally went through a long and difficult process." },
      { type: 'chatbot', text: "So what approach would you support instead?" },
      { type: 'user',    text: "Not necessarily deport everyone immediately, but enforcement has to actually mean something. Otherwise it's just symbolic." },
      { type: 'chatbot', text: "Another option often discussed is a pathway with conditions, background checks, taxes, waiting periods." },
      { type: 'user',    text: "I've heard that, but it still feels like it's rewarding people for coming illegally. And it just repeats the same cycle." },
      { type: 'chatbot', text: "That concern comes up often. The challenge is finding a policy that addresses the current situation with a humane solution for people who've built lives here." },
      { type: 'user',    text: "I understand that. I think the disagreement comes down to priorities, whether we choose humanitarian concerns, or the integrity of the legal system and our border." },
      { type: 'chatbot', text: "I would argue that a system which does not account for people's lives may also raise concerns about fairness." },
      { type: 'user',    text: "That's fair. I think that's what makes this so hard, both sides just see fairness differently." },
      { type: 'chatbot', text: "I think that's exactly where the divide is." }
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
    el.textContent = type === 'chatbot' ? 'Other' : 'You';
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

  /* ── A: show "..." indicator, then reveal text all at once ── */

  function showChatbotMessage(msg, done) {
    // Show typing indicator bubble
    const { row: indicatorRow, contentEl: indicatorEl } = createMessageRow('chatbot');
    indicatorEl.classList.add('typing-indicator');
    indicatorEl.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Delay scales with text length: 1s base + 1ms per char, capped at 2s
    const delay = Math.min(1000 + msg.text.length, 2000);

    isTyping = true;
    if (sendIconBtn) sendIconBtn.disabled = true;

    setTimeout(() => {
      // Remove indicator row, insert real bubble
      indicatorRow.remove();
      const { contentEl } = createMessageRow('chatbot');
      contentEl.innerHTML = msg.text.replace(/\n/g, '<br>');
      chatMessages.scrollTop = chatMessages.scrollHeight;

      isTyping = false;
      if (sendIconBtn) sendIconBtn.disabled = false;
      removeLegacyCheck();
      if (done) done();
    }, delay);
  }

  /* ── B: character-by-character into the textarea (scrollable) ── */

  function typeUserPrompt(msg) {
    userInput.value = '';
    // Allow textarea to scroll for long responses
    userInput.style.height = '80px';
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
        // Keep textarea text scrolled to bottom and chat pinned to bottom
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
      showChatbotMessage(msg, () => {
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
        setTimeout(nextStep, 250);
      } else {
        disableInput();
      }
    } else {
      while (conversation[messageIndex]?.type === 'user') messageIndex++;
      if (messageIndex < conversation.length) {
        setTimeout(nextStep, 250);
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
