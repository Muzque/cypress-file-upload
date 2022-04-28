// eslint-disable-next-line import/no-extraneous-dependencies
import { getType } from 'mime';

import getFileExt from './getFileExt';

function getMimeType(extension) {
  if (extension === 'py') {
    return 'text/x-python'
  }
  return getType(extension)
}

export default function getFileMimeType(filePath) {
  const extension = getFileExt(filePath);
  const mimeType = getMimeType(extension);

  return mimeType;
}
