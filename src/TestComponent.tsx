import { Dayjs } from 'dayjs';
import { CSSProperties, FC, ReactElement, ReactNode } from 'react';

type Option<Label extends string, Value> = {
  label: Label;
  value: Value;
};

type SomeProps = {
  backgroundColor?: string;
  variant: 'a' | 'b';
};

type SomeOtherProps<Id> = {
  id: Id;
  variant: 'a' | 'b';
};

type Variant = 'success' | 'info' | 'warning' | 'error';

type Props<Id extends string> = Pick<SomeProps, 'backgroundColor'> & {
  id: Id;
  className?: string;
  /**
   * my property description
   * @example
   * <TestComponent open={true} />
   */
  open: boolean;
  onClick: () => void;
  size?: '16' | '24' | 36;
  count: number;
  options: Option<'name' | 'title', number>[];
  // mapped types not supported yet
  classes: Record<string, string>;
  children: ReactNode;
  someChildren: ReactElement<SomeOtherProps<Id>>[];
  style?: CSSProperties;

  variant: Variant;
  date: Dayjs;
};

// type Props = {
//   options: Option<string, number>[];
//   variant: Variant;
//   // classes: Record<'root' | 'container', string>;
// };

export const TestComponent: FC<Props<string>> = (props) => {
  const {} = props;

  return null as any;
};

export type { Props as TestComponentProps };
