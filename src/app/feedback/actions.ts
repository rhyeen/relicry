'use server';

import { z } from 'zod';

const schema = z.object({
  feedback: z.string().min(1),
});

export async function saveFeedback(prevState: { message?: string }, formData: FormData) {
  const validatedFields = schema.safeParse({
    feedback: formData.get('feedback'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // In a real application, you would save this to a database.
  console.log('Feedback received:', validatedFields.data.feedback);

  return { message: 'Thank you for your feedback!' };
}
