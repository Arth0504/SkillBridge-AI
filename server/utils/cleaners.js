/**
 * Sanitize and validate resume URL.
 * Returns empty string "" if URL is null, empty, or contains fake/demo/placeholder patterns.
 * @param {string} url
 * @returns {string}
 */
export const cleanResumeUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (
    trimmed.includes('cloudinary.com/demo') ||
    trimmed.includes('cloudinary.com/resumes/') ||
    trimmed.includes('sample.pdf') ||
    trimmed.includes('mock_') ||
    trimmed.includes('example.com') ||
    trimmed.includes('fake_') ||
    trimmed.includes('dummy_')
  ) {
    return '';
  }
  return trimmed;
};

/**
 * Sanitize and validate avatar image URL.
 * Returns empty string "" if URL is null, empty, or contains fake/demo/placeholder patterns.
 * @param {string} url
 * @returns {string}
 */
export const cleanAvatarUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (
    trimmed.includes('cloudinary.com/demo') ||
    trimmed.includes('sample.png') ||
    trimmed.includes('sample.jpg') ||
    trimmed.includes('mock_') ||
    trimmed.includes('example.com') ||
    trimmed.includes('fake_') ||
    trimmed.includes('dummy_')
  ) {
    return '';
  }
  return trimmed;
};
