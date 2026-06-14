import { useState, useEffect, useRef, useMemo } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getToken } from "@/lib/token"
import { toast } from "sonner"
import { Upload, Trash2, ImageIcon, FileText, Video, File, RefreshCw, Search, FolderOpen } from "lucide-react"

interface MediaItem {
  name: string
  url: string
  size: string
  sizeBytes: number
  type: string
  ext: string
  modified: string
}

const GROUPS = [
  { key: 'all', label: 'All', icon: FolderOpen },
  { key: 'image', label: 'Images', icon: ImageIcon },
  { key: 'document', label: 'Documents', icon: FileText },
  { key: 'video', label: 'Video', icon: Video },
  { key: 'other', label: 'Other', icon: File },
]

export default function AdminMediaPage() {
  const [files, setFiles] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeTab, setTypeTab] = useState('all')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchFiles = async () => {
    setLoading(true)
    try {
      const token = getToken()
      const res = await fetch('/api/admin/media', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setFiles(data.files || [])
    } catch {
      toast.error('Failed to load media')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchFiles() }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const token = getToken()
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
      if (!res.ok) throw new Error()
      toast.success('File uploaded')
      fetchFiles()
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (name: string) => {
    try {
      const token = getToken()
      const res = await fetch(`/api/admin/media/${encodeURIComponent(name)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error()
      toast.success('File deleted')
      setFiles(prev => prev.filter(f => f.name !== name))
    } catch {
      toast.error('Delete failed')
    }
  }

  const filteredBySearch = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))

  const grouped = useMemo(() => {
    const byType = typeTab === 'all' ? filteredBySearch : filteredBySearch.filter(f => f.type === typeTab)

    const groups: { label: string; files: MediaItem[] }[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekAgo = new Date(today.getTime() - 7 * 86400000)
    const monthAgo = new Date(today.getTime() - 30 * 86400000)

    const recent = byType.filter(f => new Date(f.modified) >= weekAgo)
    const thisMonth = byType.filter(f => {
      const d = new Date(f.modified)
      return d >= monthAgo && d < weekAgo
    })
    const older = byType.filter(f => new Date(f.modified) < monthAgo)

    if (recent.length) groups.push({ label: 'This week', files: recent })
    if (thisMonth.length) groups.push({ label: 'This month', files: thisMonth })
    if (older.length) groups.push({ label: 'Older', files: older })

    return groups
  }, [filteredBySearch, typeTab])

  const TypeIcon = ({ type }: { type: string }) => {
    if (type === 'image') return <ImageIcon size={20} className="text-blue-500" />
    if (type === 'document') return <FileText size={20} className="text-amber-500" />
    if (type === 'video') return <Video size={20} className="text-purple-500" />
    return <File size={20} className="text-muted-foreground" />
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search files..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-10 rounded-xl" />
        </div>
        <Button variant="outline" size="sm" onClick={fetchFiles} className="rounded-xl h-10" disabled={loading}>
          <RefreshCw size={14} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
        </Button>
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
        <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="rounded-xl h-10">
          <Upload size={14} className="mr-2" /> {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </div>

      <Tabs value={typeTab} onValueChange={setTypeTab}>
        <TabsList className="rounded-xl bg-muted/50">
          {GROUPS.map(g => (
            <TabsTrigger key={g.key} value={g.key} className="rounded-lg text-xs font-bold gap-1.5">
              <g.icon size={14} />{g.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="text-xs text-muted-foreground font-bold">{filteredBySearch.length} files</div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : filteredBySearch.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center text-muted-foreground">{search ? 'No files match your search' : 'No files uploaded yet'}</CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {grouped.map(group => (
            <div key={group.label}>
              <h3 className="text-sm font-black text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <FolderOpen size={16} /> {group.label} ({group.files.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {group.files.map(file => (
                  <Card key={file.name} className="border-0 shadow-sm overflow-hidden group">
                    <div className="aspect-square relative bg-muted flex items-center justify-center overflow-hidden">
                      {file.type === 'image' ? (
                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.querySelector('.media-fallback')?.classList.remove('hidden') }} />
                      ) : null}
                      <div className={`media-fallback ${file.type !== 'image' ? '' : 'hidden'} absolute inset-0 flex items-center justify-center`}>
                        <TypeIcon type={file.type} />
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full" onClick={() => handleDelete(file.name)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-2">
                      <p className="text-[10px] font-bold truncate" title={file.name}>{file.name}</p>
                      <p className="text-[9px] text-muted-foreground">{file.size} · .{file.ext}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
