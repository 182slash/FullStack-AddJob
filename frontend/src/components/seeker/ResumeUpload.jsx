import { useState } from 'react'
import { Upload, FileText, X, CheckCircle2 } from 'lucide-react'

const ResumeUpload = ({ onFileSelect, currentResume }) => {
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState(null)
  const handleFile = (f) => {
    if (!f) return
    const ext = f.name.split(".").pop().toLowerCase()
    if (!["pdf","doc","docx"].includes(ext)) return alert("Format harus PDF, DOC, atau DOCX")
    if (f.size > 5*1024*1024) return alert("Maksimal 5MB")
    setFile(f); onFileSelect?.(f)
  }
  return (
    <div className={`upload-area ${dragOver ? "upload-area--active" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
      onClick={() => document.getElementById("resume-input").click()}>
      <input id="resume-input" type="file" accept=".pdf,.doc,.docx" style={{ display:"none" }} onChange={(e) => handleFile(e.target.files[0])} />
      {file ? (
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <CheckCircle2 size={24} style={{ color:"var(--success)", flexShrink:0 }}/>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontWeight:600 }} className="truncate">{file.name}</p>
            <p style={{ fontSize:"0.8rem", color:"var(--muted)" }}>{(file.size/1024/1024).toFixed(2)} MB</p>
          </div>
          <button onClick={(e)=>{ e.stopPropagation(); setFile(null); onFileSelect?.(null) }} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--muted)" }}><X size={18}/></button>
        </div>
      ) : (
        <>
          <Upload size={32} style={{ color:"var(--primary)", margin:"0 auto 12px" }}/>
          <p style={{ fontWeight:600, marginBottom:4 }}>Drag & drop CV Anda di sini</p>
          <p style={{ fontSize:"0.875rem", color:"var(--muted)" }}>PDF, DOC, DOCX · maks 5MB</p>
          {currentResume && <p style={{ marginTop:12, fontSize:"0.8125rem", color:"var(--success)", display:"flex", alignItems:"center", gap:4, justifyContent:"center" }}><FileText size={14}/>CV tersimpan</p>}
        </>
      )}
    </div>
  )
}
export default ResumeUpload
