import {DataTable} from "@/components/data-table.tsx";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {Button} from "@/components/ui/button.tsx";
import {ChevronDown} from "lucide-react";
import {TAG_COLUMNS, TagColumns} from "@/components/data-table-columns/tag-columns.tsx";
import React, {useState} from "react";
import {Input} from "@/components/ui/input.tsx";
import IconTrash from "@/assets/svg/IconTrash.tsx";
import {IconPlus} from "@/assets/svg";
import useTagStore from "@/store/tag.ts";
import {toast} from "sonner";

export default function TagPage() {
    const {data, removeTags, saved} = useTagStore()
    const [isEdit, setEdit] = useState(false);

    const columns = TAG_COLUMNS(isEdit)

    const onSavedHandler = async () => {
        if (confirm('저장하시겠습니까?')) {
            await saved()
            alert('저장되었습니다.')
        }
    }

    return <div className="flex flex-1 px-4 gap-5 w-full">
        <div className={'flex flex-7'}>
            <DataTable<TagColumns, unknown>
                columns={columns}
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
                                placeholder="Search Idx..."
                                value={(table.getColumn("idx")?.getFilterValue() as string) ?? ""}
                                onChange={(event) => {
                                    console.log(table.getColumn("idx"))
                                    return table.getColumn("idx")?.setFilterValue(event.target.value)
                                }
                                }
                                className="w-[130px] h-8"
                            />
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
        <AddTag/>
    </div>
}

const init = [{
    idx: '',
    name: '',
    usedChannels: 0,
    usedVideos: 0,
    total: 0
}]

function AddTag() {
    const {push} = useTagStore()
    const [inputs, setInputs] = useState<TagColumns[]>(init)
    const pushInput = () => {
        if (confirm('추가하시겠습니까?\n(엑셀 갱신버튼은 따로 눌러야합니다.)')) {
            const result = push(inputs)
            if (!result) {
                return
            }

            setInputs(init)
        }
    }

    const addInput = () => {
        setInputs([
            ...inputs,
            {
                idx: '',
                name: '',
                usedChannels: 0,
                usedVideos: 0,
                total: 0
            }
        ]);
    };

    const removeInput = (index: number) => {
        if (confirm('입력칸을 삭제하시겠습니까?\n(입력정보도 삭제됩니다.)')) {
            setInputs(inputs.filter((_, i) => i !== index));
        }
    };

    const setValues = (index: number, key: string, value: string) => {
        setInputs(
            inputs.map((input, i) => {
                if (i === index) {
                    return {...input, [key]: value};
                }
                return input;
            })
        );
    };

    const isEmpty = inputs.every(e => e.name !== '' && e.idx !== '')

    return <div className={'flex flex-3 flex-col'}>
        <div className={'flex justify-end mb-2'}>
            <Button variant={'secondary'} disabled={!isEmpty} onClick={pushInput}>추가</Button>
        </div>
        <div className={'flex flex-col'}>
            {inputs.map((input, i) => {
                return <div className={'flex gap-2 mb-3'} key={i}>
                    <Input value={input.idx}
                           type={'number'}
                           placeholder={'idx'}
                           className={'w-[150px]'}
                           onChange={(e) =>
                               setValues(i, 'idx', e.target.value.trim())
                           }/>
                    <Input value={input.name}
                           placeholder={'태그명'}
                           onChange={(e) =>
                               setValues(i, 'name', e.target.value.trim())
                           }/>
                    <Button size={'icon'} disabled={inputs.length === 1}
                            onClick={() => removeInput(i)}
                    ><IconTrash/>
                    </Button>
                </div>
            })}

        </div>
        {inputs.length <= 5 &&
            <Button className={'font-bold'} onClick={addInput}>태그 추가<IconPlus/></Button>
        }
    </div>
}