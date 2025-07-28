import { sendGridSendEmail } from '../send-mail';
import sgMail from '@sendgrid/mail';
import sinon from 'sinon';

describe('sendGridSendEmail', () => {
  const originalEnv = process.env;
  let sgSendStub: sinon.SinonStub;

  beforeEach(() => {
    process.env = { ...originalEnv };

    sgSendStub = sinon.stub(sgMail, 'send').resolves([
      {
        statusCode: 202,
        headers: { 'x-message-id': '1234567890' },
        body: { message: 'success' },
      },
      {},
    ]);
  });

  afterEach(() => {
    sinon.restore();
    process.env = originalEnv;
  });

  it('throws if SENDGRID_API_KEY is missing', async () => {
    delete process.env.SENDGRID_API_KEY;
    await expect(
      sendGridSendEmail('a@b.test', 'subject', 'body')
    ).rejects.toThrow('SENDGRID_API_KEY is not set');
  });

  it('throws if VERIFIED_SENDER_EMAIL is missing', async () => {
    process.env.SENDGRID_API_KEY = 'dummy-key';
    delete process.env.VERIFIED_SENDER_EMAIL;

    await expect(
      sendGridSendEmail('a@b.test', 'subject', 'body')
    ).rejects.toThrow('VERIFIED_SENDER_EMAIL is not set');
  });

  it('sends with correct args when both env vars are present', async () => {
    process.env.SENDGRID_API_KEY = 'dummy-key';
    process.env.VERIFIED_SENDER_EMAIL = 'verified@sender.test';

    const result = await sendGridSendEmail(
      'mwnewman@umich.edu',
      'Test Subject',
      'Test Body'
    );

    sinon.assert.calledOnce(sgSendStub);
    sinon.assert.calledWithExactly(sgSendStub, {
      to: 'mwnewman@umich.edu',
      from: 'verified@sender.test',
      subject: 'Test Subject',
      text: 'Test Body',
    });

    expect(result[0].statusCode).toBe(202);
    expect(result[0].headers['x-message-id']).toBe('1234567890');
  });
});
