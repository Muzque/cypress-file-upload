import { DEFAULT_PROCESSING_OPTIONS, EVENTS_BY_SUBJECT_TYPE } from './constants';
import { validateFile, validateOptions } from './validators';
import { getFileBlobAsync, getFileMimeType, getFileEncoding } from '../lib/file';
import { merge } from '../lib/object';

export default function attachDirectory(subject, fixtureDir, processingOptions ) {
  const { subjectType, force, allowEmpty } = merge(processingOptions, DEFAULT_PROCESSING_OPTIONS);
  validateOptions({ subjectType, force, allowEmpty });

  const dataTransfer = new DataTransfer();
  const fixtures = `${Cypress.config('fixturesFolder')}/`;
  cy.exec(`find ${fixtures}${fixtureDir} -type f`)
    .then(contents => {
      const files = contents.stdout.split('\n').map(item => item.replace(fixtures, ''));
      files.forEach(filePath => {
        const fileMimeType = getFileMimeType(filePath);
        const fileEncoding = getFileEncoding(filePath);
        Cypress.cy.fixture(filePath, fileEncoding).then(fileContent => {
          return getFileBlobAsync({
            filePath,
            fileContent,
            mimeType: fileMimeType,
            encoding: fileEncoding,
          }).then(file => {
            validateFile(file, allowEmpty);
            dataTransfer.items.add(file);
          });
        });
      });
    })
    .then(() => {
      const events = EVENTS_BY_SUBJECT_TYPE(subjectType);
      const eventPayload = {
        bubbles: true,
        cancelable: true,
        detail: dataTransfer,
      };
      const inputElement = subject[0]
      if (inputElement.files && inputElement.file.length > 0) {
        Array.prototype.forEach.call(inputElement.files, f => dataTransfer.items.add(f));
      }
      inputElement.files = dataTransfer.files;
      events.forEach(e => {
        const event = new CustomEvent(e, eventPayload);
        Object.assign(event, { dataTransfer });
        subject[0].dispatchEvent(event);
      });
    });

   return Cypress.cy.wrap(subject, { log: false })
}
