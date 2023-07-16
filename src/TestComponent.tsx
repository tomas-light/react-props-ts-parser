import { FC } from 'react';

type Option<Label, Value> = {
  label: Label;
  value: Value;
};

type Props = {
  className?: string;
  open: boolean;
  onClick: () => void;
  size?: '16' | '24' | 36;
  count: number;
  options: Option<string, number>[];
  classes: Record<string, string>;
};

export const TestComponent: FC<Props> = (props) => {
  const {} = props;

  return null as any;
};
