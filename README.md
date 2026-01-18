<div align="center">
  <a href="https://github.com/Ashwin-Pulipati/arbiter">
    <img src="client/public/logo.png" alt="Logo" width="100" height="100">
  </a>

  <h3 align="center">Arbiter</h3>

  <p align="center">
    An intelligent, multi-tenant application for seamless interaction with documents, movies, and AI-powered chat.
    <br />
    <em>(Demo link not available yet)</em>
  </p>
</div>

## 📝 About The Project

Arbiter is a modern, full-stack application designed to serve as a centralized hub for managing and interacting with various data sources. It features distinct, permission-controlled modules for document management, movie discovery, and a sophisticated chat interface powered by large language models. Built with a robust backend and a sleek, component-based UI, Arbiter is perfect for teams and individuals looking for a powerful and organized data interaction tool.

## ⚙️ Built With

This project is built with a modern tech stack that ensures scalability, type safety, and a great developer experience.

*   **Frontend Framework:** [Next.js](https://nextjs.org/)
*   **Backend Framework:** [Django](https://www.djangoproject.com/)
*   **API Layer:** [Django Ninja](https://django-ninja.rest-framework.com/)
*   **Database:** [PostgreSQL](https://www.postgresql.org/)
*   **AI Orchestration:** [LangChain](https://www.langchain.com/) & [LangGraph](https://langchain-ai.github.io/langgraph/)
*   **AI Models:** [OpenAI](https://platform.openai.com/)
*   **Authorization:** [Permit.io](https://www.permit.io/)
*   **UI:** [Tailwind CSS](https://tailwindcss.com/) & [Shadcn/UI](https://ui.shadcn.com/)
*   **Deployment:** Vercel (Frontend), TBD (Backend)

## ✅ Key Features

- **Multi-Tenant Architecture:** Securely separate data and access for different users and teams.
- **AI-Powered Chat:** Interact with an intelligent agent that can access and reason about your data.
- **Document Management:** Full CRUD functionality for documents with role-based access control (admins vs. users).
- **Movie Discovery:** Search for movies and view details from The Movie Database (TMDB).
- **Secure Authorization:** Fine-grained permissions managed by Permit.io.
- **Interactive UI:** A rich, responsive interface built with a modern component library.

## 🏗️ System Architecture

Arbiter is built with a focus on a clean separation of concerns, security, and powerful AI orchestration. The system is divided into three main layers:

### 1. Frontend Application (Next.js)
- **UI/UX:** Built with React, TypeScript, and Tailwind CSS, using Shadcn/UI for a highly responsive and accessible component-based user experience.
- **API Communication:** Communicates with the backend via a RESTful API, with clear data contracts.
- **User-Specific Views:** The UI dynamically adapts based on the authenticated user's role and permissions.

### 2. Backend Services (Django & Django Ninja)
- **Business Logic:** The Django backend handles all core business logic, from data validation to user management.
- **API Endpoints:** Django Ninja provides a fast, type-hinted API layer for the frontend to consume.
- **Authorization:** Integrates with Permit.io to enforce policies, ensuring users can only access the data and perform the actions they are authorized for.

### 3. AI & Data Layer (LangChain, PostgreSQL)
- **AI Orchestration:** LangChain and LangGraph are used to build and manage the AI agent, allowing it to interact with tools (like document retrieval or movie search) and maintain conversation history.
- **Persistence:** A PostgreSQL database stores all application data, including user information, documents, and chat history.

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
