import { useCallback, useState } from 'react';

/** ### useUpload
 *  @example
 *  const { upload } = useUpload();
 *  const [isImageLoading, setIsImageLoading] = useState(false);
 *
 *   const handleUpload = async () => {
 *     upload(async (file) => {
 *       if (!file) return;
 *       setIsImageLoading(true);
 *       await handleImageUpload(file);
 *       setIsImageLoading(false);
 *     });
 *   };
 */
export default function useUpload() {
  const [file, setFile] = useState<File | null>(null);

  const upload = useCallback((callback: (file: File | null) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      if (!input.files || input.files.length === 0) return;
      const selectedFile = input.files[0];
      setFile(selectedFile);
      callback(selectedFile);
    };
    input.click();
  }, []);

  return { upload, file };
}
