import type { RepositoryContent } from '../types/repository_content'
import { File, Folder } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { LatestCommit } from '../types/commit'
import { timeAgo } from '../utils/timeAgo'

interface FileTreeRowProps {
    owner: string
    repo: string
    item: RepositoryContent
    fetchCommit: boolean
}

export default function FileTreeRow({ owner, repo, item, fetchCommit }: FileTreeRowProps) {

    // State to hold the latest commit for the file/directory
    const [commit, setCommit] = useState<LatestCommit | null>(null)

        useEffect(() => {
        if (!fetchCommit) return

        const controller = new AbortController()
        
        // Fetch the latest commit for the file/directory
        const fetchLatestCommit = async () => {
            try {
                const response = await fetch(
                    `/api/github/repository/${owner}/${repo}/latest-commit/?path=${encodeURIComponent(item.path)}`,
                    { signal: controller.signal }
                )

                if (!response.ok) return

                const data: LatestCommit | null = await response.json()
                setCommit(data)

            } catch {
                // Aborted or failed fetch, row will not display commit info
            }
        }

        fetchLatestCommit()

        return () => {
            controller.abort()
        }

    }, [owner, repo, item.path, fetchCommit])


    return (
        <div key={item.path} className="repository-file-tree-row">
            {item.type === 'dir'
                ? <Folder size={18} className="repository-file-tree-folder" /> 
                : <File size={18} className="repository-file-tree-file" />}
            <div className="repository-file-tree-name-container">
                <a 
                    href={item.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="repository-file-tree-name"
                >
                    {item.name}
                </a>
            </div>
            <a
                href={commit?.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="repository-latest-commit-message">
                {commit?.commit.message.split('\n')[0]}
            </a>
            <span className="repository-latest-commit-time">{commit &&timeAgo(commit?.commit.author.date)}</span>
        </div>
    )
}