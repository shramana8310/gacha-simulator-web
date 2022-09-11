import { Alert, AlertIcon, Link, ScaleFade } from "@chakra-ui/react";

export default function WarnAlert({ onClick, children }) {
  return <ScaleFade in={true} initialScale={0.9}>
    <Link>
      <Alert status='warning' onClick={onClick}>
        <AlertIcon />
        {children}
      </Alert>
    </Link>
  </ScaleFade>;
};