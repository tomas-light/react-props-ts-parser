import { FC } from 'react';
import { Dayjs } from 'dayjs';
import { LocalImportedType } from './LocalImportedType';

type MyTypeA = {
  someData: any;
};

type MyTypeB = 'a' | 'b' | 'c';

export type Props = {
  props_object: {
    someData: any;
  };
  props_objectArray: {
    someDataInArray: any;
  }[];
  props_objectRef: MyTypeA;
  props_unionTypeRef: MyTypeB;
  props_dayjs: Dayjs;
  props_localImportedType: LocalImportedType;
};

export const TestComponent: FC<Props> = () => null as any;
