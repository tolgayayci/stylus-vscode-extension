# Stylus Extension for VS Code

This extension provides comprehensive support for Stylus projects, including project management, contract handling, and useful code snippets for rapid smart contract development.

## Features

#### Projects Management

- **List Stylus Projects:** Easily view all your Stylus projects in one place.
- **Remove Stylus Projects:** Clean up your workspace by removing projects you no longer need.
- **Create a New Stylus Project:** Start a new project using `cargo stylus` directly within VS Code.
- **Add Existing Stylus Project:** Import and manage your existing Stylus projects.

#### Contract Handling

Provides user-friendly interfaces for all contract functions with custom parameters, supported by the Stylus Cargo. Functions include:

- **export-abi:** Export the Application Binary Interface (ABI).
- **check:** Validate contracts for errors or issues.
- **deploy:** Deploy contracts to the blockchain.
- **replay:** Test contract execution in a simulated environment.
- **trace:** Analyze contract execution paths for optimization or debugging.

All contract interactions can be initiated by right-clicking on projects or via the VS Code command palette. Users can fill parameters one by one in order or from a JSON file for everyday use.

#### Macro Insertions and Predefined Templates (Snippets)

Quickly insert common code patterns and structures into your Stylus projects with predefined snippets and templates.

- **ERC20 Smart Contract Example** (`erc20_example`): Template for creating an ERC20 token contract.
- **ERC721 Smart Contract Example** (`erc721_smart_contract`): Template for implementing an ERC721 NFT contract.
- **Ed25519 Signature Verification Example** (`ed25519_verify`): Snippet for verifying Ed25519 signatures.
- **Rust Smart Contract Storage Definitions** (`solidity_storage`): Define contract storage structures.
- **Solidity-Like Storage Definitions** (`sol_storage`): Utilize Solidity-like storage definitions in Rust.
- **Reading and Writing Storage** (`sol_storage_read_and_write`): Access and modify contract storage.
- **Collections** (`sol_storage_collections`): Operations on storage collections.
- **Erase and #[derive(Erase)]** (`erase`): Erase storage values.
- **Storage Cache** (`storage_cache`): Custom storage caching with StorageCache.
- **Immutables and PhantomData** (`immutables`): Using Immutables and PhantomData in contract development.

Each snippet is designed to expedite the development process by providing ready-to-use code templates for common smart contract patterns and functionalities. These snippets support various aspects of smart contract development, from creating and managing token contracts to handling complex data structures and optimizing storage interactions.


> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

This extension requires Visual Studio Code. Additionally, having the Rust and Cargo installed and configured on your system is necessary for Stylus project development.

- [Visual Studio Code](https://code.visualstudio.com/)
- [Stylus CLI]() - The Stylus CLI is required for project management and contract handling.
- [Open AI API Key (optional)]() - An Open AI API key is required for using Stylus GPT.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something.

## Known Issues

No known issues at this time. If you encounter any problems, please report them using the issue template provided.

## Release Notes

### 0.1.0

Initial release of ...

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
