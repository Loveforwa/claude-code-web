"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Plus,
  Search,
  Settings,
  MessageSquare,
  FolderOpen,
  Blocks,
  Code,
  Pencil,
  Sparkles,
  Briefcase,
  ChevronDown,
  Send,
  Copy,
  Check,
  RefreshCw,
  PanelLeftClose,
  PanelLeft,
  Book,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ProjectsList, type Project } from "./projects-list"
import { ProjectDetail } from "./project-detail"
import CustomizePage, { knowledgeBase } from "./customize-page"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isTyping?: boolean
}

type View = "chat" | "projects" | "project-detail" | "customize"

interface MentionItem {
  id: string
  name: string
  type: "knowledge" | "skill"
  description: string
}

// 打字机效果 Hook
function useTypewriter(text: string, speed: number = 20, enabled: boolean = true) {
  const [displayedText, setDisplayedText] = useState("")
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setDisplayedText(text)
      setIsComplete(true)
      return
    }

    setDisplayedText("")
    setIsComplete(false)
    let index = 0

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1))
        index++
      } else {
        setIsComplete(true)
        clearInterval(timer)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed, enabled])

  return { displayedText, isComplete }
}

// 代码块组件
function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-3 rounded-xl overflow-hidden bg-[#1e1e1e] border border-[#333]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-[#333]">
        <span className="text-xs text-[#888] font-mono">{language}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-[#888] hover:text-white hover:bg-[#444]"
          onClick={handleCopy}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          <span className="ml-1.5 text-xs">{copied ? "Copied" : "Copy"}</span>
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm font-mono text-[#d4d4d4] leading-relaxed">{code.trim()}</code>
      </pre>
    </div>
  )
}

// 解析消息内容
function parseContent(content: string) {
  const parts: { type: "text" | "code"; content: string; language?: string }[] = []
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
  let lastIndex = 0
  let match

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: content.slice(lastIndex, match.index) })
    }
    parts.push({ type: "code", content: match[2], language: match[1] || "plaintext" })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < content.length) {
    parts.push({ type: "text", content: content.slice(lastIndex) })
  }

  return parts.length > 0 ? parts : [{ type: "text" as const, content }]
}

// 消息内容渲染
function MessageContent({ content, isTyping = false }: { content: string; isTyping?: boolean }) {
  const { displayedText, isComplete } = useTypewriter(content, 15, isTyping)
  const textToShow = isTyping ? displayedText : content
  const parts = parseContent(textToShow)

  return (
    <div className="space-y-2">
      {parts.map((part, index) =>
        part.type === "code" ? (
          <CodeBlock key={index} code={part.content} language={part.language || "plaintext"} />
        ) : (
          <p key={index} className="whitespace-pre-wrap leading-7 text-foreground/90">
            {part.content}
            {isTyping && !isComplete && index === parts.length - 1 && (
              <span className="inline-block w-0.5 h-5 bg-primary ml-0.5 animate-pulse" />
            )}
          </p>
        )
      )}
    </div>
  )
}

// 思考中指示器
function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-3 py-4 animate-in fade-in duration-300">
      <div className="relative">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
        </div>
        <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Claude is thinking</span>
        <span className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" />
        </span>
      </div>
    </div>
  )
}

// 侧边栏项目
function SidebarItem({
  icon: Icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ElementType
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
        active
          ? "bg-secondary text-foreground font-medium"
          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
      )}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  )
}

// 快捷操作按钮
function QuickAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType
  label: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border bg-card hover:bg-secondary/50 text-sm text-foreground/80 hover:text-foreground transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5"
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  )
}



const sampleResponses = [
  `当然可以！这里是一个简单的 React 组件示例：

\`\`\`tsx
import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <div className="flex items-center gap-4">
      <button 
        onClick={() => setCount(c => c - 1)}
        className="px-4 py-2 rounded-lg bg-red-500 text-white"
      >
        -
      </button>
      <span className="text-2xl font-bold">{count}</span>
      <button 
        onClick={() => setCount(c => c + 1)}
        className="px-4 py-2 rounded-lg bg-green-500 text-white"
      >
        +
      </button>
    </div>
  )
}
\`\`\`

这个计数器组件使用了 React 的 useState Hook 来管理状态。点击按钮可以增加或减少计数值。`,

  `好的，我来帮你解释一下 async/await 的工作原理：

**async 函数** 总是返回一个 Promise。当你在函数前面加上 async 关键字时，这个函数会自动将返回值包装在 Promise 中。

**await 关键字** 只能在 async 函数内部使用，它会暂停函数的执行，直到 Promise 被解决。

\`\`\`javascript
async function fetchUserData(userId) {
  try {
    // await 会等待 fetch 完成
    const response = await fetch(\`/api/users/\${userId}\`)
    
    // 然后等待 JSON 解析完成
    const user = await response.json()
    
    return user
  } catch (error) {
    console.error('获取用户数据失败:', error)
    throw error
  }
}
\`\`\`

这比使用 .then() 链式调用要清晰得多，而且错误处理也更直观。`,

  `我可以帮你创建一个 Next.js API 路由。以下是示例代码：

\`\`\`typescript
// app/api/hello/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const name = searchParams.get('name') || 'World'
  
  return NextResponse.json({
    message: \`Hello, \${name}!\`,
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // 处理请求数据
  return NextResponse.json({
    received: body,
    status: 'success'
  })
}
\`\`\`

这个 API 路由支持 GET 和 POST 请求。GET 请求可以通过查询参数传递 name，POST 请求可以发送 JSON 数据。`,
]

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<View>("chat")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [activeNavItem, setActiveNavItem] = useState("chat")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [greeting, setGreeting] = useState("Hello")
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState("")
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 })
  const [selectedMentions, setSelectedMentions] = useState<MentionItem[]>([])

  // 获取可提及的项目列表（知识库）
  const mentionItems: MentionItem[] = knowledgeBase.map((kb) => ({
    id: kb.id,
    name: kb.name,
    type: "knowledge" as const,
    description: kb.description,
  }))

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  // 客户端设置问候语，避免 hydration 错误
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good morning")
    else if (hour < 18) setGreeting("Good afternoon")
    else setGreeting("Good evening")
  }, [])

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }

    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000))

    const assistantMessageId = (Date.now() + 1).toString()
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: sampleResponses[Math.floor(Math.random() * sampleResponses.length)],
      timestamp: new Date(),
      isTyping: true,
    }

    setMessages((prev) => [...prev, assistantMessage])
    setTypingMessageId(assistantMessageId)
    setIsLoading(false)

    // 打字完成后移除打字状态
    const typingDuration = assistantMessage.content.length * 15 + 500
    setTimeout(() => {
      setTypingMessageId(null)
      setMessages((prev) =>
        prev.map((msg) => (msg.id === assistantMessageId ? { ...msg, isTyping: false } : msg))
      )
    }, typingDuration)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleCopyMessage = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleRegenerate = async (id: string) => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newContent = sampleResponses[Math.floor(Math.random() * sampleResponses.length)]
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, content: newContent, isTyping: true } : msg))
    )
    setTypingMessageId(id)
    setIsLoading(false)

    const typingDuration = newContent.length * 15 + 500
    setTimeout(() => {
      setTypingMessageId(null)
      setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, isTyping: false } : msg)))
    }, typingDuration)
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setInput(value)
    e.target.style.height = "auto"
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px"

    // 检测 @ 符号
    const cursorPos = e.target.selectionStart
    const textBeforeCursor = value.slice(0, cursorPos)
    const atMatch = textBeforeCursor.match(/@(\w*)$/)

    if (atMatch) {
      setShowMentions(true)
      setMentionQuery(atMatch[1].toLowerCase())
      
      // 计算弹出位置
      const textarea = e.target
      const rect = textarea.getBoundingClientRect()
      setMentionPosition({
        top: rect.top - 10,
        left: rect.left + 20,
      })
    } else {
      setShowMentions(false)
      setMentionQuery("")
    }
  }

  const handleSelectMention = (item: MentionItem) => {
    // 找到最后一个 @ 符号的位置
    const atIndex = input.lastIndexOf("@")
    if (atIndex !== -1) {
      const newInput = input.slice(0, atIndex) + `@${item.name} `
      setInput(newInput)
    }
    
    // 添加到选中的提及列表
    if (!selectedMentions.find((m) => m.id === item.id)) {
      setSelectedMentions([...selectedMentions, item])
    }
    
    setShowMentions(false)
    setMentionQuery("")
    textareaRef.current?.focus()
  }

  const handleRemoveMention = (id: string) => {
    setSelectedMentions(selectedMentions.filter((m) => m.id !== id))
  }

  const filteredMentions = mentionItems.filter(
    (item) =>
      item.name.toLowerCase().includes(mentionQuery) ||
      item.description.toLowerCase().includes(mentionQuery)
  )

  const handleNavClick = (item: string) => {
    setActiveNavItem(item)
    if (item === "projects") {
      setCurrentView("projects")
    } else if (item === "customize") {
      setCurrentView("customize")
    } else if (item === "chat" || item === "new") {
      setCurrentView("chat")
    }
  }

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project)
    setCurrentView("project-detail")
  }

  const handleBackFromProject = () => {
    setCurrentView("projects")
    setSelectedProject(null)
  }

  const handleBackToChat = () => {
    setCurrentView("chat")
    setActiveNavItem("chat")
  }

  const hasMessages = messages.length > 0

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-64" : "w-0 opacity-0 overflow-hidden"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="text-lg font-semibold text-foreground">Claude</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <PanelLeftClose className="w-4 h-4" />
          </Button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <SidebarItem
            icon={Plus}
            label="New chat"
            active={activeNavItem === "new"}
            onClick={() => handleNavClick("new")}
          />
          <SidebarItem icon={Search} label="Search" />
          <SidebarItem
            icon={Settings}
            label="Customize"
            active={activeNavItem === "customize"}
            onClick={() => handleNavClick("customize")}
          />

          <div className="pt-4 pb-2">
            <SidebarItem
              icon={MessageSquare}
              label="Chats"
              active={activeNavItem === "chat"}
              onClick={() => handleNavClick("chat")}
            />
            <SidebarItem
              icon={FolderOpen}
              label="Projects"
              active={activeNavItem === "projects"}
              onClick={() => handleNavClick("projects")}
            />
            <SidebarItem icon={Blocks} label="Artifacts" />
            <SidebarItem icon={Code} label="Code" />
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-border">
          <p className="text-xs text-muted-foreground text-center py-2">
            Your chats will show up here
          </p>
        </div>

        {/* User Profile */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-secondary/50 cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium text-foreground">
              U
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">User</p>
              <p className="text-xs text-muted-foreground">Pro plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Toggle Sidebar Button */}
        {!sidebarOpen && (
          <div className="absolute top-4 left-4 z-10">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              onClick={() => setSidebarOpen(true)}
            >
              <PanelLeft className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* View Switching */}
        {currentView === "projects" && (
          <ProjectsList onSelectProject={handleSelectProject} onBack={handleBackToChat} />
        )}

        {currentView === "project-detail" && selectedProject && (
          <ProjectDetail project={selectedProject} onBack={handleBackFromProject} />
        )}

        {currentView === "customize" && (
          <CustomizePage onBack={handleBackToChat} />
        )}

        {currentView === "chat" && (
          <>
            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto">
              {!hasMessages ? (
                /* Welcome Screen */
                <div className="flex flex-col items-center justify-center h-full px-4">
                  <div className="flex flex-col items-center max-w-2xl w-full animate-in fade-in duration-500">
                    {/* Greeting */}
                    <div className="flex items-center gap-3 mb-8">
                      <div className="relative">
                        <Sparkles className="w-10 h-10 text-primary" />
                        <div className="absolute inset-0 animate-ping">
                          <Sparkles className="w-10 h-10 text-primary/30" />
                        </div>
                      </div>
                      <h1 className="text-4xl font-serif text-foreground">
                        {greeting}, <span className="text-primary">User</span>
                      </h1>
                    </div>

                    {/* Input Box */}
                    <div className="w-full max-w-xl mb-6">
                      {/* Selected mentions */}
                      {selectedMentions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {selectedMentions.map((mention) => (
                            <div
                              key={mention.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm animate-in fade-in zoom-in duration-200"
                            >
                              <Book className="w-3.5 h-3.5 text-primary" />
                              <span className="text-foreground">{mention.name}</span>
                              <button
                                onClick={() => handleRemoveMention(mention.id)}
                                className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="relative bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300">
                        {/* @ Mention Popup */}
                        {showMentions && filteredMentions.length > 0 && (
                          <div className="absolute bottom-full left-0 right-0 mb-2 bg-card rounded-xl border border-border shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
                            <div className="px-3 py-2 border-b border-border">
                              <span className="text-xs font-medium text-muted-foreground">Knowledge Base</span>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                              {filteredMentions.map((item) => (
                                <button
                                  key={item.id}
                                  onClick={() => handleSelectMention(item)}
                                  className="flex items-start gap-3 w-full px-3 py-2.5 hover:bg-secondary/50 transition-colors text-left"
                                >
                                  <div className="mt-0.5">
                                    <Book className="w-4 h-4 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                                    <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                            <div className="px-3 py-2 border-t border-border bg-secondary/30">
                              <span className="text-xs text-muted-foreground">Type @ to search knowledge base</span>
                            </div>
                          </div>
                        )}
                        
                        <textarea
                          ref={textareaRef}
                          value={input}
                          onChange={handleTextareaChange}
                          onKeyDown={handleKeyDown}
                          placeholder="How can I help you today? (Type @ for knowledge base)"
                          className="w-full resize-none bg-transparent px-5 py-4 pr-28 text-base text-foreground placeholder:text-muted-foreground focus:outline-none min-h-[60px] max-h-[200px]"
                          rows={1}
                        />
                        <div className="absolute right-3 bottom-3 flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <Plus className="w-5 h-5" />
                          </Button>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>Sonnet 4.6</span>
                            <ChevronDown className="w-3 h-3" />
                          </div>
                          <Button
                            onClick={handleSubmit}
                            disabled={!input.trim() || isLoading}
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground disabled:opacity-30"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <QuickAction icon={Pencil} label="Write" onClick={() => setInput("Help me write ")} />
                      <QuickAction icon={Sparkles} label="Learn" onClick={() => setInput("Explain ")} />
                      <QuickAction icon={Code} label="Code" onClick={() => setInput("Write code for ")} />
                      <QuickAction
                        icon={Briefcase}
                        label="Life stuff"
                        onClick={() => setInput("Help me with ")}
                      />
                      <QuickAction
                        icon={Sparkles}
                        label="Claude's choice"
                        onClick={() => setInput("Surprise me with something interesting")}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Messages */
                <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "group animate-in fade-in slide-in-from-bottom-2 duration-300",
                        message.role === "user" ? "flex justify-end" : ""
                      )}
                    >
                      {message.role === "user" ? (
                        <div className="max-w-[80%] bg-secondary rounded-2xl px-4 py-3">
                          <p className="text-foreground leading-relaxed">{message.content}</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                              <Sparkles className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-sm font-medium text-foreground">Claude</span>
                          </div>
                          <div className="pl-9">
                            <MessageContent
                              content={message.content}
                              isTyping={message.id === typingMessageId}
                            />

                            {/* Actions */}
                            {message.id !== typingMessageId && (
                              <div className="flex items-center gap-1 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-3 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg"
                                  onClick={() => handleCopyMessage(message.id, message.content)}
                                >
                                  {copiedId === message.id ? (
                                    <Check className="w-4 h-4" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-3 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg"
                                  onClick={() => handleRegenerate(message.id)}
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Thinking Indicator */}
                  {isLoading && <ThinkingIndicator />}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Box (when has messages) */}
            {hasMessages && (
              <div className="border-t border-border p-4">
                <div className="max-w-3xl mx-auto">
                  {/* Selected mentions */}
                  {selectedMentions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedMentions.map((mention) => (
                        <div
                          key={mention.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm animate-in fade-in zoom-in duration-200"
                        >
                          <Book className="w-3.5 h-3.5 text-primary" />
                          <span className="text-foreground">{mention.name}</span>
                          <button
                            onClick={() => handleRemoveMention(mention.id)}
                            className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="relative bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300">
                    {/* @ Mention Popup */}
                    {showMentions && filteredMentions.length > 0 && (
                      <div className="absolute bottom-full left-0 right-0 mb-2 bg-card rounded-xl border border-border shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
                        <div className="px-3 py-2 border-b border-border">
                          <span className="text-xs font-medium text-muted-foreground">Knowledge Base</span>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {filteredMentions.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => handleSelectMention(item)}
                              className="flex items-start gap-3 w-full px-3 py-2.5 hover:bg-secondary/50 transition-colors text-left"
                            >
                              <div className="mt-0.5">
                                <Book className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                        <div className="px-3 py-2 border-t border-border bg-secondary/30">
                          <span className="text-xs text-muted-foreground">Type @ to search knowledge base</span>
                        </div>
                      </div>
                    )}
                    
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={handleTextareaChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Reply to Claude... (Type @ for knowledge base)"
                      className="w-full resize-none bg-transparent px-5 py-4 pr-28 text-base text-foreground placeholder:text-muted-foreground focus:outline-none min-h-[60px] max-h-[200px]"
                      rows={1}
                    />
                    <div className="absolute right-3 bottom-3 flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>Sonnet 4.6</span>
                        <ChevronDown className="w-3 h-3" />
                      </div>
                      <Button
                        onClick={handleSubmit}
                        disabled={!input.trim() || isLoading}
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
