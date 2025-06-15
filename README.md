
# AI-Powered Mind Map Generator

This is an interactive mind mapping tool that leverages AI to automatically generate, visualize, and organize ideas from various sources. It's designed to help users quickly brainstorm and structure information from documents, text, or simple topics.

## ✨ Features

- **Interactive Mind Map Interface**: A smooth, pannable, and zoomable canvas to view and organize your mind map.
- **AI-Powered Generation**:
  - **Import from PDF**: Upload a PDF file and have the AI generate a structured mind map from its content.
  - **Import from Text/Markdown**: Generate a mind map directly from `.txt` or `.md` files.
- **File Management**:
  - **Export to JSON**: Save your mind map structure as a JSON file.
  - **Import from JSON**: Load a previously exported mind map back into the application.
- **Secure API Key Handling**: Your Google AI API key is encrypted and stored securely in your browser's local storage.
- **Modern Tech Stack**: Built with React, Vite, TypeScript, and Tailwind CSS for a fast and responsive user experience.

## 🚀 How to Use

1.  **Set Your API Key**: Click the **Settings** icon (⚙️) in the "AI Assistant" card, enter your Google AI API key, and save it. This is required for all AI-powered features.
2.  **Generate a Mind Map**:
    - Use the "Import from PDF", "Import from Text", or "Import from Markdown" buttons to upload a file.
    - The AI will process the content and generate a mind map on the canvas.
3.  **Manage Your Mind Map**:
    - Use the "Export JSON" button to save your work.
    - Use the "Import JSON" button to load a saved mind map.

## 🛠️ How to Edit This Code

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/a7a1ee3b-e9ea-4bd6-bd9f-c0aa78983493) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## 💻 Technologies Used

This project is built with:

- Vite
- TypeScript
- React
- shadcn/ui
- Tailwind CSS
- React Flow for the mind map interface
- Google Gemini for AI features

