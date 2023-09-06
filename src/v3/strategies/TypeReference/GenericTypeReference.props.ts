export type Props<
  Id extends 'prop_a' | 'prob_b',
  Value,
  MultiValue extends number,
> = {
  props_id_constraint: Id;
  props_value: Value;
  props_option: Option<Id, Value>;
  props_multi_option: MultiOption<Id, MultiValue>;
};

type MultiOption<Label extends string, Value> = Option<Label, bigint> & {
  multi_value: Value;
};

type Option<Label, Value> = {
  label: Label;
  value: Value;
};
