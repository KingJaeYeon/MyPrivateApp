import useSettingStore from '@/store/setting.ts';
import {useState} from 'react';
import {Label} from '@/components/ui/label.tsx';
import {Input} from '@/components/ui/input.tsx';
import {CancelButton, ConnectButton, DeleteButton, EditButton,} from '@/pages/home/components/buttons.tsx';
import {ExcelFilesLocation} from "@/pages/home/components/ExcelFilesLocation.tsx";
import {FileNameRule} from "@/pages/home/components/FileNameRule.tsx";
import {SavedResult} from "@/pages/home/components/SavedResult.tsx";

export type ApiType = 'youtubeApiKey';

export function Home() {
    const youtubeApiKey = useSettingStore(r => r.data.youtube.apiKey);
    const [editValues, setEditValues] = useState({youtubeApiKey: ''});
    const [isEditing, setIsEditing] = useState({youtubeApiKey: false});
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
                    <DeleteButton/>
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
        <div className={'flex flex-1 w-full p-4 flex-col gap-8'}>
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
                <div className="flex w-full items-center gap-4">
                    <ExcelFilesLocation/>
                </div>
            </div>
            <FileNameRule/>
            <SavedResult/>
        </div>
    );
}


