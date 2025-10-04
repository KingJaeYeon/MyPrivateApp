import useChannelStore from "@/store/channels.ts";
import React, {useState} from "react";
import {DataTable} from "@/components/data-table.tsx";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx";
import {ChevronDown} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
import {toast} from "sonner";
import {CHANNEL_COLUMNS, ChannelColumns, text_columns} from "@/components/data-table-columns/channel-columns.tsx";


export default function ChannelsPage(){
    const {data, removeTags, saved} = useChannelStore()
    const [isEdit, setEdit] = useState(false);

    const columns = CHANNEL_COLUMNS(isEdit)
    const onSavedHandler = async () => {
        if (confirm('저장하시겠습니까?')) {
            await saved()
            alert('저장되었습니다.')
        }
    }
    return <div className="flex flex-1 px-4 gap-5 w-full">
        <DataTable<ChannelColumns, unknown>
            columns={text_columns}
            data={data}
            tableControls={(table) => {
                return <div className={'flex justify-between w-full'}>
                    <div className={'flex gap-1'}>
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <Button variant="outline" className="ml-auto" size={'sm'}>
                                    Tag<ChevronDown/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                {table
                                    .getAllColumns()
                                    .filter((column) => column.getCanHide())
                                    .map((column) => {
                                        return (
                                            <DropdownMenuCheckboxItem
                                                key={column.id}
                                                className="capitalize"
                                                checked={column.getIsVisible()}
                                                onCheckedChange={(value) =>
                                                    column.toggleVisibility(!!value)
                                                }
                                            >
                                                {column.id}
                                            </DropdownMenuCheckboxItem>
                                        )
                                    })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Input
                            placeholder="Search Tag..."
                            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                            onChange={(event) => {
                                console.log(table.getColumn("name"))
                                return table.getColumn("name")?.setFilterValue(event.target.value)
                            }
                            }
                            className="w-[200px] h-8"
                        />
                    </div>
                    <div className={'flex gap-2'}>
                        {isEdit ? <React.Fragment>
                                <Button size={'sm'} variant={'destructive'} onClick={() => {
                                    const selected = table.getSelectedRowModel().rows.map(r => r.original);
                                    if (selected.length === 0) {
                                        toast.error("삭제할 항목을 선택하세요.");
                                        return;
                                    }
                                    removeTags(selected)
                                }}>삭제</Button>
                                <Button variant={'secondary'} size={'sm'} onClick={() => setEdit(false)}>취소</Button>
                            </React.Fragment> :
                            <React.Fragment>
                                <Button size={'sm'} onClick={onSavedHandler}>저장</Button>
                                <Button size={'sm'} variant={'secondary'} onClick={() => setEdit(true)}>수정</Button>
                            </React.Fragment>
                        }
                    </div>
                </div>
            }}/>
    </div>
}