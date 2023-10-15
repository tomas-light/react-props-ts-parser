import { Dayjs } from 'dayjs';
import { LocalImportedType } from './LocalImportedType';

type MyTypeA = {
  someData: any;
};

type MyTypeB = 'a' | 'b' | 'c';

type MyTypeC = {
  some: number;
  another?: string;
  prop3: bigint;
  prop4: symbol;
  prop5?: null;
  prop6: undefined;
};

export type Props = {
  props_partial: Partial<MyTypeC>;
  props_pick: Pick<MyTypeC, 'prop3' | 'prop5'>;
  props_omit: Omit<MyTypeC, 'some' | 'another' | 'prop3'>;
  props_set: Set<string>;
  props_map: Map<number, boolean>;

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
  props_pickLocalImportedType: Pick<LocalImportedType, 'juice'>;
};
