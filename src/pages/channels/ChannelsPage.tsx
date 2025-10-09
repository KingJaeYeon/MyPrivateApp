import useChannelStore from '@/store/channels.ts';
import React, { useState } from 'react';
import { DataTable } from '@/components/data-table.tsx';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { Button } from '@/components/ui/button.tsx';
import { ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input.tsx';
import { toast } from 'sonner';
import {
  CHANNEL_COLUMNS,
  ChannelColumns,
  text_columns,
} from '@/components/data-table-columns/channel-columns.tsx';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label.tsx';
import useSettingStore from '@/store/setting.ts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import useTagStore from '@/store/tag.ts';
import { IconArrowDown, IconArrowUp } from '@/assets/svg';
import { cn } from '@/lib/utils.ts';

export default function ChannelsPage() {
  const { data, removeTags, saved } = useChannelStore();
  const [isEdit, setEdit] = useState(false);

  const columns = CHANNEL_COLUMNS(isEdit);
  const onSavedHandler = async () => {
    if (confirm('저장하시겠습니까?')) {
      await saved();
      alert('저장되었습니다.');
    }
  };
  return (
    <div className="flex flex-1 px-4 gap-5 w-full">
      <DataTable<ChannelColumns, unknown>
        columns={text_columns}
        data={data}
        tableControls={(table) => {
          return (
            <div className={'flex justify-between w-full'}>
              <div className={'flex gap-1'}>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="outline" className="ml-auto" size={'sm'}>
                      Tag
                      <ChevronDown />
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
                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                          >
                            {column.id}
                          </DropdownMenuCheckboxItem>
                        );
                      })}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Input
                  placeholder="Search Tag..."
                  value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                  onChange={(event) => {
                    console.log(table.getColumn('name'));
                    return table.getColumn('name')?.setFilterValue(event.target.value);
                  }}
                  className="w-[200px] h-8"
                />
              </div>
              <div className={'flex gap-2'}>
                {isEdit ? (
                  <React.Fragment>
                    <Button
                      size={'sm'}
                      variant={'destructive'}
                      onClick={() => {
                        const selected = table.getSelectedRowModel().rows.map((r) => r.original);
                        if (selected.length === 0) {
                          toast.error('삭제할 항목을 선택하세요.');
                          return;
                        }
                        removeTags(selected);
                      }}
                    >
                      삭제
                    </Button>
                    <Button variant={'secondary'} size={'sm'} onClick={() => setEdit(false)}>
                      취소
                    </Button>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <AddChannelModal />
                    <Button size={'sm'} onClick={onSavedHandler}>
                      저장
                    </Button>
                    <Button size={'sm'} variant={'secondary'} onClick={() => setEdit(true)}>
                      수정
                    </Button>
                  </React.Fragment>
                )}
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
const nf = new Intl.NumberFormat();

function AddChannelModal() {
  const usedQuota = useSettingStore((r) => r.data.youtube.usedQuota);
  const { data, removeTags } = useChannelStore();
  const [select, setSelect] = useState<ChannelColumns | null>(null);
  const { JSONData, data: tags } = useTagStore.getState();
  const onCancel = () => {
    setSelect(null);
  };
  const [isOpen, setIsOpen] = useState(false);

  const onChangeHandler = (key: keyof ChannelColumns, value: string) => {
    const temp = { ...select };
    if (key === 'platform') {
      temp.platform = value.toLowerCase();
    }
    if (key === 'tag') {
      temp.tag = value;
    }
    if (key === 'memo') {
      temp.memo = value;
    }
    setSelect(temp as ChannelColumns);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button size={'sm'}>추가</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className={'max-w-[calc(100%-100px)] h-[calc(100%-100px)] flex flex-col'}>
        <AlertDialogHeader className={'flex flex-1'}>
          <AlertDialogTitle className={'flex gap-2 items-center mb-4'}>
            <div className={'text-xl'}>채널추가</div>
            <div className={'text-sm'}>
              (사용한 쿼터:{' '}
              <span className={'font-mono'}>{usedQuota.toLocaleString()} / 10000)</span>
            </div>
          </AlertDialogTitle>
          <div className={'flex-1 flex flex-col'}>
            <div className={'flex gap-2'}>
              <Label className={'min-w-[80px]'}>채널ID 검색:</Label>
              <Input />
              <Button>검색</Button>
            </div>
            <div className={'flex flex-1 gap-2 mt-2'}>
              <DataTable<ChannelColumns, unknown>
                columns={text_columns}
                onClickRow={setSelect}
                data={data}
              />
              {select && (
                <div className="w-[400px] border bg-background shadow-xl p-6 rounded-sm flex flex-col">
                  <div className={'flex flex-1 flex-col gap-3'}>
                    <div className={'flex justify-between'}>
                      <span className="tabular-nums text-xs flex gap-1 items-center">
                        <Avatar className={'w-6 h-6'}>
                          <AvatarImage src={select.icon} />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <p className={'font-bold'}>{`${select.name} (${select.channelId})`}</p>
                      </span>
                      <div>
                        <Button variant={'destructive'} size={'sm'}>
                          삭제
                        </Button>
                      </div>
                    </div>
                    <div className={'grid grid-cols-2 gap-y-1'}>
                      <div className={'flex'}>
                        <Label>국가:</Label>
                        <p
                          className={
                            'cursor-pointer break-words whitespace-normal pl-2 text-sm font-bold'
                          }
                        >
                          {select.regionCode}
                        </p>
                      </div>
                      <div className={'flex'}>
                        <Label>조회수:</Label>
                        <span className="tabular-nums text-sm pl-2 font-bold">
                          {nf.format(select.viewCount)}
                        </span>
                      </div>
                      <div className={'flex'}>
                        <Label>구독자 수:</Label>
                        <span className="tabular-nums text-sm pl-2 font-bold">
                          {nf.format(select.subscriberCount)}
                        </span>
                      </div>
                      <div className={'flex'}>
                        <Label>생성일:</Label>
                        <span className="tabular-nums text-sm pl-2 font-bold">
                          {select.publishedAt}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label>링크:</Label>
                      <span className="tabular-nums text-sm font-bold">{select.link}</span>
                    </div>
                    <div
                      className={'flex flex-1 relative overflow-auto scrollWidth3 border-t pt-4'}
                    >
                      <div className={'flex-col gap-4 absolute flex'}>
                        <div className={'flex flex-col gap-2'}>
                          <Label>플랫폼</Label>
                          <Input
                            className={'w-[90%]'}
                            value={select?.platform}
                            onChange={(e) => onChangeHandler('platform', e.target.value)}
                          />
                        </div>
                        <div className={'flex flex-col gap-2'}>
                          <div className={'flex gap-2 justify-between'}>
                            <Label>태그</Label>
                            <Button
                              size={'icon-sm'}
                              className={'w-5 h-5'}
                              variant={'ghost'}
                              onClick={() => setIsOpen(!isOpen)}
                            >
                              {isOpen ? <IconArrowDown /> : <IconArrowUp />}
                            </Button>
                          </div>
                          <div className={'flex gap-0.5 flex-wrap'}>
                            {select.tag === '' ? (
                              <Label className={'text-xs'}>선택안함</Label>
                            ) : (
                              select.tag.split(',').map((tag, i) => (
                                <Badge
                                  variant="secondary"
                                  key={i}
                                  onClick={() => {
                                    const currentTags = select?.tag ? select.tag.split(',') : [];
                                    if (currentTags.includes(tag)) {
                                      // 이미 있으면 제거
                                      const newTags = currentTags.filter((t) => t !== tag);
                                      onChangeHandler('tag', newTags.join(','));
                                    }
                                  }}
                                >
                                  {JSONData[tag]}
                                </Badge>
                              ))
                            )}
                          </div>
                          <div
                            data-isopen={isOpen}
                            className={cn('gap-1 flex flex-wrap mt-2', isOpen ? '' : 'hidden')}
                          >
                            {tags.map((tag, i) => {
                              const isSelected = select?.tag
                                .split(',')
                                .includes(tag.idx.toString());
                              return (
                                <Badge
                                  key={i}
                                  variant={isSelected ? 'secondary' : 'outline'}
                                  className={'cursor-pointer'}
                                  onClick={() => {
                                    const currentTags = select?.tag ? select.tag.split(',') : [];
                                    if (currentTags.includes(tag.idx.toString())) {
                                      // 이미 있으면 제거
                                      const newTags = currentTags.filter(
                                        (t) => t !== tag.idx.toString()
                                      );
                                      onChangeHandler('tag', newTags.join(','));
                                    } else {
                                      // 없으면 추가
                                      currentTags.push(tag.idx.toString());
                                      onChangeHandler('tag', currentTags.join(','));
                                    }
                                  }}
                                >
                                  {tag.name}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                        <div className={'flex flex-col gap-2'}>
                          <Label>메모</Label>
                          <Textarea
                            className={'resize-none'}
                            value={select?.memo}
                            onChange={(e) => onChangeHandler('memo', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <Button variant={'outline'} onClick={onCancel}>
                      취소
                    </Button>
                    <Button>저장</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className={'h-fit'}>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
