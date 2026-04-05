"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  ArrowLeft,
  Star,
  MoreHorizontal,
  Plus,
  ChevronDown,
  Send,
  Hand,
  FileText,
  Upload,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  X,
  File,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Project } from "./projects-list"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isTyping?: boolean
}

interface ProjectFile {
  id: string
  name: string
  type: string
  lines: number
  size: string
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

// 文件卡片
function FileCard({ file, onRemove }: { file: ProjectFile; onRemove?: () => void }) {
  return (
    <div className="group relative p-4 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-sm transition-all duration-200">
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
        >
          <X className="w-3 h-3" />
        </button>
      )}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
          <FileText className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground text-sm truncate">{file.name}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">{file.lines} lines</p>
        </div>
      </div>
      <div className="mt-3">
        <span className="px-2 py-1 text-xs rounded border border-border bg-secondary text-muted-foreground">
          {file.type}
        </span>
      </div>
    </div>
  )
}

const sampleFiles: ProjectFile[] = [
  { id: "1", name: "Claude prompting guide.md", type: "MD", lines: 414, size: "12KB" },
]

const sampleResponses = [
  `Great question! Based on the project context, I can help you understand how to use Claude effectively.

Here are some key tips from the prompting guide:

1. **Be specific and clear** - The more context you provide, the better responses you'll get.

2. **Use examples** - Show Claude what you're looking for with concrete examples.

3. **Iterate and refine** - Don't hesitate to ask follow-up questions or request clarifications.

\`\`\`markdown
# Example prompt structure:
- Context: What you're working on
- Task: What you need help with
- Format: How you want the response
\`\`\`

Would you like me to elaborate on any of these points?`,

  `I've reviewed the files in this project. Here's what I found:

The **Claude prompting guide** contains comprehensive documentation on:

- Best practices for prompting
- Examples of effective prompts
- Common pitfalls to avoid
- Advanced techniques for complex tasks

Let me know if you'd like me to summarize any specific section or help you apply these techniques to your use case!`,
]

interface ProjectDetailProps {
  project: Project
  onBack: () => void
}

export function ProjectDetail({ project, onBack }: ProjectDetailProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [files, setFiles] = useState<ProjectFile[]>(sampleFiles)
  const [isFavorite, setIsFavorite] = useState(project.isFavorite || false)
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

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

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px"
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    // Handle file drop - in a real app, you'd upload the files here
    const droppedFiles = Array.from(e.dataTransfer.files)
    droppedFiles.forEach((file) => {
      const newFile: ProjectFile = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.name.split(".").pop()?.toUpperCase() || "FILE",
        lines: Math.floor(Math.random() * 500) + 50,
        size: `${Math.floor(file.size / 1024)}KB`,
      }
      setFiles((prev) => [...prev, newFile])
    })
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    selectedFiles.forEach((file) => {
      const newFile: ProjectFile = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.name.split(".").pop()?.toUpperCase() || "FILE",
        lines: Math.floor(Math.random() * 500) + 50,
        size: `${Math.floor(file.size / 1024)}KB`,
      }
      setFiles((prev) => [...prev, newFile])
    })
  }

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const hasMessages = messages.length > 0

  return (
    <div className="flex-1 flex overflow-hidden animate-in fade-in duration-300">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            All projects
          </button>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-serif text-foreground">{project.title}</h1>
                {project.isExample && (
                  <span className="px-2.5 py-0.5 text-xs rounded-full border border-border bg-secondary text-muted-foreground">
                    Example project
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground max-w-2xl">{project.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Star className={cn("w-5 h-5", isFavorite && "fill-primary text-primary")} />
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {!hasMessages ? (
            <div className="max-w-2xl mx-auto space-y-4">
              {/* Input Box */}
              <div className="relative bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder="How can I help you today?"
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

              {/* Start Chat Card */}
              <div className="bg-card rounded-2xl border border-border p-6 text-center">
                <p className="text-muted-foreground">
                  Start a chat to keep conversations organized and re-use project knowledge.
                </p>
              </div>
            </div>
          ) : (
            /* Messages */
            <div className="max-w-2xl mx-auto space-y-6">
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
              {isLoading && (
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
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Box (when has messages) */}
        {hasMessages && (
          <div className="px-6 py-4 border-t border-border">
            <div className="max-w-2xl mx-auto relative bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Reply to Claude..."
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
        )}
      </div>

      {/* Right Sidebar - Context Panel */}
      <aside className="w-80 border-l border-border bg-background flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Context Info Card */}
          <div
            className={cn(
              "p-5 rounded-2xl border transition-all duration-300",
              isDragging
                ? "border-primary bg-primary/5 border-dashed"
                : "border-border bg-card"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Hand className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
            <h3 className="font-medium text-foreground mb-2">Add relevant context for your project</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload documents, code, and other files to the project for Claude to reference in your chats.
            </p>
            {project.isExample && (
              <p className="text-sm text-primary">
                In this example project, we&apos;ve added key files about how to use Claude.
              </p>
            )}
          </div>

          {/* Upload Button */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileInputChange}
            />
            <Button
              variant="outline"
              className="w-full justify-start gap-2 rounded-xl border-dashed"
              onClick={handleFileSelect}
            >
              <Upload className="w-4 h-4" />
              Upload files
            </Button>
          </div>

          {/* Files Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-foreground">Files</h4>
              <span className="text-xs text-muted-foreground">{files.length} file{files.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="space-y-3">
              {files.map((file) => (
                <FileCard key={file.id} file={file} onRemove={() => removeFile(file.id)} />
              ))}
              {files.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <File className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No files yet</p>
                  <p className="text-xs mt-1">Drop files here or click upload</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
