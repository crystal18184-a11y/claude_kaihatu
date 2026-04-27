import { create } from "zustand";
import { persist } from "zustand/middleware";

interface StoreState {
  receipts: any[];
  budgets: any[];
  knownStores: any[];
  fixedCosts: any[];
  addReceipt: (receipt: any) => void;
  deleteReceipt: (id: string) => void;
  updateReceipt: (id: string, updates: any) => void;
  updateItem: (receiptId: string, itemId: string, updates: any) => void;
  setBudget: (budget: any) => void;
  getBudgetForMonth: (yearMonth: string) => number;
  getReceiptsForMonth: (yearMonth: string) => any[];
  getReceiptsForDate: (date: string) => any[];
  getSimilarStores: (name: string) => any[];
  addFixedCost: (fixedCost: any) => void;
  updateFixedCost: (id: string, updates: any) => void;
  deleteFixedCost: (id: string) => void;
  applyFixedCostsForMonth: (yearMonth: string) => number;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      receipts: [],
      budgets: [],
      knownStores: [],
      fixedCosts: [],

      addReceipt: (receipt) =>
        set((state) => {
          const storeExists = state.knownStores.find((s: any) => s.name === receipt.store);
          const newStores = storeExists
            ? state.knownStores
            : [...state.knownStores, { name: receipt.store, type: receipt.storeType }];
          return { receipts: [receipt, ...state.receipts], knownStores: newStores };
        }),

      deleteReceipt: (id) =>
        set((state) => ({ receipts: state.receipts.filter((r: any) => r.id !== id) })),

      updateReceipt: (id, updates) =>
        set((state) => ({
          receipts: state.receipts.map((r: any) => r.id === id ? { ...r, ...updates } : r),
        })),

      updateItem: (receiptId, itemId, updates) =>
        set((state) => ({
          receipts: state.receipts.map((r: any) =>
            r.id === receiptId
              ? { ...r, items: r.items.map((item: any) => item.id === itemId ? { ...item, ...updates } : item) }
              : r
          ),
        })),

      setBudget: (budget) =>
        set((state) => ({
          budgets: [...state.budgets.filter((b: any) => b.yearMonth !== budget.yearMonth), budget],
        })),

      getBudgetForMonth: (yearMonth) => {
        const budget = get().budgets.find((b: any) => b.yearMonth === yearMonth);
        return budget?.amount ?? 50000;
      },

      getReceiptsForMonth: (yearMonth) =>
        get().receipts.filter((r: any) => r.date.startsWith(yearMonth)),

      getReceiptsForDate: (date) =>
        get().receipts.filter((r: any) => r.date === date),

      getSimilarStores: (name) => {
        const stores = get().knownStores;
        return stores.filter((s: any) =>
          s.name !== name && (
            s.name.includes(name) ||
            name.includes(s.name) ||
            (name.length >= 4 && s.name.slice(0, 4) === name.slice(0, 4))
          )
        );
      },

      addFixedCost: (fixedCost) =>
        set((state) => ({ fixedCosts: [...state.fixedCosts, fixedCost] })),

      updateFixedCost: (id, updates) =>
        set((state) => ({
          fixedCosts: state.fixedCosts.map((f: any) => f.id === id ? { ...f, ...updates } : f),
        })),

      deleteFixedCost: (id) =>
        set((state) => ({ fixedCosts: state.fixedCosts.filter((f: any) => f.id !== id) })),

      applyFixedCostsForMonth: (yearMonth) => {
        const { fixedCosts, receipts } = get();
        const newReceipts: any[] = [];

        fixedCosts.filter((f: any) => f.enabled).forEach((f: any) => {
          const date = `${yearMonth}-${String(f.dayOfMonth).padStart(2, "0")}`;
          const alreadyExists = receipts.some(
            (r: any) => r.date === date && r.store === f.name && r.total === f.amount
          );
          if (!alreadyExists) {
            newReceipts.push({
              id: crypto.randomUUID(),
              date,
              store: f.name,
              storeType: f.storeType,
              total: f.amount,
              items: [{
                id: crypto.randomUUID(),
                name: f.name,
                price: f.amount,
                quantity: 1,
                majorCategory: f.majorCategory,
                category: f.category,
                sub: "",
                wasteTags: [],
              }],
            });
          }
        });

        if (newReceipts.length > 0) {
          set((state) => ({ receipts: [...newReceipts, ...state.receipts] }));
        }
        return newReceipts.length;
      },
    }),
    { name: "kakeibo-storage" }
  )
);
