import useSettingStore from "@/store/setting.ts";
import React from "react";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";

export function ExcelFilesLocation() {

    const {location, name} = useSettingStore(r => r.data.folder)
    const {updateIn} = useSettingStore()
    const {data} = useSettingStore.getState()

    async function handleClick() {
        const result = await window.electronAPI.pickFolder()
        if (!result) return;

        await updateIn('folder', {
            ...data.folder,
            location: result
        })
    }

    async function generateFiles() {
        // const hasExcelFies = fs.readdirSync('/Users/pyj')
        // console.log(hasExcelFies)
        const isAllFill= !!name.channel &&
            !!name.tag &&
            !!name.progress &&
            !!name.english &&
            !!name.prompt &&
            !!name.reference &&
            !!name.result
        if (!isAllFill) {
            alert('FileName Rule 먼저 체워 주세요.')
            return
        }

        const { result, ...others } = name
        const files = Object.values(others)
        const allXlsx = files.every(f => /\.xlsx?$/.test(f.toLowerCase()))
        if (!allXlsx) {
            alert("result를 제외한 모든 파일명이 .xlsx 확장자를 가져야 합니다.")
            return
        }

        const test = await window.fsApi.exists(`${location}/${name.tag}`)
        console.log(test)
    }

    return (
        <React.Fragment>
            <Label htmlFor="mode" className="min-w-[100px]">
                Location
            </Label>
            <Input className="w-[500px] h-8"
                   value={location}
                   onClick={handleClick}
                   placeholder={'폴더를 지정해주세요.'}
                   readOnly/>
            {location && <Button variant={'secondary'} onClick={generateFiles}>Excel 생성</Button>}
        </React.Fragment>
    );
}