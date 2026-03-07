// Manual mock for file-type module
module.exports = {
  fileTypeFromBuffer: jest.fn().mockResolvedValue({ mime: 'application/pdf', ext: 'pdf' }),
};


