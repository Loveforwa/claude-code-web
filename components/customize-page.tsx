"use client"

import { useState, useRef } from "react"
import {
  ArrowLeft,
  Search,
  Plus,
  ChevronRight,
  ChevronDown,
  FileText,
  Folder,
  Eye,
  Code,
  Sparkles,
  Plug,
  ToggleRight,
  ToggleLeft,
  Book,
  Upload,
  Trash2,
  File,
  FileJson,
  FileSpreadsheet,
  FileImage,
  FileCode,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface FileNode {
  name: string
  type: "file" | "folder"
  children?: FileNode[]
}

interface Skill {
  id: string
  name: string
  addedBy: string
  invokedBy: string
  description: string
  content: string
  enabled: boolean
  files: FileNode[]
}

interface Connector {
  id: string
  name: string
  description: string
  icon: string
  connected: boolean
  category: string
}

interface KnowledgeItem {
  id: string
  name: string
  type: "document" | "format" | "secret" | "reference"
  category: string
  description: string
  content: string
  fileType?: string
  lines?: number
  createdAt: string
}

const defaultSkills: Skill[] = [
  {
    id: "skill-creator",
    name: "skill-creator",
    addedBy: "Anthropic",
    invokedBy: "User or Claude",
    description:
      "Create new skills, modify and improve existing skills, and measure skill performance. Use when users want to create a skill from scratch, edit, or optimize an existing skill, run evals to test a skill, benchmark skill performance with variance analysis, or optimize a skill's description for better triggering accuracy.",
    content: `# Skill Creator

A skill for creating new skills and iteratively improving them.

At a high level, the process of creating a skill goes like this:

- Decide what you want the skill to do and roughly how it should do it
- Write a draft of the skill
- Create a few test prompts and run claude-with-access-to-the-skill on them
- Help the user evaluate the results both qualitatively and quantitatively
  - While the runs happen in the background, draft some quantitative evals if there aren't any (if there are some, you can either use as is or modify if you feel something needs to change about them). Then explain them to the user (or if they already existed, explain the ones that already exist)
  - Use the \`eval-viewer/generate_review.py\` script to show the user the results for them to look at, and also let them look at the quantitative metrics
- Rewrite the skill based on feedback from the user's evaluation of the results (and also if there are any glaring flaws that become apparent from the quantitative benchmarks)
- Repeat until you're satisfied
- Expand the test set and try again at larger scale

Your job when using this skill is to figure out where the user is in this process and then jump in and help them progress through these stages.`,
    enabled: true,
    files: [
      { name: "SKILL.md", type: "file" },
      { name: "agents", type: "folder", children: [] },
      { name: "assets", type: "folder", children: [] },
      { name: "eval-viewer", type: "folder", children: [] },
      { name: "references", type: "folder", children: [] },
      { name: "scripts", type: "folder", children: [] },
      { name: "LICENSE.txt", type: "file" },
    ],
  },
  {
    id: "code-review",
    name: "code-review",
    addedBy: "Anthropic",
    invokedBy: "User",
    description:
      "Review code for bugs, security issues, performance problems, and style inconsistencies. Provides detailed feedback with suggestions for improvement.",
    content: `# Code Review

A comprehensive code review skill that analyzes your code for:

- **Bugs and Logic Errors**: Identifies potential bugs and logical issues
- **Security Vulnerabilities**: Checks for common security problems
- **Performance Issues**: Suggests optimizations
- **Code Style**: Ensures consistency with best practices

## Usage

Simply share your code and ask for a review. You can specify focus areas or request a general review.`,
    enabled: true,
    files: [
      { name: "SKILL.md", type: "file" },
      { name: "templates", type: "folder", children: [] },
      { name: "rules", type: "folder", children: [] },
    ],
  },
  {
    id: "english-tutor",
    name: "english-tutor",
    addedBy: "User",
    invokedBy: "User",
    description:
      "An English language learning assistant that helps with grammar, vocabulary, writing, and conversation practice. Supports all proficiency levels from beginner to advanced.",
    content: `# English Tutor

Your personal English language learning assistant.

## Features

- **Grammar Correction**: Get explanations for grammar mistakes
- **Vocabulary Building**: Learn new words with context and examples
- **Writing Assistance**: Improve your essays and documents
- **Conversation Practice**: Practice dialogues and expressions
- **Pronunciation Tips**: Learn proper pronunciation patterns

## Proficiency Levels

- Beginner (A1-A2)
- Intermediate (B1-B2)
- Advanced (C1-C2)

Ask me anything about English!`,
    enabled: true,
    files: [
      { name: "SKILL.md", type: "file" },
      { name: "vocabulary", type: "folder", children: [] },
      { name: "grammar-rules", type: "folder", children: [] },
      { name: "exercises", type: "folder", children: [] },
    ],
  },
]

const defaultConnectors: Connector[] = [
  {
    id: "github",
    name: "GitHub",
    description: "Connect to GitHub repositories to read and write code",
    icon: "github",
    connected: true,
    category: "Development",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Access your Notion workspace, pages, and databases",
    icon: "notion",
    connected: false,
    category: "Productivity",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Send and receive messages from Slack channels",
    icon: "slack",
    connected: false,
    category: "Communication",
  },
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Access files and documents from Google Drive",
    icon: "drive",
    connected: true,
    category: "Storage",
  },
  {
    id: "linear",
    name: "Linear",
    description: "Manage issues and projects in Linear",
    icon: "linear",
    connected: false,
    category: "Development",
  },
]

// Knowledge base items - core business knowledge and file format conversions
export const knowledgeBase: KnowledgeItem[] = [
  {
    id: "kb-file-format-json",
    name: "JSON Format Specification",
    type: "format",
    category: "File Formats",
    description: "JSON file format rules, validation, and conversion guidelines",
    fileType: "JSON",
    lines: 256,
    createdAt: "2024-01-15",
    content: `# JSON Format Specification

## Overview
JSON (JavaScript Object Notation) is a lightweight data interchange format.

## Structure Rules
- Objects are enclosed in curly braces \`{}\`
- Arrays are enclosed in square brackets \`[]\`
- Keys must be strings in double quotes
- Values can be: string, number, boolean, null, object, or array

## Conversion Guidelines

### JSON to XML
\`\`\`javascript
function jsonToXml(json, rootName = 'root') {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>';
  xml += \`<\${rootName}>\`;
  
  for (const [key, value] of Object.entries(json)) {
    if (Array.isArray(value)) {
      value.forEach(item => {
        xml += \`<\${key}>\${typeof item === 'object' ? jsonToXml(item, '') : item}</\${key}>\`;
      });
    } else if (typeof value === 'object') {
      xml += \`<\${key}>\${jsonToXml(value, '')}</\${key}>\`;
    } else {
      xml += \`<\${key}>\${value}</\${key}>\`;
    }
  }
  
  xml += \`</\${rootName}>\`;
  return xml;
}
\`\`\`

### JSON to CSV
\`\`\`javascript
function jsonToCsv(jsonArray) {
  if (!Array.isArray(jsonArray) || jsonArray.length === 0) return '';
  
  const headers = Object.keys(jsonArray[0]);
  const csv = [headers.join(',')];
  
  jsonArray.forEach(obj => {
    const row = headers.map(header => {
      const value = obj[header];
      return typeof value === 'string' ? \`"\${value}"\` : value;
    });
    csv.push(row.join(','));
  });
  
  return csv.join('\\n');
}
\`\`\`

## Validation
- Use JSON.parse() for validation
- Check for circular references
- Validate against JSON Schema when available`,
  },
  {
    id: "kb-file-format-csv",
    name: "CSV Format Specification",
    type: "format",
    category: "File Formats",
    description: "CSV file format parsing, generation, and conversion rules",
    fileType: "CSV",
    lines: 198,
    createdAt: "2024-01-15",
    content: `# CSV Format Specification

## Overview
CSV (Comma-Separated Values) is a simple file format for tabular data.

## Structure Rules
- Each line represents a row
- Values are separated by commas (or other delimiters)
- First row typically contains headers
- Text with commas should be enclosed in quotes

## Parsing Guidelines
\`\`\`javascript
function parseCsv(csvString, delimiter = ',') {
  const lines = csvString.trim().split('\\n');
  const headers = parseRow(lines[0], delimiter);
  
  return lines.slice(1).map(line => {
    const values = parseRow(line, delimiter);
    return headers.reduce((obj, header, i) => {
      obj[header] = values[i];
      return obj;
    }, {});
  });
}

function parseRow(row, delimiter) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (const char of row) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}
\`\`\`

## Conversion to JSON
\`\`\`javascript
function csvToJson(csvString) {
  return parseCsv(csvString);
}
\`\`\`

## Best Practices
- Always handle quoted fields
- Support different delimiters (comma, semicolon, tab)
- Handle newlines within quoted fields
- Preserve data types when converting`,
  },
  {
    id: "kb-file-format-xml",
    name: "XML Format Specification",
    type: "format",
    category: "File Formats",
    description: "XML file format structure, parsing, and transformation rules",
    fileType: "XML",
    lines: 312,
    createdAt: "2024-01-16",
    content: `# XML Format Specification

## Overview
XML (eXtensible Markup Language) is a markup language for structured data.

## Structure Rules
- Must have a single root element
- Tags must be properly nested
- Attribute values must be quoted
- Special characters must be escaped

## Parsing with DOM
\`\`\`javascript
function parseXml(xmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');
  
  function nodeToJson(node) {
    const result = {};
    
    // Handle attributes
    if (node.attributes) {
      for (const attr of node.attributes) {
        result[\`@\${attr.name}\`] = attr.value;
      }
    }
    
    // Handle child nodes
    for (const child of node.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent.trim();
        if (text) result['#text'] = text;
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const childResult = nodeToJson(child);
        if (result[child.nodeName]) {
          if (!Array.isArray(result[child.nodeName])) {
            result[child.nodeName] = [result[child.nodeName]];
          }
          result[child.nodeName].push(childResult);
        } else {
          result[child.nodeName] = childResult;
        }
      }
    }
    
    return result;
  }
  
  return nodeToJson(doc.documentElement);
}
\`\`\`

## XML to JSON Conversion
- Attributes become @attribute properties
- Text content becomes #text property
- Repeated elements become arrays`,
  },
  {
    id: "kb-file-format-yaml",
    name: "YAML Format Specification",
    type: "format",
    category: "File Formats",
    description: "YAML file format structure and conversion to JSON/XML",
    fileType: "YAML",
    lines: 178,
    createdAt: "2024-01-17",
    content: `# YAML Format Specification

## Overview
YAML (YAML Ain't Markup Language) is a human-readable data serialization format.

## Structure Rules
- Indentation defines structure (spaces only, no tabs)
- Key-value pairs use colon and space
- Lists use dash and space
- Multi-line strings use | or >

## Basic Syntax
\`\`\`yaml
# Simple key-value
name: John Doe
age: 30

# Nested objects
address:
  street: 123 Main St
  city: New York

# Arrays
hobbies:
  - reading
  - coding
  - gaming

# Multi-line string
description: |
  This is a multi-line
  string that preserves
  line breaks.
\`\`\`

## YAML to JSON
\`\`\`javascript
// Using js-yaml library
import yaml from 'js-yaml';

function yamlToJson(yamlString) {
  return yaml.load(yamlString);
}

function jsonToYaml(jsonObj) {
  return yaml.dump(jsonObj);
}
\`\`\`

## Best Practices
- Use consistent indentation (2 spaces recommended)
- Quote strings with special characters
- Use anchors and aliases for repeated data`,
  },
  {
    id: "kb-file-format-markdown",
    name: "Markdown Format Specification",
    type: "format",
    category: "File Formats",
    description: "Markdown syntax, parsing, and HTML conversion rules",
    fileType: "MD",
    lines: 224,
    createdAt: "2024-01-18",
    content: `# Markdown Format Specification

## Overview
Markdown is a lightweight markup language for creating formatted text.

## Basic Syntax

### Headers
\`\`\`markdown
# H1
## H2
### H3
\`\`\`

### Emphasis
\`\`\`markdown
*italic* or _italic_
**bold** or __bold__
***bold italic***
~~strikethrough~~
\`\`\`

### Lists
\`\`\`markdown
- Unordered item
- Another item

1. Ordered item
2. Another item
\`\`\`

### Code
\`\`\`markdown
Inline \`code\`

\\\`\\\`\\\`javascript
const code = 'block';
\\\`\\\`\\\`
\`\`\`

## Markdown to HTML
\`\`\`javascript
function markdownToHtml(md) {
  return md
    // Headers
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // Bold
    .replace(/\\*\\*(.*)\\*\\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\\*(.*)\\*/g, '<em>$1</em>')
    // Code
    .replace(/\`([^\`]+)\`/g, '<code>$1</code>')
    // Line breaks
    .replace(/\\n/g, '<br>');
}
\`\`\``,
  },
  {
    id: "kb-api-secrets",
    name: "API Integration Secrets",
    type: "secret",
    category: "Business Secrets",
    description: "Confidential API integration patterns and authentication methods",
    fileType: "DOC",
    lines: 156,
    createdAt: "2024-02-01",
    content: `# API Integration Secrets

## Authentication Patterns

### OAuth 2.0 Flow
\`\`\`javascript
const oauth2Config = {
  authorizationEndpoint: '/oauth/authorize',
  tokenEndpoint: '/oauth/token',
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  scopes: ['read', 'write'],
};

async function getAccessToken(code) {
  const response = await fetch(oauth2Config.tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: oauth2Config.clientId,
      client_secret: oauth2Config.clientSecret,
    }),
  });
  return response.json();
}
\`\`\`

### API Key Rotation
- Rotate keys every 90 days
- Use separate keys for dev/staging/prod
- Never commit keys to version control
- Use environment variables or secret managers

## Rate Limiting Strategies
- Implement exponential backoff
- Cache responses when possible
- Use request queuing for burst protection`,
  },
  {
    id: "kb-data-transform",
    name: "Data Transformation Patterns",
    type: "reference",
    category: "Data Processing",
    description: "Common data transformation patterns and utilities",
    fileType: "DOC",
    lines: 289,
    createdAt: "2024-02-05",
    content: `# Data Transformation Patterns

## Common Transformations

### Flatten Nested Objects
\`\`\`javascript
function flatten(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, key) => {
    const newKey = prefix ? \`\${prefix}.\${key}\` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(acc, flatten(obj[key], newKey));
    } else {
      acc[newKey] = obj[key];
    }
    return acc;
  }, {});
}
\`\`\`

### Unflatten Objects
\`\`\`javascript
function unflatten(obj) {
  const result = {};
  for (const key in obj) {
    const keys = key.split('.');
    keys.reduce((acc, k, i) => {
      if (i === keys.length - 1) {
        acc[k] = obj[key];
      } else {
        acc[k] = acc[k] || {};
      }
      return acc[k];
    }, result);
  }
  return result;
}
\`\`\`

### Array Grouping
\`\`\`javascript
function groupBy(array, key) {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
}
\`\`\`

### Deep Clone
\`\`\`javascript
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(deepClone);
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, deepClone(v)])
  );
}
\`\`\``,
  },
  {
    id: "kb-encoding",
    name: "Encoding & Decoding Guide",
    type: "format",
    category: "File Formats",
    description: "Base64, URL encoding, and character encoding conversions",
    fileType: "DOC",
    lines: 167,
    createdAt: "2024-02-10",
    content: `# Encoding & Decoding Guide

## Base64 Encoding

### Encode/Decode Strings
\`\`\`javascript
// Encode
const encoded = btoa('Hello World');
// 'SGVsbG8gV29ybGQ='

// Decode
const decoded = atob('SGVsbG8gV29ybGQ=');
// 'Hello World'
\`\`\`

### Handle Unicode
\`\`\`javascript
function encodeUnicode(str) {
  return btoa(encodeURIComponent(str).replace(
    /%([0-9A-F]{2})/g,
    (_, p1) => String.fromCharCode(parseInt(p1, 16))
  ));
}

function decodeUnicode(str) {
  return decodeURIComponent(
    atob(str).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join('')
  );
}
\`\`\`

## URL Encoding
\`\`\`javascript
// Encode
const url = encodeURIComponent('hello world & more');
// 'hello%20world%20%26%20more'

// Decode
const original = decodeURIComponent('hello%20world%20%26%20more');
// 'hello world & more'
\`\`\`

## Hex Encoding
\`\`\`javascript
function toHex(str) {
  return str.split('').map(c =>
    c.charCodeAt(0).toString(16).padStart(2, '0')
  ).join('');
}

function fromHex(hex) {
  return hex.match(/.{2}/g).map(byte =>
    String.fromCharCode(parseInt(byte, 16))
  ).join('');
}
\`\`\``,
  },
]

interface CustomizePageProps {
  onBack: () => void
}

export default function CustomizePage({ onBack }: CustomizePageProps) {
  const [activeTab, setActiveTab] = useState<"skills" | "connectors" | "knowledge">("skills")
  const [skills, setSkills] = useState<Skill[]>(defaultSkills)
  const [connectors, setConnectors] = useState<Connector[]>(defaultConnectors)
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>(knowledgeBase)
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(skills[0])
  const [selectedKnowledge, setSelectedKnowledge] = useState<KnowledgeItem | null>(knowledge[0])
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["skill-creator"]))
  const [searchQuery, setSearchQuery] = useState("")
  const [showPreview, setShowPreview] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedFolders(newExpanded)
  }

  const toggleSkill = (skillId: string) => {
    setSkills(skills.map((s) => (s.id === skillId ? { ...s, enabled: !s.enabled } : s)))
    if (selectedSkill?.id === skillId) {
      setSelectedSkill({ ...selectedSkill, enabled: !selectedSkill.enabled })
    }
  }

  const toggleConnector = (connectorId: string) => {
    setConnectors(connectors.map((c) => (c.id === connectorId ? { ...c, connected: !c.connected } : c)))
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
    
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = (files: File[]) => {
    files.forEach(file => {
      const newItem: KnowledgeItem = {
        id: `kb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: "document",
        category: "Uploaded",
        description: `Uploaded file: ${file.name}`,
        content: `# ${file.name}\n\nFile uploaded on ${new Date().toLocaleDateString()}`,
        fileType: file.name.split('.').pop()?.toUpperCase() || "FILE",
        lines: 0,
        createdAt: new Date().toISOString().split('T')[0],
      }
      setKnowledge(prev => [...prev, newItem])
    })
  }

  const deleteKnowledge = (id: string) => {
    setKnowledge(knowledge.filter(k => k.id !== id))
    if (selectedKnowledge?.id === id) {
      setSelectedKnowledge(knowledge.find(k => k.id !== id) || null)
    }
  }

  const getFileIcon = (fileType?: string) => {
    switch (fileType?.toLowerCase()) {
      case 'json':
        return <FileJson className="h-4 w-4 text-yellow-600" />
      case 'csv':
        return <FileSpreadsheet className="h-4 w-4 text-green-600" />
      case 'xml':
      case 'yaml':
      case 'md':
        return <FileCode className="h-4 w-4 text-blue-600" />
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return <FileImage className="h-4 w-4 text-purple-600" />
      default:
        return <File className="h-4 w-4 text-muted-foreground" />
    }
  }

  const renderFileTree = (files: FileNode[], skillId: string, depth = 0) => {
    return files.map((file, index) => {
      const path = `${skillId}-${file.name}`
      const isExpanded = expandedFolders.has(path)

      return (
        <div key={index}>
          <button
            onClick={() => file.type === "folder" && toggleFolder(path)}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-secondary/80",
              "text-foreground/80"
            )}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
          >
            {file.type === "folder" ? (
              <>
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <Folder className="h-4 w-4 text-muted-foreground" />
              </>
            ) : (
              <>
                <span className="w-3.5" />
                <FileText className="h-4 w-4 text-muted-foreground" />
              </>
            )}
            <span>{file.name}</span>
            {file.type === "folder" && <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />}
          </button>
          {file.type === "folder" && isExpanded && file.children && (
            <div>{renderFileTree(file.children, skillId, depth + 1)}</div>
          )}
        </div>
      )
    })
  }

  const filteredSkills = skills.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
  
  const filteredKnowledge = knowledge.filter((k) => 
    k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    k.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const groupedKnowledge = filteredKnowledge.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, KnowledgeItem[]>)

  const groupedConnectors = connectors.reduce(
    (acc, connector) => {
      if (!acc[connector.category]) {
        acc[connector.category] = []
      }
      acc[connector.category].push(connector)
      return acc
    },
    {} as Record<string, Connector[]>
  )

  // Render content preview with basic markdown
  const renderMarkdown = (content: string) => {
    const lines = content.split('\n')
    return lines.map((line, i) => {
      if (line.startsWith('# ')) {
        return <h1 key={i} className="text-xl font-bold mb-4 mt-6 first:mt-0">{line.slice(2)}</h1>
      } else if (line.startsWith('## ')) {
        return <h2 key={i} className="text-lg font-semibold mb-3 mt-5">{line.slice(3)}</h2>
      } else if (line.startsWith('### ')) {
        return <h3 key={i} className="text-base font-semibold mb-2 mt-4">{line.slice(4)}</h3>
      } else if (line.startsWith('- **')) {
        const match = line.match(/- \*\*(.*?)\*\*:?\s*(.*)/)
        if (match) {
          return (
            <li key={i} className="ml-4 mb-1">
              <strong className="text-primary">{match[1]}</strong>
              {match[2] && `: ${match[2]}`}
            </li>
          )
        }
      } else if (line.startsWith('- ')) {
        return <li key={i} className="ml-4 mb-1">{line.slice(2)}</li>
      } else if (line.startsWith('```')) {
        return null
      } else if (line.trim() === '') {
        return <br key={i} />
      }
      return <p key={i} className="mb-2 leading-relaxed">{line}</p>
    })
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Navigation */}
      <div className="flex w-56 flex-col border-r border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border p-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Customize</span>
          </button>
        </div>

        <nav className="flex-1 p-2">
          <button
            onClick={() => setActiveTab("skills")}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
              activeTab === "skills"
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            )}
          >
            <Sparkles className="h-4 w-4" />
            Skills
          </button>
          <button
            onClick={() => setActiveTab("knowledge")}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
              activeTab === "knowledge"
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            )}
          >
            <Book className="h-4 w-4" />
            Knowledge Base
          </button>
          <button
            onClick={() => setActiveTab("connectors")}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
              activeTab === "connectors"
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            )}
          >
            <Plug className="h-4 w-4" />
            Connectors
          </button>
        </nav>
      </div>

      {/* Middle Panel - List */}
      {activeTab === "skills" ? (
        <div className="flex w-72 flex-col border-r border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-sm font-medium">Skills</h2>
            <div className="flex items-center gap-1">
              <button className="rounded-md p-1.5 transition-colors hover:bg-secondary">
                <Search className="h-4 w-4 text-muted-foreground" />
              </button>
              <button className="rounded-md p-1.5 transition-colors hover:bg-secondary">
                <Plus className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <div className="mb-2 px-2 text-xs font-medium text-muted-foreground">Personal skills</div>

            {filteredSkills.map((skill) => {
              const isExpanded = expandedFolders.has(skill.id)
              const isSelected = selectedSkill?.id === skill.id

              return (
                <div key={skill.id}>
                  <button
                    onClick={() => {
                      setSelectedSkill(skill)
                      toggleFolder(skill.id)
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all",
                      isSelected ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50"
                    )}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">{skill.name}</span>
                  </button>

                  {isExpanded && (
                    <div className="ml-2 border-l border-border pl-2">
                      {renderFileTree(skill.files, skill.id, 1)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : activeTab === "knowledge" ? (
        <div className="flex w-72 flex-col border-r border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-sm font-medium">Knowledge Base</h2>
            <div className="flex items-center gap-1">
              <button className="rounded-md p-1.5 transition-colors hover:bg-secondary">
                <Search className="h-4 w-4 text-muted-foreground" />
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="rounded-md p-1.5 transition-colors hover:bg-secondary"
              >
                <Plus className="h-4 w-4 text-muted-foreground" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          <div 
            className={cn(
              "flex-1 overflow-y-auto p-2",
              isDragging && "bg-primary/5"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isDragging && (
              <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-primary/40 rounded-lg mb-4 bg-primary/5">
                <Upload className="h-8 w-8 text-primary/60 mb-2" />
                <p className="text-sm text-primary/80">Drop files here</p>
              </div>
            )}
            
            {Object.entries(groupedKnowledge).map(([category, items]) => (
              <div key={category} className="mb-4">
                <div className="mb-2 px-2 text-xs font-medium text-muted-foreground">{category}</div>
                {items.map((item) => {
                  const isSelected = selectedKnowledge?.id === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedKnowledge(item)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all group",
                        isSelected ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50"
                      )}
                    >
                      {getFileIcon(item.fileType)}
                      <div className="flex-1 text-left min-w-0">
                        <div className="font-medium truncate">{item.name}</div>
                        {item.lines !== undefined && item.lines > 0 && (
                          <div className="text-xs text-muted-foreground">{item.lines} lines</div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteKnowledge(item.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </button>
                    </button>
                  )
                })}
              </div>
            ))}

            {filteredKnowledge.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <Book className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No knowledge items</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Upload files or add new items</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex w-72 flex-col border-r border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-sm font-medium">Connectors</h2>
            <button className="rounded-md p-1.5 transition-colors hover:bg-secondary">
              <Search className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {Object.entries(groupedConnectors).map(([category, items]) => (
              <div key={category} className="mb-4">
                <div className="mb-2 px-2 text-xs font-medium text-muted-foreground">{category}</div>
                {items.map((connector) => (
                  <button
                    key={connector.id}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all hover:bg-secondary/50"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary">
                      <Plug className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-foreground">{connector.name}</div>
                    </div>
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full",
                        connector.connected ? "bg-green-500" : "bg-muted-foreground/30"
                      )}
                    />
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Right Panel - Detail */}
      {activeTab === "skills" && selectedSkill && (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h1 className="text-lg font-medium">{selectedSkill.name}</h1>
            <button
              onClick={() => toggleSkill(selectedSkill.id)}
              className="transition-colors"
            >
              {selectedSkill.enabled ? (
                <ToggleRight className="h-8 w-8 text-primary" />
              ) : (
                <ToggleLeft className="h-8 w-8 text-muted-foreground" />
              )}
            </button>
          </div>

          {/* Meta info */}
          <div className="border-b border-border px-6 py-4">
            <div className="flex gap-8 text-sm">
              <div>
                <span className="text-muted-foreground">Added by</span>
                <p className="font-medium">{selectedSkill.addedBy}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Invoked by</span>
                <p className="font-medium">{selectedSkill.invokedBy}</p>
              </div>
            </div>

            <div className="mt-4">
              <span className="text-sm text-muted-foreground">Description</span>
              <p className="mt-1 text-sm leading-relaxed text-foreground/80">{selectedSkill.description}</p>
            </div>
          </div>

          {/* Content Preview */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="rounded-xl border border-border bg-card">
              <div className="flex items-center justify-end gap-2 border-b border-border px-4 py-2">
                <button
                  onClick={() => setShowPreview(true)}
                  className={cn(
                    "rounded-md p-1.5 transition-colors",
                    showPreview ? "bg-secondary" : "hover:bg-secondary/50"
                  )}
                >
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className={cn(
                    "rounded-md p-1.5 transition-colors",
                    !showPreview ? "bg-secondary" : "hover:bg-secondary/50"
                  )}
                >
                  <Code className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <div className="p-6 text-sm">
                {showPreview ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {renderMarkdown(selectedSkill.content)}
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground/80">
                    {selectedSkill.content}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "knowledge" && selectedKnowledge && (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-3">
              {getFileIcon(selectedKnowledge.fileType)}
              <h1 className="text-lg font-medium">{selectedKnowledge.name}</h1>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                {selectedKnowledge.fileType}
              </span>
            </div>
            <button
              onClick={() => deleteKnowledge(selectedKnowledge.id)}
              className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-5 w-5 text-destructive" />
            </button>
          </div>

          {/* Meta info */}
          <div className="border-b border-border px-6 py-4">
            <div className="flex gap-8 text-sm">
              <div>
                <span className="text-muted-foreground">Type</span>
                <p className="font-medium capitalize">{selectedKnowledge.type}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Category</span>
                <p className="font-medium">{selectedKnowledge.category}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Created</span>
                <p className="font-medium">{selectedKnowledge.createdAt}</p>
              </div>
              {selectedKnowledge.lines !== undefined && selectedKnowledge.lines > 0 && (
                <div>
                  <span className="text-muted-foreground">Lines</span>
                  <p className="font-medium">{selectedKnowledge.lines}</p>
                </div>
              )}
            </div>

            <div className="mt-4">
              <span className="text-sm text-muted-foreground">Description</span>
              <p className="mt-1 text-sm leading-relaxed text-foreground/80">{selectedKnowledge.description}</p>
            </div>
          </div>

          {/* Content Preview */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="rounded-xl border border-border bg-card">
              <div className="flex items-center justify-end gap-2 border-b border-border px-4 py-2">
                <button
                  onClick={() => setShowPreview(true)}
                  className={cn(
                    "rounded-md p-1.5 transition-colors",
                    showPreview ? "bg-secondary" : "hover:bg-secondary/50"
                  )}
                >
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className={cn(
                    "rounded-md p-1.5 transition-colors",
                    !showPreview ? "bg-secondary" : "hover:bg-secondary/50"
                  )}
                >
                  <Code className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <div className="p-6 text-sm">
                {showPreview ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {renderMarkdown(selectedKnowledge.content)}
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground/80 overflow-x-auto">
                    {selectedKnowledge.content}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "connectors" && (
        <div className="flex flex-1 flex-col items-center justify-center">
          <Plug className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-medium text-foreground mb-2">Connect External Services</h2>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Link your accounts to enable Claude to access data from GitHub, Notion, Slack, and more.
          </p>
        </div>
      )}
    </div>
  )
}
