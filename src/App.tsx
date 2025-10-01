import {SystemProvider} from "@/providers/system-provider.tsx";
import {Routes, Route} from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle.tsx";
import Navigator from "@/components/Navigator.tsx";
import {Home} from "@/pages/home/Home.tsx";
import SearchVideo from "@/pages/search-video/SearchVideo.tsx";
import SearchVideoResult from "@/pages/search-video-result/SearchVideoResult.tsx";
import {useEffect, useState} from "react";
import useSettingStore from "@/store/setting.ts";
import {ThemeProvider} from "@/providers/theme-provider.tsx";
import TagPage from "@/pages/tag/TagPage.tsx";
import useTagStore from "@/store/tag.ts";

function App() {
    const {init} = useSettingStore();
    const {location, name} = useSettingStore(r => r.data.folder)
    const {init: tagInit} = useTagStore()
    const [isLoading, setIsLoading] = useState(false);

    // 앱 시작 시 1) 저장된 키 자동 로드
    useEffect(() => {
        async function start() {
            try {
                await init()
                console.log('API Store initialized');
            } catch (e) {
                console.error(e)
            } finally {
                setIsLoading(false);
                console.log('Initialization complete, loading state set to false', isLoading);
            }
        }

        start()
    }, []);

    useEffect(() => {
        async function start() {
            if (location) {
                try {
                    await tagInit(`${location}/${name.tag}`)
                    console.log('API Store initialized');
                } catch (e) {
                    console.error(e)
                } finally {
                    console.log('Initialization complete, loading state set to false', isLoading);
                }
            }
        }
        start()
    }, [location]);

    if (isLoading) {
        // ✅ 로딩 중일 때 보여줄 화면
        return (
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <div className="flex h-screen items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    {/* 필요하면 "로딩 중..." 텍스트도 함께 */}
                </div>
            </ThemeProvider>
        );
    }
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
                    <Route path={'/search-videos'} element={<SearchVideo/>}/>
                    <Route path={'/search-videos/result'} element={<SearchVideoResult/>}/>
                    <Route path={'/tags'} element={<TagPage/>}/>
                    {/*<Route path={'/channels'} element={<ChannelsPage/>}/>*/}
                    <Route path="*" element={<div>Not Found</div>}/>
                </Routes>
            </div>
        </SystemProvider>
    )
}

export default App
