import { Checkbox } from '@chakra-ui/react';

export default function ConditionalCheckbox({checkable, checked, onCheck, onUncheck, children}) {
  if (checkable) {
    return (
      <Checkbox isChecked={checked} onChange={checked ? onUncheck : onCheck}>
        {children}
      </Checkbox>
    );
  } else {
    return children;
  }
};
