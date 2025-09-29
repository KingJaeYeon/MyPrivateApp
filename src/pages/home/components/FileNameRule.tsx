import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {useEffect, useState} from "react";
import useSettingStore, {State} from "@/store/setting.ts";
import Tip from "@/components/Tip.tsx";
import IconMoreInfo from "@/assets/svg/IconMoreInfo.tsx";
import {Button} from "@/components/ui/button.tsx";

export function FileNameRule() {
    const [editValues, setEditValues] = useState<State['data']['folder']['name']>()
    const {location, name: names} = useSettingStore(r => r.data.folder)
    const {updateIn} = useSettingStore()

    useEffect(() => {
        setEditValues(names)
    }, [names]);

    function editHandler(key: keyof State['data']['folder']['name'], value: string) {
        setEditValues((prev) => {
            if (!prev) return prev; // prev가 undefined면 그대로 반환
            return {
                ...prev,
                [key]: value
            }
        })
    }

    async function UpdateHandler() {
        const isAllFill= !!editValues?.channel &&
            !!editValues?.tag &&
            !!editValues?.progress &&
            !!editValues?.english &&
            !!editValues?.prompt &&
            !!editValues?.reference &&
            !!editValues?.result
        if (!isAllFill) {
            alert('FileName Rule 먼저 체워 주세요.')
            return
        }

        const { result, ...others } = editValues
        const files = Object.values(others)
        const allXlsx = files.every(f => /\.xlsx?$/.test(f.toLowerCase()))
        if (!allXlsx) {
            alert("result를 제외한 모든 파일명이 .xlsx 확장자를 가져야 합니다.")
            return
        }

        await updateIn('folder', {
            name: editValues,
            location
        })
        alert('저장되었습니다.')
    }

    return <div className="flex w-fit flex-col">
        <div className={'flex justify-between items-center'}>
            <Label htmlFor="mode" className="min-w-[100px]">
                FileName Rule
            </Label>
            <div className={'flex items-end'}>
                <Button variant={'secondary'} onClick={UpdateHandler}>저장</Button>
            </div>
        </div>
        <div className="flex w-full items-center gap-4 mb-4">
            <div className={'flex gap-1 flex-col'}>
                <Label htmlFor="mode" className={'text-xs'}>
                    Tags
                </Label>
                <Input onChange={e => editHandler('tag', e.target.value)} value={editValues?.tag}/>
            </div>
            <div className={'flex gap-1 flex-col'}>
                <Label htmlFor="mode" className={'text-xs'}>
                    Channel
                </Label>
                <Input onChange={e => editHandler('channel', e.target.value)} value={editValues?.channel}/>
            </div>
            <div className={'flex gap-1 flex-col'}>
                <Label htmlFor="mode" className={'text-xs'}>
                    Result
                    <Tip txt={'날짜 포함할려면 맨 앞에 [yyyy-MM-dd]로 넣어주세요'}> <IconMoreInfo/></Tip>
                </Label>
                <Input onChange={e => editHandler('result', e.target.value)} value={editValues?.result}/>
            </div>
            <div className={'flex gap-1 flex-col'}>
                <Label htmlFor="mode" className={'text-xs'}>
                    Prompt
                </Label>
                <Input onChange={e => editHandler('prompt', e.target.value)} value={editValues?.prompt}/>
            </div>
        </div>
        <div className="flex w-full items-center gap-4">
            <div className={'flex gap-1 flex-col'}>
                <Label htmlFor="mode" className={'text-xs'}>
                    Reference
                </Label>
                <Input onChange={e => editHandler('reference', e.target.value)} value={editValues?.reference}/>
            </div>
            <div className={'flex gap-1 flex-col'}>
                <Label htmlFor="mode" className={'text-xs'}>
                    English
                </Label>
                <Input onChange={e => editHandler('english', e.target.value)} value={editValues?.english}/>
            </div>
            <div className={'flex gap-1 flex-col'}>
                <Label htmlFor="mode" className={'text-xs'}>
                    Progress
                </Label>
                <Input onChange={e => editHandler('progress', e.target.value)} value={editValues?.progress}/>
            </div>
        </div>

    </div>
}