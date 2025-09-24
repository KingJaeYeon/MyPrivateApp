import {useState} from 'react'
import {SystemProvider} from "@/providers/system-provider.tsx";
import {Routes, Route} from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle.tsx";
import Navigator from "@/components/Navigator.tsx";
import {Home} from "@/pages/home/Home.tsx";

function App() {
    const [count, setCount] = useState(0)

    return (
        <SystemProvider>
            <div className="flex min-h-svh flex-col items-center justify-center w-full">
                <div
                    className={
                        'flex items-center text-lg h-[36px] drag justify-between w-full bg-secondary pl-[80px] pr-[12px]'
                    }
                >
                    <div className={'flex gap-6 items-center'}>
                        <p className={'text-sm'}>YouTube Searcher</p>
                    </div>
                    <ThemeToggle/>
                </div>
                <Navigator/>
                <Routes>
                    <Route path={'/'} element={<Home/>}/>
                    {/*<Route path={'/about'} element={<About/>}/>*/}
                    {/*<Route path={'/search-videos'} element={<SearchVideo/>}/>*/}
                    {/*<Route path={'/search-videos/result'} element={<SearchVideoResult/>}/>*/}
                    {/*<Route path={'/channels'} element={<ChannelsPage/>}/>*/}
                    <Route path="*" element={<div>Not Found</div>}/>
                </Routes>
            </div>
        </SystemProvider>
    )
}

export default App
