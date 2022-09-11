import { Container } from "@chakra-ui/react";
import NotFoundAlert from "./NotFoundAlert";

export default function NotFoundPage() {
  return <Container maxW={'4xl'} p={5}><NotFoundAlert /></Container>;
};