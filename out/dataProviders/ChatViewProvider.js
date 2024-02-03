"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatViewProvider = void 0;
const vscode = __importStar(require("vscode"));
const openai_1 = __importDefault(require("openai"));
class ChatViewProvider {
    _extensionUri;
    static viewType = "chatView";
    _view;
    openai;
    showWelcomeMessage = true;
    threadId = null;
    context;
    constructor(_extensionUri, context) {
        this._extensionUri = _extensionUri;
        this.context = context;
        this.openai = new openai_1.default({
            apiKey: vscode.workspace.getConfiguration().get("StylusGPT.apiKey"),
        });
        this.initializeAssistant().then(() => this.initializeThread());
    }
    async initializeAssistant() {
        let assistantId = this.context.globalState.get("assistantId");
        if (!assistantId) {
            try {
                const assistant = await this.openai.beta.assistants.create({
                    name: "Stylus GPT",
                    instructions: "I am working on a project that involves developing a Stylus application on the Arbitrum Blockchain and require specialized assistance. My request is for detailed guidance, including step-by-step instructions and code examples, specifically tailored for Stylus development. It is crucial that before providing any solutions or advice, you review the uploaded files and reference the links I've provided, as they contain key information and resources for my project. Here's what I need help with:\n\n- Detailed guidance on setting up and configuring the development environment for a Stylus application on Arbitrum.\n- Assistance with integrating and utilizing the Stylus SDK in my project, with a focus on practical code examples.\n- Strategies for effectively deploying, testing, and troubleshooting the application on the Arbitrum Blockchain.\n\nPlease ensure that your responses are informed by the contents of the uploaded files, particularly those starting with 'cargoStylus', and the information within the 'stylus-sdk-rs-stylus.zip' file. Additionally, the Stylus SDK Crate Docs (https://docs.rs/stylus-sdk/latest/stylus_sdk/) and Stylus Docs (https://docs.arbitrum.io/stylus/stylus-gentle-introduction) are essential resources for this project.\n\nNote that terms like 'export-abi', 'deploy', 'replay', 'trace', and 'check' are specific to 'cargo stylus' commands and are relevant to my queries. Your responses should reflect an understanding of these terms and their application in the context of Stylus and Arbitrum Blockchain development.\n\nI am open to further clarifications or requests for specific code snippets. Your comprehensive understanding of the provided materials will greatly enhance the quality of assistance.",
                    tools: [{ type: "code_interpreter" }],
                    model: "gpt-3.5-turbo",
                });
                assistantId = assistant.id;
                await this.context.globalState.update("assistantId", assistantId);
                console.log("Initialized new assistant", assistant);
            }
            catch (error) {
                vscode.window.showErrorMessage(`Error initializing assistant: ${error}`);
            }
        }
        else {
            console.log("Using existing assistant ID", assistantId);
        }
    }
    async initializeThread() {
        // Attempt to retrieve existing threadId from global state
        const threadId = this.context.globalState.get("threadId");
        if (threadId) {
            try {
                await this.openai.beta.threads.retrieve(threadId);
                console.log("Using existing thread", threadId);
                this.threadId = threadId;
            }
            catch (error) {
                console.log("Error retrieving thread, initializing a new one", error);
                await this.createThread();
            }
        }
        else {
            await this.createThread();
        }
    }
    async createThread() {
        try {
            const thread = await this.openai.beta.threads.create();
            this.threadId = thread.id;
            await this.context.globalState.update("threadId", this.threadId); // Save new threadId to global state
            console.log("Initialized new thread and saved thread ID", this.threadId);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error initializing thread: ${error}`);
        }
    }
    async handleQuery(query) {
        const assistantId = this.context.globalState.get("assistantId");
        if (!this.threadId || !assistantId) {
            vscode.window.showErrorMessage("Assistant or Thread not initialized");
            return;
        }
        try {
            console.log("Sending query to OpenAI", query);
            console.log("Thread ID", this.threadId);
            // Send the user query to the thread
            const message = await this.openai.beta.threads.messages.create(this.threadId, {
                role: "user",
                content: query,
            });
            console.log("Message added", message);
            // Create a run to process the query and get a response
            const run = await this.openai.beta.threads.runs.create(this.threadId, {
                assistant_id: assistantId,
            });
            console.log("Run created", run);
            function delay(ms) {
                return new Promise((resolve) => setTimeout(resolve, ms));
            }
            // Poll for the run status until it's completed
            let status = run.status;
            while (status !== "completed") {
                const newrun = await this.openai.beta.threads.runs.retrieve(run.thread_id, run.id);
                await delay(2000);
                status = newrun.status;
            }
            console.log("Run completed");
            const messagesResponse = await this.openai.beta.threads.messages.list(this.threadId);
            console.log("Messages retrieved", messagesResponse.data);
            if (messagesResponse.data.length > 0) {
                // Get the first message from the response
                const firstMessage = messagesResponse.data[0];
                // Extract the text content from the first message
                const firstMessageText = firstMessage.content
                    .map((contentItem) => {
                    if ("text" in contentItem && contentItem.type === "text") {
                        return contentItem.text.value;
                    }
                    return "";
                })
                    .join("\n");
                // Create a message response with the first message
                console.log("First message text", firstMessageText);
                // Send the message response to the webview
                this._view?.webview.postMessage({
                    type: "response",
                    text: firstMessageText,
                });
            }
            else {
                console.log("No messages to display");
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error communicating with OpenAI: ${error}`);
        }
    }
    async resolveWebviewView(webviewView, context, token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
        };
        webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);
        if (this.showWelcomeMessage) {
            webviewView.webview.postMessage({ type: "welcome" });
        }
        webviewView.webview.onDidReceiveMessage(async (data) => {
            console.log("Received message from webview", data);
            switch (data.type) {
                case "query":
                    await this.handleQuery(data.text);
                    break;
            }
        });
    }
    getHtmlForWebview(webview) {
        const scriptSource = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "src", "scripts", "main.js"));
        const tailwindSource = "https://cdn.tailwindcss.com";
        return `<!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.0.0-beta.1/dist/tailwind.min.css" rel="stylesheet">
                <style>
                  body, html {
                    height: 100%;
                    margin: 0;
                    padding: 0;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  }
                  #chat-container {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                  }
                  #chat {
                    flex-grow: 1;
                    overflow-y: auto;
                    padding: 10px;
                    margin-bottom: 44px;
                  }
                  .input-bar {
                    position: fixed;
                    bottom: 0;
                    left: 0; 
                    width: 100%; 
                    padding: 12px 8px;
                  }
                  .input-bar input {
                    width: calc(100% - 34px); 
                    padding: 10px;
                    border-radius: 20px;
                    border: none;
                    font-size: 16px;
                    color: #fff;
                    background-color: #7f8c8d; 
                  }
                  .message {
                    display: flex;
                    align-items: center;
                    margin: 5px;
                    padding: 10px;
                    border-radius: 18px;
                    color: white;
                    font-size: 0.9rem;
                  }
                  .user {
                    align-self: flex-end;
                    background-color: #0984e3; /* Blue for user */
                  }
                  .assistant {
                    align-self: flex-start;
                    background-color: #636e72; /* Gray for AI */
                  }
                  .icon {
                    width: 20px;
                    height: 20px;
                    margin-right: 8px;
                  }
                  .loader {
                    border: 4px solid #f3f3f3; /* Light grey */
                    border-top: 4px solid #3498db; /* Blue */
                    border-radius: 50%;
                    width: 12px;
                    height: 12px;
                    animation: spin 2s linear infinite;
                    margin-left: auto;
                    margin-right: auto;
                  }
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                </style>
              </head>
              <body>
                <div id="chat-container">
                  <div id="chat" class="chat">
                    <!-- Messages will be dynamically inserted here -->
                  </div>
                  <div class="input-bar">
                    <input type="text" id="prompt-input" placeholder="Ask Copilot or type / for commands" />
                  </div>
                </div>
              
                <!-- Include your script source here -->
                <script src="${scriptSource}"></script>
              </body>
            </html>        
        `;
    }
}
exports.ChatViewProvider = ChatViewProvider;
//# sourceMappingURL=ChatViewProvider.js.map