import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import enMessages from '@/messages/en-US.json';
import zhMessages from '@/messages/zh-CN.json';
import { EvidenceCard } from '../EvidenceCard';
import { useQAStore } from '@/stores/qaStore';
import type { Source } from '@/api/types';

function wrap(ui: React.ReactNode, locale: 'zh-CN' | 'en-US') {
  const messages = locale === 'en-US' ? enMessages : zhMessages;
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}

const baseSource: Source = {
  id: 'c-1',
  chunk_id: 'c-1',
  title: 'Record of Zhaozhou Bridge',
  type: 'book',
  author: 'Li Chun',
  location: 'Ch. 3',
  text_zh: '赵州桥，敞肩拱也。',
  text_en: 'Zhaozhou Bridge uses open-spandrel arches.',
};

describe('EvidenceCard', () => {
  beforeEach(() => {
    useQAStore.getState().reset();
  });

  describe('en-US locale', () => {
    it('renders the English summary as primary content with a Show original toggle', async () => {
      render(wrap(<EvidenceCard source={baseSource} index={1} />, 'en-US'));

      expect(screen.getByText(/Zhaozhou Bridge uses open-spandrel arches/)).toBeInTheDocument();
      // Original Chinese should be hidden until the disclosure is opened.
      expect(screen.queryByText(/敞肩拱也/)).not.toBeInTheDocument();

      const toggle = screen.getByRole('button', { name: enMessages.qa.evidence.show_original });
      expect(toggle).toHaveAttribute('aria-expanded', 'false');

      await userEvent.click(toggle);

      expect(screen.getByText(/敞肩拱也/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: enMessages.qa.evidence.hide_original })).toHaveAttribute(
        'aria-expanded',
        'true',
      );
    });

    it('falls back to Chinese text and omits the toggle when text_en is missing', () => {
      const source: Source = { ...baseSource, text_en: undefined };
      render(wrap(<EvidenceCard source={source} index={2} />, 'en-US'));

      // Chinese body is shown as the fallback body; no "Show original" button.
      expect(screen.getByText(/敞肩拱也/)).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: enMessages.qa.evidence.show_original }),
      ).not.toBeInTheDocument();
    });

    it('renders the citation index and source title', () => {
      render(wrap(<EvidenceCard source={baseSource} index={3} />, 'en-US'));
      // EvidenceCard pads single digits to 2 chars per Songci Celadon design.
      expect(screen.getByText('[03]')).toBeInTheDocument();
      expect(screen.getByText('Record of Zhaozhou Bridge')).toBeInTheDocument();
    });
  });

  describe('zh-CN locale', () => {
    it('renders Chinese content primary without any toggle', () => {
      render(wrap(<EvidenceCard source={baseSource} index={1} />, 'zh-CN'));
      expect(screen.getByText(/敞肩拱也/)).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: zhMessages.qa.evidence.show_original }),
      ).not.toBeInTheDocument();
      // The English summary must NOT be surfaced in zh-CN — it's redundant.
      expect(screen.queryByText(/open-spandrel arches/)).not.toBeInTheDocument();
    });
  });
});
