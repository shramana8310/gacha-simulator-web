import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { initializeGachaRequestForm } from "./gachaRequestFormSlice";

export default function useGachaRequestForm() {
  const { gameTitleSlug } = useParams();
  let { gachaRequestFormMap } = useSelector((state) => state.gachaRequestForm);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  
  if (!gachaRequestFormMap[gameTitleSlug]) {
    dispatch(initializeGachaRequestForm(gameTitleSlug));
  }
  gachaRequestFormMap = useSelector((state) => state.gachaRequestForm.gachaRequestFormMap);
  const gachaRequestForm = gachaRequestFormMap[gameTitleSlug];

  const countWithinBudget = useMemo(() => {
    if (gachaRequestForm.pricing.pricePerGacha === 0 || (gachaRequestForm.pricing.discount && gachaRequestForm.pricing.discountedPricePerGacha === 0)) {
      return -1;
    }
    if (gachaRequestForm.pricing.discount) {
      const discountedConsecutiveGachasCount = Math.floor(gachaRequestForm.plan.budget / (gachaRequestForm.pricing.discountedPricePerGacha * gachaRequestForm.pricing.discountTrigger));
      const discountedSum = discountedConsecutiveGachasCount * gachaRequestForm.pricing.discountedPricePerGacha * gachaRequestForm.pricing.discountTrigger;
      const restOfBudget = gachaRequestForm.plan.budget - discountedSum;
      const restGachaCount = Math.floor(restOfBudget / gachaRequestForm.pricing.pricePerGacha);
      return (discountedConsecutiveGachasCount * gachaRequestForm.pricing.discountTrigger) + restGachaCount;
    } else {
      return Math.floor(gachaRequestForm.plan.budget / gachaRequestForm.pricing.pricePerGacha);
    }
  }, [gachaRequestForm]);

  const effectiveMaxConsecutiveGachas = useMemo(() => {
    if (countWithinBudget === -1) {
      return gachaRequestForm.plan.maxConsecutiveGachas;
    }
    return countWithinBudget < gachaRequestForm.plan.maxConsecutiveGachas ? countWithinBudget : gachaRequestForm.plan.maxConsecutiveGachas;
  }, [gachaRequestForm, countWithinBudget]);

  const validationErrors = useMemo(() => {
    const errors = [];
    if (gachaRequestForm.tiers.length === 0) {
      errors.push({page: "tiers", message: t('error.tiers_empty')});
    }
    if (gachaRequestForm.tiers.reduce((prev, tier) => prev + tier.ratio, 0) === 0) {
      errors.push({page: "tiers", message: t('error.tier_ratio_zero')});
    }
    if (gachaRequestForm.customizeItems) {
      if (gachaRequestForm.items.length === 0) {
        errors.push({page: "items", message: t('error.items_empty')});
      }
      if (gachaRequestForm.items.reduce((prev, item) => prev + item.ratio, 0) === 0) {
        errors.push({page: "items", message: t('error.item_ratio_zero')});
      }
    }
    if (gachaRequestForm.pricing.discount) {
      if (gachaRequestForm.pricing.discountedPricePerGacha > gachaRequestForm.pricing.pricePerGacha) {
        errors.push({page: "pricing", message: t('error.discount_gt_price')});
      }
    }
    if (gachaRequestForm.policies.pity) {
      if (!gachaRequestForm.policies.pityItem || 
          (gachaRequestForm.policies.pityItem && gachaRequestForm.customizeItems && !gachaRequestForm.items.some(item => item.id === gachaRequestForm.policies.pityItem.id))) {
        errors.push({page: "policies", message: t('error.pity_item_empty')});
      }
    }
    if (gachaRequestForm.plan.itemGoals) {
      const filteredWantedItems = gachaRequestForm.customizeItems ?
        gachaRequestForm.plan.wantedItems.filter(wantedItem => gachaRequestForm.items.some(item => item.id === wantedItem.id)) :
        gachaRequestForm.plan.wantedItems;
      if (filteredWantedItems.length === 0) {
        errors.push({page: "plan", message: t('error.wanted_item_empty')});
      }
    }
    if (gachaRequestForm.plan.tierGoals) {
      const filteredWantedTiers = gachaRequestForm.customizeItems ?
        gachaRequestForm.plan.wantedTiers.filter(wantedTier => gachaRequestForm.items.some(item => item.tier.id === wantedTier.id)) :
        gachaRequestForm.plan.wantedTiers;
      if (filteredWantedTiers.length === 0) {
        errors.push({page: "plan", message: t('error.wanted_tier_empty')});
      }
    }
    if (effectiveMaxConsecutiveGachas === 0) {
      errors.push({page: "plan", message: t('error.gachas_zero')});
    }
    return errors;
  }, [gachaRequestForm, effectiveMaxConsecutiveGachas, t]);

  return { 
    gachaRequestForm, 
    validationErrors, 
    countWithinBudget, 
    effectiveMaxConsecutiveGachas,
  };
}