export const validationErrorMessageMapper = (error: Fetch.Error) => {
  return Object.values(error.errors).map((err) => err.message);
};
