<div align="center">
  <a href="https://github.com/Ashwin-Pulipati/arbiter">
    <img src="client/public/logo.png" alt="Logo" width="100" height="100">
  </a>

  <h3 align="center">Arbiter</h3>

  <p align="center">
    An open-source Agentic AI workspace that autonomously reasons, plans, and acts to help you manage and interact with your data.
    <br />
    <em>View Demo >></em>
  </p>
</div>

## 📝 About The Project

Arbiter is not just another application—it's an **agentic system**. Powered by Large Language Models (LLMs), Arbiter is designed to be a proactive, intelligent partner that goes beyond simple chat. It's a modern, full-stack application that can autonomously understand your goals, interact with different data sources like documents and movies, and execute tasks on your behalf.

This project leverages a robust backend and a sleek, component-based UI to create a seamless environment for both individual developers and teams looking to explore the power of agentic AI.

## ✨ Built With

Arbiter is built with a cutting-edge, modular tech stack designed for scalability, performance, and a best-in-class developer experience.

**AI & Orchestration:**
*   **[LangChain](https://www.langchain.com/) & [LangGraph](https://langchain-ai.github.io/langgraph/):** Core frameworks for building stateful, multi-actor applications with LLMs. LangGraph enables the creation of cyclical, agentic architectures.
*   **[OpenAI](https://platform.openai.com/):** Powers the reasoning and language understanding capabilities of the agent.

**Backend:**
*   **[Python](https://www.python.org/) & [Django](https://www.djangoproject.com/):** A robust and scalable foundation for the backend services.
*   **[Django Ninja](https://django-ninja.rest-framework.com/):** A fast, type-hinted API layer for seamless frontend-backend communication.
*   **[PostgreSQL](https://www.postgresql.org/):** Serves as the primary data store for application data and conversation history.

**Frontend:**
*   **[Next.js](https://next.js.org/) & [React](https://react.dev/):** For building a fast, modern, and server-driven user interface.
*   **[TypeScript](https://www.typescriptlang.org/):** Ensures type safety and improves code quality across the application.
*   **[Tailwind CSS](https://tailwindcss.com/) & [Shadcn/UI](https://ui.shadcn.com/):** For creating a beautiful, responsive, and accessible component-based UI.

**Authorization & Deployment:**
*   **[Permit.io](https://www.permit.io/):** Manages fine-grained, role-based access control (RBAC) to secure the application.
*   **[Vercel](https://vercel.com/):** For seamless deployment of the frontend application.

## ✅ Key Features

-   **Agentic AI Core:** Interact with an AI that can **reason, plan, and execute** tasks by using tools.
-   **Autonomous Tool Use:** The AI agent can autonomously decide which tools to use (e.g., document search, movie database query) to accomplish your goals.
-   **Multi-Tenant Architecture:** Securely isolates data and permissions for different users and organizations.
-   **Retrieval Augmented Generation (RAG):** The agent can search your private documents to provide context-aware, accurate answers.
-   **Fine-Grained Access Control:** Sophisticated, role-based permissions ensure that users and agents can only access authorized data.
-   **Interactive & Modern UI:** A sleek, responsive interface built for an intuitive user experience.

## 🏗️ System Architecture

Arbiter is built with a focus on a clean separation of concerns, security, and powerful AI orchestration. The system is divided into three main layers:

### 1. Frontend Application (Next.js)
-   **UI/UX:** Built with React, TypeScript, and Tailwind CSS, using Shadcn/UI for a highly responsive and accessible component-based user experience.
-   **API Communication:** Communicates with the backend via a RESTful API, with clear data contracts.
-   **User-Specific Views:** The UI dynamically adapts based on the authenticated user's role and permissions.

### 2. Backend Services (Django & Django Ninja)
-   **Business Logic:** The Django backend handles all core business logic, from data validation to user management.
-   **API Endpoints:** Django Ninja provides a fast, type-hinted API layer for the frontend to consume.
-   **Authorization:** Integrates with Permit.io to enforce policies, ensuring users can only access the data and perform the actions they are authorized for.

### 3. AI & Data Layer (LangChain, PostgreSQL)
-   **Agentic Engine:** At the heart of Arbiter is a sophisticated agent built with **LangGraph**. This allows for cyclical reasoning, where the agent can plan, execute, reflect, and re-plan, similar to a human thought process.
-   **Tool Integration:** The agent has access to a set of tools (e.g., `document_search`, `movie_lookup`) that it can call upon to gather information or perform actions.
-   **Persistence:** A PostgreSQL database stores all application data, including user information, documents, and the agent's conversation history, providing a stateful memory.

## ▶️ Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have Node.js, npm, and Python installed on your machine.
*   npm
    ```sh
    npm install npm@latest -g
    ```
*   Python & Pip
    ```sh
    # Ensure Python and pip are installed and available in your PATH
    ```

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/Ashwin-Pulipati/arbiter.git
    cd Arbiter
    ```
2.  **Set up Backend:**
    Navigate to the `server` directory, create a virtual environment, and install dependencies.
    ```sh
    cd server
    python -m venv venv
    # On Windows
    .\venv\Scripts\activate
    # On macOS/Linux
    source venv/bin/activate
    pip install -r requirements.txt
    ```
3.  **Set up Frontend:**
    Navigate to the `client` directory and install NPM packages.
    ```sh
    cd ../client
    npm install
    ```
4.  **Set up your environment variables:**
    You will need to create `.env` files in both the `client` and `server` directories. Refer to the respective configuration files for required variables (e.g., database connection strings, API keys for TMDB, OpenAI, and Permit.io).

5.  **Run database migrations (from the `server` directory):**
    ```sh
    python manage.py migrate
    ```
6.  **Run the development servers:**
    In two separate terminals, run the following commands:
    ```sh
    # In the /server directory
    python manage.py runserver
    ```
    ```sh
    # In the /client directory
    npm run dev
    ```
7.  Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See the `LICENSE` file for more information.

## 📧 Contact

Ashwin Pulipati - [LinkedIn](https://www.linkedin.com/in/ashwinpulipati/) - ashwinpulipati@gmail.com

Project Link: [https://github.com/Ashwin-Pulipati/arbiter](https://github.com/Ashwin-Pulipati/arbiter)