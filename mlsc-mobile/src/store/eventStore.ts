import { create } from 'zustand';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { Event } from '../types';

interface EventState {
  events: Event[];
  isLoading: boolean;
  error: string | null;

  // Actions
  subscribeToEvents: () => () => void;
  getEventById: (eventId: string) => Promise<Event | null>;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  isLoading: false,
  error: null,

  subscribeToEvents: () => {
    set({ isLoading: true, error: null });

    const eventsRef = collection(db, 'events');
    const q = query(eventsRef, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const eventsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Event[];

        set({ events: eventsList, isLoading: false, error: null });
      },
      (error) => {
        console.error('Error fetching events:', error);
        set({ error: error.message, isLoading: false });
      }
    );

    return unsubscribe;
  },

  getEventById: async (eventId: string) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      const eventSnap = await getDoc(eventRef);

      if (eventSnap.exists()) {
        return {
          id: eventSnap.id,
          ...eventSnap.data(),
        } as Event;
      }
      return null;
    } catch (error) {
      console.error('Error fetching event:', error);
      return null;
    }
  },
}));
