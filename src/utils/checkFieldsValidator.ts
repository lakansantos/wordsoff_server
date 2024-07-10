import { Request } from 'express';

const checkFieldsValidator = (
  missingFields: string[],
  req: Request,
) => {
  const fields: string[] = [];

  let hasMissingFields;
  let errorMessage;
  missingFields.map((field: string) => {
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
