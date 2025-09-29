import {Button} from '@/components/ui/button.tsx';
import {Trash2} from 'lucide-react';
import useSettingStore from '@/store/setting.ts';
import type {ApiType} from '@/pages/home/Home.tsx';
import {useMutation} from '@tanstack/react-query';
import {pingTest} from '@/service/pingtest.ts';
import React from 'react';

export function DeleteButton() {
    const {updateIn} = useSettingStore();

    const deleteKey = async () => {
        const isDelete = confirm('정말 삭제하시겠습니까?');
        if (isDelete) {
            await updateIn('youtube', {usedQuota: 0, apiKey: ''});
            alert('삭제되었습니다. 다시 입력해주세요.');
        }
    };

    return (
        <Button variant="destructive" onClick={deleteKey}>
            <Trash2/>
        </Button>
    );
}

export function ConnectButton(
    {type, editValues, setIsEditing}:
    {
        type: ApiType;
        editValues: { youtubeApiKey: string; };
        setIsEditing: React.Dispatch<React.SetStateAction<{ youtubeApiKey: boolean; }>>;
    }) {

    const {updateIn} = useSettingStore();

    const {mutate, isPending} = useMutation({
        mutationFn: ({apiKey, type}: { apiKey: string; type: ApiType }) =>
            pingTest({apiKey, type}),
        onSuccess: async () => {
            await updateIn('youtube', {
                apiKey: editValues[type],
                usedQuota: 0
            });
            setIsEditing((prev) => ({...prev, [type]: false}));
            alert('API 키 저장 완료');
        },
        onError: async (error: any) => {
            if (error.message.includes('quota')) {
                await updateIn('youtube', {
                    apiKey: editValues[type],
                    usedQuota: 0
                });
                alert('API 키가 저장되었습니다. 다만 할당량이 초과되었습니다.');
                return;
            }
            alert('API 키가 유효하지 않거나 연결에 실패했습니다: ' + error.message);
        },
    });
    return (
        <Button
            disabled={isPending}
            onClick={() => {
                if (!editValues[type] || editValues[type].trim() === '') {
                    alert('API 키를 입력해주세요.');
                    return;
                }
                mutate({type, apiKey: editValues[type].trim()});
            }}
        >
            연결
        </Button>
    );
}

export function CancelButton(
    {type, setIsEditing, setEditValues}:
    {
        type: ApiType;
        setIsEditing: React.Dispatch<React.SetStateAction<{ youtubeApiKey: boolean; }>>;
        setEditValues: React.Dispatch<React.SetStateAction<{ youtubeApiKey: string; }>>;
    },
) {
    const handleCancel = () => {
        setIsEditing((prev) => ({...prev, [type]: false}));
        setEditValues((prev) => ({...prev, [type]: ''}));
    };
    return (
        <Button
            variant="secondary"
            onClick={handleCancel}
        >
            취소
        </Button>
    );
}

export function EditButton(
    {type, setIsEditing, setEditValues}:
    {
        type: ApiType;
        setIsEditing: React.Dispatch<React.SetStateAction<{ youtubeApiKey: boolean; }>>;
        setEditValues: React.Dispatch<React.SetStateAction<{ youtubeApiKey: string; }>>;
    },
) {
    const youtubeApiKey = useSettingStore(r => r.data.youtube.apiKey);

    const handleEdit = (type: ApiType) => {
        setIsEditing((prev) => ({...prev, [type]: true}));
        // 현재 저장된 값으로 초기화
        setEditValues((prev) => ({...prev, [type]: youtubeApiKey}));
    };

    return (
        <Button
            variant="secondary"
            onClick={() => handleEdit(type)}
        >
            수정
        </Button>
    );
}