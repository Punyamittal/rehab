"use client";

import { create } from "zustand";
import { fetchCatalog } from "@/lib/api/rehab-api";
import type { BranchingStory, GameDefinition, LearningModule } from "@/types";

interface CatalogState {
  modules: LearningModule[];
  games: GameDefinition[];
  stories: BranchingStory[];
  isLoading: boolean;
  error: string | null;
  isReady: boolean;
  loadCatalog: () => Promise<void>;
  getModuleBySlug: (slug: string) => LearningModule | undefined;
  getModuleById: (id: string) => LearningModule | undefined;
  getGameBySlug: (slug: string) => GameDefinition | undefined;
  getGameById: (id: string) => GameDefinition | undefined;
  getStoryBySlug: (slug: string) => BranchingStory | undefined;
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  modules: [],
  games: [],
  stories: [],
  isLoading: false,
  error: null,
  isReady: false,

  loadCatalog: async () => {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const { modules, games, stories } = await fetchCatalog();
      set({ modules, games, stories, isReady: true, isLoading: false });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Failed to load content",
        isLoading: false,
      });
    }
  },

  getModuleBySlug: (slug) => get().modules.find((m) => m.slug === slug),

  getModuleById: (id) =>
    get().modules.find((m) => m.id === id || m.slug === id),

  getGameBySlug: (slug) =>
    get().games.find((g) => g.slug === slug || g.id === slug),

  getGameById: (id) => get().games.find((g) => g.id === id || g.slug === id),

  getStoryBySlug: (slug) => get().stories.find((s) => s.slug === slug),
}));
