import { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import type { PublicUser } from '@elitequest/shared';
import { getCurrentUser, logoutUser } from './api/auth.js';
import HomePage from './pages/HomePage.js';
import LoginPage from './pages/LoginPage.js';
import DashboardPage from './pages/DashboardPage.js';
import ClassDetailPage from './pages/ClassDetailPage.js';
import QuizzesPage from './pages/QuizzesPage.js';
import QuizEditPage from './pages/QuizEditPage.js';
import LiveDisplayPage from './pages/LiveDisplayPage.js';
import PlayPage from './pages/PlayPage.js';
import CampaignDetailPage from './pages/CampaignDetailPage.js';
import CampaignResultsPage from './pages/CampaignResultsPage.js';
import QuizResultsPage from './pages/QuizResultsPage.js';
import GamesPage from './pages/GamesPage.js';
import GamePlayPage from './pages/GamePlayPage.js';
import QuizRunPage from './pages/QuizRunPage.js';
import AdminUsersPage from './pages/AdminUsersPage.js';
import AdminSettingsPage from './pages/AdminSettingsPage.js';
import AiGeneratePage from './pages/AiGeneratePage.js';
import BanksPage from './pages/BanksPage.js';
import BankDetailPage from './pages/BankDetailPage.js';
import Logo from './components/Logo.js';
import SplashModal from './components/SplashModal.js';

export default function App(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [splashOpen, setSplashOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser().then((current) => {
      if (!cancelled) setUser(current);
    });
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  async function handleLogout() {
    await logoutUser();
    setUser(null);
    navigate('/');
  }

  function openSplash(event: React.MouseEvent) {
    event.preventDefault();
    setSplashOpen(true);
  }

  const isLecturer = user?.role === 'lecturer';

  return (
    <div className="app">
      <header className="app-header">
        <Link
          to={user ? (isLecturer ? '/dashboard' : '/play') : '/'}
          className="app-brand"
          onClick={openSplash}
        >
          <Logo size="header" />
          <span className="app-brand-text">ELITEQuest</span>
        </Link>
        {user && (
          <nav className="app-nav">
            {isLecturer ? (
              <Link to="/dashboard" className="button">
                Dashboard
              </Link>
            ) : (
              <Link to="/play" className="button">
                My Quizzes
              </Link>
            )}
            <button onClick={handleLogout}>Logout</button>
          </nav>
        )}
      </header>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage onLogoClick={openSplash} />} />
          <Route path="/dashboard" element={<DashboardPage user={user} />} />
          <Route path="/classes/:id" element={<ClassDetailPage user={user} />} />
          <Route path="/quizzes" element={<QuizzesPage />} />
          <Route path="/quizzes/:id/edit" element={<QuizEditPage />} />
          <Route path="/quizzes/:id/live" element={<LiveDisplayPage />} />
          <Route path="/quizzes/:id/run" element={<QuizRunPage />} />
          <Route path="/quizzes/:id/results" element={<QuizResultsPage />} />
          <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
          <Route path="/campaigns/:id/results" element={<CampaignResultsPage />} />
          <Route path="/classes/:id/games" element={<GamesPage />} />
          <Route path="/games/:id" element={<GamePlayPage />} />
          <Route path="/play" element={<PlayPage />} />
          <Route path="/users" element={<AdminUsersPage />} />
          <Route path="/settings" element={<AdminSettingsPage />} />
          <Route path="/generate" element={<AiGeneratePage />} />
          <Route path="/banks" element={<BanksPage />} />
          <Route path="/banks/:id" element={<BankDetailPage />} />
        </Routes>
      </main>
      <SplashModal isOpen={splashOpen} onClose={() => setSplashOpen(false)} />
    </div>
  );
}
