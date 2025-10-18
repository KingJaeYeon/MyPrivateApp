import { request_youtube } from '@/service/axios.ts';

type ApiKey = {
  apiKey: string;
  type: 'youtubeApiKey';
};

export async function pingTest({ apiKey, type }: ApiKey) {
  if (type === 'youtubeApiKey') {
    return request_youtube.get('videos', {
      params: {
        key: apiKey,
        part: 'snippet',
        id: 'dQw4w9WgXcQ',
      },
    });
  }
}
