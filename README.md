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

#### Stylus GPT Support

The Stylus Extension for VS Code also supports the Stylus GPT, a powerful AI-based code generation tool that can help you write smart contracts and other Rust code more efficiently. With Stylus GPT, you can generate code snippets, complete functions, and even entire contracts using natural language descriptions and prompts. This feature is powered by the OpenAI API and requires an API key to use.

P.S: Stylus GPT works well with Cargo Stylus questions because for version 0.1.2, it only trained on Cargo Stylus. It will be improved in the future with more general Stylus and Arbitrum logic.

## Requirements

This extension requires Visual Studio Code. Additionally, having the Rust and Cargo installed and configured on your system is necessary for Stylus project development.

- [Stylus CLI](https://docs.arbitrum.io/stylus/stylus-quickstart#creating-a-stylus-project) - The Stylus CLI is required for project management and contract handling.
- [Open AI API Key (Optional)](https://help.openai.com/en/articles/4936850-where-do-i-find-my-api-key) - An Open AI API key is required for using Stylus GPT.

## Extension Settings

* `StylusGPT.apiKey`: Open AI API key for using Stylus GPT. (You can set this by opening the command palette and click "Preferences: User Settings (UI) after that search Stylus GPT and set the API key.)

## Known Issues

No known issues at this time. If you encounter any problems, please report them using the issue template provided.

## Release Notes

### 0.1.2

Initial release of the Stylus Extension for VS Code.

- Project management features.
- Contract handling features.
- Snippets and templates for smart contract development.
- Stylus GPT support.

---

**Enjoy!**
