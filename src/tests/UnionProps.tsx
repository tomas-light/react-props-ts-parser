import { FC } from 'react';

export type Props = {
  props_string: 'string_1' | 'string_2';
  props_number: 25 | 50;
  props_bigint: 25n | 100n;
  props_arrayOrSet: boolean[] | Set<string>;
};

export const TestComponent: FC<Props> = () => null as any;
