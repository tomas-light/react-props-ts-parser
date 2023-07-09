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
  size?: '16' | '24';
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
    "type": "unionType",
    "values": [
      "16",
      "24"
    ]
  },
  "count": {
    "type": "number"
  },
  "options": {
    "type": "array",
    "descriptor": {
      "type": "typeReference",
      "descriptor": {
        "label": {
          "type": "string"
        },
        "value": {
          "type": "number"
        }
      }
    }
  },
  "classes": {
    "string": {} // <--- TBD
  }
}
```
