import { ComponentPropsWithRef, FC } from 'react';

const PencilComponent: FC<{
  pencilSpecificProp: string;
}> = () => null;

const MapComponent: FC<{
  mapSpecificProp: string;
}> = () => null;

const CompassComponent: FC<{
  compassSpecificProp: string;
}> = () => null;

const icons = {
  pencil: PencilComponent,
  map: MapComponent,
  compass: CompassComponent,
};

type Icons = typeof icons;
type IconVariant = keyof Icons;

type VariantProps<Variant extends IconVariant> = ComponentPropsWithRef<
  Icons[Variant]
>;

export type Props<Variant extends IconVariant> = {
  variant: Variant;
} & VariantProps<Variant>;

// function Test<Variant extends IconVariant>(props: Props<Variant>) {
//   return null;
// }
//
// <Test variant={'map'} mapSpecificProp={''} />;
