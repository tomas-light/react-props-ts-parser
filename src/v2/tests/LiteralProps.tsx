import { FC } from 'react';

export type Props = {
  props_string: 'string_1';
  props_number: 25;
  props_bigint: 25n;
  props_boolean_true: true;
  props_boolean_false: false;
};

export const TestComponent: FC<Props> = () => null as any;
