import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { Footer } from './components/layout/Footer.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { HomeView } from './views/HomeView.tsx';
import { CircuitsLabView } from './views/CircuitsLabView.tsx';
import { PowerSupplyView } from './views/PowerSupplyView.tsx';
import { ElectronicsLabView } from './views/ElectronicsLabView.tsx';
import { DigitalLogicLabView } from './views/DigitalLogicLabView.tsx';
import { ArduinoLabView } from './views/ArduinoLabView.tsx';
import { RoboticsLabView } from './views/RoboticsLabView.tsx';
import { ControlSystemsLabView } from './views/ControlSystemsLabView.tsx';
import { ExperimentsView } from './views/ExperimentsView.tsx';
import { CalculatorsView } from './views/CalculatorsView.tsx';
import { AiAssistantView } from './views/AiAssistantView.tsx';
import { OwnerDashboardView } from './views/OwnerDashboardView.tsx';
import { ProfileView } from './views/ProfileView.tsx';
import { TrainingBoardView } from './views/TrainingBoardView.tsx';
import { ElectronicsBoxView } from './views/ElectronicsBoxView.tsx';
import { UniversityProjectsView } from './views/UniversityProjectsView.tsx';
import { LessonsView } from './views/LessonsView.tsx';
import { SubscriptionGate } from './components/auth/SubscriptionGate.tsx';

const MainContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'activate'>('login');
  const { user, isOwner, hasActiveSubscription } = useAuth();

  const handleOpenAuth = (mode: 'login' | 'register' | 'activate' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  // If unauthorized user tries to view owner dashboard, fall back to home
  const effectiveTab = currentTab === 'owner' && !isOwner ? 'home' : currentTab;

  // Strict Access Rule: Student CANNOT enter ANY lab or use ANY service without registering and entering activation code!
  const isLabOrService = [
    'uniprojects',
    'trainingboard',
    'electronicsbox',
    'circuits',
    'powersupply',
    'electronics',
    'digital',
    'arduino',
    'robotics',
    'control',
    'lessons',
    'experiments',
    'calculators',
    'ai',
  ].includes(effectiveTab);

  const isAccessBlocked = isLabOrService && !hasActiveSubscription;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-sky-500 selection:text-white antialiased">
      <Navbar
        currentTab={effectiveTab}
        setCurrentTab={setCurrentTab}
        onOpenAuth={handleOpenAuth}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {isAccessBlocked ? (
          <SubscriptionGate
            targetTab={effectiveTab}
            onOpenAuth={handleOpenAuth}
            onGoHome={() => setCurrentTab('home')}
          />
        ) : (
          <>
            {effectiveTab === 'home' && (
              <HomeView setCurrentTab={setCurrentTab} onOpenAuth={handleOpenAuth} />
            )}
            {effectiveTab === 'uniprojects' && (
              <UniversityProjectsView
                onOpenTrainingBoard={() => setCurrentTab('trainingboard')}
                onOpenElectronicsBox={() => setCurrentTab('electronicsbox')}
              />
            )}
            {effectiveTab === 'trainingboard' && <TrainingBoardView />}
            {effectiveTab === 'electronicsbox' && <ElectronicsBoxView />}
            {effectiveTab === 'circuits' && <CircuitsLabView />}
            {effectiveTab === 'powersupply' && <PowerSupplyView />}
            {effectiveTab === 'electronics' && <ElectronicsLabView />}
            {effectiveTab === 'digital' && <DigitalLogicLabView />}
            {effectiveTab === 'arduino' && <ArduinoLabView />}
            {effectiveTab === 'robotics' && <RoboticsLabView />}
            {effectiveTab === 'control' && <ControlSystemsLabView />}
            {effectiveTab === 'lessons' && (
              <LessonsView onOpenOwnerDashboard={() => setCurrentTab('owner')} />
            )}
            {effectiveTab === 'experiments' && <ExperimentsView onLaunchLab={setCurrentTab} />}
            {effectiveTab === 'calculators' && <CalculatorsView />}
            {effectiveTab === 'ai' && <AiAssistantView />}
            {effectiveTab === 'owner' && isOwner && <OwnerDashboardView />}
            {effectiveTab === 'profile' && <ProfileView />}
          </>
        )}
      </main>

      <Footer setCurrentTab={setCurrentTab} onOpenAuth={handleOpenAuth} />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
