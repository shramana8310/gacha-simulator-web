import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { initializeGachaRequestForm } from "./gachaRequestFormSlice";

export const useGachaRequestForm = () => {
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

  const tierEntries = useMemo(() => {
    const filteredTiers = gachaRequestForm.customizeItems ? 
      gachaRequestForm.tiers.filter(tier => gachaRequestForm.items.some(item => item.tier.id === tier.id)) : 
      gachaRequestForm.tiers;
    const tierRatioSum = filteredTiers.reduce((prev, tier) => prev + tier.ratio, 0);
    return filteredTiers.map(tier => ({
      tier: tier,
      tierRatioSum: tierRatioSum,
      percentage: tier.ratio / tierRatioSum,
    }));
  }, [gachaRequestForm]);

  const filteredWantedItems = useMemo(() => {
    return gachaRequestForm.customizeItems ? 
      gachaRequestForm.plan.wantedItems.filter(wantedItem => gachaRequestForm.items.some(item => item.id === wantedItem.id)) : 
      gachaRequestForm.plan.wantedItems;
  }, [gachaRequestForm]);

  const effectiveItemGoals = useMemo(() => {
    return filteredWantedItems.length === 0 ? false : gachaRequestForm.plan.itemGoals;
  }, [filteredWantedItems, gachaRequestForm]);

  const filteredWantedTiers = useMemo(() => {
    return gachaRequestForm.customizeItems ? 
      gachaRequestForm.plan.wantedTiers.filter(wantedTier => gachaRequestForm.items.some(item => item.tier.id === wantedTier.id)) :
      gachaRequestForm.plan.wantedTiers;
  }, [gachaRequestForm]);

  const effectiveTierGoals = useMemo(() => {
    return filteredWantedTiers.length === 0 ? false : gachaRequestForm.plan.tierGoals;
  }, [filteredWantedTiers, gachaRequestForm]);

  const treeMapData = useMemo(() => {
    if (gachaRequestForm.customizeItems) {
      return tierEntries.map(tierEntry => ({
          name: tierEntry.tier.shortName,
          children: gachaRequestForm.items.filter(item => item.tier.id === tierEntry.tier.id)
            .map((item, _, filteredItems) => ({
              name: item.shortName,
              ratio: (item.ratio / filteredItems.reduce((prev, item) => prev + item.ratio, 0)) * tierEntry.percentage,
            }))
        }))
        .filter(tierEntry => tierEntry.children.length > 0);
    } else {
      return tierEntries.map(tierEntry => ({
        name: tierEntry.tier.shortName,
        ratio: tierEntry.tier.ratio,
      }));
    }
    
  }, [tierEntries, gachaRequestForm]);

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
      if (gachaRequestForm.items.length > 50) {
        errors.push({page: "items", message: t('error.items_too_large')});
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
    tierEntries,
    filteredWantedItems,
    effectiveItemGoals,
    filteredWantedTiers,
    effectiveTierGoals,
    treeMapData,
  };
};

export const useGachaResultShareCallbacks = ({
  gachaResult, 
  authService, 
  i18next, 
  setUpdating, 
  setGachaResult, 
  toast,
  t,
}) => {
  const togglePublic = useCallback(() => {
    setUpdating(true);
    return fetch(`/api/gachas/${gachaResult.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authService.getAccessToken()}`,
        'Accept-Language': i18next.language,
      },
      body: JSON.stringify({
        public: !gachaResult.public,
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error();
      }
      return response;
    })
    .then(() => {
      setUpdating(false);
      setGachaResult({
        ...gachaResult,
        public: !gachaResult.public,
      });
      toast({
        title: !gachaResult.public ? t('changed_to_public_result') : t('changed_to_private_result'),
        status: 'success',
        isClosable: true,
      });
    })
    .catch(() => {
      setUpdating(false);
      toast({
        title: t('error.fetch_fail_public_switch'),
        status: 'error',
        isClosable: true,
      });
    });
  }, [gachaResult, authService, i18next, setUpdating, setGachaResult, toast, t]);
  const shareGacha = useCallback(() => {
    const share = () => {
      const url = `${window.location.origin}/results/${gachaResult.id}`;
      if (navigator.share) {
        return navigator.share({
          title: t('gacha_simulator_shared_result_title'),
          text: t('gacha_simulator_shared_result_text'), 
          url: url,
        });
      }
      if (navigator.clipboard) {
        return navigator.clipboard.writeText(url).then(() => {
          toast({
            title: t('url_copied'),
            status: 'success',
            isClosable: true,
          });
        });
      }
      return new Promise((resolve) => {
        const message = `${t('gacha_simulator_shared_result_text')}: \n${url}`;
        alert(message);
        resolve();
      });
    };
    if (!gachaResult.public) {
      togglePublic().then(share);
    } else {
      share();
    }
  }, [gachaResult, togglePublic, t]);
  return {
    togglePublic,
    shareGacha,
  };
};