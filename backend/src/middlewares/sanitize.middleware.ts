import sanitizeHtml from 'sanitize-html';

export const sanitize = (value: string): string => {
  if (typeof value !== 'string') return value;
  return sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
  });
};
