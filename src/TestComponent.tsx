import { Dayjs } from 'dayjs';
import { CSSProperties, FC, ReactNode } from 'react';

type Option<Label extends string, Value> = {
  label: Label;
  value: Value;
};

type SomeProps = {
  backgroundColor?: string;
  variant: 'a' | 'b';
};

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
  options: Option<string, number>[];
  classes: Record<string, string>;
  children: ReactNode;
  style?: CSSProperties;

  date: Dayjs;
};

// type Props = {
//   // classes: Record<'root' | 'container', string>;
//   options: Option<string, number>[];
// };

export const TestComponent: FC<Props<string>> = (props) => {
  const {} = props;

  return null as any;
};

export type { Props as TestComponentProps };
