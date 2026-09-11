import { SITE_DESCRIPTION, SITE_NAME, GITHUB_REPO } from '../config'

export function About() {
  return (
    <div className="about card">
      <h1>关于</h1>
      <p>
        欢迎来到 <strong>{SITE_NAME}</strong>。{SITE_DESCRIPTION}。
      </p>
      <p>
        本站使用 Vite、React、TypeScript 与 react-markdown 构建，部署于 GitHub
        Pages。
      </p>
      <p>
        仓库地址：{' '}
        <a
          href={`https://github.com/${GITHUB_REPO}`}
          target="_blank"
          rel="noreferrer"
        >
          github.com/{GITHUB_REPO}
        </a>
      </p>
    </div>
  )
}
