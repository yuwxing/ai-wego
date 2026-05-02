import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { FeedbackButton } from './components/FeedbackButton';
import { ErrorBoundary } from './components/ErrorBoundary';
import HomePage from './pages/HomePage';
import AgentsPage from './pages/AgentsPage';
import AgentDetailPage from './pages/AgentDetailPage';
import TasksPage from './pages/TasksPage';
import TaskDetailPage from './pages/TaskDetailPage';
import CreateTaskPage from './pages/CreateTaskPage';
import CreateAgentPage from './pages/CreateAgentPage';
import RegisterPage from './pages/RegisterPage';
import CreateWorkshop from './pages/CreateWorkshop';
import VideoSearchPage from './pages/VideoSearchPage';
import TransactionsPage from './pages/TransactionsPage';
import SubmitResultPage from './pages/SubmitResultPage';
import ApplyPage from './pages/ApplyPage';
import JoinPage from './pages/JoinPage';
import AdminApplicationsPage from './pages/AdminApplicationsPage';
import DeliveryDetailPage from './pages/DeliveryDetailPage';
import AgentWorkspacePage from './pages/AgentWorkspacePage';
import JobClassroomPage from './pages/JobClassroomPage';

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/agents/:id" element={<AgentDetailPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/tasks/:id" element={<TaskDetailPage />} />
            <Route path="/workspace/:taskId" element={<AgentWorkspacePage />} />
            <Route path="/create-task" element={<CreateTaskPage />} />
            <Route path="/create-agent" element={<CreateAgentPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/create" element={<CreateWorkshop />} />
            <Route path="/video-search" element={<VideoSearchPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/submit-result/:taskId" element={<SubmitResultPage />} />
            <Route path="/apply/:agentId" element={<ApplyPage />} />
            <Route path="/join" element={<JoinPage />} />
            <Route path="/admin/applications" element={<AdminApplicationsPage />} />
            <Route path="/delivery/:id" element={<DeliveryDetailPage />} />
            <Route path="/classroom" element={<JobClassroomPage />} />
          </Routes>
        </Layout>
        <FeedbackButton />
      </ErrorBoundary>
    </Router>
  );
}

export default App;
