import { 
  IconButton, 
  useColorMode, 
} from '@chakra-ui/react'
import { FiMoon, FiSun } from 'react-icons/fi';

export default function ColorModeToggleButton() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <IconButton
      variant="ghost"
      onClick={toggleColorMode}
      icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
    />
  );
};