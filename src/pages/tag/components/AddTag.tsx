import useTagStore from "@/store/tag.ts";
import {useState} from "react";
import {TagColumns} from "@/components/data-table-columns/tag-columns.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import IconTrash from "@/assets/svg/IconTrash.tsx";
import {IconPlus} from "@/assets/svg";

const init = [{
    idx: '',
    name: '',
    usedChannels: 0,
    usedVideos: 0,
    total: 0
}]


export function AddTag() {
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