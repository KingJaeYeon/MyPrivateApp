import MDEditor from '@uiw/react-md-editor';

export function MarkdownEditor({ value, onChange }) {
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));

    for (const file of imageFiles) {
      // 1. 파일을 images 폴더에 저장
      const timestamp = Date.now();
      const ext = file.name.split('.').pop();
      const filename = `img_${timestamp}.${ext}`;
      const imagePath = `data/english/images/${filename}`;

      // Electron IPC로 파일 저장
      await window.fsApi.saveImage(file, imagePath);

      // 2. 마크다운에 삽입
      const imageMarkdown = `![](./images/${filename})`;
      onChange(value + '\n' + imageMarkdown);
    }
  };

  return (
    <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      <MDEditor value={value} onChange={onChange} />
    </div>
  );
}
