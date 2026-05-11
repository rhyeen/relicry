'use server';

import { z } from 'zod';

const FEEDBACK_CATEGORIES = {
  general: 'General feedback',
  event: 'Event experience',
  cards: 'Cards or rules',
  bug: 'Website issue',
  creator: 'Host or creator interest',
  other: 'Other',
} as const;

const schema = z.object({
  name: z.string().trim().max(80, 'Name must be 80 characters or fewer.').optional(),
  contact: z.string().trim().max(160, 'Contact must be 160 characters or fewer.').optional(),
  category: z.enum(Object.keys(FEEDBACK_CATEGORIES) as [keyof typeof FEEDBACK_CATEGORIES, ...(keyof typeof FEEDBACK_CATEGORIES)[]]),
  feedback: z.string().trim().min(1, 'Feedback is required.').max(1500, 'Feedback must be 1500 characters or fewer.'),
});

type FeedbackState = {
  errors?: {
    name?: string[];
    contact?: string[];
    category?: string[];
    feedback?: string[];
    form?: string[];
  };
  message?: string;
  discordUrl?: string;
};

const DISCORD_WEBHOOK_URL = process.env.RC_DISCORD_FEEDBACK_WEBHOOK_URL;

export async function saveFeedback(prevState: FeedbackState, formData: FormData): Promise<FeedbackState> {
  const validatedFields = schema.safeParse({
    name: formData.get('name'),
    contact: formData.get('contact'),
    category: formData.get('category'),
    feedback: formData.get('feedback'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const feedback = validatedFields.data;

  if (!DISCORD_WEBHOOK_URL) {
    return {
      errors: {
        form: ['Feedback delivery is not configured yet.'],
      },
    };
  }

  const webhookUrl = new URL(DISCORD_WEBHOOK_URL);
  webhookUrl.searchParams.set('wait', 'true');

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: 'Relicry Feedback',
      thread_name: buildThreadName(feedback.category),
      allowed_mentions: { parse: [] },
      embeds: [
        {
          title: FEEDBACK_CATEGORIES[feedback.category],
          color: 0x5865f2,
          fields: [
            {
              name: 'Feedback',
              value: feedback.feedback,
            },
            {
              name: 'Submitted by',
              value: feedback.name || 'Anonymous',
              inline: true,
            },
            {
              name: 'Contact',
              value: feedback.contact || 'Not provided',
              inline: true,
            },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    }),
  });

  if (!response.ok) {
    return {
      errors: {
        form: ['Unable to send feedback right now. Please try again later.'],
      },
    };
  }

  const discordUrl = await buildDiscordMessageUrl(response);

  return {
    message: 'Thank you for your feedback!',
    discordUrl,
  };
}

function buildThreadName(category: keyof typeof FEEDBACK_CATEGORIES) {
  return `Feedback: ${FEEDBACK_CATEGORIES[category]}`;
}

async function buildDiscordMessageUrl(response: Response): Promise<string | undefined> {
  const [message, guildId] = await Promise.all([
    response.json().catch(() => null) as Promise<{ id?: string; channel_id?: string } | null>,
    getDiscordGuildId(),
  ]);

  if (!message?.id || !message.channel_id || !guildId) {
    return undefined;
  }

  return `https://discord.com/channels/${guildId}/${message.channel_id}/${message.id}`;
}

async function getDiscordGuildId(): Promise<string | undefined> {
  if (!DISCORD_WEBHOOK_URL) {
    return undefined;
  }

  const webhookUrl = new URL(DISCORD_WEBHOOK_URL);
  webhookUrl.search = '';

  const response = await fetch(webhookUrl);
  if (!response.ok) {
    return undefined;
  }

  const webhook = await response.json().catch(() => null) as { guild_id?: string } | null;
  return webhook?.guild_id;
}
