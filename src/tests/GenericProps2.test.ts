import path from 'path';
import { ParsedProperty } from '../ParsedProperty';
import { parsePropsInFile } from '../parsePropsInFile';
import { compilerOptions } from './compilerOptions';

describe('[generic types 2]', () => {
  const componentPath = path.join(__dirname, 'GenericProps_2.tsx');
  const { parsed } = parsePropsInFile(componentPath, compilerOptions);

  test('steps', () => {
    expect(parsed?.['steps']).toEqual({
      type: 'array',
      values: [
        {
          type: 'object',
          value: {
            number: {
              type: 'generic-constraint',
              value: 'number',
            },
            label: {
              type: 'string',
            },
          },
        },
      ],
    } satisfies ParsedProperty);
  });

  test('activeStep', () => {
    expect(parsed?.['activeStep']).toEqual({
      type: 'union-type',
      values: [
        {
          type: 'generic-constraint',
          value: 'number',
        },
        {
          type: 'object',
          value: {
            number: {
              type: 'generic-constraint',
              value: 'number',
            },
            label: {
              type: 'string',
            },
          },
        },
      ],
    } satisfies ParsedProperty);
  });

  test('completedSteps', () => {
    expect(parsed?.['completedSteps']).toEqual({
      type: 'union-type',
      values: [
        {
          type: 'array',
          values: [
            {
              type: 'generic-constraint',
              value: 'number',
            },
          ],
        },
        {
          type: 'array',
          values: [
            {
              type: 'object',
              value: {
                number: {
                  type: 'generic-constraint',
                  value: 'number',
                },
                label: {
                  type: 'string',
                },
              },
            },
          ],
        },
        {
          type: 'not-parsed',
          value: 'Set<Step<TNumber>>',
        },
      ],
    } satisfies ParsedProperty);
  });
});
