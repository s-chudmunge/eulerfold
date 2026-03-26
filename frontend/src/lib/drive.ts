export const getDriveDownloadUrl = (id: string) =>
  `https://drive.google.com/uc?export=download&id=${id}`;

export const getDrivePreviewUrl = (id: string) =>
  `https://drive.google.com/file/d/${id}/preview`;
