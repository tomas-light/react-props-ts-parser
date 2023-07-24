import { FC } from 'react';

type Step<TNumber extends number | string = number> = {
  number: TNumber;
  label: string;
};

export type Props<TNumber extends number | string = number> = {
  steps: Step<TNumber>[];
  activeStep: TNumber | Step<TNumber>;
  completedSteps: TNumber[] | Step<TNumber>[] | Set<Step<TNumber>>;
};

export const TestComponent: FC<Props> = () => null as any;
