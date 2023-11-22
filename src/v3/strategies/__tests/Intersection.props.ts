type ExternalProps = {
  external_string1?: string;
  external_string2: string;
};

type ExternalProps2 = ExternalProps3 & {
  external_number1: number;
  external_number2: number;
};

type ExternalProps3 = {
  external_boolean1: boolean;
  external_boolean2: boolean;
};

export type Props = ExternalProps &
  ExternalProps2 & {
    props_string1: string;
    props_string2: string;
  };
