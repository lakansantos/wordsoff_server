const checkFieldsValidator = (missingFields, req) => {
  const fields = [];

  let hasMissingFields;
  missingFields.map((field) => {
    if (!req.body[field]) {
      fields.push(field);
    }
  });
  if (fields.length > 0) {
    hasMissingFields = true;
  } else {
    hasMissingFields = false;
  }

  return {
    fields,
    hasMissingFields,
  };
};

export default checkFieldsValidator;
