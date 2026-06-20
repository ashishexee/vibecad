import { describe, it, expect } from 'vitest';
import { extractPythonCode } from '../src/services/llm';

describe('extractPythonCode', () => {
  it('extracts from ```python block', () => {
    expect(extractPythonCode('```python\nimport cadquery as cq\nr = cq.Workplane("XY")\n```'))
      .toBe('import cadquery as cq\nr = cq.Workplane("XY")');
  });

  it('extracts from \\boxed block', () => {
    expect(extractPythonCode('\\boxed{```python\ncorrect\n```}')).toBe('correct');
  });

  it('prefers boxed over regular', () => {
    expect(extractPythonCode('```python\nwrong\n```\n\\boxed{```python\ncorrect\n```}')).toBe('correct');
  });

  it('returns trimmed text when no block', () => {
    expect(extractPythonCode('  just text  ')).toBe('just text');
  });

  it('handles empty block', () => {
    expect(extractPythonCode('```python\n\n```')).toBe('');
  });

  it('handles multiline code', () => {
    const input = '```python\nimport cadquery as cq\nr = cq.Workplane("XY").rect(60, 40).extrude(5)\n```';
    expect(extractPythonCode(input)).toContain('.extrude(5)');
  });
});
