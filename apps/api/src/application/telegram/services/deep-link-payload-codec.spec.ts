import { DeepLinkPayloadCodec } from './deep-link-payload-codec';
import { TelegramFlow } from '@domain/telegram/value-objects/TelegramEnums';

describe('DeepLinkPayloadCodec', () => {
  it('encodes and decodes payload without padding', () => {
    const payload = {
      dl: 'abc123',
      f: TelegramFlow.plan_7d,
      t: 'anxiety',
      s: 'quiz',
    };

    const encoded = DeepLinkPayloadCodec.encode(payload);
    expect(encoded).not.toContain('=');

    const decoded = DeepLinkPayloadCodec.decode(encoded);
    expect(decoded).toEqual(payload);
  });

  it('throws when required fields are missing', () => {
    const encoded = DeepLinkPayloadCodec.encode({ dl: 'abc123', f: TelegramFlow.plan_7d });
    const tampered = encoded.slice(0, -2);
    expect(() => DeepLinkPayloadCodec.decode(tampered)).toThrow();
  });
});
