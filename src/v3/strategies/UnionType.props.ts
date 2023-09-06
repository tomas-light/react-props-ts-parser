type ExternalProps = {
  external_optional_string?: string;
  external_string: string;
};

type ExternalProps2 =
  | ExternalProps3
  | {
      external_number_or_string: number | string;
      external_number_or_boolean: number | boolean;
    };

type ExternalProps3 = {
  external_boolean_or_null: boolean | null;
  external_boolean_or_symbol: boolean | symbol;
};

export type Props =
  | ExternalProps
  | ExternalProps2
  | {
      props_string_literal: 'string_1' | 'string_2';
      props_number_literal: 25 | 50;
    }
  | {
      props_bigint_literal: 25n | 100n;
      props_array_or_set: boolean[] | Set<string>;
    };
