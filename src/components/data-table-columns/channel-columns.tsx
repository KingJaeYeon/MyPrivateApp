import {toast} from 'sonner';
import type {ColumnDef} from "@tanstack/react-table";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {Button} from "@/components/ui/button.tsx";
import Tip from "@/components/Tip.tsx";
import useTagStore from "@/store/tag.ts";

const nf = new Intl.NumberFormat();

export type ChannelColumns = {
    icon: string
    name: string;
    channelId: string;
    tag: string;
    publishedAt: string
    link: string;
    regionCode: string;
    viewCount: number;
    keyword: string
    subscriberCount: number; // ✅ 구독자 수
    memo: string;
    fetchedAt: string;
    platform: string;
}
export const text_columns = [{
    accessorKey: 'name',
    header: '채널명',
    cell: ({row}) => (
        <span className="tabular-nums text-xs pl-2 flex gap-1 items-center">
                    <Avatar className={'w-6 h-6'}>
                        <AvatarImage src={row.original.icon}/>
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <p className={'font-bold'}>{row.original.name}</p>
                </span>
    ),
}, {
    accessorKey: 'channelId',
    header: '채널ID',
    cell: ({row}) => (
        <p className={'cursor-pointer text-xs break-words whitespace-normal pl-2 font-bold'}
           onClick={() => {
               navigator.clipboard.writeText(row.original.channelId);
               toast.success(`${row.original.channelId} 복사완료`);
           }}>
            {row.original.channelId}
        </p>
    ),
},
    {
        accessorKey: 'tag',
        header: '태그',
        size: 200,
        cell: ({row}) => {
            const tags = useTagStore.getState().JSONData
            return (
                <div className={'flex w-full flex-wrap gap-0.5'}>
                    {row.original.tag.split(',').map((tag, i) => (
                        <Badge variant="secondary" key={i}>{tags[tag]}</Badge>
                    ))}
                </div>
            )
        },
    },
    {
        accessorKey: 'regionCode',
        header: '국가',
        size: 50,
        cell: ({row}) => (
            <p className={'cursor-pointer text-xs break-words whitespace-normal pl-2'}>
                {row.original.regionCode}
            </p>
        ),
    },
    {
        accessorKey: 'subscriberCount',
        header: '구독자 수',
        size: 50,
        cell: ({row}) => (
            <span className="tabular-nums text-xs pl-2">{nf.format(row.original.subscriberCount)}</span>
        ),
    },
    {
        accessorKey: 'viewCount',
        header: '총 조회수',
        size: 120,
        cell: ({row}) => (
            <span className="tabular-nums text-xs pl-2">{nf.format(row.original.viewCount)}</span>
        ),
    },
    {
        accessorKey: 'memo',
        header: '메모',
        size: 120,
        cell: ({row}) => (
            <Tip txt={row.original.memo} className={'max-w-[400px] w-full'}>
                <span
                    className={'ellipsisLine2 flex cursor-pointer min-w-[250px] w-full text-xs break-words whitespace-normal'}>{row.original.memo}</span>
            </Tip>

        ),
    },
    {
        accessorKey: 'keyword',
        header: '키워드',
        size: 120,
        cell: ({row}) => (
            <span className="tabular-nums text-xs pl-2">{row.original.keyword}</span>
        ),
    },
    {
        accessorKey: 'publishedAt',
        header: '생성일',
        size: 120,
        cell: ({row}) => (
            <span className="tabular-nums text-xs pl-2">{row.original.publishedAt}</span>
        ),
    }, {
        accessorKey: 'platform',
        header: '플랫폼',
        size: 120,
        cell: ({row}) => (<Badge variant="destructive">
                {row.original.platform}</Badge>
        ),
    }, {
        accessorKey: 'fetchedAt',
        header: '갱신날짜',
        size: 120,
        cell: ({row}) => (
            <span className="tabular-nums text-xs pl-2">{row.original.fetchedAt}</span>
        ),
    }, {
        accessorKey: 'link',
        header: '링크',
        size: 120,
        cell: ({row}) => (
            <Button
                size="sm"
                variant="secondary"
                onClick={() => window.electronAPI.openExternal(row.original.link)}
            >
                열기
            </Button>
        ),
        enableSorting: false,
    },]

export const CHANNEL_COLUMNS = (isEdit?: boolean): ColumnDef<ChannelColumns>[] => {
    const cols: ColumnDef<ChannelColumns>[] = []
    if (isEdit) {
        cols.push({
            id: "select",
            header: ({table}) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />

            ),
            cell: ({row}) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className={'ml-2'}
                />
            ),
            enableSorting: false,
            enableHiding: false,
        })
    }
    cols.push({
            accessorKey: 'name',
            header: '채널명',
            cell: ({row}) => (
                <span className="tabular-nums text-xs pl-2">
                    <Avatar className={'w-2 h-2'}>
                        <AvatarImage src={row.original.icon}/>
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div>{row.original.name}</div>
                </span>
            ),
        }, {
            accessorKey: 'channelId',
            header: '채널ID',
            cell: ({row}) => (
                <p className={'cursor-pointer text-xs break-words whitespace-normal pl-2'}
                   onClick={() => {
                       navigator.clipboard.writeText(row.original.channelId);
                       toast.success(`${row.original.channelId} 복사완료`);
                   }}>
                    {row.original.channelId}
                </p>
            ),
        },
        {
            accessorKey: 'tag',
            header: '태그',
            cell: ({row}) => (
                <div className={'flex w-full flex-wrap gap-0.5'}>
                    {row.original.tag.split(',').map((tag, i) => (
                        <Badge variant="secondary" key={i}>{tag}</Badge>
                    ))}
                </div>
            ),
        },
        {
            accessorKey: 'regionCode',
            header: '국가',
            size: 30,
            cell: ({row}) => (
                <p className={'cursor-pointer text-xs break-words whitespace-normal pl-2'}>
                    {row.original.regionCode}
                </p>
            ),
        },
        {
            accessorKey: 'subscriberCount',
            header: '구독자 수',
            size: 120,
            cell: ({row}) => (
                <span className="tabular-nums text-xs pl-2">{nf.format(row.original.subscriberCount)}</span>
            ),
        },
        {
            accessorKey: 'viewCount',
            header: '총 조회수',
            size: 120,
            cell: ({row}) => (
                <span className="tabular-nums text-xs pl-2">{nf.format(row.original.viewCount)}</span>
            ),
        },
        {
            accessorKey: 'memo',
            header: '메모',
            size: 120,
            cell: ({row}) => (
                <Tip txt={row.original.memo} className={'max-w-[400px] w-full'}>
                    <span
                        className={'ellipsisLine2 flex cursor-pointer min-w-[250px] w-full text-xs break-words whitespace-normal'}>{row.original.memo}</span>
                </Tip>

            ),
        },
        {
            accessorKey: 'keyword',
            header: '키워드',
            size: 120,
            cell: ({row}) => (
                <span className="tabular-nums text-xs pl-2">{row.original.keyword}</span>
            ),
        },
        {
            accessorKey: 'publishedAt',
            header: '생성일',
            size: 120,
            cell: ({row}) => (
                <span className="tabular-nums text-xs pl-2">{row.original.publishedAt}</span>
            ),
        }, {
            accessorKey: 'link',
            header: '링크',
            size: 120,
            cell: ({row}) => (
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => window.electronAPI.openExternal(row.original.link)}
                >
                    열기
                </Button>
            ),
            enableSorting: false,
        }, {
            accessorKey: 'platform',
            header: '플랫폼',
            size: 120,
            cell: ({row}) => (
                <span className="tabular-nums text-xs pl-2">{row.original.platform}</span>
            ),
        }, {
            accessorKey: 'fetchedAt',
            header: '갱신날짜',
            size: 120,
            cell: ({row}) => (
                <span className="tabular-nums text-xs pl-2">{row.original.fetchedAt}</span>
            ),
        })

    return cols
}
