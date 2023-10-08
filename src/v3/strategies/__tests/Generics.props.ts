type CardProps = {
  variant: 'a' | 'b';
};

type AnotherProps<Id> = {
  id: Id;
  name: string;
};

export type Props<
  Id extends 'prop_a' | 'prop_b',
  Value,
  MultiValue extends number,
> = CardProps &
  Pick<AnotherProps<unknown>, 'name'> & {
    props_id_constraint: Id;
    props_value: Value;
    props_array: Value[];
    props_option: Option<Id, 'id_100' | 'id_200'>;
    props_multi_option: MultiOption<Id, MultiValue>;
    props_custom_object: Pick<Custom<{ id: Id }>, 'id' | 'info'>;
  };

type MultiOption<Label extends string, Value> = Option<Label, bigint> & {
  multi_value: Value;
};

type Option<Label, Value> = {
  label: Label;
  value: Value;
};

type Custom<T extends { id: string }> = T & {
  name: string;
  age: number;
  info?: string;
};
