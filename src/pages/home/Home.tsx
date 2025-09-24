import useApiStore from '@/store/api.ts';
import {useState} from 'react';
import {Label} from '@/components/ui/label.tsx';
import {Input} from '@/components/ui/input.tsx';
import {
    CancelButton,
    ConnectButton,
    DeleteButton,
    EditButton,
} from '@/pages/home/components/buttons.tsx';
import {Button} from '@/components/ui/button.tsx';
import fs from 'fs';
import electron from 'electron';
// const remote = electron.remote
// const {dialog} = remote

export type ApiType = 'youtubeApiKey';

export function Home() {
    const {youtubeApiKey} = useApiStore();

    const [editValues, setEditValues] = useState({
        youtubeApiKey: '',
    });
    const [isEditing, setIsEditing] = useState({
        youtubeApiKey: false,
    });

    const hasYoutubeApiKey = Boolean(youtubeApiKey);

    const getValue = (type: ApiType) => {
        const isConnected = Boolean(youtubeApiKey);
        const isCurrentlyEditing = isEditing[type];

        if (isConnected && !isCurrentlyEditing) {
            return youtubeApiKey;
        }
        return editValues[type];
    };

    const onChange = (value: string, key: ApiType) => {
        setEditValues((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const ConnectionStatus = ({type, isConnect}: { type: ApiType; isConnect: boolean }) => {
        if (isConnect && !isEditing[type]) {
            return (
                <div className="gap-2 flex">
                    <EditButton type={type} setIsEditing={setIsEditing} setEditValues={setEditValues}/>
                    <DeleteButton type={type}/>
                </div>
            );
        }

        if (isConnect && isEditing[type]) {
            return (
                <div className="gap-2 flex">
                    <ConnectButton type={type} editValues={editValues} setIsEditing={setIsEditing}/>
                    <CancelButton type={type} setIsEditing={setIsEditing} setEditValues={setEditValues}/>
                </div>
            );
        }

        return <ConnectButton type={type} editValues={editValues} setIsEditing={setIsEditing}/>;
    };

    return (
        <div className={'flex flex-1 w-full p-4'}>
            <div className={'flex flex-col gap-3 max-w-[800px] w-full'}>
                <div className="flex w-full items-center gap-4">
                    <Label htmlFor="mode" className="min-w-[100px]">
                        YouTube API
                    </Label>
                    <Input
                        id="keyword"
                        readOnly={Boolean(youtubeApiKey) && !isEditing['youtubeApiKey']}
                        value={getValue('youtubeApiKey')}
                        placeholder="입력해주세요."
                        onChange={(e) => onChange(e.target.value, 'youtubeApiKey')}
                        className="w-[500px] h-8"
                    />
                    <ConnectionStatus type={'youtubeApiKey'} isConnect={hasYoutubeApiKey}/>
                </div>
                <div>
                    <NTest/>
                </div>
            </div>
        </div>
    );
}


function NTest() {

    const [folderPath, setFolderPath] = useState('');
    const handleSelectFolder = (e) => {
        // try{
        //   dialog.showOpenDialog({ properties: ['openDirectory',] })
        //     .then(result => {
        //       console.log(result);
        //       // 선택한 폴더의 경로
        //       const selectFolderPath = result.filePaths[0];
        //       // 선택한 폴더 정보
        //       const selectFolderInfo = fs.statSync(selectFolderPath);
        //       // 하위 파일 및 폴더
        //       let childPath = [];
        //
        //       // 폴더인 경우
        //       if(selectFolderInfo.isDirectory()) {
        //         // 폴더 경로를 전달하여 폴더의 내용을 읽음
        //         fs.readdirSync(selectFolderPath)
        //           .map(file => {
        //             childPath.push(file);
        //           })
        //       }
        //       console.log(childPath);
        //       setFolderPath(result.filePaths[0]);
        //     })
        // } catch(error) {
        //   console.error(error);
        // }
    }
    const onClick = () => {

    }

    return (
        <div className={'flex gap-4'}>
            <Input value={folderPath}/>
            <Button variant={'secondary'} onClick={e => handleSelectFolder(e)}>Excel 생성</Button>
        </div>
    );
}
