import { FC } from 'react';

export type Props = {
  props_string: string;
  props_number: number;
  props_boolean: boolean;
  props_null: null;
  props_undefined: undefined;
  props_bigint: bigint;
  props_symbol: symbol;
  props_function: () => void;
};

export const TestComponent: FC<Props> = () => null as any;
