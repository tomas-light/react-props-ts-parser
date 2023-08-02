import { FC } from 'react';

type Inherited = {
  some: number;
  another: string;
  prop3: bigint;
};

export type Props = Partial<Inherited> & {
  props_string: string;
  props_set: Set<string>;
  props_map: Map<number, boolean>;
};

export const TestComponent: FC<Props> = () => null as any;
