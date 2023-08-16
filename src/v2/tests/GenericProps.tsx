import { FC } from 'react';

type Option<Label, Value> = {
  label: Label;
  value: Value;
};

type Values = keyof {
  propA: string;
  propB: number;
  propC: bigint;
};

interface Item {
  name: string;
  age: number;
}

export type Props<Id extends string, Value> = {
  props_set: Set<number>;
  props_map: Map<number, Item>;
  props_array: Array<Item>;
  props_id_constraint: Id;
  props_value: Value;
  props_option: Option<'a' | 'b' | 'c', Values>;
};

export const TestComponent: FC<Props<'a', number>> = () => null as any;
