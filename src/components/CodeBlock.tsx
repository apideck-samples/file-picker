import { ReactNode } from 'react'
import Highlight from 'react-highlight'
import { useClipboard } from 'use-clipboard-copy'

interface Props {
  title: string | ReactNode
  code: string
  lang?: string
}

const CodeBlock = ({ title, lang = 'javascript', code }: Props) => {
  const clipboard = useClipboard({ copiedTimeout: 1200 })

  return (
    <div className="bg-gray-100 rounded-xl">
      <div className="flex items-center justify-between px-3 py-2 m-0 text-gray-800 bg-gray-100 border-t border-b border-l border-r border-gray-200 border-solid select-none rounded-t-md dark:bg-gray-800 dark:text-gray-100 dark:border-none">
        <h3 className="text-sm font-normal leading-normal">{title}</h3>
        {clipboard.copied ? (
          <span className="text-sm py-0.5">Copied</span>
        ) : (
          <svg
            width={26}
            height={26}
            viewBox="0 3 24 24"
            fill="none"
            className="stroke-current transform hover:rotate-[-4deg] transition cursor-pointer hover:text-primary-600 text-gray-500"
            onClick={() => clipboard.copy(code)}
          >
            <path
              d="M12.9975 10.7499L11.7475 10.7499C10.6429 10.7499 9.74747 11.6453 9.74747 12.7499L9.74747 21.2499C9.74747 22.3544 10.6429 23.2499 11.7475 23.2499L20.2475 23.2499C21.352 23.2499 22.2475 22.3544 22.2475 21.2499L22.2475 12.7499C22.2475 11.6453 21.352 10.7499 20.2475 10.7499L18.9975 10.7499"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M17.9975 12.2499L13.9975 12.2499C13.4452 12.2499 12.9975 11.8022 12.9975 11.2499L12.9975 9.74988C12.9975 9.19759 13.4452 8.74988 13.9975 8.74988L17.9975 8.74988C18.5498 8.74988 18.9975 9.19759 18.9975 9.74988L18.9975 11.2499C18.9975 11.8022 18.5498 12.2499 17.9975 12.2499Z"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13.7475 16.2499L18.2475 16.2499"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13.7475 19.2499L18.2475 19.2499"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <g className="transition-opacity opacity-0">
              <path
                d="M15.9975 5.99988L15.9975 3.99988"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19.9975 5.99988L20.9975 4.99988"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11.9975 5.99988L10.9975 4.99988"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </svg>
        )}
      </div>
      <div className="flex justify-between border-b border-l border-r border-gray-200 rounded-b-md dark:border-none api-reference">
        <Highlight className={`${lang} hide-scrollbar max-h-100 font-mono text-xs whitespace-pre`}>
          {code}
        </Highlight>
      </div>
    </div>
  )
}

export default CodeBlock
