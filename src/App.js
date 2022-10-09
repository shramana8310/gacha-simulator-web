import { Routes, Route, Outlet } from "react-router-dom";
import GameTitles from "./components/GameTitles";
import GachaRequestForm from "./components/GachaRequestForm";
import TiersForm from "./components/TiersForm";
import ItemsForm from "./components/ItemsForm";
import PricingForm from "./components/PricingForm";
import PoliciesForm from "./components/PoliciesForm";
import PlanForm from "./components/PlanForm";
import GachaRequestReview from "./components/GachaRequestReview";
import { useAuth } from "./auth/AuthContext";
import GachaResultList from "./components/GachaResultList";
import { Box, Center, Spinner, Stack } from "@chakra-ui/react";
import GachaResultDetails from "./components/GachaResultDetails";
import PublicGachaResultDetails from "./components/PublicGachaResultDetails";
import NotFoundPage from "./components/NotFoundPage";
import ReloadButton from "./components/ReloadButton";
import { useCallback, useEffect, useState } from "react";
import PresetsForm from "./components/PresetsForm";

export default function App() {
  const { authService } = useAuth();

  const [authenticated, setAuthenticated] = useState(authService.isAuthenticated());
  const authenticatedCallback = useCallback((authenticated) => {
    setAuthenticated(authenticated);
  }, []);
  authService.setAuthenticatedCallback(authenticatedCallback);

  const [pending, setPending] = useState(authService.isPending());
  const pendingCallback = useCallback((pending) => {
    setPending(pending);
  }, []);
  authService.setPendingCallback(pendingCallback);

  useEffect(() => {
    authService.init();
  }, [authService]);

  if (!authenticated) {
    return (
      <Stack h={'100vh'} justify={'center'}>
        <Box>
          <Stack spacing={5}>
            <Center>
            {pending ? <Spinner /> : <ReloadButton onClick={() => authService.login()} />}
            </Center>
          </Stack>
        </Box>
      </Stack>
    );
  }
  return (
    <Routes>
      <Route path="/" element={<GameTitles />} />
      <Route path="/gacha/:gameTitleSlug" element={<GachaRequestForm><Outlet /></GachaRequestForm>}>
        <Route index element={<PresetsForm />} />
        <Route path="presets" element={<PresetsForm />} />
        <Route path="tiers" element={<TiersForm />} />
        <Route path="items" element={<ItemsForm />} />
        <Route path="pricing" element={<PricingForm />} />
        <Route path="policies" element={<PoliciesForm />} />
        <Route path="plan" element={<PlanForm />} />
        <Route path="review" element={<GachaRequestReview />} />
        <Route path="results" element={<GachaResultList />} />
        <Route path="results/:resultId" element={<GachaResultDetails />} />
      </Route>
      <Route path="/results/:resultId" element={<PublicGachaResultDetails />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};