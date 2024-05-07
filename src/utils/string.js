export const validationErrorMessageMapper = (error) => {
  return Object.values(error.errors).map((err) => err.message);
};
