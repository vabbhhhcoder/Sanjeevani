import { AnimatePresence, motion } from 'framer-motion';
import { StoreProvider, useStore } from '@/lib/store';
import { Shell } from '@/components/Shell';
import { Decoy } from '@/components/Decoy';
import { ConsentBanner } from '@/components/Consent';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SurvivorPortal } from '@/portals/Survivor';
import { CounselorConsole } from '@/portals/Counselor';
import { NodalDashboard } from '@/portals/Nodal';

function Router() {
  const { role, stealth, consent } = useStore();
  if (stealth) return <Decoy />;
  return (
    <>
      <AnimatePresence>{!consent && <ConsentBanner key="consent" />}</AnimatePresence>
      <Shell>
        <ErrorBoundary label="Portal">
          <motion.div aria-hidden={!consent} className={!consent ? 'pointer-events-none select-none blur-sm' : ''}>
            {role === 'survivor' && <SurvivorPortal />}
            {role === 'counselor' && <CounselorConsole />}
            {role === 'nodal' && <NodalDashboard />}
          </motion.div>
        </ErrorBoundary>
      </Shell>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary label="Application">
      <StoreProvider><Router /></StoreProvider>
    </ErrorBoundary>
  );
}
