export const isProduction = process.env.NODE_ENV === 'production';
export const isEmulated = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true';