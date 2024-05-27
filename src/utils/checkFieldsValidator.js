const checkFieldsValidator = (missingFields, req) => {
  const fields = [];

  let hasMissingFields;
  let errorMessage;
  missingFields.map((field) => {
    if (!req.body[field]) {
      fields.push(field);
    }
  });
  if (fields.length > 0) {
    hasMissingFields = true;
    errorMessage = `Required field is missing: ${fields
      .filter(Boolean)
      .join(', ')}`;
  } else {
    hasMissingFields = false;
  }

  return {
    fields,
    hasMissingFields,
    errorMessage,
  };
};

export default checkFieldsValidator;
