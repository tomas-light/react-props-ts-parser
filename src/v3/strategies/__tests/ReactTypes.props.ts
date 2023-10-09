import {
  HTMLAttributes,
  AnchorHTMLAttributes,
  InputHTMLAttributes,
  CanvasHTMLAttributes,
} from 'react';

export type Props = HTMLAttributes<HTMLDivElement> & {
  anchor_attributes: AnchorHTMLAttributes<HTMLAnchorElement>;
  input_attributes: InputHTMLAttributes<HTMLInputElement>;
  canvas_attributes: CanvasHTMLAttributes<HTMLCanvasElement>;
};
