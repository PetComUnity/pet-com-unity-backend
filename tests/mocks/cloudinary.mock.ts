export const mockCloudinary = {
  uploader: {
    upload: jest.fn(),
    destroy: jest.fn(),
  },
  utils: {
    private_download_url: jest.fn(),
  },
};

export function resetCloudinaryMock(): void {
  mockCloudinary.uploader.upload.mockResolvedValue({
    public_id: 'documents/test-file',
    secure_url:
      'https://res.cloudinary.com/test-cloud/raw/upload/v1/documents/test-file.pdf',
  });
  mockCloudinary.uploader.destroy.mockResolvedValue({ result: 'ok' });
  mockCloudinary.utils.private_download_url.mockReturnValue(
    'https://storage.example.test/private-file',
  );
}

resetCloudinaryMock();

export const cloudinary = mockCloudinary;
