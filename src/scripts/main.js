const vscode = acquireVsCodeApi();

document.addEventListener('DOMContentLoaded', () => {
  const chat = document.getElementById('chat');
  const input = document.getElementById('prompt-input');
  const welcomeMessageId = 'welcome-message';

  let response = '';

  function showWelcomeMessage() {
  if (!document.getElementById(welcomeMessageId)) {
    const welcomeMessageContainer = document.createElement('div');
    welcomeMessageContainer.id = welcomeMessageId;
    welcomeMessageContainer.classList.add('message', 'assistant');

    // Create header for the welcome message
    const welcomeHeader = document.createElement('div');
    welcomeHeader.classList.add('message-header');
    welcomeHeader.innerHTML = `<span class="icon-text">StylusGPT</span>`;

    // Append the header to the welcome message container
    welcomeMessageContainer.appendChild(welcomeHeader);

    const welcomeText = document.createElement('div');
    welcomeText.classList.add('message-content');
    welcomeText.textContent = 'Welcome to Stylus GPT! Type your question and press Enter to get started.';

    // Append the welcome text to the welcome message container
    welcomeMessageContainer.appendChild(welcomeText);

    chat.appendChild(welcomeMessageContainer);
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

  function fixCodeBlocks(response) {
    const REGEX_CODEBLOCK = new RegExp('\`\`\`', 'g');
    const matches = response.match(REGEX_CODEBLOCK);
  
    const count = matches ? matches.length : 0;
    if (count % 2 === 0) {
      return response;
    } else {
      return response.concat('\n\`\`\`');
    }
  }

  function appendMessageToChat(sender, htmlContent) {
    // Create the main message container
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
  
    // Create a header for the message
    const messageHeader = document.createElement('div');
    messageHeader.classList.add('message-header');
  
    // Set the icon text based on the sender
    const iconText = sender === 'user' ? 'User' : 'Stylus GPT'; // Replace with your actual icons
  
    // Set the innerHTML of the header
    messageHeader.innerHTML = `<span class="icon-text">${iconText}</span>`;
  
    // Append the header to the message element
    messageElement.appendChild(messageHeader);
  
    // Create a content container for the message
    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    messageContent.innerHTML = htmlContent;
  
    // Append the content container to the message element
    messageElement.appendChild(messageContent);
  
    // Finally, append the entire message element to the chat container
    chat.appendChild(messageElement);

    chat.scrollTop = chat.scrollHeight;
  }
  

  function setResponse(text = response, sender = 'assistant') {
    var converter = new showdown.Converter({
      omitExtraWLInCodeBlocks: true, 
      simplifiedAutoLink: true,
      excludeTrailingPunctuationFromURLs: true,
      literalMidWordUnderscores: true,
      simpleLineBreaks: true
    });

    text = fixCodeBlocks(text);
    let html = converter.makeHtml(text);
    appendMessageToChat(sender, html); 

    var preCodeBlocks = document.querySelectorAll("pre code");
    for (var i = 0; i < preCodeBlocks.length; i++) {
        preCodeBlocks[i].classList.add(
          "p-2",
          "my-2",
          "block",
          "overflow-x-scroll"
        );
    }
    
    var codeBlocks = document.querySelectorAll('code');
    for (var i = 0; i < codeBlocks.length; i++) {
        // Check if innertext starts with "Copy code"
        if (codeBlocks[i].innerText.startsWith("Copy code")) {
            codeBlocks[i].innerText = codeBlocks[i].innerText.replace("Copy code", "");
        }

        codeBlocks[i].classList.add("inline-flex", "max-w-full", "overflow-hidden", "rounded-sm", "cursor-pointer");

        codeBlocks[i].addEventListener('click', function (e) {
            e.preventDefault();
            vscode.postMessage({
                type: 'codeSelected',
                value: this.innerText
            });
        });

        const d = document.createElement('div');
        d.innerHTML = codeBlocks[i].innerHTML;
        codeBlocks[i].innerHTML = null;
        codeBlocks[i].appendChild(d);
        d.classList.add("code");
    }

    microlight.reset('code');
  }

  showWelcomeMessage();

  window.addEventListener('message', event => {
    const message = event.data;
    switch (message.type) {
      case 'restoreMessages':
        removeWelcomeMessage();
        message.messages.forEach(msg => {
          setResponse(msg.text, msg.sender);
        });
        break;
      case 'response':
        removeWelcomeMessage();
        removeLoader();
        setResponse(message.text);
        break;
      case 'query':
        removeWelcomeMessage();
        setResponse(message.text, 'user');
        showLoader();
        vscode.postMessage({
          type: 'query',
          text: message.text
        });
        input.value = '';
        break;
    }
});


  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const query = input.value.trim();
      if (query) {
        removeWelcomeMessage();
        appendMessageToChat('user', query); // Show user message in chat
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
