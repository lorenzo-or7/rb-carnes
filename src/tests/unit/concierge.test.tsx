import { act, render } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { ConciergeProvider, useConcierge } from '../../concierge/ConciergeContext';

let api: ReturnType<typeof useConcierge>;
function Probe() {
  api = useConcierge();
  return null;
}

describe('ConciergeContext', () => {
  beforeEach(() => sessionStorage.clear());

  it('deduplica, remove, abre com segmento e não persiste dados pessoais', () => {
    render(
      <ConciergeProvider>
        <Probe />
      </ConciergeProvider>,
    );
    const item = { key: 'produto:cupim', productId: 'cupim', name: 'Cupim', source: 'catalogo' as const, format: '' };
    act(() => void api.addItem(item));
    act(() => void api.addItem(item));
    expect(api.state.items).toHaveLength(1);
    act(() => api.setContact({ name: 'Ana', whatsapp: '48999990000' }));
    act(() => api.open({ segment: 'delivery' }));
    expect(api.isOpen).toBe(true);
    expect(api.state.segment).toBe('delivery');
    expect(api.step).toBe(1);
    const saved = JSON.parse(sessionStorage.getItem('rb-concierge-selection')!);
    expect(saved.items).toHaveLength(1);
    expect(saved.contact).toBeUndefined();
    expect(JSON.stringify(saved)).not.toContain('Ana');
    act(() => api.removeItem('produto:cupim'));
    expect(api.state.items).toHaveLength(0);
  });
});
