
import type { Route } from "./+types/home";
import Navbar from "../../components/Navbar";
import { ArrowRightIcon, Clock } from "lucide-react";
import { Button } from "components/ui/Button";
import Upload from "../../components/Upload";
import { useNavigate } from "react-router";
import { useState } from "react";
import { createProject } from "lib/puter.action";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<DesignItem[]>([]);

  const handleUploadcomplete = async (base64Image: string) => {
    const newId = Date.now().toString();
    const name = `Residence ${newId}`;
    const newItem = {
      id: newId, name, sourceImage: base64Image, renderedImage: undefined, timestamp: Date.now()
    }
    let saved;
    try {
      saved = await createProject({ item: newItem, visibility: 'private' });
    } catch (err) {
      console.error("failed to create project", err);
      return;
    }

    if (!saved) {
      console.error("failed to create project ");
      return false;
    }

    setProjects((prev) => [newItem, ...prev]);



    navigate(`/visualizer/${newId}`, {
      state: {
        initialImage: saved.sourceImage,
        initialRender: saved.renderedImage || null,
        name
      }
    });
  }

  return (
    <div className="home">
      <Navbar />
      <section className="hero">
        <div className="annouce">
          <div className="dot">
            <div className="pulse"></div>
          </div>
          <p>Introducing room</p>
        </div>
        <h1>Build beautiful spaces at the speed of thought</h1>
        <p className="subtitle">Room is an AI platform for architects and designers to create and share their work</p>
        <div className="actions">
          <a href="#upload" className="cta">Start Building <ArrowRightIcon className="icon" /></a>
          <Button variant="outline" size="lg" className="demo">Watch demo</Button>

        </div>
        <div id="upload" className="upload-shell">
          <div className="grid-overlay" />
          <Upload onComplete={handleUploadcomplete} />
        </div>



      </section >
      <section className="projects">
        <div className="section-inner">
          <div className="section-head">
            <div className="copy">
              <h2>Projects</h2>
              <p>Explore our collection of projects</p>
            </div>
          </div>
          <div className="projects-grid">
            {projects.map(({ id, name, renderedImage, sourceImage, timestamp }) => (
              <div className="project-card group">
                <div className="preview">
                  <img src={renderedImage || sourceImage} alt="Project" />
                  <div className="badge">
                    <span>Community</span>
                  </div>
                </div>
                <div className="card-body">
                  <div>
                    <h3>{name}</h3>
                    <div className="meta">
                      <Clock size={16} />
                      <span>{new Date(timestamp).toLocaleDateString()}</span>
                      <span>by John</span>
                    </div>
                  </div>
                  <div className="arrow">
                    <ArrowRightIcon size={18} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div >
  );
}
