import { FC, ReactNode } from 'react';

type Option<Label extends string, Value> = {
  label: Label;
  value: Value;
};

type SomeProps = {
  backgroundColor?: string;
  variant: 'a' | 'b';
};

type Props = Pick<SomeProps, 'backgroundColor'> & {
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
  children?: ReactNode;
};

export const TestComponent: FC<Props> = (props) => {
  const {} = props;

  return null as any;
};

export type { Props as TestComponentProps };
