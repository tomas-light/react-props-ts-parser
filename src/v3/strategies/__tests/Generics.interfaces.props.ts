interface CardProps {
  variant: 'a' | 'b';
}

interface AnotherProps<Id> {
  id: Id;
  name: string;
}

export interface Props<
  Id extends 'prop_a' | 'prop_b',
  Value,
  MultiValue extends number,
> extends CardProps,
    Pick<AnotherProps<Id>, 'name'> {
  props_id_constraint: Id;
  props_value: Value;
  props_array: Value[];
  props_option: Option<Id, 'id_100' | 'id_200'>;
  props_multi_option: MultiOption<Id, MultiValue>;
  props_custom_object: Pick<Custom<Id>, 'id' | 'info'>;
}

interface MultiOption<Label extends string, Value>
  extends Option<Label, bigint> {
  multi_value: Value;
}

interface Option<Label, Value> {
  label: Label;
  value: Value;
}

interface Custom<T extends string> {
  id: T;
  name: string;
  age: number;
  info?: string;
}
