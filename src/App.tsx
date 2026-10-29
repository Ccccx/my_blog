import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { About } from './pages/About'
import { CodeHarnessFeature, CodeHarnessOverview } from './pages/CodeHarnessDoc'
import { CodeHarnessHome } from './pages/CodeHarnessHome'
import { Home } from './pages/Home'
import { PostDetail } from './pages/PostDetail'

const PandaParadise = lazy(() =>
  import('./pages/PandaParadise').then((mod) => ({ default: mod.PandaParadise })),
)

function App() {
  return (
    <BrowserRouter basename="/my_blog">
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="posts/:slug" element={<PostDetail />} />
          <Route path="about" element={<About />} />
          <Route
            path="panda-paradise"
            element={
              <Suspense fallback={<div className="panda-loading">正在铺开草地…</div>}>
                <PandaParadise />
              </Suspense>
            }
          />
          <Route path="code-harness" element={<CodeHarnessHome />} />
          <Route path="code-harness/features/:slug" element={<CodeHarnessFeature />} />
          <Route path="code-harness/:page" element={<CodeHarnessOverview />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
