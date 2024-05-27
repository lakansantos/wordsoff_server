const checkFieldsValidator = (missingFields, req) => {
  const fields = [];
  fields.map((field) => {
    if (!req.body[field]) {
      missingFields.push(field);
    }
  });
  if (missingFields.length > 0) {
    return true;
  } else {
    return false;
  }
};

export default checkFieldsValidator;
