import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {useEffect, useState} from "react";
import useSettingStore, {State} from "@/store/setting.ts";
import {Button} from "@/components/ui/button.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {cn} from "@/lib/utils.ts";

export function FileNameRule() {
    const [editValues, setEditValues] = useState<State['data']['folder']['name']>()
    const [editFileDate, setEditFileDate] = useState<'date' | 'datetime'>()
    const {location, name: names, exportFile} = useSettingStore(r => r.data.folder)
    const {updateIn} = useSettingStore()

    useEffect(() => {
        setEditValues(names)
        setEditFileDate(exportFile.fileStampMode)
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
        const isAllFill = !!editValues?.channel &&
            !!editValues?.tag &&
            !!editValues?.progress &&
            !!editValues?.english &&
            !!editValues?.prompt &&
            !!editValues?.reference &&
            !!editValues?.result &&
            !!editFileDate

        if (!isAllFill) {
            alert('FileName Rule 먼저 체워 주세요.')
            return
        }

        const {result, ...others} = editValues
        const files = Object.values(others)
        const allXlsx = files.every(f => /\.xlsx?$/.test(f.toLowerCase()))
        const resultCheck = /^\//.test(result) || /\./.test(result)
        if (!allXlsx) {
            alert("result를 제외한 모든 파일명이 .xlsx, .xls 확장자를 가져야 합니다.")
            return
        }
        if (resultCheck) {
            alert("result는 맨앞에 /와 . 제외해야합니다.")
            return
        }

        await updateIn('folder', {
            name: editValues, location, exportFile: {
                fileStampMode: editFileDate
            }
        })
        alert('저장되었습니다.')
    }

    return <div className="flex w-fit flex-col">
        <div className={'flex justify-between items-center'}>
            <Label htmlFor="mode" className="min-w-[100px]">
                FileName Rule
                <div className={'flex items-center gap-1 text-green-500 text-xs'}>
                    <div className={'rounded-full bg-green-500 w-2.5 h-2.5'}/>
                    파일
                </div>
                |
                <div className={'flex items-center gap-2 text-destructive text-xs'}>
                    <div className={'flex items-center gap-1'}>
                        <div className={'rounded-full bg-destructive w-2.5 h-2.5'}/>
                        <span>폴더</span>
                    </div>
                    <div className={'flex gap-1'}>
                        <Checkbox checked={editFileDate === 'date'} onCheckedChange={_ => setEditFileDate('date')}/>
                        <span>날짜 [yyyy-MM-dd]</span>
                    </div>
                    <div className={'flex gap-1'}>
                        <Checkbox checked={editFileDate === 'datetime'}
                                  onCheckedChange={_ => setEditFileDate('datetime')}/>
                        <span>시간 [yyyy-MM-dd HH:mm]</span>
                    </div>
                </div>
            </Label>
            <div className={'flex items-end'}>
                <Button variant={'secondary'} onClick={UpdateHandler}>저장</Button>
            </div>
        </div>
        <div className="flex w-full items-center gap-4 mb-4">
            <div className={'flex gap-1 flex-col'}>
                <Label htmlFor="mode" className={'text-xs text-green-500'}>
                    Tags
                </Label>
                <Input className={cn(names.tag !== editValues?.tag && 'border-green-500')}
                       onChange={e => editHandler('tag', e.target.value)}
                       value={editValues?.tag}/>
            </div>
            <div className={'flex gap-1 flex-col'}>
                <Label htmlFor="mode" className={'text-xs text-green-500'}>
                    Channel
                </Label>
                <Input className={cn(names.channel !== editValues?.channel && 'border-green-500')}
                       onChange={e => editHandler('channel', e.target.value)}
                       value={editValues?.channel}/>
            </div>
            <div className={'flex gap-1 flex-col'}>
                <Label htmlFor="mode" className={'text-xs text-green-500'}>
                    Prompt
                </Label>
                <Input className={cn(names.prompt !== editValues?.prompt && 'border-green-500')}
                       onChange={e => editHandler('prompt', e.target.value)}
                       value={editValues?.prompt}/>
            </div>
            <div className={'flex gap-1 flex-col'}>
                <Label htmlFor="mode" className={'text-xs text-destructive'}>
                    Result
                </Label>
                <Input className={cn(names.result !== editValues?.result && 'border-destructive')}
                       onChange={e => editHandler('result', e.target.value)}
                       value={editValues?.result}/>
            </div>
        </div>
        <div className="flex w-full items-center gap-4">
            <div className={'flex gap-1 flex-col'}>
                <Label htmlFor="mode" className={'text-xs text-green-500'}>
                    Reference
                </Label>
                <Input className={cn(names.reference !== editValues?.reference && 'border-green-500')}
                       onChange={e => editHandler('reference', e.target.value)}
                       value={editValues?.reference}/>
            </div>
            <div className={'flex gap-1 flex-col'}>
                <Label htmlFor="mode" className={'text-xs text-green-500'}>
                    English
                </Label>
                <Input className={cn(names.english !== editValues?.english && 'border-green-500')}
                       onChange={e => editHandler('english', e.target.value)}
                       value={editValues?.english}/>
            </div>
            <div className={'flex gap-1 flex-col'}>
                <Label htmlFor="mode" className={'text-xs text-green-500'}>
                    Progress
                </Label>
                <Input className={cn(names.progress !== editValues?.progress && 'border-green-500')}
                       onChange={e => editHandler('progress', e.target.value)}
                       value={editValues?.progress}/>
            </div>
        </div>

    </div>
}