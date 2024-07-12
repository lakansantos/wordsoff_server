export const validationErrorMessageMapper = (error: Fetch.Error) => {
  return Object.values(error.errors).map((err) => err.message);
};

export const REGEXP: {
  [key: string]: RegExp;
} = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

export const REGEXP_FEEDBACK = {
  email: 'Please provide a valid email address.',
};
