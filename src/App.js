import { Routes, Route, Outlet } from "react-router-dom";
import GameTitles from "./components/GameTitles";
import GachaRequestForm from "./components/GachaRequestForm";
import TiersForm from "./components/TiersForm";
import ItemsForm from "./components/ItemsForm";
import PricingForm from "./components/PricingForm";
import PoliciesForm from "./components/PoliciesForm";
import PlanForm from "./components/PlanForm";
import GachaRequestReview from "./components/GachaRequestReview";
import { useAuth } from "react-oauth2-pkce";
import GachaResultList from "./components/GachaResultList";
import { Box, Center, Spinner, Stack } from "@chakra-ui/react";
import GachaResultDetails from "./components/GachaResultDetails";
import GachaResultDetailsPage from "./components/GachaResultDetailsPage";
import NotFoundPage from "./components/NotFoundPage";
import ReloadButton from "./components/ReloadButton";
import { useEffect, useState } from "react";

export default function App() {
  const { authService } = useAuth();
  const [ takingTooLong, setTakingTooLong ] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setTakingTooLong(true);
    }, 5000);
  }, []);

  if (!authService.isAuthenticated()) {
    if (!authService.isPending()) {
      authService.authorize();
    }
    return <Stack h={'100vh'} justify={'center'}>
        <Box>
          <Stack spacing={5}>
            <Center><Spinner /></Center>
            {takingTooLong && <Center><ReloadButton onClick={() => { authService.authorize() }} /></Center>}
          </Stack>
        </Box>
      </Stack>;
  }
  return (
    <Routes>
      <Route path="/" element={<GameTitles />} />
      <Route path="/gacha/:gameTitleSlug" element={<GachaRequestForm><Outlet /></GachaRequestForm>}>
        <Route index element={<TiersForm />} />
        <Route path="tiers" element={<TiersForm />} />
        <Route path="items" element={<ItemsForm />} />
        <Route path="pricing" element={<PricingForm />} />
        <Route path="policies" element={<PoliciesForm />} />
        <Route path="plan" element={<PlanForm />} />
        <Route path="review" element={<GachaRequestReview />} />
        <Route path="results" element={<GachaResultList />} />
        <Route path="results/:resultID" element={<GachaResultDetails />} />
      </Route>
      <Route path="/results/:resultID" element={<GachaResultDetailsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};