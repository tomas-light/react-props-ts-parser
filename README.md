# react-props-ts-parser

Work In Progress

Transform typescript Props definition:
```tsx
type Option<Label, Value> = {
  label: Label;
  value: Value;
}

type Props = {
  className?: string;
  open: boolean;
  onClick: () => void;
  size?: '16' | '24' | 36;
  count: number;
  options: Option<string, number>[];
  classes: Record<string, string>;
};
```

to JSON:
```json
{
  "className": {
    "optional": true,
    "type": "string"
  },
  "open": {
    "type": "boolean"
  },
  "onClick": {
    "type": "function"
  },
  "size": {
    "optional": true,
    "type": "union-type",
    "values": [
      {
        "type": "string-literal",
        "value": "16"
      },
      {
        "type": "string-literal",
        "value": "24"
      },
      {
        "type": "number-literal",
        "value": 36
      }
    ]
  },
  "count": {
    "type": "number"
  },
  "options": {
    "type": "array",
    "values": [
      {
        "type": "object",
        "value": {
          "type": "number"
        },
        "label": {
          "type": "string"
        }
      }
    ]
  },
  "classes": {
    "type": "not-parsed",
    "value": "Record<string, string>"
  }
}
```
