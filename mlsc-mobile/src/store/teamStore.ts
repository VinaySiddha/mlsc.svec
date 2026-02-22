import { create } from 'zustand';
import { db } from '../services/firebase';
import { collection, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { TeamMember, TeamCategory } from '../types';

interface TeamState {
  teamMembers: TeamMember[];
  categories: TeamCategory[];
  isLoading: boolean;
  error: string | null;

  // Actions
  subscribeToTeamMembers: () => () => void;
  fetchCategories: () => Promise<void>;
}

export const useTeamStore = create<TeamState>((set, get) => ({
  teamMembers: [],
  categories: [],
  isLoading: false,
  error: null,

  subscribeToTeamMembers: () => {
    set({ isLoading: true, error: null });

    const membersRef = collection(db, 'teamMembers');
    // Only fetch active members
    const q = query(membersRef, where('status', '==', 'active'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const membersList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as TeamMember[];

        set({ teamMembers: membersList, isLoading: false, error: null });
      },
      (error) => {
        console.error('Error fetching team members:', error);
        set({ error: error.message, isLoading: false });
      }
    );

    return unsubscribe;
  },

  fetchCategories: async () => {
    try {
      const categoriesRef = collection(db, 'teamCategories');
      const q = query(categoriesRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);

      const categoriesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TeamCategory[];

      set({ categories: categoriesList });
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  },
}));
