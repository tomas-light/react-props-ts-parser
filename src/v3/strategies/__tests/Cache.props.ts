type Booleanish = boolean | 'true' | 'false';

interface MyType2 {
  property: string;
}

type MyType3 = {
  property_abc: string;
  property_qwe: string;
};

export type Props = {
  cached1_1: Booleanish;
  cached1_2: Booleanish;

  cached2_1: MyType2;
  cached2_2: MyType2;

  cached3_1: MyType3;
  cached3_2: MyType3;

  cached4_1: MyType3[];
  cached4_2: MyType3[];

  cached8_1: ReadonlyArray<MyType3>;
  cached8_2: ReadonlyArray<MyType3>;

  not_cached5_1: Pick<MyType3, 'property_abc'>;
  not_cached5_2: Pick<MyType3, 'property_abc'>;

  not_cached6_1: Omit<MyType3, 'property_abc'>;
  not_cached6_2: Omit<MyType3, 'property_abc'>;

  not_cached7_1: Partial<MyType3>;
  not_cached7_2: Partial<MyType3>;
};
