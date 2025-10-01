import {DataTable} from "@/components/data-table.tsx";
import type {VideoRow} from "@/service/youtube.ts";
import {columns} from "@/components/video-table-columns.tsx";
import {useFilterStore} from "@/store/search-video.ts";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {Button} from "@/components/ui/button.tsx";
import {ChevronDown} from "lucide-react";

export default function TagPage() {
    const rows = useFilterStore((s) => s.result);
    return <div className="flex flex-1 px-4 w-full">
        <DataTable<VideoRow, unknown>
            columns={columns}
            data={rows}
            tableControls={(table) => {
            return <div>
                <Input
                    placeholder="Filter emails..."
                    value={(table.getColumn("link")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("link")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Button variant="outline" className="ml-auto">
                            Columns <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
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
            </div>
        }}/>
        <div></div>
    </div>
}