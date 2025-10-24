import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import PatientHomeButton from "../../components/PatientHomeButton";
import API_URL from "../../config/api";

export default function UploadDocuments() {
  const [documents, setDocuments] = useState([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [deleting, setDeleting] = useState(null); // për të treguar se cili dokument po fshihet

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/documents/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocuments(res.data);
    } catch (err) {
      console.error("❌ Gabim në marrjen e dokumenteve:", err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Auto-clear success messages after 5 seconds
  useEffect(() => {
    if (message && message.startsWith("✅")) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!title || !file) {
      setMessage("❗ Titulli dhe dokumenti janë të detyrueshëm.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/api/documents/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage("✅ Dokumenti u ngarkua me sukses!");
      setTitle("");
      setFile(null);
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      fetchDocuments();
    } catch (err) {
      console.error("❌ Gabim gjatë ngarkimit:", err);
      setMessage("❌ Dështoi ngarkimi i dokumentit.");
    }
  };

  const handleDelete = async (documentId, documentTitle) => {
    // Konfirmo fshirjen
    const confirm = window.confirm(
      `A jeni të sigurt që doni të fshini dokumentin "${documentTitle}"?\n\nKy veprim nuk mund të anulluar.`
    );
    
    if (!confirm) return;

    try {
      setDeleting(documentId);
      const token = localStorage.getItem("token");
      
      await axios.delete(`${API_URL}/api/documents/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage(`✅ Dokumenti u fshi me sukses!");
      fetchDocuments(); // Rifresko listën
    } catch (err) {
      console.error("❌ Gabim gjatë fshirjes:", err);
      setMessage("❌ Dështoi fshirja e dokumentit.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="container-fluid" style={{ 
      backgroundColor: "#FAF7F3", 
      minHeight: "100vh", 
      padding: "2rem 0",
      background: "linear-gradient(135deg, #FAF7F3 0%, #F0E4D3 50%, #DCC5B2 100%)"
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10 col-xl-8">
            <div className="card shadow-lg" style={{
              background: "linear-gradient(145deg, #FAF7F3, #F0E4D3)",
              border: "1px solid rgba(220, 197, 178, 0.3)",
              borderRadius: "25px",
              boxShadow: "0 20px 40px rgba(217, 162, 153, 0.3)",
              overflow: "hidden"
            }}>
              <div className="card-header text-center py-4" style={{
                background: "linear-gradient(135deg, #D9A299, #DCC5B2)",
                color: "white",
                border: "none"
              }}>
                <h2 className="card-title mb-0" style={{ fontSize: "2.5rem", fontWeight: "bold", color: "white" }}>
                  📎 Ngarko Dokumente Mjekësore
                </h2>
                <p className="mt-2 mb-0" style={{ fontSize: "1.1rem", opacity: "0.9", color: "white" }}>
                  Ngarkoni dhe menaxhoni dokumentet tuaja mjekësore
                </p>
              </div>
              <div className="card-body p-5">

                {message && (
                  <div
                    className="alert mb-4"
                    style={{
                      background: message.startsWith("✅") 
                        ? "linear-gradient(145deg, #F0E4D3, #DCC5B2)" 
                        : "linear-gradient(145deg, #DCC5B2, #D9A299)",
                      border: "1px solid rgba(220, 197, 178, 0.3)",
                      borderRadius: "15px",
                      color: "#2c3e50",
                      fontSize: "1.1rem"
                    }}
                  >
                    {message}
                  </div>
                )}

                <form onSubmit={handleUpload} className="mb-5" style={{
                  background: "linear-gradient(145deg, #FAF7F3, #F0E4D3)",
                  padding: "2rem",
                  borderRadius: "20px",
                  boxShadow: "0 8px 25px rgba(217, 162, 153, 0.2)",
                  border: "1px solid rgba(220, 197, 178, 0.3)"
                }}>
                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <label className="form-label fw-bold" style={{ color: "#D9A299", fontSize: "1.1rem" }}>
                        📝 Titulli i dokumentit
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="P.sh. Analizat e gjakut"
                        required
                        style={{
                          border: "2px solid rgba(220, 197, 178, 0.3)",
                          borderRadius: "12px",
                          padding: "0.75rem 1rem"
                        }}
                      />
                    </div>
                    <div className="col-md-6 mb-4">
                      <label className="form-label fw-bold" style={{ color: "#D9A299", fontSize: "1.1rem" }}>
                        📁 Zgjidh dokumentin
                      </label>
                      <input
                        type="file"
                        className="form-control form-control-lg"
                        accept=".pdf,.jpg,.png,.jpeg"
                        onChange={(e) => setFile(e.target.files[0])}
                        required
                        style={{
                          border: "2px solid rgba(220, 197, 178, 0.3)",
                          borderRadius: "12px",
                          padding: "0.75rem 1rem"
                        }}
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-lg w-100" style={{
                    background: "linear-gradient(135deg, #D9A299, #DCC5B2)",
                    border: "none",
                    color: "white",
                    borderRadius: "15px",
                    boxShadow: "0 8px 25px rgba(217, 162, 153, 0.4)",
                    padding: "1rem 2rem",
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    transition: "all 0.3s ease"
                  }}>
                    📤 Ngarko Dokumentin
                  </button>
                </form>

                <h4 className="mb-4" style={{ color: "#D9A299", fontSize: "1.5rem" }}>🗂️ Dokumentet e ngarkuara</h4>
                {documents.length === 0 ? (
                  <div className="alert text-center" style={{
                    background: "linear-gradient(145deg, #F0E4D3, #DCC5B2)",
                    border: "1px solid rgba(220, 197, 178, 0.3)",
                    borderRadius: "15px",
                    color: "#2c3e50",
                    fontSize: "1.1rem",
                    padding: "2rem"
                  }}>S'keni ngarkuar ende asnjë dokument.</div>
                ) : (
                  <div className="list-group" style={{
                    background: "linear-gradient(145deg, #FAF7F3, #F0E4D3)",
                    borderRadius: "15px",
                    boxShadow: "0 8px 25px rgba(217, 162, 153, 0.2)",
                    border: "1px solid rgba(220, 197, 178, 0.3)"
                  }}>
                    {documents.map((doc) => (
                      <div key={doc._id} className="list-group-item" style={{
                        background: "transparent",
                        border: "1px solid rgba(220, 197, 178, 0.2)",
                        borderRadius: "10px",
                        marginBottom: "0.5rem",
                        color: "#2c3e50",
                        padding: "1.5rem"
                      }}>
                        <div className="row align-items-center">
                          <div className="col-md-8">
                            <h6 className="mb-2" style={{ color: "#D9A299", fontSize: "1.2rem" }}>{doc.title}</h6>
                            <small className="text-muted" style={{ fontSize: "1rem" }}>
                              Ngarkuar më: {new Date(doc.createdAt || doc.uploadDate).toLocaleDateString('sq-AL')}
                            </small>
                          </div>
                          <div className="col-md-4 text-end">
                            <div className="btn-group">
                              <a
                                href={`${API_URL}${doc.fileUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-lg me-2"
                                title="Shiko dokumentin"
                                style={{
                                  background: "linear-gradient(135deg, #D9A299, #DCC5B2)",
                                  border: "none",
                                  color: "white",
                                  borderRadius: "10px",
                                  boxShadow: "0 4px 15px rgba(217, 162, 153, 0.3)",
                                  padding: "0.75rem 1.5rem",
                                  fontSize: "1rem",
                                  fontWeight: "bold"
                                }}
                              >
                                👁️ Shiko
                              </a>
                              <button
                                className="btn btn-lg"
                                onClick={() => handleDelete(doc._id, doc.title)}
                                disabled={deleting === doc._id}
                                title="Fshi dokumentin"
                                style={{
                                  background: "linear-gradient(135deg, #DCC5B2, #D9A299)",
                                  border: "none",
                                  color: "white",
                                  borderRadius: "10px",
                                  boxShadow: "0 4px 15px rgba(217, 162, 153, 0.3)",
                                  padding: "0.75rem 1.5rem",
                                  fontSize: "1rem",
                                  fontWeight: "bold"
                                }}
                              >
                                {deleting === doc._id ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                    Duke fshirë...
                                  </>
                                ) : (
                                  '🗑️ Fshi'
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <PatientHomeButton />
    </div>
  );
}
