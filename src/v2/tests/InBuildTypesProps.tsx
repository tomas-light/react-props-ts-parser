import { FC } from 'react';

type Inherited = {
  some: number;
  another: string;
  prop3: bigint;
  prop4: symbol;
  prop5: null;
  prop6: undefined;
};

export type Props = {
  props_partial: Partial<Inherited>;
  props_pick: Pick<Inherited, 'prop3' | 'prop5'>;
  props_omit: Omit<Inherited, 'some' | 'another' | 'prop3'>;
  props_set: Set<string>;
  props_map: Map<number, boolean>;
};

export const TestComponent: FC<Props> = () => null as any;
