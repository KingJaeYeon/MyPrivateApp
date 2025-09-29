import useSettingStore from '@/store/setting.ts';
import {useRef, useState} from 'react';
import {Label} from '@/components/ui/label.tsx';
import {Input} from '@/components/ui/input.tsx';
import {
    CancelButton,
    ConnectButton,
    DeleteButton,
    EditButton,
} from '@/pages/home/components/buttons.tsx';
import {Button} from '@/components/ui/button.tsx';
// import fs from 'fs';

export type ApiType = 'youtubeApiKey';

export function Home() {
    const youtubeApiKey = useSettingStore(r => r.data.youtube.apiKey);

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
                    <DeleteButton />
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

    const location = useSettingStore(r => r.data.folder.location)
    const {updateIn} = useSettingStore()
    const {data} = useSettingStore.getState()
    const inputRef = useRef<HTMLInputElement | null>(null);

    async function handleClick() {
        window.api.pickFolder().then(async (result) => {
            if (result) {
                await updateIn('folder', {
                    ...data.folder,
                    location: result
                })

            }
        })
    }

    function onChangePath(e: any) {
        const result = e.target
        console.log(e)
        alert(result)
        const selectFolderPath = result.filePaths[0];
        alert(selectFolderPath)
    }

    return (
        <div className={'flex gap-4'}>
            <Input value={location} readOnly onClick={handleClick} placeholder={'폴더를 지정해주세요.'}/>
            <form>
                <Input type={'file'} accept={'.xls,.xlsx'} webkitdirectory={'true'} hidden ref={inputRef}
                       onChange={onChangePath}/>
            </form>
            <Button variant={'secondary'} >Excel 생성</Button>

        </div>
    );
}
