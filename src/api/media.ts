import api from '../config/api';

type UploadResponse = { url: string } | { data: { url: string } } | string;
export type UploadMediaKind = 'avatar' | 'post';

const uploadPaths: Record<UploadMediaKind, string> = {
  avatar: '/media/upload/avatar',
  post: '/media/upload/post',
};

const extractUrl = (payload: UploadResponse): string => {
  if (typeof payload === 'string') return payload;

  if (typeof payload === 'object' && payload !== null) {
    if ('url' in payload && typeof payload.url === 'string') return payload.url;
    if (
      'data' in payload &&
      typeof payload.data === 'object' &&
      payload.data !== null &&
      'url' in payload.data &&
      typeof payload.data.url === 'string'
    ) {
      return payload.data.url;
    }
  }

  throw new Error('Unexpected response format from media upload');
};

/**
 * Upload a file to the server and return the public URL.
 * Sends a multipart/form-data POST to the avatar or post upload route.
 */
export const uploadMedia = async (file: File): Promise<string> => {
  return uploadMediaWithKind(file, 'avatar');
};

export const uploadMediaWithKind = async (
  file: File,
  kind: UploadMediaKind,
): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<UploadResponse>(uploadPaths[kind], formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error('Failed to upload media');
  }

  return extractUrl(response.data);
};
