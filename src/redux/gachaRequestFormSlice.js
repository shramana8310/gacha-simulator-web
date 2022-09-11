import { createSlice } from "@reduxjs/toolkit";

export const gachaRequestFormSlice = createSlice({
  name: 'gachaRequestForm',
  initialState: {
    gachaRequestFormMap: {},
    showHelp: true,
    tiersHelpIndex: 0,
    itemsHelpIndex: 0,
    pricingHelpIndex: 0,
    policiesHelpIndex: 0,
    planHelpIndex: 0,
  },
  reducers: {
    initializeGachaRequestForm: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload] = {
        tiers: [],
        customizeItems: false,
        items: [],
        pricingPresets: [],
        pricing: {
          pricePerGacha: 0,
          discount: false,
          discountTrigger: 1,
          discountedPricePerGacha: 0,
        },
        policiesPresets: [],
        policies: {
          pity: false,
          pityItem: undefined,
          pityTrigger: 0
        },
        planPresets: [],
        plan: {
          budget: 0,
          maxConsecutiveGachas: 0,
          itemGoals: false,
          wantedItems: [],
          tierGoals: false,
          wantedTiers: []
        },
        tiersLoaded: false,
        pricingPresetsLoaded: false,
        policiesPresetsLoaded: false,
        planPresetsLoaded: false,
        tiersError: false,
        pricingPresetsError: false,
        policiesPresetsError: false,
        planPresetsError: false,
      }
    },

    setTiers: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].tiers = payload.tiers;
    },
    setItems: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].items = payload.items;
    },
    setPricingPresets: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].pricingPresets = payload.pricingPresets;
    },
    setPoliciesPresets: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].policiesPresets = payload.policiesPresets;
    },
    setPlanPresets: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].planPresets = payload.planPresets;
    },

    setTierRatio: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].tiers[payload.index].ratio = payload.value;
    },

    setCustomizeItems: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].customizeItems = payload.value;
    },
    addItems: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].items.push(...payload.items);
    },
    removeItem: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].items = gachaRequestFormMap[payload.gameTitleSlug].items.filter((item) => item.id !== payload.item.id);
    },
    setItemRatio: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].items[payload.index].ratio = payload.value;
    },

    setPricing: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].pricing = payload.pricing;
    },
    setPricePerGacha: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].pricing.pricePerGacha = payload.value;
    },
    setDiscount: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].pricing.discount = payload.value;
    },
    setDiscountTrigger: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].pricing.discountTrigger = payload.value;
    },
    setDiscountedPricePerGacha: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].pricing.discountedPricePerGacha = payload.value;
    },

    setPolicies: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].policies = payload.policies;
    },
    setPity: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].policies.pity = payload.value;
    },
    setPityTrigger: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].policies.pityTrigger = payload.value;
    },
    setPityItem: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].policies.pityItem = payload.pityItem;
    },

    setPlan: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].plan = payload.plan;
    },
    setBudget: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].plan.budget = payload.value;
    },
    setMaxConsecutiveGachas: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].plan.maxConsecutiveGachas = payload.value;
    },
    setItemGoals: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].plan.itemGoals = payload.value;
    },
    addWantedItems: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].plan.wantedItems.push(...payload.wantedItems);
    },
    removeWantedItem: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].plan.wantedItems = gachaRequestFormMap[payload.gameTitleSlug].plan.wantedItems.filter((wantedItem) => wantedItem.id !== payload.wantedItem.id);
    },
    setWantedItemNumber: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].plan.wantedItems[payload.index].number = payload.value;
    },
    setTierGoals: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].plan.tierGoals = payload.value;
    },
    addWantedTiers: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].plan.wantedTiers.push(...payload.wantedTiers);
    },
    removeWantedTier: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].plan.wantedTiers = gachaRequestFormMap[payload.gameTitleSlug].plan.wantedTiers.filter((wantedTier) => wantedTier.id !== payload.wantedTier.id);
    },
    setWantedTierNumber: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].plan.wantedTiers[payload.index].number = payload.value;
    },

    setTiersLoaded: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].tiersLoaded = payload.value;
    },
    setPricingPresetsLoaded: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].pricingPresetsLoaded = payload.value;
    },
    setPoliciesPresetsLoaded: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].policiesPresetsLoaded = payload.value;
    },
    setPlanPresetsLoaded: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].planPresetsLoaded = payload.value;
    },

    setTiersError: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].tiersError = payload.value;
    },
    setPricingPresetsError: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].pricingPresetsError = payload.value;
    },
    setPoliciesPresetsError: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].policiesPresetsError = payload.value;
    },
    setPlanPresetsError: ({ gachaRequestFormMap }, { payload }) => {
      gachaRequestFormMap[payload.gameTitleSlug].planPresetsError = payload.value;
    },

    toggleShowHelp: (state, action) => {
      state.showHelp = !state.showHelp;
    },
    setShowHelp: (state, action) => {
      state.showHelp = action.payload;
    },

    setTiersHelpIndex: (state, action) => {
      state.tiersHelpIndex = action.payload;
    },
    setItemsHelpIndex: (state, action) => {
      state.itemsHelpIndex = action.payload;
    },
    setPricingHelpIndex: (state, action) => {
      state.pricingHelpIndex = action.payload;
    },
    setPoliciesHelpIndex: (state, action) => {
      state.policiesHelpIndex = action.payload;
    },
    setPlanHelpIndex: (state, action) => {
      state.planHelpIndex = action.payload;
    },
  }
});

export const { 
  initializeGachaRequestForm, 
  setTiers, 
  setItems,
  setPricingPresets,
  setPoliciesPresets,
  setPlanPresets,
  setTierRatio,
  setCustomizeItems,
  addItems,
  removeItem,
  setItemRatio,
  setPricing,
  setPricePerGacha,
  setDiscount,
  setDiscountTrigger,
  setDiscountedPricePerGacha,
  setPolicies,
  setPity,
  setPityTrigger,
  setPityItem,
  setPlan,
  setBudget,
  setMaxConsecutiveGachas,
  setItemGoals,
  addWantedItems,
  removeWantedItem,
  setWantedItemNumber,
  setTierGoals,
  addWantedTiers,
  removeWantedTier,
  setWantedTierNumber,
  setTiersLoaded,
  setPricingPresetsLoaded,
  setPoliciesPresetsLoaded,
  setPlanPresetsLoaded,
  setTiersError,
  setPricingPresetsError,
  setPoliciesPresetsError,
  setPlanPresetsError,
  toggleShowHelp,
  setShowHelp,
  setTiersHelpIndex,
  setItemsHelpIndex,
  setPricingHelpIndex,
  setPoliciesHelpIndex,
  setPlanHelpIndex,
} = gachaRequestFormSlice.actions;

export default gachaRequestFormSlice.reducer;