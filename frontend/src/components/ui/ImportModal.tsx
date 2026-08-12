'use client'
import { useState, useRef } from 'react'
import { Modal }   from './Modal'
import { Button }  from './Button'
import { Upload, Download, CheckCircle, XCircle, FileText } from 'lucide-react'
import api from '@/lib/api'

interface ImportModalProps {
  open:        boolean
  onClose:     () => void
  onSuccess:   () => void
  projectId:   number
  type:        'requirements' | 'assets'
}

export function ImportModal({ open, onClose, onSuccess, projectId, type }: ImportModalProps) {
  const [file,        setFile]        = useState<File | null>(null)
  const [uploading,   setUploading]   = useState(false)
  const [result,      setResult]      = useState<any>(null)
  const [dragOver,    setDragOver]    = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const label   = type === 'requirements' ? 'Requirements' : 'Assets'
  const endpoint = type === 'requirements'
    ? '/requirements/import/csv/'
    : '/assets/import/csv/'
  const templateEndpoint = type === 'requirements'
    ? '/requirements/import/template/'
    : '/assets/import/template/'

  const handleFile = (f: File) => {
    if (!f.name.endsWith('.csv')) {
      alert('Please select a .csv file')
      return
    }
    setFile(f)
    setResult(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('project_id', String(projectId))

    try {
      const res = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(res.data)
      if (res.data.created > 0) onSuccess()
    } catch (err: any) {
      setResult({ error: err.response?.data?.error || 'Upload failed' })
    } finally {
      setUploading(false)
    }
  }

  const downloadTemplate = async () => {
    const token = localStorage.getItem('access_token')
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
    const res = await fetch(`${apiUrl}${templateEndpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const blob = await res.blob()
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `archiguide_${type}_template.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const reset = () => {
    setFile(null)
    setResult(null)
  }

  return (
    <Modal open={open} onClose={() => { onClose(); reset() }} title={`↑ Import ${label}`} size="md">
      {/* Instructions */}
      <div className="bg-bg-3 border border-border-2 rounded-xl p-4 mb-4">
        <div className="text-xs font-semibold text-text-3 uppercase tracking-wider mb-2">
          How to import
        </div>
        <ol className="text-[12.5px] text-text-2 flex flex-col gap-1.5 list-decimal list-inside">
          <li>Download the CSV template below</li>
          <li>Fill in your data — one row per {type === 'requirements' ? 'requirement' : 'asset'}</li>
          <li>Save as CSV (UTF-8) and upload here</li>
        </ol>
        <Button
          size="sm"
          icon={<Download size={12} />}
          className="mt-3"
          onClick={downloadTemplate}
        >
          Download CSV Template
        </Button>
      </div>

      {/* Drop zone */}
      {!result && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-accent bg-accent/5'
              : file
              ? 'border-success bg-success/5'
              : 'border-border-3 hover:border-accent hover:bg-accent/3'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <FileText size={28} className="text-success" />
              <div className="font-medium text-success">{file.name}</div>
              <div className="text-xs text-text-3">{(file.size / 1024).toFixed(1)} KB</div>
              <button
                onClick={e => { e.stopPropagation(); reset() }}
                className="text-xs text-danger hover:underline mt-1"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload size={28} className="text-text-4" />
              <div className="font-medium text-text-2">Drop CSV here or click to browse</div>
              <div className="text-xs text-text-3">.csv files only</div>
            </div>
          )}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="flex flex-col gap-3">
          {result.error ? (
            <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 flex items-start gap-2">
              <XCircle size={16} className="text-danger mt-0.5 flex-shrink-0" />
              <div className="text-sm text-danger">{result.error}</div>
            </div>
          ) : (
            <>
              <div className="bg-success/10 border border-success/20 rounded-xl p-4 flex items-start gap-2">
                <CheckCircle size={16} className="text-success mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-success text-sm">
                    {result.created} {type === 'requirements' ? 'requirement' : 'asset'}
                    {result.created !== 1 ? 's' : ''} imported successfully
                  </div>
                  {result.codes?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {result.codes.map((c: string) => (
                        <span key={c} className="text-[10px] font-mono bg-success/10 text-success px-1.5 py-0.5 rounded">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {result.errors?.length > 0 && (
                <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
                  <div className="text-xs font-semibold text-warning mb-2">
                    {result.errors.length} row{result.errors.length !== 1 ? 's' : ''} had errors
                  </div>
                  <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                    {result.errors.map((e: string, i: number) => (
                      <div key={i} className="text-[11px] text-text-2 font-mono">{e}</div>
                    ))}
                  </div>
                </div>
              )}

              {result.skipped?.length > 0 && (
                <div className="text-xs text-text-3">{result.skipped.length} rows skipped (empty)</div>
              )}
            </>
          )}
          <Button size="sm" onClick={reset}>Import Another File</Button>
        </div>
      )}

      {/* Actions */}
      {!result && (
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={() => { onClose(); reset() }}>Cancel</Button>
          <Button
            variant="primary"
            loading={uploading}
            disabled={!file}
            icon={<Upload size={13} />}
            onClick={handleUpload}
          >
            Import {file ? `"${file.name}"` : 'CSV'}
          </Button>
        </div>
      )}
    </Modal>
  )
}