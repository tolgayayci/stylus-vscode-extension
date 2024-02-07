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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatViewProvider = void 0;
const vscode = __importStar(require("vscode"));
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
        // this.openai = new OpenAI({
        //   apiKey: vscode.workspace.getConfiguration().get("StylusGPT.apiKey"),
        // });
        // this.initializeAssistant().then(() => this.initializeThread());
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
            try {
                const myAssistant = await this.openai.beta.assistants.retrieve(assistantId);
                if (myAssistant.id) {
                    console.log("Assistant retrieved", myAssistant);
                }
            }
            catch (error) {
                console.log("Error retrieving assistant, creating a new one", error);
                this.context.globalState.update("assistantId", null);
                await this.initializeAssistant();
            }
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
    handleSelectedText(action, selectedText) {
        if (this._view) {
            // If the webview is already created, reveal (focus) it
            this._view.show(true); // `true` to give it focus
            // Format the selected text as a Markdown code block
            const codeBlock = `\`\`\`\n${selectedText}\n\`\`\``;
            let prompt = "";
            // Determine the prompt based on the action
            switch (action) {
                case "Explain":
                    prompt = "Please explain the following code:\n";
                    break;
                case "Refactor":
                    prompt =
                        "Please refactor the following code for better readability and efficiency:\n";
                    break;
                case "FindProblems":
                    prompt =
                        "Please identify any problems or errors in the following code:\n";
                    break;
                default:
                    console.warn("Unknown action.");
                    return;
            }
            // Combine the prompt with the code block
            const query = `${prompt}${codeBlock}`;
            this._view?.webview.postMessage({
                type: "query",
                text: query,
            });
        }
        else {
            console.warn("Webview is not initialized.");
            // Here, you may choose to initialize the webview if necessary
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
                console.log("Run status", newrun.status);
                status = newrun.status;
                if (status === "failed") {
                    this._view?.webview.postMessage({
                        type: "response",
                        text: "There is an error while retrieving response. Please try again later.",
                    });
                    break;
                }
            }
            if (status === "completed") {
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
            }
            else if (status === "failed") {
                vscode.window.showErrorMessage("The process has failed. Please try again later.");
            }
            else {
                console.log("Unknown error occurred");
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
        const tailwindSource = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "src", "scripts", "helper", "tailwind.min.js"));
        const showdownSource = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "src", "scripts", "helper", "showdown.min.js"));
        const microlightSource = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "src", "scripts", "helper", "microlight.min.js"));
        return `<!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="${tailwindSource}"></script>
                <script src="${showdownSource}"></script>
                <script src="${microlightSource}"></script>
                <style>
                  body, html {
                    height: 100%;
                    margin: 0;
                    padding: 0;
                    font-family: -apple-system,BlinkMacSystemFont,sans-serif;
                  }
                  #chat {
                    flex-grow: 1;
                    overflow-y: auto;
                    margin-bottom: 44px;
                  }
                  .message {
                    align-items: center;
                    padding-bottom: 12px;
                    border-bottom: 1px solid var(--vscode-chat-requestBorder);
                    padding: 20px;
                    font-family: -apple-system,BlinkMacSystemFont,sans-serif;
                  }
                  .user {
                    align-self: flex-end;
                  }
                  .assistant {
                    align-self: flex-start;
                  }
                  .icon {
                    width: 20px;
                    height: 20px;
                    margin-right: 8px;
                  }
                  .loader {
                    margin-top: 12px;
                    border: 4px solid #f3f3f3; /* Light grey */
                    border-top: 4px solid #3498db; /* Blue */
                    border-radius: 50%;
                    width: 12px;
                    height: 12px;
                    animation: spin 2s linear infinite;
                    margin-left: auto;
                    margin-right: auto;
                  }
                  .message-header {
                    display: flex;
                    align-items: center;
                    font-weight: bold;
                  }
                  .icon-text {
                    margin-bottom: 8px;
                  }
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                </style>
              </head>
              <body>
                <div class="flex flex-col h-screen">
                  <div id="chat" class="flex-1 overflow-y-auto">
                    <!-- Chat messages go here -->
                  </div>
                  <div class="fixed bottom-0 w-full">
                    <input class="h-10 w-full text-white p-4 text-sm" placeholder="Ask Stylus GPT something" type="text" id="prompt-input" />
                  </div>
                </div>            
                <script src="${scriptSource}"></script>
              </body>
            </html>        
        `;
    }
}
exports.ChatViewProvider = ChatViewProvider;
//# sourceMappingURL=ChatViewProvider.js.map