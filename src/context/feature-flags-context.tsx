import React, { createContext, useContext, useMemo } from 'react';
import { doc, DocumentData } from 'firebase/firestore';
import { useFirestore, useDoc } from "@/shims/firebase";

export interface FeatureFlags {
  videoCallsEnabled: boolean;
  aiIcebreakersEnabled: boolean;
  aiCompatibilityEnabled: boolean;
  groupsPageEnabled: boolean;
}

const defaultFlags: FeatureFlags = {
  videoCallsEnabled: true,
  aiIcebreakersEnabled: true,
  aiCompatibilityEnabled: true,
  groupsPageEnabled: true,
};

const FeatureFlagsContext = createContext<FeatureFlags>(defaultFlags);

export const FeatureFlagsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const firestore = useFirestore();
  const featureFlagsRef = useMemo(() => {
      if (!firestore) return null;
      return doc(firestore, 'config', 'features');
  }, [firestore]);
  
  const { data: flags, loading } = useDoc<DocumentData>(featureFlagsRef);

  const featureFlags = useMemo(() => {
    if (loading || !flags) {
      return defaultFlags;
    }
    return { ...defaultFlags, ...flags };
  }, [flags, loading]);

  return (
    <FeatureFlagsContext.Provider value={featureFlags}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};

export const useFeatureFlags = () => {
  return useContext(FeatureFlagsContext);
};
