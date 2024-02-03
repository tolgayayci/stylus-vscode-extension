const vscode = acquireVsCodeApi();

document.addEventListener('DOMContentLoaded', () => {
  const chat = document.getElementById('chat');
  const input = document.getElementById('prompt-input');
  const welcomeMessageId = 'welcome-message';

  function appendMessage(content, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);

    // Removed icon creation and appending

    const textContent = document.createElement('div');
    textContent.textContent = content;
    messageElement.appendChild(textContent);

    chat.appendChild(messageElement);
    chat.scrollTop = chat.scrollHeight;
  }

  function showWelcomeMessage() {
    if (!document.getElementById(welcomeMessageId)) {
      const welcomeMessage = document.createElement('div');
      welcomeMessage.id = welcomeMessageId;
      welcomeMessage.classList.add('message', 'assistant');
      welcomeMessage.textContent = 'Welcome to AI Chat! Type your question and press Enter to get started.';
      chat.appendChild(welcomeMessage);
    }
  }

  function removeWelcomeMessage() {
    const welcomeMessage = document.getElementById(welcomeMessageId);
    if (welcomeMessage) {
      welcomeMessage.remove();
    }
  }

  function showLoader() {
    removeWelcomeMessage();
    const loader = document.createElement('div');
    loader.classList.add('loader');
    chat.appendChild(loader);
  }

  function removeLoader() {
    const loader = chat.querySelector('.loader');
    if (loader) {
      loader.remove();
    }
  }

  function showThreadId(threadId) {
    const threadIdDisplay = document.createElement('div');
    threadIdDisplay.classList.add('message', 'system-message');
    threadIdDisplay.textContent = `Thread ID: ${threadId}`;
    chat.insertBefore(threadIdDisplay, chat.firstChild); // Show at the top
  }

  showWelcomeMessage();

  window.addEventListener('message', event => {
    const message = event.data;
    switch (message.type) {
      case 'response':
        removeLoader();
        console.log(message);
        // Handle multiple messages if present
        appendMessage(message.text, 'assistant'); // This will append the latest message
        break;
      case 'threadId': // Handle the new 'threadId' message type
        showThreadId(message.threadId); // Assuming the thread ID is sent in the 'text' field
        break;
    }
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const query = input.value.trim();
      if (query) {
        removeWelcomeMessage();
        appendMessage(query, 'user');
        showLoader();
        vscode.postMessage({
          type: 'query',
          text: query
        });
        input.value = '';
      }
    }
  });
});
