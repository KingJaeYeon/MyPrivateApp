import useSettingStore from "@/store/setting.ts";
import React, {useEffect, useState} from "react";
import {Label} from "@/components/ui/label.tsx";
import {Button} from "@/components/ui/button.tsx";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {cn} from "@/lib/utils.ts";

export function SavedResult() {
    const {name, location} = useSettingStore(r => r.data.folder);
    const [savedFiles, setSavedFiles] = useState<string[]>([])
    const [select, setSelect] = useState<string>('')

    async function getFiles() {
        const result = await window.fsApi.listExcel(`${location}/${name.result.split('/')[0]}`)
        setSavedFiles(result)
    }

    useEffect(() => {
        getFiles()
    }, []);

    return <div className={'flex flex-col gap-4 max-w-[1000px] w-full'}>
        <div className={'flex min-w-fit justify-between'}>
            <Label htmlFor="mode" className="min-w-[100px]">
                Saved Result
            </Label>
            <Button size={'sm'} onClick={getFiles}>새로고침</Button>
        </div>
        <div className={'flex h-80 gap-4'}>
            <ScrollArea className="h-full w-60 rounded-md border">
                <div className="p-4">
                    {savedFiles.map((fileName) => (
                        <React.Fragment key={fileName}>
                            <div className={cn("text-sm cursor-pointer", fileName === select && 'text-destructive')}
                                 onClick={() => setSelect(fileName)}
                            >
                                {fileName}
                            </div>
                            <Separator className="my-2"/>
                        </React.Fragment>
                    ))}
                </div>
            </ScrollArea>
            <div className={'border-red-500 flex-1 h-full border'}>d</div>
        </div>
    </div>
}