type ExternalProps = {
  external_string?: string;
};

type ExternalProps2 = ExternalProps3 & {
  external_number: number;
};

type ExternalProps3 = {
  external_boolean: boolean;
};

export type Props = ExternalProps &
  ExternalProps2 & {
    props_string: string;
  };
