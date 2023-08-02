import { FC, HTMLAttributes } from 'react';

type Inherited = {
  some: number;
  another: string;
};

export type Props = HTMLAttributes<HTMLDivElement> & {
  props_string: 'string_1';
  props_number: 25;
} & Inherited & {
    lastOne: boolean;
  };

export const TestComponent: FC<Props> = () => null as any;
