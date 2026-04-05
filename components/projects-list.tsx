"use client"

import { useState } from "react"
import { Plus, Star, MoreHorizontal, FolderOpen, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface Project {
  id: string
  title: string
  description: string
  isExample?: boolean
  isFavorite?: boolean
  filesCount: number
  chatsCount: number
  createdAt: Date
}

interface ProjectsListProps {
  onSelectProject: (project: Project) => void
  onBack: () => void
}

const sampleProjects: Project[] = [
  {
    id: "1",
    title: "How to use Claude",
    description: "An example project that also doubles as a how-to guide for using Claude. Chat with it to learn more about how to get the most out of chatting with Claude!",
    isExample: true,
    isFavorite: false,
    filesCount: 1,
    chatsCount: 3,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    title: "React Component Library",
    description: "A collection of reusable React components with TypeScript support and comprehensive documentation.",
    isExample: false,
    isFavorite: true,
    filesCount: 12,
    chatsCount: 8,
    createdAt: new Date("2024-02-20"),
  },
  {
    id: "3",
    title: "API Documentation",
    description: "Complete API reference documentation for our backend services, including authentication and rate limiting guides.",
    isExample: false,
    isFavorite: false,
    filesCount: 5,
    chatsCount: 2,
    createdAt: new Date("2024-03-10"),
  },
]

function ProjectCard({
  project,
  onClick,
}: {
  project: Project
  onClick: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "w-full text-left p-5 rounded-xl border border-border bg-card",
        "transition-all duration-300 ease-out",
        "hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300",
            isHovered ? "bg-primary/10" : "bg-secondary"
          )}>
            <FolderOpen className={cn(
              "w-5 h-5 transition-colors duration-300",
              isHovered ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-foreground">{project.title}</h3>
              {project.isExample && (
                <span className="px-2 py-0.5 text-xs rounded-full border border-border bg-secondary text-muted-foreground">
                  Example project
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {project.isFavorite && (
            <Star className="w-4 h-4 text-primary fill-primary" />
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
        {project.description}
      </p>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>{project.filesCount} files</span>
        <span>{project.chatsCount} chats</span>
      </div>
    </button>
  )
}

export function ProjectsList({ onSelectProject, onBack }: ProjectsListProps) {
  const [projects] = useState<Project[]>(sampleProjects)

  return (
    <div className="flex-1 overflow-y-auto animate-in fade-in duration-300">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-serif text-foreground mb-1">Projects</h1>
            <p className="text-sm text-muted-foreground">
              Organize your work with projects. Add files for Claude to reference in your chats.
            </p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => onSelectProject(project)}
            />
          ))}
        </div>

        {/* Empty State */}
        {projects.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No projects yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Create a project to organize your chats and add reference files.
            </p>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Create your first project
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
