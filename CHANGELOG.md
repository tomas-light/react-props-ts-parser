## Release 3.0.0-rc-6

* bumped react type packages versions;
* added `preventFromParsing` option;
* fixed copying of optional properties;

## Release 3.0.0-rc-3

* added error throwing when file to parse is not found, instead of writing message to console `file not found for path`;
* added error throwing when target node to parse is not found, instead of writing message to console `node with name "${nodeName}" is not found`;
* added error throwing when Source file is not typescript, instead of writing message to console `we can not to make SourceFile from a file`;
* performance and memory optimizations:
  * added cache to avoid extra attempts to parse the same node (for type references); 

## Release 3.0.0-rc-2

* added `import` information to imported referenced types;
* added lazy parsing for react types via `skipTypeAliasAndInterfaces`;

## Release 3.0.0-rc-1

* removed IntersectionParsesProperties - now all values presented as arrays, so `A & B` it is a just array `[Parsed A, Parsed B]`;
* implemented support of generic types;
* rewrote code;
* simplified optional union types: `property?: string | undefined` is parsed as `property?: string`;
* added a lot of different tests
* fixed JsDoc type error: `comment` is optional now;
