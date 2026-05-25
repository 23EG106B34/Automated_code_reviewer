import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  EmotionAnalysisResult,
  FatigueLevel,
  ReviewTone,
  TeamHealthSnapshot,
  TeamMember,
} from '@/types/emotion';

/**
 * Zustand store for Emotion & Team Dynamics Awareness.
 * Drives PR review tone, sidebar context, and reviewer selection UI.
 */
interface EmotionState {
  activeDeveloperId: string | null;
  activeTone: ReviewTone;
  currentFatigue: FatigueLevel;
  energyScore: number;
  teamMembers: TeamMember[];
  teamHealth: TeamHealthSnapshot | null;
  emotionByDeveloper: Record<string, EmotionAnalysisResult>;
  twinSummary: string | null;
  insights: string[];
  emotionSidebarOpen: boolean;
  selectedReviewerId: string | null;
  suggestedReviewers: TeamMember[];
  isAnalyzing: boolean;
}

interface EmotionActions {
  setActiveDeveloper: (id: string | null) => void;
  setActiveTone: (tone: ReviewTone) => void;
  setCurrentFatigue: (fatigue: FatigueLevel) => void;
  setEnergyScore: (score: number) => void;
  setTeamMembers: (members: TeamMember[]) => void;
  setTeamHealth: (health: TeamHealthSnapshot | null) => void;
  setEmotionForDeveloper: (id: string, emotion: EmotionAnalysisResult) => void;
  setTwinSummary: (summary: string | null) => void;
  setInsights: (insights: string[]) => void;
  setSuggestedReviewers: (reviewers: TeamMember[]) => void;
  toggleEmotionSidebar: () => void;
  setSelectedReviewer: (id: string | null) => void;
  setIsAnalyzing: (v: boolean) => void;
  /** Hydrate store from API analyze response */
  applyAnalysis: (author: TeamMember, reviewers: TeamMember[]) => void;
  hydrateFromMember: (member: TeamMember) => void;
  reset: () => void;
}

const initialState: EmotionState = {
  activeDeveloperId: null,
  activeTone: 'educational',
  currentFatigue: 'low',
  energyScore: 70,
  teamMembers: [],
  teamHealth: null,
  emotionByDeveloper: {},
  twinSummary: null,
  insights: [],
  emotionSidebarOpen: true,
  selectedReviewerId: null,
  suggestedReviewers: [],
  isAnalyzing: false,
};

export const useEmotionStore = create<EmotionState & EmotionActions>()(
  devtools(
    (set) => ({
      ...initialState,

      setActiveDeveloper: (id) => set({ activeDeveloperId: id }),
      setActiveTone: (tone) => set({ activeTone: tone }),
      setCurrentFatigue: (fatigue) => set({ currentFatigue: fatigue }),
      setEnergyScore: (score) => set({ energyScore: score }),
      setTeamMembers: (members) => set({ teamMembers: members }),
      setTeamHealth: (health) =>
        set({
          teamHealth: health,
          teamMembers: health?.members ?? [],
        }),
      setEmotionForDeveloper: (id, emotion) =>
        set((s) => ({
          emotionByDeveloper: { ...s.emotionByDeveloper, [id]: emotion },
        })),
      setTwinSummary: (summary) => set({ twinSummary: summary }),
      setInsights: (insights) => set({ insights }),
      setSuggestedReviewers: (reviewers) => set({ suggestedReviewers: reviewers }),
      toggleEmotionSidebar: () =>
        set((s) => ({ emotionSidebarOpen: !s.emotionSidebarOpen })),
      setSelectedReviewer: (id) => set({ selectedReviewerId: id }),
      setIsAnalyzing: (v) => set({ isAnalyzing: v }),

      applyAnalysis: (author, reviewers) =>
        set({
          activeDeveloperId: author.id,
          activeTone: author.emotion.recommendedTone,
          currentFatigue: author.emotion.fatigue,
          energyScore: author.emotion.energyScore,
          twinSummary: author.emotion.twinSummary,
          insights: author.emotion.insights,
          suggestedReviewers: reviewers,
          emotionByDeveloper: { [author.id]: author.emotion },
        }),

      hydrateFromMember: (member) =>
        set({
          activeDeveloperId: member.id,
          activeTone: member.emotion.recommendedTone,
          currentFatigue: member.emotion.fatigue,
          energyScore: member.emotion.energyScore,
          twinSummary: member.emotion.twinSummary,
          insights: member.emotion.insights,
          emotionByDeveloper: { [member.id]: member.emotion },
        }),

      reset: () => set(initialState),
    }),
    { name: 'useEmotionStore' }
  )
);
